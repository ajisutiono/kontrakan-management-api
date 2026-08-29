# Kontrakan Management API

A REST API for managing rental properties (boarding houses / kost), built with **Clean Architecture** and strict **separation of concerns** — explicitly separating business logic, infrastructure, and HTTP layers.

> Built as a backend portfolio project, with a focus on scalable architecture, testability, and code quality.

---

## Architecture

Follows **Clean Architecture** with 4 layers:

```
src/
├── Domains/          # Entities + abstract interfaces (pure business rules)
├── Applications/     # Use Cases (orchestration logic)
├── Infrastructures/  # Database, repositories, security (implementation details)
└── Interfaces/       # HTTP handlers, controllers, routers
```

**Design decisions:**
- **Awilix** for Dependency Injection — enables easy testing and decoupling between layers
- **Repository pattern without ORM** — PostgreSQL queries written manually for full control
- **Authorization in Use Case, not middleware** — role logic lives in the business layer, not the HTTP layer
- **Domain Errors + Translator** — errors are coded (`REGISTER_ROOM.NOT_CONTAIN_NEEDED_PROPERTY`) and translated in one place

---

## Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js 18+ (ESM) |
| Framework | Express 5 |
| Database | PostgreSQL (raw queries, no ORM) |
| Auth | JWT (Access Token + Refresh Token) |
| DI Container | Awilix |
| Testing | Vitest + Supertest |

---

## Features

- [x] Authentication — Register, Login, Refresh Token, Logout
- [x] Room management — add room, listing with filter & pagination
- [ ] Owner dashboard — manage own rooms
- [ ] Tenant management
- [ ] Payment management

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/users` | Register a new user | — |
| POST | `/api/authentications` | Login | — |
| PUT | `/api/authentications` | Refresh access token | — |
| DELETE | `/api/authentications` | Logout | — |

### Rooms

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/rooms` | Add a new room | Owner only |
| GET | `/api/rooms` | List available rooms (public marketplace) | All roles |

---

## Request & Response Examples

### POST /api/users
```bash
POST /api/users
Content-Type: application/json

{
  "name": "Aji Sutiono",
  "email": "aji@mail.com",
  "password": "Password1!",
  "role": "owner"
}
```
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Aji Sutiono",
    "email": "aji@mail.com",
    "role": "owner"
  }
}
```

### GET /api/rooms
```bash
GET /api/rooms?minPrice=500000&maxPrice=1500000&page=1&limit=10
Authorization: Bearer <access_token>
```
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "room_number": "01",
      "type": "30/60",
      "price": 1000000,
      "facilities": ["AC", "private bathroom"],
      "status": "available",
      "owner_id": "uuid",
      "owner_name": "Budi Santoso",
      "owner_email": "budi@mail.com"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

## Testing

This project prioritizes test coverage and reliability.

```bash
# Run all tests
npm test

# With coverage report
npm run test:coverage
```

**Coverage target: 100%** across all completed modules.

**Test types:**
- **Unit tests** — use cases, domain entities, repositories (with mocks)
- **Integration tests** — HTTP endpoints using Supertest against a real database

**Integration test scenarios for `GET /api/rooms` include:**
- Authentication (401 with no token / invalid token)
- Role behavior (both tenant and owner only see `available` rooms)
- Filtering (ownerId, minPrice, maxPrice, combinations)
- Pagination (limit, page, metadata)
- Edge cases (empty page, `booked` rooms cannot be exposed via query override)

---

## Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL

### Installation

```bash
git clone https://github.com/ajisutiono/kontrakan-management-api.git
cd kontrakan-management-api
npm install
cp .env.example .env   # fill in your DB configuration
npm run migrate
npm run start:dev
```

### Environment Variables

```env
HOST=localhost
PORT=5000

PGHOST=localhost
PGPORT=5432
PGDATABASE=kontrakan_db
PGUSER=postgres
PGPASSWORD=yourpassword

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_AGE=900
```

---

## Project Status

This project is actively being developed. Features currently in progress:

- `GET /api/me/rooms` — owner dashboard (view and manage own rooms)
- Tenant management
- Payment management