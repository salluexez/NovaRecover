Backend service (Node + Express)

Commands

- dev: npm run dev (from repo root: npm run dev:backend)
- start: npm run start

Configuration

Copy `.env.example` to `.env` and update values for `DATABASE_URL`, `REDIS_URL`, and `JWT_SECRET`.

Authentication

- Access tokens are short-lived JWTs returned from `/auth/login` and `/auth/refresh`.
- Refresh tokens are stored server-side in Redis and sent as an `HttpOnly` cookie named `refreshToken`.
- Endpoints: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`.

