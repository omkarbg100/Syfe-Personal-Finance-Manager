# Personal Finance Manager

A full-stack personal finance manager for tracking income, expenses, custom categories, savings goals, monthly/yearly reports, and user profile details.

The project is split into a Spring Boot backend and a React/Vite frontend. The backend exposes a secured REST API, while the frontend provides a dashboard-driven finance workspace with transactions, categories, goals, reports, CSV exports, and profile management.

## Live Backend

Backend API base URL:

```text
https://syfe-personal-finance-manager.onrender.com/api
```

Swagger UI is available when enabled by the deployment:

```text
https://syfe-personal-finance-manager.onrender.com/swagger-ui/index.html
```

## Project Structure

```text
.
+-- frontend/          React + Vite client
+-- syfe/              Spring Boot REST API
+-- docker-compose.yml Local full-stack Docker setup
+-- README.md          Project overview
```

## Features

- User registration, login, logout, and protected API access
- JWT and session-cookie based authentication support
- Transaction CRUD with filtering by date and category
- Income and expense category management
- Savings goals with progress calculations
- Monthly and yearly financial reports
- Dashboard charts and finance summaries
- CSV download for monthly, yearly, and transaction reports
- User profile view and update
- Docker support for local full-stack runs

## Tech Stack

Backend:

- Java 17
- Spring Boot 3.2
- Spring Security
- Spring Data JPA
- H2 database
- Maven
- OpenAPI/Swagger

Frontend:

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Nginx for Docker production serving

## Local Development

Start the backend:

```bash
cd syfe
mvn spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Docker

Run both services:

```bash
docker compose up --build
```

Default Docker ports:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

## API Summary

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

Transactions:

- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/{id}`
- `DELETE /api/transactions/{id}`

Categories:

- `GET /api/categories`
- `POST /api/categories`
- `DELETE /api/categories/{name}`

Goals:

- `GET /api/goals`
- `GET /api/goals/{id}`
- `POST /api/goals`
- `PUT /api/goals/{id}`
- `DELETE /api/goals/{id}`

Reports:

- `GET /api/reports/monthly/{year}/{month}`
- `GET /api/reports/yearly/{year}`

Profile:

- `GET /api/users/profile`
- `PUT /api/users/profile`

## Documentation

More focused setup and implementation notes are available in:

- [Frontend README](frontend/README.md)
- [Backend README](syfe/README.md)
