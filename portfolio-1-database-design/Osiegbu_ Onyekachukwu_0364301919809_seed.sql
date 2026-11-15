BEGIN;

INSERT INTO customers (customer_id, email, first_name, last_name, phone) VALUES
  ('00000000-0000-0000-0000-000000000001', 'olivia.hart@example.test', 'Olivia', 'Hart', '+44 7700 920001'),
  ('00000000-0000-0000-0000-000000000002', 'noah.king@example.test', 'Noah', 'King', '+44 7700 920002');

INSERT INTO addresses (address_id, customer_id, label, line_1, city, county, postcode, is_default) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Home', '21 Cotton Street', 'Manchester', 'Greater Manchester', 'M1 2AB', true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Home', '9 Tailor Lane', 'Liverpool', 'Merseyside', 'L1 3CD', true);

INSERT INTO categories (parent_category_id, name, slug) VALUES
  (NULL, 'Footwear', 'footwear'),
  (NULL, 'Outerwear', 'outerwear');

INSERT INTO products (product_id, category_id, name, slug, description, brand, attributes) VALUES
  ('20000000-0000-0000-0000-000000000001', 1, 'Trail Running Shoes', 'trail-running-shoes', 'Cushioned shoes for mixed-terrain running', 'StrideWorks', '{"recycled_materials": true, "terrain": "trail"}'),
  ('20000000-0000-0000-0000-000000000002', 2, 'Lightweight Rain Jacket', 'lightweight-rain-jacket', 'Breathable waterproof shell jacket', 'Northline', '{"waterproof": true, "breathable": true}');

INSERT INTO product_variants (variant_id, product_id, sku, variant_name, unit_price) VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'SF-TRAIL-08', 'UK 8', 84.99),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'SF-TRAIL-09', 'UK 9', 84.99),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'SF-RAIN-M', 'Medium', 119.50);

INSERT INTO warehouses (name, city) VALUES ('North West Fashion Hub', 'Manchester');

INSERT INTO inventory (warehouse_id, variant_id, quantity_on_hand, quantity_reserved, reorder_level) VALUES
  (1, '30000000-0000-0000-0000-000000000001', 50, 2, 10),
  (1, '30000000-0000-0000-0000-000000000002', 25, 0, 8),
  (1, '30000000-0000-0000-0000-000000000003', 15, 1, 5);

INSERT INTO orders (order_id, customer_id, shipping_address_id, status, subtotal, shipping_fee, discount_total, placed_at) VALUES
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'paid', 84.99, 4.99, 0, now() - interval '2 days');

INSERT INTO order_items (order_id, variant_id, sku_snapshot, product_name_snapshot, quantity, unit_price) VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'SF-TRAIL-08', 'Trail Running Shoes - UK 8', 1, 84.99);

INSERT INTO payments (order_id, provider, provider_reference, status, amount) VALUES
  ('40000000-0000-0000-0000-000000000001', 'sandbox-pay', 'style_pay_001', 'captured', 89.98);

COMMIT;
