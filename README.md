# novarecover

Monorepo for the NovaRecover project.

Modules

- **frontend** — React + Vite + Tailwind (Vite React app scaffold)
- **backend** — Node.js + Express + PostgreSQL + Redis + JWT auth (skeleton)
- **ai-service** — Python FastAPI (minimal service)
- **infra** — docker-compose for local environment (Postgres + Redis + backend + frontend + ai-service)

Quick start

1. To run everything locally with Docker Compose:

  docker-compose -f infra/docker-compose.yml up --build

2. To run frontend only (npm workspaces):

  npm install
  npm run dev:frontend

3. To run backend only:

   npm run dev:backend

4. To run ai-service only (local Python):

   cd ai-service
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000

Notes

- The backend has example `.env.example` in `backend/`.
- The infra docker-compose file exposes Postgres (5432), Redis (6379), backend (4000), ai-service (8000) and frontend (5173).

Create an initial user

You can create users via the `/auth/register` endpoint. Example curl to create an admin:

```
curl -X POST http://localhost:4000/auth/register -H 'Content-Type: application/json' -d '{"email":"admin@example.com","password":"pass123","role":"Admin"}'
```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
