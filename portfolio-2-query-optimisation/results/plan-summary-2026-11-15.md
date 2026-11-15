# Query-Plan Comparison — 15 November 2026

## Test conditions

- PostgreSQL 14.15 (Homebrew), local Apple Silicon environment
- Seed data: 2 customers, 2 products, 3 variants, 3 inventory rows, 1 order, and 1 payment
- Before: schema-defined keys and constraints only
- After: `indexes.sql` applied, followed by `ANALYZE`
- Capture command: `psql -X -d styleforge_portfolio_verify_20261115 -f portfolio-2-query-optimisation/queries.sql`

## Results

| Query | Principal plan before | Execution before | Principal plan after | Execution after | Interpretation |
|---|---|---:|---|---:|---|
| Q1 Customer order history | Sequential scan on `orders`, then sort | 0.022 ms | Sequential scan on `orders`, then sort | 0.035 ms | One order makes a sequential scan cheaper than using the new customer/date index; this run also shows that timing noise can outweigh any change. |
| Q2 Catalogue search | Sequential scans plus hash/nested-loop joins | 0.054 ms | Sequential scans plus nested-loop joins | 0.049 ms | Two products and three variants are too few to demonstrate the trigram or partial indexes. |
| Q3 Low stock | Sequential scan on `inventory`; 3 rows removed by filter | 0.032 ms | Sequential scan on `inventory`; 3 rows removed by filter | 0.015 ms | No row qualified, and scanning three inventory rows was cheapest. |
| Q4 Monthly revenue | Sequential scans, hash join, sort, group aggregate | 0.028 ms | Sequential scans, nested loop, sort, group aggregate | 0.033 ms | One order and one payment do not justify the optional reporting indexes; the small increase is normal measurement noise. |
| Q5 JSONB attribute filter | Sequential scan on `products`; 1 row returned | 0.005 ms | Sequential scan on `products`; 1 row returned | 0.006 ms | A GIN lookup would cost more than scanning two products. |

All plans reported shared-buffer hits and no material disk-read workload in the measured execution. These single-run, sub-millisecond differences do not prove that the indexes improved performance. The tables are too small, the cache state was not controlled, and the after run benefited from prior execution. A defensible optimisation claim requires representative order/product volumes, recorded selectivity, repeated or benchmarked runs, and comparison of actual rows with estimates.
