# MongoDB Verification Evidence — 15 November 2026

## Environment

- MongoDB server: 7.0.14
- MongoDB Shell: 2.0.2
- Deployment: temporary, loopback-only in-memory server on port 27018
- Database: `styleforge_catalogue`
- The temporary server was stopped after verification; no persistent catalogue data or background service was left running.

## Initialization, validation, and indexes

Commands:

```bash
mongosh mongodb://127.0.0.1:27018/styleforge_catalogue \
  portfolio-4-nosql/mongo-init.js

mongosh mongodb://127.0.0.1:27018/styleforge_catalogue \
  portfolio-4-nosql/queries.js
```

Observed initialization results:

```text
MongoDB version: 7.0.14
Product count: 2
Validation level: strict
Validation action: error
Index count: 6
```

The indexes returned by `getIndexes()` were:

```text
_id_
slug_1 (unique)
variants.sku_1 (unique)
category.slug_1_active_1_name_1
name_text_brand_text_category.name_text
attributes.$**_1
```

An intentionally invalid document used an empty product name and an empty variants array. MongoDB rejected it:

```text
PASS: invalid document rejected
Error code: 121
```

Interpretation: the collection used strict, error-producing validation and enforced the required non-empty fields and variant array.

## Query results

The active-footwear query returned `Trail Running Shoes` by StrideWorks with UK 8 and UK 9 SKUs, both priced at 84.99.

The recycled-material query returned `Trail Running Shoes` with `recycledMaterials: true`, trail terrain, and slate colour.

The text search for `trail running` returned `Trail Running Shoes`.

## Execution plan

The category query was run with `explain("executionStats")` for this filter:

```javascript
{ "category.slug": "footwear", active: true }
```

Key results:

```text
winning stage: FETCH over IXSCAN
index: category.slug_1_active_1_name_1
nReturned: 1
totalKeysExamined: 1
totalDocsExamined: 1
executionTimeMillis: 0
```

Interpretation: MongoDB used the intended compound category/active/name index. For the seeded data it examined one matching index key and fetched one document. The result confirms correct index selection, but the zero-millisecond time on two documents is not a production-scale performance benchmark.

The recycled-material query also used an index:

```text
winning stage: FETCH over IXSCAN
index: attributes.$**_1
nReturned: 1
totalKeysExamined: 1
totalDocsExamined: 1
```

The `attributes.$**_1` wildcard index supports category-specific subfields such as `attributes.recycledMaterials`; the plan confirmed that the recycled-material query examined one index key and one document.
