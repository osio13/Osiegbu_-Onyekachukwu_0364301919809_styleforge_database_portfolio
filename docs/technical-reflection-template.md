# Individual Technical Reflection

## The design decision that mattered most

The decision I kept coming back to was how to stop two customers from buying the same stock at the same time. I handled this by reserving inventory and creating the order within one transaction. The inventory `UPDATE` only succeeds when enough stock is still available, and the order and order item are created only when that update returns a row. This matters more than simply checking the quantity first, because another checkout could change the stock between a separate check and update.

Separating products from product variants was also important. General information such as the product name and brand belongs to the product, while the SKU, price, and stock belong to the saleable variant. This avoids repeating product information and makes the design easier to maintain.

## A problem I encountered

The most useful problem appeared during the two-session concurrency test. PostgreSQL behaved correctly: Session B waited while Session A held the inventory-row lock. However, after the lock was released, `session-b.sql` displayed a `psql` error instead of the intended message. The expression `\if :ROW_COUNT = 0` produced `Boolean expected` because `psql` did not evaluate that comparison in the way I expected.

I checked `pg_stat_activity` while the sessions were running. It showed Session A as `idle in transaction` and Session B waiting with `wait_event_type = Lock` and `wait_event = transactionid`. This was useful because it proved that the database locking was working and that the fault was only in the client-side conditional.

I fixed the script by evaluating `ROW_COUNT = 0` in SQL, storing the Boolean result with `\gset`, and then passing that Boolean variable to `\if`. When I repeated the test, Session B waited for Session A, updated zero rows, printed the expected insufficient-stock message, and committed without an error. The final inventory state was 15 units on hand and 11 reserved. The second request for 10 units was therefore rejected instead of causing the reserved quantity to exceed the available stock.

## What the query plans taught me

I originally expected the additional indexes to produce obvious index scans. The plans showed why that expectation was too simple. The test database contained only two products, one order, one payment, and three inventory rows, so PostgreSQL continued to use sequential scans after the indexes were added. Reading such small tables directly costs less than traversing an index.

For example, the customer-order query remained a sequential scan, with execution time changing from 0.022 ms to 0.035 ms. The indexed run was slightly slower, which reinforces that these sub-millisecond differences are measurement noise rather than proof of improvement or regression. My main lesson was that an index should be judged using representative data, selectivity, actual and estimated row counts, buffer activity, and repeated tests—not simply by whether the index exists.

## Transactions, locking, and rollback

The checkout runs at `READ COMMITTED`. When two sessions try to update the same inventory row, the second session waits for the first transaction to finish. It then checks the `WHERE` condition again using the committed row value. In the demonstration, only four units were available after Session A committed, so Session B's request for ten units updated zero rows. The inventory check constraint provides another layer of protection by preventing reserved stock from ever being greater than stock on hand.

The rollback test made transaction atomicity clear. The script increased a reservation and then attempted to insert an order item with a negative price. The price check constraint rejected the insert. After `ROLLBACK`, the reservation was still zero, which showed that the earlier update had not been left behind as a partial change.

## Relational and document models

MongoDB suited the fashion catalogue because the style, category, flexible material attributes, size variants, media, and rating summary can be stored and read together. I ran the scripts against a temporary MongoDB 7.0.14 instance. The initialization created two product documents and six indexes. Strict validation rejected an invalid product with error code 121. Footwear, recycled-material, and text-search queries returned the expected products, and the category query used the compound `category.slug_1_active_1_name_1` index.

The execution test also showed why flexible fashion attributes need a matching index. The wildcard `attributes.$**_1` index supported the query on `attributes.recycledMaterials`; the plan examined one key and one document. This was a useful reminder that an index must match the actual field path used by a query.

I would not use this document model as the main store for checkout, inventory, or payments. Those areas depend more heavily on relationships, cross-table constraints, and atomic multi-step changes. PostgreSQL is therefore the source of truth for transactional data, while MongoDB is a better fit for the flexible, read-heavy catalogue.

## What I would improve for production

The next step would be to repeat the performance work with representative order and product volumes. I would also use connection pooling, least-privilege database roles, secret rotation, monitoring for lock waits and replication lag, and regular restore tests. PostgreSQL would use a managed primary, a synchronous standby, read replicas for reporting, encrypted backups, and a tested disaster-recovery process. MongoDB could begin as a replica set and move to sharding only when measured workload and storage growth justify the added complexity.

This portfolio helped me connect database theory with observable behaviour. I can now explain why the schema is normalised, why historical order lines keep snapshots, how constraints and transactions protect correctness, why a sequential scan can be the right plan, how row locks prevent overselling, and why different database models suit different parts of the same system.
