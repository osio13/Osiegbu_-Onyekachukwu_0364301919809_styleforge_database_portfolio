# Case Study: StyleForge Fashion Platform

## Organisation and system

StyleForge is a simulated UK online fashion retailer selling footwear, outerwear, and performance clothing. The portfolio focuses on the data platform supporting size- and colour-based variants, checkout, payments, stock control, fulfilment, and operational reporting.

## Database users

- Customers browse products, maintain addresses, place orders, and track delivery.
- Merchandising staff manage categories, styles, size variants, prices, materials, colours, and sustainability attributes.
- Warehouse staff receive stock and reserve or release inventory.
- Finance staff reconcile payments, refunds, and order totals.
- Fulfilment staff create shipments and update tracking status.
- Analysts run sales, customer, catalogue, and inventory reports.

## Major data

Customer profiles and addresses; hierarchical categories; product and variant catalogue data; warehouse stock; orders and order lines; payment attempts; shipment events; and audit records.

## Key operations

1. Search and filter the fashion catalogue by category and product attributes.
2. Reserve inventory and create an order atomically.
3. Record payment success, failure, and refunds.
4. Update fulfilment and delivery status.
5. Prevent overselling under concurrent checkout.
6. Analyse revenue, style demand, customer activity, and low stock by size.
7. Scale read-heavy catalogue traffic separately from transactional checkout workloads.

## Scope and assumptions

- Prices are stored in GBP as exact `numeric` values.
- Each style can have several saleable size or colour variants.
- Material and performance attributes vary by category and are represented flexibly.
- Inventory is tracked per variant and warehouse.
- Payment card details are never stored; only provider references are retained.
- A completed order keeps snapshots of product names, SKUs, and prices so later catalogue changes do not alter historical records.
