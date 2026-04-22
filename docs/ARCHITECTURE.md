# Project Architecture & Flow

This document describes the complete flow of the Task Management Application using architecture and sequence diagrams.

---

## 🏗️ System Architecture Overview

```mermaid
graph TB
    subgraph "Client (Browser)"
        UI["⚛️ React Frontend\n(Vite, Port 3000)"]
    end

    subgraph "API Layer"
        API["🟢 Node.js / Express\n(Port 5000)"]
        SW["📖 Swagger UI\n/api-docs"]
    end

    subgraph "Data Layer"
        DB[("🐬 MySQL 5.0\nDatabase\n(Port 3306)")]
    end

    UI -->|"HTTP Requests\n(axios + JWT)"| API
    API -->|"Raw SQL via mysql2"| DB
    DB -->|"Query Results"| API
    API -->|"JSON Response"| UI
    SW -->|"Documents"| API
```

---

## 🔒 Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant Backend as Express Backend
    participant DB as MySQL Database

    User->>Frontend: Fill in Register/Login Form
    Frontend->>Backend: POST /api/auth/register OR /api/auth/login

    Backend->>Backend: Validate payload via Joi

    alt Registration
        Backend->>DB: SELECT user by email
        DB-->>Backend: No user found
        Backend->>Backend: bcrypt.hash(password)
        Backend->>DB: INSERT INTO users
        DB-->>Backend: New user ID
    else Login
        Backend->>DB: SELECT user by email
        DB-->>Backend: User row
        Backend->>Backend: bcrypt.compare(password, hash)
    end

    Backend->>Backend: jwt.sign(userId, email, role)
    Backend-->>Frontend: 200/201 JSON { id, name, email, role, token }
    Frontend->>Frontend: Save token to localStorage
    Frontend->>User: Redirect to Dashboard / Admin Dashboard
```

---


## 🛡️ Admin Management Flow

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend as React Frontend
    participant AdminMW as AdminOnly Middleware
    participant Backend as Express Backend
    participant DB as MySQL Database

    Admin->>Frontend: Access Admin Dashboard
    Frontend->>Backend: GET /api/admin/users
    Backend->>AdminMW: Check role == 'admin'
    AdminMW->>Backend: Authorized
    Backend->>DB: SELECT users with task counts
    DB-->>Backend: User list
    Backend-->>Frontend: 200 OK [users]

    Admin->>Frontend: Select User -> View Tasks
    Frontend->>Backend: GET /api/admin/tasks?userId=123
    Backend->>DB: SELECT * FROM tasks WHERE userId=123
    DB-->>Backend: Tasks array
    Backend-->>Frontend: 200 OK { tasks }
```
```

---

## 📁 Project Folder Structure

```mermaid
graph TD
    ROOT["📦 Credence Analytics (root)"]
    ROOT --> BE["📂 backend"]
    ROOT --> FE["📂 frontend"]
    ROOT --> DOCS["📂 docs"]
    ROOT --> DC["🐳 docker-compose.yml"]
    ROOT --> RM["📄 README.md"]
    ROOT --> GI["🙈 .gitignore"]

    BE --> BE_SRC["📂 src"]
    BE_SRC --> BE_CONFIG["📂 config\n(db.js)"]
    BE_SRC --> BE_CTRL["📂 controllers\n(auth, task, admin)"]
    BE_SRC --> BE_MID["📂 middlewares\n(auth, error)"]
    BE_SRC --> BE_ROUTES["📂 routes\n(auth, task, admin)"]
    BE_SRC --> BE_UTILS["📂 utils\n(validators, swagger)"]
    BE_SRC --> BE_APP["app.js"]
    BE_SRC --> BE_SRV["server.js"]
    BE --> BE_ENV[".env"]
    BE --> BE_SQL["database.sql"]
    BE --> BE_DOCKER["Dockerfile"]

    FE --> FE_SRC["📂 src"]
    FE_SRC --> FE_CTX["📂 context\n(AuthContext)"]
    FE_SRC --> FE_COMP["📂 components\n(Navbar)"]
    FE_SRC --> FE_PAGES["📂 pages\n(Login, Register, Dashboard, AdminLogin, AdminDashboard)"]
    FE_SRC --> FE_UTILS2["📂 utils\n(api.js)"]
    FE_SRC --> FE_CSS["index.css"]
    FE --> FE_DOCKER["Dockerfile"]
    FE --> FE_NGINX["nginx.conf"]

    DOCS --> D1["API_REFERENCE.md"]
    DOCS --> D2["ARCHITECTURE.md"]
    DOCS --> D3["ENVIRONMENT_VARIABLES.md"]
```

---

## 🔄 Request Lifecycle (Middleware Chain)

```mermaid
flowchart LR
    REQ["📥 Incoming Request"] --> CORS["CORS Middleware"]
    CORS --> JSON["JSON Body Parser"]
    JSON --> ROUTER["Express Router"]
    ROUTER --> AUTH{"Is Protected\nRoute?"}
    AUTH -->|Yes| JWT["JWT Middleware\nverify token"]
    AUTH -->|No| CTRL
    JWT -->|Invalid| ERR1["401 Unauthorized"]
    JWT -->|Valid| CTRL["Controller\nFunction"]
    CTRL --> JOI["Joi Validation"]
    JOI -->|Fail| ERR2["400 Bad Request"]
    JOI -->|Pass| DB["MySQL Query\n(mysql2)"]
    DB --> RES["📤 JSON Response"]
    CTRL --> ERRM["Error thrown"]
    ERRM --> CENTRAL["Centralized Error\nMiddleware"]
    CENTRAL --> ERRRES["HTTP Error Response\n(status + message)"]
```
