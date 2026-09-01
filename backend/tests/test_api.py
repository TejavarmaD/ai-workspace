
import pytest

from fastapi.testclient import TestClient

import sys

sys.path.insert(0, '/workspaces/ai-workspace')

from backend.app.main import app

client = TestClient(app)

def test_root():

    response = client.get("/")

    assert response.status_code == 200

    assert "AI Workspace" in response.json()["message"]

def test_health():

    response = client.get("/api/v1/health")

    assert response.status_code == 200

    assert response.json()["status"] == "ok"

def test_providers():

    response = client.get("/api/v1/providers")

    assert response.status_code == 200

    assert "providers" in response.json()

def test_models():

    response = client.get("/api/v1/models")

    assert response.status_code == 200

    assert "models" in response.json()

