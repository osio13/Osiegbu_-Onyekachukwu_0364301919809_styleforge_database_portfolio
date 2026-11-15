# Relational Verification Evidence — 15 November 2026

## Environment

- PostgreSQL server and client: 14.15 (Homebrew)
- Platform: Apple Silicon macOS
- Server encoding: UTF-8
- Server time zone: Africa/Lagos
- Disposable source database: `styleforge_portfolio_verify_20261115`

## Schema, seed, and constraint checks

Commands:

```bash
psql -X -v ON_ERROR_STOP=1 -d styleforge_portfolio_verify_20261115 \
  -f portfolio-1-database-design/schema.sql
psql -X -v ON_ERROR_STOP=1 -d styleforge_portfolio_verify_20261115 \
  -f portfolio-1-database-design/seed.sql
psql -X -v ON_ERROR_STOP=1 -d styleforge_portfolio_verify_20261115 \
  -f portfolio-1-database-design/tests/schema_checks.sql
```

Observed results:

```text
seeded customers       | t
seeded variants        | t
generated order total  | t
generated line total   | t
NOTICE: PASS: excessive reservation rejected
NOTICE: PASS: duplicate customer email rejected
```

Seeded row counts used for interpretation:

```text
customers=2
products=2
orders=1
```

Interpretation: the schema was created and seeded successfully. Generated totals matched their expected values, and the database enforced both the inventory check constraint and customer-email uniqueness.

## Atomic checkout test

`checkout.sql` reserved two units of `SF-RAIN-M` and created the dependent order and order item in one transaction. The returned line total was 239.00. After commit, the database contained two orders and the selected inventory row had three reserved units, up from its seeded value of one.

Interpretation: the conditional inventory update succeeded because sufficient stock was available, and the reservation and order records committed together.

## Rollback test

Command:

```bash
psql -X -d styleforge_portfolio_verify_20261115 \
  -f portfolio-3-transactions-concurrency/rollback-demo.sql
```

Observed sequence:

```text
before_reserved=0
UPDATE 1
ERROR: new row for relation "order_items" violates check constraint
ROLLBACK
after_rollback_reserved=0
```

Interpretation: the deliberately invalid negative price aborted the transaction. The inventory change made earlier in the same transaction did not persist, demonstrating atomic rollback.

## Concurrent reservation test

Session A locked the row for variant `30000000-0000-0000-0000-000000000003`, then changed its reservation from 1 to 11 while leaving the transaction open. While Session B attempted to reserve another 10 units, `pg_stat_activity` showed:

```text
Session A: wait_event_type=Client, wait_event=ClientRead, state=idle in transaction
Session B: wait_event_type=Lock, wait_event=transactionid, state=active
```

After Session A committed, Session B produced:

```text
UPDATE 0
No reservation made: stock was no longer sufficient after the lock was released.
COMMIT
```

Final selected inventory state:

```text
quantity_on_hand=15
quantity_reserved=11
```

Interpretation: Session B could not write the row while Session A held the lock. After the lock was released, PostgreSQL rechecked the conditional update against the committed state. Only four units were then available, so the second ten-unit reservation affected zero rows and overselling was avoided.

During the first run, `session-b.sql` used `\if :ROW_COUNT = 0`, which `psql` rejected as a Boolean expression. The script was corrected to calculate `no_reservation` with SQL and `\gset`; the successful output above is from the rerun.

## Backup and restore test

Commands:

```bash
pg_dump --format=custom --file=/tmp/styleforge-20261115.dump \
  styleforge_portfolio_verify_20261115
createdb styleforge_restore_verify_20261115
pg_restore --dbname=styleforge_restore_verify_20261115 \
  --clean --if-exists /tmp/styleforge-20261115.dump
psql -X -d styleforge_restore_verify_20261115 \
  -c "SELECT count(*) AS restored_orders FROM orders;"
```

Observed results:

```text
source database size: 9825 kB
custom archive size: approximately 34 kB
restored_orders: 1
SHA-256: 789f04cd64e002bc35d6c47a292e50a66d914505e651d309ecf9d6c012ed0335
```

Interpretation: the custom-format logical archive restored into a disposable database and contained the expected order. This verifies a local logical backup and restore only; it is not evidence of cloud point-in-time recovery or regional failover.
