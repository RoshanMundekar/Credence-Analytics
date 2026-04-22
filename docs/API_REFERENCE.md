# API Reference

Base URL: `http://localhost:5000/api`

All protected endpoints require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication

### Register a New User
`POST /auth/register`

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Validations**
| Field    | Rule                        |
|----------|-----------------------------|
| name     | Required, string            |
| email    | Required, valid email format|
| password | Required, min 6 characters  |

**Success Response** `201 Created`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

**Error Responses**
| Status | Message              |
|--------|----------------------|
| 400    | Validation error     |
| 400    | User already exists  |

---

### Login
`POST /auth/login`

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success Response** `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

**Error Responses**
| Status | Message                |
|--------|------------------------|
| 400    | Validation error       |
| 401    | Invalid email or password |

---

## ✅ Tasks

> All task endpoints require JWT authentication.

---

### Create a Task
`POST /tasks`

**Request Body**
```json
{
  "title": "Fix bug #42",
  "description": "Investigate the login timeout issue",
  "status": "pending",
  "dueDate": "2026-05-01"
}
```

**Validations**
| Field       | Rule                                          |
|-------------|-----------------------------------------------|
| title       | Required, string                              |
| description | Optional, string                              |
| status      | Optional, one of: `pending`, `in_progress`, `completed` |
| dueDate     | Optional, valid ISO date                      |

**Success Response** `201 Created`
```json
{
  "id": 5,
  "title": "Fix bug #42",
  "description": "Investigate the login timeout issue",
  "status": "pending",
  "dueDate": "2026-05-01T00:00:00.000Z",
  "isDeleted": false,
  "createdAt": "2026-04-22T13:00:00.000Z",
  "updatedAt": "2026-04-22T13:00:00.000Z",
  "userId": 1
}
```

---

### List Tasks
`GET /tasks`

**Query Parameters**
| Param   | Type    | Description                                      |
|---------|---------|--------------------------------------------------|
| page    | integer | Page number (default: 1)                         |
| limit   | integer | Items per page (default: 5)                      |
| status  | string  | Filter by status: `pending`, `in_progress`, `completed` |
| search  | string  | Search tasks by title (partial match)            |

**Example Request**
```
GET /tasks?page=1&limit=5&status=pending&search=bug
```

**Success Response** `200 OK`
```json
{
  "tasks": [...],
  "page": 1,
  "pages": 3,
  "total": 12
}
```

---

### Get Single Task
`GET /tasks/:id`

**Success Response** `200 OK`
```json
{
  "id": 5,
  "title": "Fix bug #42",
  ...
}
```

**Error Response**
| Status | Message        |
|--------|----------------|
| 404    | Task not found |

---

### Update a Task
`PUT /tasks/:id`

**Request Body** (same structure as Create Task)
```json
{
  "title": "Fix bug #42 - resolved",
  "status": "completed"
}
```

**Success Response** `200 OK` — Returns the updated task object.

**Error Responses**
| Status | Message        |
|--------|----------------|
| 400    | Validation error|
| 404    | Task not found |

---

### Delete a Task (Soft Delete)
`DELETE /tasks/:id`

Marks the task as deleted (`isDeleted = true`). The task will no longer appear in list results.

**Success Response** `200 OK`
```json
{
  "message": "Task removed"
}
```

**Error Response**
| 404    | Task not found |

---

## 🛡️ Admin Endpoints

> All admin endpoints require JWT authentication and an `admin` role.

### List All Users
`GET /api/admin/users`
Returns a list of all non-admin users with their task counts.

### List All Tasks
`GET /api/admin/tasks`
Lists all tasks from all users. Supports the same `status`, `search`, `page`, and `limit` params as the user task list.

### Create/Update/Delete Tasks
`POST /api/admin/tasks`, `PUT /api/admin/tasks/:id`, `DELETE /api/admin/tasks/:id`
Allows admins to perform CRUD operations on any user's tasks.

