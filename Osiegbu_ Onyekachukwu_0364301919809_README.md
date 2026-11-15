# MIT 8103 Advanced Database Systems Portfolio — StyleForge

## Student Information
* **Name:** Onyekachukwu Osiegbu
* **Student ID:** 0364301919809
* **Program:** Master of Science in Information Technology
* **Institution:** MIVA Open University
* **Githublink:** https://github.com/osio13/Osiegbu_-Onyekachukwu_0364301919809_styleforge_database_portfolio/blob/main/Osiegbu_%20Onyekachukwu_0364301919809_README.md

This repository is a practical database portfolio for the **StyleForge Fashion Platform**, a simulated UK online fashion retailer. The same case study is used consistently across relational design, query optimisation, transactions, NoSQL modelling, and distributed/cloud database work.

## Case study

StyleForge sells footwear and outerwear with size-based variants. Customers search the catalogue, choose sizes, place orders, pay, and track deliveries. Merchandising staff manage material, sustainability, colour, and performance attributes; fulfilment staff control size-level inventory; finance staff review payments; and analysts examine sales and stock availability.

The database stores customers, addresses, categories, products, variants, inventory, orders, order items, payments, shipments, and audit events. Its key operations are catalogue search, stock updates, checkout, payment recording, order fulfilment, refund processing, and reporting.

## Portfolio map

| Component | Evidence in this repository |
|---|---|
| 1. Database design and modelling | ER diagram, PostgreSQL schema, constraints, seed data, normalisation notes, schema checks |
| 2. Query processing and optimisation | Representative queries, indexes, `EXPLAIN (ANALYZE, BUFFERS)` workflow, results folder |
| 3. Transactions and concurrency | Checkout transaction, rollback example, row-locking concurrency demonstration |
| 4. NoSQL and advanced data models | MongoDB catalogue documents, indexes, validation, and queries |
| 5. Distributed and cloud databases | Architecture diagram and reasoned replication, sharding, consistency, and recovery plan |
| Final documentation | Summary outline, evidence checklist, reflection template, references, AI-use declaration |

## Quick start

Requirements: PostgreSQL 14+ and MongoDB 6+ locally, or Docker with Compose.

```bash
cp .env.example .env
docker compose up -d
psql postgresql://portfolio:portfolio@localhost:5432/styleforge -f portfolio-1-database-design/schema.sql
psql postgresql://portfolio:portfolio@localhost:5432/styleforge -f portfolio-1-database-design/seed.sql
psql postgresql://portfolio:portfolio@localhost:5432/styleforge -f portfolio-1-database-design/tests/schema_checks.sql
```

Load the MongoDB model:

```bash
mongosh mongodb://localhost:27017/styleforge_catalogue portfolio-4-nosql/mongo-init.js
mongosh mongodb://localhost:27017/styleforge_catalogue portfolio-4-nosql/queries.js
```

## Evidence policy

The `evidence/` and `portfolio-2-query-optimisation/results/` directories contain instructions, not fabricated outputs. Capture screenshots, execution plans, timings, logs, and test results only after running the scripts. Record the date, environment, dataset size, and command used for every result.

## Repository practice

- Commit each meaningful step separately.
- Explain changes in commit messages.
- Keep secrets in `.env`, never in Git.
- Verify every script before using its result in the final submission.
- Keep the remote repository private and grant the assessor access before submission.

## Academic integrity

This portfolio is a technical starting point. The student remains responsible for running, validating, explaining, and adapting every artefact. Sources and AI assistance must be declared in the final submission.
