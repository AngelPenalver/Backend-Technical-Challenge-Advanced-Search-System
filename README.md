# Product Search System

A backend system to manage and search products, built with **NestJS** and **Docker**. This project demonstrates a clean, modular architecture that keeps business logic independent from infrastructure concerns.

## Technologies

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **TypeORM** - Database ORM for PostgreSQL
- **PostgreSQL** - Primary database
- **Elasticsearch 7.17** - Search engine for fast product queries
- **Redis** - Caching layer
- **Docker & Docker Compose** - Containerization
- **pnpm** - Fast, efficient package manager

## Project Structure

This project follows a **modular architecture inspired by Hexagonal Architecture** (Ports & Adapters). The goal is to keep the business logic independent from external tools like databases or APIs.

```
src/
├── products/
│   ├── domain/              # Business models and interfaces (ports)
│   ├── application/         # Use cases (business logic)
│   └── infrastructure/      # Adapters (databases, controllers, search)
```

### Why this structure?

- **Domain**: Contains the core business models (`Product`) and ports (interfaces). No dependencies on frameworks or databases.
- **Application**: Contains use cases like `CreateProductUseCase`. This is where the business logic lives.
- **Infrastructure**: Contains adapters that implement the ports—like `PostgresProductRepository` for the database and `ElasticProductAdapter` for search.

This separation makes the code **easier to test, maintain, and scale**.

##  Setup & Run

### Prerequisites

Make sure you have these installed:

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) - Install with: `npm install -g pnpm`

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/AngelPenalver/Backend-Technical-Challenge-Advanced-Search-System.git
cd Backend-Technical-Challenge-Advanced-Search-System
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

The default values in `.env.example` are ready to use with Docker Compose, so you don't need to change anything unless you want custom configurations.

4. **Start Docker services**

This will start PostgreSQL, Elasticsearch, Redis, and PgAdmin:

```bash
docker compose up -d
```

Wait a few seconds for all services to be healthy. You can check with:

```bash
docker ps
```

5. **Run the application**

```bash
pnpm run start:dev
```

The API will be available at: **http://localhost:3000**

## API Usage

### Create a Product

**Endpoint:** `POST /api/products`

**Request Body:**

```json
{
  "name": "Camiseta Premium",
  "description": "Camiseta de algodón orgánico con ajuste clásico y diseño minimalista.",
  "price": 29.99,
  "stock": 150,
  "category": "Ropa"
}
```

**Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Camiseta Premium",
  "description": "Camiseta de algodón orgánico con ajuste clásico y diseño minimalista.",
  "price": 29.99,
  "stock": 150,
  "category": "Ropa",
  "createdAt": "2025-12-10T20:00:00.000Z",
  "updatedAt": "2025-12-10T20:00:00.000Z"
}
```

### What happens when you create a product?

1. The product is validated using class-validator
2. It's saved to **PostgreSQL** via TypeORM
3. It's automatically indexed in **Elasticsearch** for fast search
4. Returns the created product with generated ID and timestamps

## Docker Services

The `docker-compose.yml` sets up the following services:

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Primary database |
| Elasticsearch | 9200 | Search engine |
| Redis | 6379 | Cache (future use) |
| PgAdmin | 5050 | Database management UI |

### Access PgAdmin

- URL: http://localhost:5050
- Email: `admin@admin.com`
- Password: `admin`

## Development

### Watch mode (auto-reload on changes)

```bash
pnpm run start:dev
```

### Build for production

```bash
pnpm run build
```

### Run production build

```bash
pnpm run start:prod
```

---

**Built with ❤️ using NestJS and TypeScript**