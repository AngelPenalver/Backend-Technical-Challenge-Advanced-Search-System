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

That's it! Docker will handle everything else.

### Quick Start (Recommended)

**Run the entire application with a single command:**

```bash
# 1. Clone the repository
git clone https://github.com/AngelPenalver/Backend-Technical-Challenge-Advanced-Search-System.git
cd Backend-Technical-Challenge-Advanced-Search-System

# 2. Copy environment file
cp .env.example .env

# 3. Start everything with Docker
docker compose up --build
```

Wait for all services to start (approximately 30-60 seconds). The API will be available at: **http://localhost:3000**

To run in detached mode (background):
```bash
docker compose up --build -d
```

To stop all services:
```bash
docker compose down
```

### Alternative: Local Development Setup

If you prefer to run the NestJS app locally (for development):

```bash
# 1. Install Node.js dependencies
npm install -g pnpm
pnpm install

# 2. Start only the services (PostgreSQL, Elasticsearch, Redis)
docker compose up postgres elasticsearch redis -d

# 3. Run the app locally
pnpm run start:dev
```

The API will be available at: **http://localhost:3000**

## API Documentation

Once the application is running, you can access the **interactive Swagger documentation** at:

** http://localhost:3000/api/docs**

The Swagger UI provides:
- Complete API reference with all endpoints
- Request/response examples
- Try-it-out functionality for testing endpoints directly from the browser
- Schema definitions for all DTOs

Alternatively, you can import the **Postman collection** (`Product-Search-API.postman_collection.json`) to test all endpoints with pre-configured requests.

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

## Docker Deployment

To deploy the application using Docker:

**1. Build the Docker image:**
```bash
docker build -t product-search-api .
```

**2. Run with Docker Compose (recommended):**

The provided `docker-compose.yml` includes all required services. Just add the application service:

```bash
docker compose up -d
```

**3. Or run the container standalone:**
```bash
docker run -p 3000:3000 \
  -e POSTGRES_HOST=your_postgres_host \
  -e POSTGRES_PORT=5432 \
  -e POSTGRES_USER=your_user \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=your_db \
  -e ELASTICSEARCH_NODE=http://your_elasticsearch:9200 \
  product-search-api
```

**Note:** Make sure PostgreSQL, Elasticsearch, and Redis are running before starting the application.

---

Made by Ángel Peñalver