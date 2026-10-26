# AXIOM - Intelligent AI Workspace

> Built from zero. Powered by intelligence. Routes every prompt to the best AI model automatically.

![AXIOM](https://img.shields.io/badge/AXIOM-AI%20Workspace-7c3aed?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)

---

## 🧠 Why I Built AXIOM

Most AI tools give you one model. AXIOM is different.

**The Core Idea:** Different AI models excel at different tasks.
- Claude is best at code and reasoning
- Gemini is best at vision and search  
- GPT-4o is best at math and structure

**AXIOM reads your prompt → classifies the task → routes to the most accurate model automatically.**

You just ask. AXIOM picks the best brain.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 Smart Chat | ChatGPT-style interface with streaming responses |
| 🧭 Auto Routing | Automatically picks the best AI for your task |
| 🔄 14 AI Providers | OpenAI, Anthropic, Gemini, Ollama and more |
| 📚 Knowledge Base | Upload PDFs and chat with your own documents (RAG) |
| 🤖 Agent Builder | Create custom AI agents with instructions |
| 📊 Analytics | Real usage stats and charts |
| 📤 Export | Download as PDF, Markdown, or Text |
| 🌙 Dark/Light Mode | Clean minimal design |
| 📱 Mobile Ready | Works on phone, tablet, desktop |
| 🔐 Secure Auth | JWT tokens, Argon2 passwords, workspace isolation |

---

## 🏗️ Built Phase by Phase

### Phase 1 - Foundation
Set up the entire infrastructure before writing any features.
- Project folder architecture
- PostgreSQL + Docker
- FastAPI backend with health endpoints
- React + Vite frontend
- SQLAlchemy ORM + Alembic migrations
- 14 AI providers + 30 models registered
- Git initialized and pushed

### Phase 2 - Authentication + Workspace
Secured the application so only registered users can access it.
- User registration + login
- Argon2 password hashing
- JWT access + refresh tokens
- Protected API routes
- Workspace system with roles (owner/admin/member)
- Workspace invitations
- Login + Register UI

### Phase 3 - Chat Interface + Real AI
Built the actual ChatGPT-style chat connected to real AI.
- Conversations + Messages stored in PostgreSQL
- Google Gemini integration (free tier)
- Chat history persists across browser refreshes
- ChatGPT-style UI with sidebar + composer
- Real AI responses

### Phase 4 - Multi-Model Provider Gateway
Made the app work with any AI provider, not just one.
- AI Gateway with normalized request/response
- Gemini, Anthropic, OpenAI, Ollama adapters
- Provider status endpoint
- Model selector in chat header
- Fallback handler (if primary fails, tries next)

### Phase 5 - AXIOM UI + Intelligent Routing
Transformed into a professional AI workspace with smart model selection.
- Complete AXIOM design system (dark/light mode)
- Collapsible sidebar with all navigation
- Constellation animation login pages
- **Prompt Classifier** - detects task type automatically
- **Intelligent Model Router** - picks best provider per task
- 8 section pages (Images, Library, Projects, Agents, Apps, etc.)

### Phase 6 - RAG + Knowledge Base + Agent Builder
Let users upload documents and build custom AI agents.
- ChromaDB vector database
- PDF, DOCX, TXT processing
- Text chunking + semantic embeddings
- Knowledge Base API + UI
- Agent Builder with instructions, model, tools

### Phase 7 - Analytics + Streaming + Export + Mobile
Polished to production quality.
- Analytics dashboard with real charts
- Streaming responses (word by word like ChatGPT)
- Export as PDF/Markdown/Text
- Mobile responsive with hamburger menu

---

## 🧭 How Intelligent Routing Works

User types: “Write a Python function to sort a list”
↓
Prompt Classifier detects: CODING (confidence: 0.9)
↓
Model Router picks: Claude (best for code)
Claude not configured? → Try GPT-4o
GPT-4o not configured? → Fallback to Gemini
↓
AI Gateway routes to Gemini adapter
↓
Response streamed back to user



**Task Types Detected Automatically:**
`coding` `math` `creative` `analysis` `reasoning` `translation` `summarization` `vision` `search` `conversation`

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy + Alembic** - ORM + migrations
- **PostgreSQL** - Production database
- **ChromaDB** - Vector store for RAG
- **Argon2 + JWT** - Security

### Frontend
- **React 19 + Vite** - UI framework
- **React Router v7** - Navigation
- **Recharts** - Data visualization
- **React Markdown** - Render AI responses
- **jsPDF** - Export to PDF

---

## 📁 Project Structure
ai-workspace/
├── backend/
│ ├── app/
│ │ ├── api/v1/routes/ # Auth, Chat, Knowledge, Analytics
│ │ ├── core/ # Config, Security, Dependencies
│ │ ├── db/models/ # Users, Conversations, Knowledge
│ │ ├── gateway/ # Classifier, Router, Adapters
│ │ └── services/ # Auth, Chat, RAG, Workspace
│ └── alembic/ # Database migrations
├── frontend/
│ └── src/
│ ├── components/ # AppShell, Sidebar, Chat, Models
│ ├── pages/axiom/ # All 8 AXIOM pages
│ └── lib/ # API client, Auth, Theme, Export
└── docker-compose.yml


---

## 🗄️ Database Tables
**users** → accounts and profiles
**workspaces** → user workspaces
**workspace_members** → roles per workspace
**refresh_tokens** → JWT session management
**conversations** → chat sessions
**messages** → individual messages
**knowledge_bases** → document collections
**knowledge_documents** → uploaded files
**agents** → custom AI agents


---

## 🚀 Local Setup
```bash
# 1. Clone
git clone https://github.com/TejavarmaD/ai-workspace.git
cd ai-workspace

# 2. Start database
docker run -d --name ai-workspace-db \
  -e POSTGRES_DB=aiworkspace \
  -e POSTGRES_USER=aiworkspace \
  -e POSTGRES_PASSWORD=aiworkspace \
  -p 5432:5432 postgres:16

# 3. Install backend
pip install -r backend/requirements.txt

# 4. Configure
cp .env.example .env
# Add GOOGLE_API_KEY from aistudio.google.com (free)

# 5. Run migrations
alembic upgrade head

# 6. Start backend
python3 -m uvicorn backend.app.main:app --reload --port 8000

# 7. Start frontend
cd frontend && npm install && npm run dev
```

---

## 🔑 Environment Variables

```bash
# Required
GOOGLE_API_KEY=      # Free at aistudio.google.com
DATABASE_URL=        # PostgreSQL connection string
SECRET_KEY=          # Random secret key

# Optional
ANTHROPIC_API_KEY=   # console.anthropic.com
OPENAI_API_KEY=      # platform.openai.com
```

---

## 🧪 Tests

```bash
python3 -m pytest backend/tests/ -v
# 11 passed ✅
```

---

## 📡 Key API Endpoints
POST /api/v1/auth/register Register
POST /api/v1/auth/login Login
GET /api/v1/chat/conversations List chats
POST /api/v1/chat/conversations New chat
POST /api/v1/chat/.../messages Send message
POST /api/v1/chat/.../stream Streaming response
POST /api/v1/chat/auto-route Preview routing decision
GET /api/v1/analytics/overview Usage stats
POST /api/v1/knowledge/bases Create knowledge base
GET /docs Interactive API docs


---

## 🔐 Security

- Argon2 password hashing
- JWT tokens expire in 30 minutes
- API keys never reach the browser
- Per-user conversation isolation
- Workspace access control

---

## 👨‍💻 Author

**Tejavarma Dommaraju**
GitHub: [@TejavarmaD](https://github.com/TejavarmaD)

*Started with zero coding knowledge. Built a production-grade AI platform using AI.*

---

## 📄 License

MIT - free to use, modify, distribute.

---

*AXIOM - The right AI for every question.*