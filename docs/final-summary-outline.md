# Final Portfolio Summary

## 1. Selected organisation

StyleForge is a simulated UK online fashion retailer selling footwear, outerwear, and performance clothing. Customers search by category and product attributes, choose size variants, place orders, pay, and track deliveries. Merchandising staff maintain materials, colours, sustainability details, and prices; fulfilment staff manage size-level inventory and shipments; finance staff reconcile payments; and analysts examine revenue, demand, and low stock.

The data platform must support customer profiles and addresses, hierarchical categories, products and saleable variants, inventory by warehouse, orders and order lines, payment attempts, shipments, and audit events. Its most important correctness requirement is to create an order and reserve stock without overselling when several customers check out concurrently.

## 2. Portfolio activities

### Portfolio 1 — Database design and modelling

The relational model was implemented in PostgreSQL with tables for customers, addresses, categories, products, product variants, warehouses, inventory, orders, order items, payments, shipments, and audit events. Primary and foreign keys preserve identity and relationships. Unique constraints protect values such as customer email, SKU, and payment-provider reference. Check constraints prevent negative prices or stock and prevent reserved inventory from exceeding stock on hand.

The design is in third normal form: customer, address, product, variant, warehouse, and payment facts are stored in their appropriate relations rather than repeated in an order record. Two deliberate historical snapshots remain in `order_items`: the product name and SKU at purchase time. These values prevent later catalogue edits from changing the meaning of completed orders. Generated columns calculate order and line totals consistently.

On 15 November 2026, the schema, seed data, and executable checks were run on PostgreSQL 14.15. All four Boolean checks passed. The database also rejected an excessive inventory reservation and a duplicate customer email. The seeded database contained two customers, two products, three variants, and one order.

### Portfolio 2 — Query processing and optimisation

Five query types were analysed: customer order history, catalogue search, low-stock reporting, monthly captured revenue, and JSONB attribute filtering. Optional B-tree, partial, trigram GIN, included-column, and JSONB GIN indexes were then created and the queries were analysed again.

The small seeded dataset did not demonstrate an index-speed benefit. PostgreSQL retained sequential scans for the small tables because reading one or two table pages was cheaper than index traversal. Measured execution times decreased in this single run, but the sub-millisecond differences cannot be attributed confidently to the indexes because caching and measurement noise are significant. The correct conclusion is that representative production-scale data and repeated measurements are required before making a performance claim.

### Portfolio 3 — Transactions and concurrency

The checkout transaction uses a conditional inventory `UPDATE` and dependent common table expressions. If sufficient stock is unavailable, the update returns no row and no order or order item is created. If stock is available, the reservation, order, and order line commit together.

The rollback exercise began with zero reserved units for the selected variant. An update temporarily increased the reservation, but an order item with a negative price violated a check constraint. After rollback, the reserved quantity was still zero, proving that the failed transaction left no partial change.

The two-session test showed Session B waiting with `wait_event_type = Lock` and `wait_event = transactionid` while Session A held the inventory row. Session A changed the selected item from one to eleven reserved units out of fifteen. After Session A committed, Session B re-evaluated its condition, updated zero rows, and reported that insufficient stock remained. During this test, an invalid `psql` conditional was discovered and corrected by calculating a Boolean with `\gset` before using `\if`.

### Portfolio 4 — NoSQL and advanced data models

The MongoDB model treats catalogue products as documents containing category information, flexible attributes, media, variants, and a bounded review summary. This supports catalogue pages that usually read the product and its display data together. JSON Schema validation enforces essential types and required fields, while compound and text indexes support catalogue access patterns.

MongoDB does not replace PostgreSQL for checkout, payments, or inventory. Those workloads need transactional invariants and strong consistency. Complete, unbounded reviews would also be moved to a separate collection at scale to prevent indefinite product-document growth.

The MongoDB scripts were executed against a temporary, loopback-only MongoDB 7.0.14 instance. Initialization created two fashion documents and six indexes. Strict validation rejected an invalid document with error code 121. Footwear, recycled-material, and text-search queries returned the expected products. The category query used the compound `category.slug_1_active_1_name_1` index, while the recycled-material query used `attributes.$**_1`; each examined one key and one document. These results verify the scripts and index selection on the seed data, but they do not represent a production-scale performance benchmark.

### Portfolio 5 — Distributed and cloud databases

The proposed production architecture uses a managed PostgreSQL writer with a synchronous standby in another availability zone, asynchronous cross-region disaster-recovery replication, read replicas for tolerant reporting, and point-in-time recovery. Catalogue availability begins with a three-member MongoDB replica set. Hashed sharding by product ID is a future option only if observed catalogue scale justifies it.

Strong consistency is retained for inventory, orders, and payments. Reporting and catalogue reads may tolerate replication lag. The proposed recovery targets are an RPO below five minutes for regional loss and an RTO below sixty minutes, but these remain design objectives until disaster-recovery drills validate them.

A local PostgreSQL custom-format dump and restore was completed using version 14.15 tools. The source database size was 9,825 kB, the archive was approximately 34 kB, and the restored database contained the expected one order. This validates the local logical-backup procedure only; no managed-cloud deployment or regional failover was performed.

## 3. Technical reflection

The main lesson is that database evidence must be interpreted in context. Constraints and transactions produced clear correctness results, while the query-optimisation exercise showed that an index is not automatically useful on a tiny table. A second lesson came from the concurrency demonstration: database behaviour and client-script behaviour must be diagnosed separately. PostgreSQL correctly blocked and rechecked the competing update even though a faulty `psql` conditional initially prevented the explanatory message from running.

The final architecture deliberately uses different models for different responsibilities. PostgreSQL handles the strongly consistent transactional system, while MongoDB is proposed for flexible, read-heavy catalogue documents. This adds integration complexity but avoids forcing one database model onto workloads with different correctness and scaling needs.

## 4. Repository and evidence

Repository URL: **[insert the private GitHub repository URL]**

Assessor access: **[confirm after access has been granted]**

Verified relational evidence is recorded in `evidence/relational-verification-2026-11-15.md`, MongoDB evidence in `evidence/mongodb-verification-2026-11-15.md`, and the query-plan comparison in `portfolio-2-query-optimisation/results/plan-summary-2026-11-15.md`. The ER diagram is available as `evidence/er-diagram.png` and `evidence/er-diagram.svg`; the proposed distributed architecture is rendered as `evidence/distributed-architecture.png` and `evidence/distributed-architecture.svg`. Cloud-service screenshots remain optional and must be included only if a real cloud exercise is performed. Evidence must be legible and must not expose credentials, connection strings, account identifiers, or personal data.

## 5. References and AI use

Official PostgreSQL and MongoDB documentation used for the technical decisions is listed in `docs/references.md`. The scope of Codex assistance, including scaffolding, local verification, the concurrency-script correction, and documentation drafting, is stated in `docs/ai-use-declaration.md`.
