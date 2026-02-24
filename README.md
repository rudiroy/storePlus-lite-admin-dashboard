# storepulse-lite-backend-api

A minimal Node.js + Express backend scaffold that connects to MongoDB, exposes a simple `Item` model REST API, and includes Swagger (OpenAPI) documentation plus Docker Compose for local development.

Quick start

- Install dependencies:

```bash
npm install
```

- Run locally (requires MongoDB running or use Docker Compose):

```bash
npm run dev
```

- View API docs: `http://localhost:3000/api-docs`

Docker (recommended for local dev):

```bash
docker compose up --build
```

Files added

- `package.json` - project manifest
- `src/` - application code
- `src/config/db.js` - MongoDB connection helper
- `src/models/Item.js` - example Mongoose model
- `src/routes/items.js` - CRUD routes for items
- `src/swagger/openapi.json` - OpenAPI spec
- `Dockerfile`, `docker-compose.yml` - container setup
- `.env.example` - environment variables example
# stockpile-backend-api# stockpile-admin-dashboard
