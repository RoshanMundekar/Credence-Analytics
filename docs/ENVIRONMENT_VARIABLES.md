# Environment Variables

This document describes all environment variables used across the application.

---

## Backend (`backend/.env`)

| Variable     | Default Value        | Description                                       |
|--------------|----------------------|---------------------------------------------------|
| `PORT`       | `5000`               | Port on which the Express server listens.         |
| `DB_HOST`    | `localhost`          | Hostname of the MySQL database server. Use `db` when running in Docker. |
| `DB_USER`    | `root`               | MySQL username.                                   |
| `DB_PASSWORD`| `password`           | MySQL password.                                   |
| `DB_NAME`    | `task_management`    | Name of the MySQL database to connect to.         |
| `JWT_SECRET` | `supersecretjwtkey`  | Secret key used to sign and verify JWT tokens. **Change this to a long, random string in production.** |

### Example `backend/.env`
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=task_management
JWT_SECRET=a_very_long_and_secure_random_string
```

---

## Docker (`docker-compose.yml`)

When running via Docker Compose, environment variables are injected directly into the `backend` service. Note that `DB_HOST` must be set to `db` (the Docker Compose service name) instead of `localhost`.

```yaml
environment:
  PORT: 5000
  DB_HOST: db          # ← Docker service name, NOT localhost
  DB_USER: root
  DB_PASSWORD: password
  DB_NAME: task_management
  JWT_SECRET: supersecretjwtkey
```

---

## Frontend

The frontend does **not** use a `.env` file for configuration. The API base URL is set directly in `frontend/src/utils/api.js`:

```js
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});
```
If you change the backend port or host, update this value accordingly.

---

## ⚠️ Security Notes

- **Never commit your `.env` file** to version control. It is already excluded via `.gitignore`.
- In production, use a secrets manager (e.g., AWS Secrets Manager, Azure Key Vault) or your CI/CD platform's secret injection.
- Set a strong, random value for `JWT_SECRET` (at least 32 characters).
