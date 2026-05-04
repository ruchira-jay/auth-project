# Auth App

A full-stack authentication and user management system built with **NestJS** (backend) and **Next.js** (frontend), featuring role-based access control, JWT authentication, and a modern animated UI.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | NestJS, MongoDB (Mongoose), Passport JWT, bcryptjs |
| Frontend  | Next.js 16, TypeScript, Tailwind CSS v4, Anime.js |
| Database  | MongoDB                                 |
| Auth      | JWT (JSON Web Tokens)                   |

---

## Project Structure

```
auth/
├── auth-project/        # NestJS backend (port 3001)
│   └── src/
│       ├── auth/        # JWT auth, login, register, guards
│       ├── users/       # User CRUD, schema, DTOs
│       └── common/      # Roles decorator, guards
│
└── auth-frontend/       # Next.js frontend (port 3000)
    ├── app/
    │   ├── login/
    │   ├── register/
    │   └── dashboard/
    └── lib/
        └── api.ts       # API helper functions
```

---

## Roles & Permissions

| Role          | Permissions                                      |
|---------------|--------------------------------------------------|
| `user`        | View own profile                                 |
| `admin`       | View all users                                   |
| `super_admin` | View all users, create users, delete users       |

> Public registration always creates a `user` role.  
> The first super admin must be created via `POST /auth/register-super-admin` (only works once).

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally on port `27017`

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd auth
```

### 2. Run the Backend

```bash
cd auth-project
npm install
npm run start:dev
```

Backend runs at `http://localhost:3001`

### 3. Run the Frontend

```bash
cd auth-frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## API Endpoints

### Auth

| Method | Endpoint                      | Description                        | Auth Required |
|--------|-------------------------------|------------------------------------|---------------|
| POST   | `/auth/register`              | Register a new user (role: user)   | No            |
| POST   | `/auth/register-super-admin`  | Register super admin (once only)   | No            |
| POST   | `/auth/login`                 | Login and receive JWT token        | No            |
| GET    | `/auth/me`                    | Get current logged-in user info    | Yes           |

### Users

| Method | Endpoint        | Description          | Auth Required     |
|--------|-----------------|----------------------|-------------------|
| GET    | `/users`        | Get all users        | Admin / Super Admin |
| POST   | `/users`        | Create a user        | Super Admin       |
| DELETE | `/users/:id`    | Delete a user        | Super Admin       |

---

## Environment Variables

Create a `.env` file inside `auth-project/` if you want to override defaults:

```env
JWT_SECRET=your_secret_key
MONGO_URI=mongodb://127.0.0.1:27017/auth-project
```

> The app falls back to `jwt_secret_key` and the hardcoded Mongo URI if no `.env` is provided.

---

## Features

- JWT-based authentication with role-based access control
- Password hashing with bcryptjs (salt rounds: 10)
- Animated UI with Anime.js (entrance animations, shake on error, staggered table rows)
- Responsive design with a dark green color theme
- Protected routes — unauthenticated users are redirected to login
- Single super admin enforcement (only one can exist)

---

## Branch Strategy

```
main   → stable, production-ready code
dev    → active development
```

```bash
# work on dev
git checkout dev
git add .
git commit -m "feat: your feature"
git push origin dev

# merge to main when ready
git checkout main
git merge dev
git push origin main
```

---

## License

MIT
