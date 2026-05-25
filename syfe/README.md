# Personal Finance Manager

A comprehensive Personal Finance Manager built with Spring Boot and React.

## Architecture
The application uses a clean layered architecture for the backend:
- **Controllers**: Handle HTTP requests and responses.
- **Services**: Contain business logic and rules.
- **Repositories**: Interface with the H2 database.
- **Security**: JWT-based authentication using Spring Security.

## Tech Stack
- **Backend**: Java 17, Spring Boot 3.x, Spring Data JPA, Hibernate, Spring Security, H2 Database, Maven
- **Frontend**: React, Vite, Vanilla CSS

## Setup Instructions

### Backend (Local)
1. Navigate to the `syfe` directory.
2. Run `mvn clean install`
3. Run the application using `mvn spring-boot:run`

### Frontend (Local)
1. Navigate to the `frontend` directory.
2. Run `npm install`
3. Run the dev server using `npm run dev`

### Docker Setup
You can run the backend via Docker Compose:
```sh
cd syfe
docker-compose up --build
```

## API Documentation
Once the backend is running, you can access the Swagger UI at:
`http://localhost:8080/swagger-ui/index.html`

## H2 Console
You can access the H2 in-memory database at:
`http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:financedb`
- Username: `sa`
- Password: *(leave blank)*
