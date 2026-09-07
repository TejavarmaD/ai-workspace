import sys
sys.path.insert(0, '/workspaces/ai-workspace')
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def get_auth_token():
    r = client.post("/api/v1/auth/register", json={
        "email": "chattest@test.com",
        "password": "Test1234!",
        "first_name": "Chat",
        "last_name": "Test",
    })
    if r.status_code == 409:
        r = client.post("/api/v1/auth/login", json={
            "email": "chattest@test.com",
            "password": "Test1234!",
        })
    return r.json()["access_token"], r.json()["user"]

def get_workspace_id(token):
    r = client.get("/api/v1/workspaces", headers={"Authorization": f"Bearer {token}"})
    return r.json()["workspaces"][0]["id"]

def test_create_conversation():
    token, user = get_auth_token()
    workspace_id = get_workspace_id(token)
    r = client.post("/api/v1/chat/conversations",
        json={"workspace_id": workspace_id, "title": "Test Conv"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 201
    assert r.json()["title"] == "Test Conv"

def test_list_conversations():
    token, user = get_auth_token()
    workspace_id = get_workspace_id(token)
    r = client.get(f"/api/v1/chat/conversations?workspace_id={workspace_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 200
    assert "conversations" in r.json()

def test_get_conversation():
    token, user = get_auth_token()
    workspace_id = get_workspace_id(token)
    conv = client.post("/api/v1/chat/conversations",
        json={"workspace_id": workspace_id, "title": "Get Test"},
        headers={"Authorization": f"Bearer {token}"}
    ).json()
    r = client.get(f"/api/v1/chat/conversations/{conv['id']}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 200
    assert r.json()["id"] == conv["id"]

def test_rename_conversation():
    token, user = get_auth_token()
    workspace_id = get_workspace_id(token)
    conv = client.post("/api/v1/chat/conversations",
        json={"workspace_id": workspace_id, "title": "Old Title"},
        headers={"Authorization": f"Bearer {token}"}
    ).json()
    r = client.patch(f"/api/v1/chat/conversations/{conv['id']}/rename",
        json={"title": "New Title"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 200
    assert r.json()["title"] == "New Title"

def test_delete_conversation():
    token, user = get_auth_token()
    workspace_id = get_workspace_id(token)
    conv = client.post("/api/v1/chat/conversations",
        json={"workspace_id": workspace_id, "title": "Delete Me"},
        headers={"Authorization": f"Bearer {token}"}
    ).json()
    r = client.delete(f"/api/v1/chat/conversations/{conv['id']}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 204

def test_unauthorized_access():
    token, user = get_auth_token()
    workspace_id = get_workspace_id(token)
    conv = client.post("/api/v1/chat/conversations",
        json={"workspace_id": workspace_id, "title": "Private"},
        headers={"Authorization": f"Bearer {token}"}
    ).json()
    r2 = client.post("/api/v1/auth/register", json={
        "email": "hacker@test.com",
        "password": "Test1234!",
        "first_name": "Hacker",
        "last_name": "Test",
    })
    if r2.status_code == 409:
        r2 = client.post("/api/v1/auth/login", json={
            "email": "hacker@test.com", "password": "Test1234!"
        })
    other_token = r2.json()["access_token"]
    r = client.get(f"/api/v1/chat/conversations/{conv['id']}",
        headers={"Authorization": f"Bearer {other_token}"}
    )
    assert r.status_code in [401, 403]

def test_unauthenticated_access():
    r = client.get("/api/v1/chat/conversations?workspace_id=123")
    assert r.status_code in [401, 403]
