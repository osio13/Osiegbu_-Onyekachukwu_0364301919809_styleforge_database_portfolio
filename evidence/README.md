# Evidence Register

Add only real, legible evidence produced while running the portfolio.

| ID | Component | Evidence | Command/environment | Date | Interpretation |
|---|---|---|---|---|---|
| E01 | Portfolio 1 | Schema creation and checks; see `relational-verification-2026-11-15.md` | PostgreSQL 14.15 on local Apple Silicon; `psql -X -v ON_ERROR_STOP=1` | 2026-11-15 | Four data/total checks passed; excessive reservation and duplicate email were rejected. |
| E02 | Portfolio 1 | Rendered ER diagram: `er-diagram.png` and `er-diagram.svg` | Mermaid CLI 10.9.1 using local Google Chrome | 2026-11-15 | The Mermaid source rendered successfully as a 1568×1244 PNG and a scalable SVG. |
| E03 | Portfolio 2 | Plans before optional indexes; see `../portfolio-2-query-optimisation/results/plan-summary-2026-11-15.md` | PostgreSQL 14.15; seed dataset; `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)` | 2026-11-15 | Sequential scans were appropriate for the tiny tables; this is a baseline, not a performance claim. |
| E04 | Portfolio 2 | Plans after optional indexes; see `../portfolio-2-query-optimisation/results/plan-summary-2026-11-15.md` | Same environment after `indexes.sql` and `ANALYZE` | 2026-11-15 | The planner retained sequential scans; representative volumes and repeated trials are still required. |
| E05 | Portfolio 3 | Concurrent lock/wait; see `relational-verification-2026-11-15.md` | Two local `psql` sessions plus `pg_stat_activity` | 2026-11-15 | Session B waited on a transaction-ID lock, then updated zero rows after Session A committed. |
| E06 | Portfolio 3 | Rollback state comparison; see `relational-verification-2026-11-15.md` | PostgreSQL 14.15; `rollback-demo.sql` | 2026-11-15 | Reserved quantity was 0 before and 0 after the failed transaction and rollback. |
| E07 | Portfolio 4 | MongoDB validation, indexes, queries, and plan; see `mongodb-verification-2026-11-15.md` | Temporary MongoDB 7.0.14; Mongosh 2.0.2; loopback-only local instance | 2026-11-15 | Two documents and six indexes were created; validation rejected an invalid document; expected queries passed; category query used the compound index. |
| E08 | Portfolio 5 | Rendered `distributed-architecture.png`/`.svg` and local backup/restore in `relational-verification-2026-11-15.md` | Mermaid CLI 10.9.1; PostgreSQL 14.15 `pg_dump`/`pg_restore`; local disposable target | 2026-11-15 | Restore returned the expected one order. The rendered architecture remains a design proposal, not evidence of cloud deployment. |

Redact credentials, account identifiers, connection strings, and personal data before committing screenshots.
