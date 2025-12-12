# Backend Technical Challenge - Product Search System

Backend system to manage and search products. Built with NestJS, TypeScript and Docker to make everything easier to run.

## Tech Stack

- **NestJS** - Node.js framework
- **TypeScript** - For typing and avoiding errors
- **TypeORM** - To handle PostgreSQL database
- **PostgreSQL** - Main database
- **Elasticsearch 7.17** - For fast product searches
- **Redis** - For caching (not fully implemented yet)
- **Docker & Docker Compose** - To run all services
- **pnpm** - Package manager (faster than npm)

## Project Structure

I organized this project using **Hexagonal Architecture** (also called Ports & Adapters). The main idea is to keep the business logic independent from external tools like databases, frameworks, or APIs. This makes testing easier and allows swapping implementations without changing core logic.

Here's the complete structure:

```
src/
├── main.ts                                    # App entry point
├── app.module.ts                              # Root module
└── products/
    ├── products.module.ts                     # Products module config
    │
    ├── domain/                                # DOMAIN LAYER (Core Business)
    │   ├── models/
    │   │   └── product.model.ts              # Product entity (business rules)
    │   ├── ports/                            # Interfaces (contracts)
    │   │   ├── product.repository.port.ts    # Contract for data storage
    │   │   └── search-service.port.ts        # Contract for search operations
    │   └── value-objects/
    │       └── search-query.vo.ts            # Search query encapsulation
    │
    ├── application/                           # APPLICATION LAYER (Use Cases)
    │   ├── dtos/
    │   │   ├── create-product.dto.ts         # Input validation for creation
    │   │   └── query-product.dto.ts          # Input validation for search
    │   └── use-cases/
    │       ├── create-product.use-case.ts    # Business logic: create product
    │       └── search-products.use-case.ts   # Business logic: search products
    │
    └── infrastructure/                        # INFRASTRUCTURE LAYER (Adapters)
        ├── controllers/
        │   └── product.controller.ts         # HTTP/REST API endpoints
        ├── persistence/
        │   ├── entities/
        │   │   └── product.entity.ts         # TypeORM database schema
        │   └── repositories/
        │       └── postgres-product.repository.ts  # Implements repository port
        ├── search/
        │   ├── elastic-product.adapter.ts    # Implements search port
        │   ├── elasticsearch.constants.ts    # ES configuration constants
        │   └── elasticsearch.types.ts        # ES type definitions
        └── seeder/
            └── product.seeder.service.ts     # Database seeding utility
```

### Layer Breakdown

#### Domain Layer (`domain/`)

This is the **heart of the application**. It contains:

- **Models**: Pure business entities with no framework dependencies. The `Product` model represents what a product IS in our business.
- **Ports**: Interfaces that define what operations we need (like saving or searching products) without saying HOW to do them. This is the key to hexagonal architecture.
- **Value Objects**: Small, immutable objects that represent concepts like a search query with its validation rules.

**Important**: This layer has ZERO dependencies on NestJS, TypeORM, Elasticsearch, or any external library. That's intentional!

#### Application Layer (`application/`)

This is where the **business logic lives**. It contains:

- **DTOs (Data Transfer Objects)**: Classes that validate input from the outside world using `class-validator`. They ensure data is correct before it reaches our business logic.
- **Use Cases**: Each use case represents one thing the application can do (like "Create Product" or "Search Products"). They orchestrate the domain models and ports to accomplish tasks.

**Example**: `CreateProductUseCase` receives validated data, creates a `Product` model, saves it using the repository port, and indexes it using the search port.

#### Infrastructure Layer (`infrastructure/`)

This is where we **implement the ports** with actual technologies:

- **Controllers**: Handle HTTP requests, call use cases, and return responses. This is the entry point from the outside world.
- **Persistence**: Contains TypeORM entities (database schema) and repository implementations that save/retrieve data from PostgreSQL.
- **Search**: Elasticsearch adapter that implements the search port, handling indexing and querying.
- **Seeder**: Utility to populate the database with sample data for development/testing.

**Key point**: If I wanted to swap PostgreSQL for MongoDB or Elasticsearch for Algolia, I'd only change files in this layer. The domain and application layers wouldn't know or care!

### How Data Flows

1. **Request comes in** → `ProductController` receives HTTP request
2. **Validation** → DTO validates the input data
3. **Use Case** → Controller calls the appropriate use case (e.g., `CreateProductUseCase`)
4. **Business Logic** → Use case works with domain models and calls ports
5. **Adapters** → Infrastructure implementations (repositories, search) do the actual work
6. **Response goes out** → Controller returns the result to the client

This separation makes the code:
- **Testable**: Can mock ports and test use cases independently
- **Flexible**: Can swap implementations without touching business logic
- **Maintainable**: Clear responsibilities for each layer
- **Scalable**: Easy to add new features following the same pattern

## Installation and Usage

### Prerequisites

You need to have installed:

- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [pnpm](https://pnpm.io/) - install it with: `npm install -g pnpm`

### Steps to run the project

**1. Clone the repository**

```bash
git clone https://github.com/AngelPenalver/Backend-Technical-Challenge-Advanced-Search-System.git
cd Backend-Technical-Challenge-Advanced-Search-System
```

**2. Install dependencies**

```bash
pnpm install
```

**3. Configure environment variables**

Copy the example file:

```bash
cp .env.example .env
```

Default values are already set up to work with Docker, so you don't need to change anything unless you want to.

**4. Start Docker services**

This starts PostgreSQL, Elasticsearch, Redis and PgAdmin:

```bash
docker compose up -d
```

Wait a few seconds for everything to be ready. You can check with:

```bash
docker ps
```

**5. Run the application**

```bash
pnpm run start:dev
```

The API will be available at: **http://localhost:3000**

## Available Endpoints

### Create a product

**POST** `/api/products`

**Body:**

```json
{
  "name": "Gaming Laptop",
  "description": "Powerful laptop for gaming and video editing",
  "price": 1299.99,
  "stock": 50,
  "category": "Electronics"
}
```

**Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Gaming Laptop",
  "description": "Powerful laptop for gaming and video editing",
  "price": 1299.99,
  "stock": 50,
  "category": "Electronics",
  "createdAt": "2025-12-10T20:00:00.000Z",
  "updatedAt": "2025-12-10T20:00:00.000Z"
}
```

### Search products

**GET** `/api/products/search?query=laptop&minPrice=500&maxPrice=2000&category=Electronics`

Optional parameters:
- `query`: Text to search in name and description
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `category`: Filter by category
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

### What happens when you create a product?

1. Product gets validated with class-validator
2. It's saved to PostgreSQL using TypeORM
3. It's automatically indexed in Elasticsearch for fast searches
4. Returns the created product with its ID and timestamps

## Docker Services

The `docker-compose.yml` sets up these services:

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Main database |
| Elasticsearch | 9200 | Search engine |
| Redis | 6379 | Cache |
| PgAdmin | 5050 | UI to manage the DB |

### Access PgAdmin

If you want to see the database graphically:

- URL: http://localhost:5050
- Email: `admin@admin.com`
- Password: `admin`

## Useful Commands

**Development mode (with hot reload):**
```bash
pnpm run start:dev
```

**Build for production:**
```bash
pnpm run build
```

**Run production version:**
```bash
pnpm run start:prod
```

**View Docker logs:**
```bash
docker compose logs -f
```

**Stop containers:**
```bash
docker compose down
```

---

Made by Ángel Peñalver