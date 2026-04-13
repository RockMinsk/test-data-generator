# Test Data Generator POC — Company X (classicmodels)

A **TypeScript-based Test Data Generator (TDG)** built with `@faker-js/faker` and `mysql2` for the `classicmodels` MySQL schema.

Supports:
- Full DB reset (truncate in FK-safe order)
- Prerequisite data seeding (offices, employees, product lines, products, customers)
- Synthetic transactional data generation (orders, order details, payments)
- Configurable **validity profiles** (valid / invalid / partial data ratios)
- CI/CD-ready (Docker, GitHub Actions)

---

## Project Structure

```
tdg-poc/
├── src/
│   ├── cli.ts                        # CLI entry point
│   ├── config/
│   │   └── config.types.ts           # TypeScript interfaces for config
│   ├── db/
│   │   ├── connection.ts             # mysql2 connection pool
│   │   └── batchWriter.ts            # Bulk INSERT helper
│   ├── generators/
│   │   ├── officeGenerator.ts
│   │   ├── employeeGenerator.ts
│   │   ├── productLineGenerator.ts
│   │   ├── productGenerator.ts
│   │   ├── customerGenerator.ts
│   │   └── orderGenerator.ts         # Orders + OrderDetails + Payments
│   ├── phases/
│   │   ├── resetPhase.ts             # Phase 1: truncate all tables
│   │   ├── seedPhase.ts              # Phase 2: seed prerequisite data
│   │   └── generatePhase.ts          # Phase 3: generate transactional data
│   ├── validity/
│   │   └── validityProfile.ts        # Weighted ratio selector
│   └── utils/
│       └── logger.ts                 # Console logger
├── config.json                       # Default run configuration
├── Dockerfile
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── tdg.yml                   # GitHub Actions workflow
├── package.json
└── tsconfig.json
```

---

## Prerequisites

- **Node.js** >= 20
- **MySQL** >= 5.7 with the `classicmodels` schema created
  - Schema: https://www.mysqltutorial.org/mysql-sample-database.aspx

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure DB connection
Edit `config.json`:
```json
{
  "db": {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "your_password",
    "database": "classicmodels"
  }
}
```

Or copy and customize:
```bash
cp config.json config.local.json
# edit config.local.json
```

### 3. Run
```bash
# Using ts-node (development)
npm start

# With custom config
npx ts-node src/cli.ts config.local.json

# Build & run compiled (production)
npm run build
node dist/cli.js config.json
```

---

## Docker

### Build & run with Docker
```bash
docker build -t tdg-poc .
docker run --rm \
  -v $(pwd)/config.json:/app/config.json \
  --network host \
  tdg-poc
```

### Run with Docker Compose (includes MySQL)
```bash
docker-compose up
```

---

## Configuration Reference

| Key | Description | Default |
|-----|-------------|---------|
| `db.host` | MySQL host | `localhost` |
| `db.port` | MySQL port | `3306` |
| `db.connectionLimit` | Connection pool size | `10` |
| `seed.faker_seed` | Faker seed for reproducibility | `12345` |
| `seed.offices` | Number of offices to generate | `5` |
| `seed.employees_per_office` | Employees per office | `100` |
| `seed.product_lines` | Number of product lines | `50` |
| `seed.products_per_line` | Products per product line | `500` |
| `seed.customers` | Number of customers | `10000` |
| `generate.orders_per_customer` | Orders per customer | `10` |
| `generate.order_details_per_order.min/max` | Line items per order | `1–5` |
| `validity.orders.with_payment` | Ratio of orders with single payment | `0.70` |
| `validity.orders.without_payment` | Ratio of orders with no payment | `0.15` |
| `validity.orders.with_multiple_payments` | Ratio of orders with multiple payments | `0.15` |
| `validity.employees.with_manager` | Ratio of employees with a manager | `0.85` |
| `validity.employees.without_manager` | Ratio of employees without a manager | `0.15` |
| `validity.offices.with_employees` | Ratio of offices that have employees | `0.80` |
| `validity.offices.without_employees` | Ratio of offices with no employees | `0.20` |
| `batch_size` | Insert batch size (rows per query) | `1000` |

---

## Generated Data Volumes (Default Config)

| Table | Rows |
|-------|------|
| offices | 5 |
| employees | 500 (100 × 5 offices) |
| productlines | 50 |
| products | 25,000 (500 × 50 lines) |
| customers | 10,000 |
| orders | 100,000 (10 × 10,000 customers) |
| orderdetails | ~150,000–300,000 (1–5 per order) |
| payments | ~85,000 (85% of orders) |

---

## CI/CD Integration

The TDG is triggered automatically via GitHub Actions every sprint (Monday 6AM) or manually via `workflow_dispatch`. See `.github/workflows/tdg.yml`.
