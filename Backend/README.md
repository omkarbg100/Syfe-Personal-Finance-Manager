# Personal Finance Manager Backend

Spring Boot REST API for the Personal Finance Manager application. It handles authentication, user-isolated finance data, transactions, categories, savings goals, reports, and user profile management.

## Deployed Backend

Base URL:

```text
https://syfe-personal-finance-manager.onrender.com/api
```

Root service URL:

```text
https://syfe-personal-finance-manager.onrender.com
```

Swagger UI:

```text
https://syfe-personal-finance-manager.onrender.com/swagger-ui/index.html
```

## Tech Stack

- Java 17
- Spring Boot 3.2.4
- Spring Web
- Spring Security
- Spring Data JPA
- Spring Validation
- H2 in-memory database
- JWT with `jjwt`
- OpenAPI/Swagger via Springdoc
- Maven
- Docker

## Architecture

```text
controller/   HTTP endpoints and request/response handling
service/      Business rules and calculations
repository/   Spring Data JPA repositories
entity/       Database models
dto/          API request and response objects
security/     JWT and session authentication filters
exception/    Centralized API error handling
config/       Security, CORS, and Swagger configuration
util/         Startup data seeding
```

## Local Setup

Run with Maven:

```bash
mvn spring-boot:run
```

Build the jar:

```bash
mvn clean package
```

Run the jar:

```bash
java -jar target/syfe-0.0.1-SNAPSHOT.jar
```

The API runs on:

```text
http://localhost:8080
```

## Docker

Build and run only the backend:

```bash
docker compose up --build
```

The backend container exposes:

```text
http://localhost:8080
```

## Configuration

Main configuration file:

```text
src/main/resources/application.yml
```

Important settings:

- `server.port` uses `${PORT:8080}` for Render compatibility
- H2 database runs in memory as `jdbc:h2:mem:financedb`
- JWT secret and expiration are configured under `jwt`

## Authentication

Public endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`

Protected endpoints:

- All finance, report, profile, and logout endpoints require authentication.

The API returns a JWT token after login/register and also supports session-cookie authentication. Clients can authenticate protected requests with:

```text
Authorization: Bearer <token>
```

Logout invalidates the server session and blacklists the current JWT when one is supplied.

## API Endpoints

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive auth token |
| POST | `/api/auth/logout` | Logout current user |

### Transactions

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/transactions` | List transactions with optional filters |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/{id}` | Update transaction amount/category/description |
| DELETE | `/api/transactions/{id}` | Delete transaction |

Supported transaction filters:

- `startDate`
- `endDate`
- `categoryId`
- `category`
- `categoryName`
- `page`
- `size`

### Categories

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/categories` | List default and user categories |
| POST | `/api/categories` | Create custom category |
| DELETE | `/api/categories/{name}` | Delete custom category by name |

### Goals

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/goals` | List savings goals |
| GET | `/api/goals/{id}` | Get one savings goal |
| POST | `/api/goals` | Create savings goal |
| PUT | `/api/goals/{id}` | Update savings goal |
| DELETE | `/api/goals/{id}` | Delete savings goal |

### Reports

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/reports/monthly/{year}/{month}` | Monthly income, expenses, net savings, and category breakdown |
| GET | `/api/reports/yearly/{year}` | Yearly income, expenses, and net savings |

### Profile

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/users/profile` | Get current user's profile |
| PUT | `/api/users/profile` | Update full name and phone number |

## Example Requests

Register:

```bash
curl -X POST https://syfe-personal-finance-manager.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"user@example.com\",\"password\":\"Password123\",\"fullName\":\"Demo User\"}"
```

Login:

```bash
curl -X POST https://syfe-personal-finance-manager.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"user@example.com\",\"password\":\"Password123\"}"
```

Get categories with a token:

```bash
curl https://syfe-personal-finance-manager.onrender.com/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## H2 Console

Local H2 console:

```text
http://localhost:8080/h2-console
```

Connection details:

- JDBC URL: `jdbc:h2:mem:financedb`
- Username: `sa`
- Password: leave blank

## Validation And Error Handling

The backend uses DTO validation and centralized exception handling to return client-friendly `4xx` responses for invalid input, duplicate records, missing resources, and forbidden cross-user access.

Known examples:

- Duplicate user/category returns conflict
- Invalid dates and negative amounts return bad request
- Missing records return not found
- Unauthorized requests are rejected before reaching protected controllers
