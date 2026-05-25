# Personal Finance Manager Frontend

React frontend for the Personal Finance Manager application. It connects to the Spring Boot API, protects finance pages behind login, and gives users a dashboard for managing transactions, categories, goals, reports, and profile details.

## Features

- Login and registration screens
- Protected application layout after authentication
- Dashboard with income, expense, savings, goal, and category visualizations
- Monthly, yearly, and transaction CSV downloads
- Transaction create, update, delete, and list views
- Category create, delete, and list views
- Savings goal create, update, delete, and detail refresh
- User profile view and update page
- Responsive UI built with Tailwind CSS

## Tech Stack

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- ESLint
- Nginx for Docker serving

## API Configuration

The frontend reads the backend API base URL from:

```text
VITE_API_URL
```

If no value is provided, the app falls back to:

```text
http://localhost:8080/api
```

For local development against the deployed backend, create a `.env` file in `frontend/`:

```env
VITE_API_URL=https://syfe-personal-finance-manager.onrender.com/api
```

For local development against a local backend:

```env
VITE_API_URL=http://localhost:8080/api
```

## Local Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Pages

- `/login` - user login
- `/register` - user registration
- `/` - dashboard
- `/transactions` - transaction management
- `/categories` - category management
- `/goals` - savings goal management
- `/profile` - user profile

## Docker

Build the frontend image:

```bash
docker build --build-arg VITE_API_URL=https://syfe-personal-finance-manager.onrender.com/api -t finance-frontend .
```

Run it:

```bash
docker run -p 3000:80 finance-frontend
```

The container serves the app with Nginx.

## Important Files

- `src/services/api.js` - Axios instance and auth token handling
- `src/context/AuthContext.jsx` - login, register, logout, and user state
- `src/pages/Dashboard.jsx` - charts, report summaries, and CSV export
- `src/pages/Transactions.jsx` - transaction CRUD
- `src/pages/Categories.jsx` - category CRUD
- `src/pages/Goals.jsx` - savings goal CRUD
- `src/pages/Profile.jsx` - user profile UI
