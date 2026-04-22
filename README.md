# Task Management Full-Stack Application

This is a full-stack Task Management application featuring a Node.js/Express backend (with raw MySQL queries via `mysql2`) and a React/Vite frontend.

## Features

- **Authentication**: User registration and login using JWT and bcrypt.
- **Task Management**: Create, read, update, and soft-delete tasks.
- **Pagination & Filtering**: Filter tasks by status, search by title, and paginate through results.
- **Responsive UI**: A beautiful, modern, dark-mode React interface with a scrollable task grid.
- **Swagger API Docs**: Fully interactive OpenAPI documentation built-in.

---

## 🛠 Backend Setup

### Prerequisites
- Node.js installed
- MySQL 5.0 (or newer) running locally (e.g., via SQLYog)

### 1. Database Configuration
Before running the backend, you must manually create the database tables using the provided SQL script:
1. Open your MySQL client (SQLYog).
2. Open the file `backend/database.sql`.
3. Execute all the queries in the file to create the `task_management` database and the `users` and `tasks` tables.

### 2. Environment Variables
Navigate to the `backend` directory and edit the `.env` file to match your database configuration:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=task_management
JWT_SECRET=supersecretjwtkey
```

### 3. Installation & Running
From the root folder, run:
```bash
cd backend
npm install
npm run dev
```
The backend server will start on `http://localhost:5000`.

### 📚 API Documentation
Once the backend server is running, you can view and test the interactive API documentation (Swagger/OpenAPI) by visiting:
**[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

---

## 🎨 Frontend Setup

The frontend is a modern React application built with Vite.

### 1. Installation
Open a new terminal window and run:
```bash
cd frontend
npm install
```

### 2. Running the Application
```bash
npm run dev
```
The React frontend will start locally (usually on `http://localhost:5173`). 

---

## Architecture Decisions
- **Raw SQL over Prisma**: To ensure full compatibility with MySQL 5.0, Prisma ORM was bypassed in favor of raw SQL queries using the `mysql2` driver. 
- **Vanilla CSS**: The frontend utilizes custom, highly-responsive vanilla CSS featuring CSS Variables, Flexbox/Grid layouts, and micro-animations.

---

## 🐳 Docker Setup

You can spin up the **entire stack** (MySQL 5.7, backend API, and frontend) with a single command using Docker Compose.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### ⚠️ Important: Frontend API URL
Before building the Docker image for the frontend, update the base URL in `frontend/src/utils/api.js` so it points to the Docker backend:
```js
baseURL: 'http://localhost:5000/api',
```
This is already the correct default value.

### Running with Docker Compose
From the **root** directory of the project, run:
```bash
docker-compose up --build
```
This single command will:
1. Start a **MySQL 5.7** database container and automatically run the `database.sql` schema script to create tables.
2. Build and start the **Node.js backend** API server on port `5000`.
3. Build and start the **React frontend** (served via Nginx) on port `3000`.

### Services & Ports

| Service  | URL                              | Default Credentials |
|----------|----------------------------------|---------------------|
| Frontend | http://localhost:3000            | -                   |
| Admin    | http://localhost:3000/admin/login| admin@gmail.com / admin |
| Backend  | http://localhost:5000            | -                   |
| Swagger  | http://localhost:5000/api-docs   | -                   |
| MySQL DB | localhost:3306                   | root / password     |

### Stopping the Services
```bash
docker-compose down
```
To also delete the database volume (all data):
```bash
docker-compose down -v
```

### Docker Environment Variables
Environment variables for the backend are defined inline in `docker-compose.yml`. You can modify them there directly:
```yaml
environment:
  DB_HOST: db
  DB_USER: root
  DB_PASSWORD: password
  DB_NAME: task_management
  JWT_SECRET: supersecretjwtkey
  PORT: 5000
```

> **Note**: The `DB_HOST` is `db` (the Docker Compose service name), NOT `localhost`, when running inside Docker.
