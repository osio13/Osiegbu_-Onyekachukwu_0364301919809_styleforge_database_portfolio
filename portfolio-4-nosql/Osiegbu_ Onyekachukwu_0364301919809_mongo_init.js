db = db.getSiblingDB("styleforge_catalogue");
db.products.drop();

db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["productId", "name", "slug", "brand", "category", "active", "variants"],
      properties: {
        productId: { bsonType: "string" },
        name: { bsonType: "string", minLength: 1 },
        slug: { bsonType: "string", minLength: 1 },
        brand: { bsonType: "string" },
        category: {
          bsonType: "object",
          required: ["slug", "name"],
          properties: { slug: { bsonType: "string" }, name: { bsonType: "string" } }
        },
        active: { bsonType: "bool" },
        attributes: { bsonType: "object" },
        variants: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["sku", "name", "price"],
            properties: {
              sku: { bsonType: "string" },
              name: { bsonType: "string" },
              price: { bsonType: "decimal", minimum: NumberDecimal("0") }
            }
          }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

db.products.insertMany([
  {
    productId: "20000000-0000-0000-0000-000000000001",
    name: "Trail Running Shoes",
    slug: "trail-running-shoes",
    brand: "StrideWorks",
    category: { slug: "footwear", name: "Footwear" },
    active: true,
    attributes: { recycledMaterials: true, terrain: "trail", colour: "slate" },
    media: [{ type: "image", url: "https://example.test/products/trail-shoes.png" }],
    variants: [
      { sku: "SF-TRAIL-08", name: "UK 8", price: NumberDecimal("84.99") },
      { sku: "SF-TRAIL-09", name: "UK 9", price: NumberDecimal("84.99") }
    ],
    ratingSummary: { average: 4.5, count: 128 }
  },
  {
    productId: "20000000-0000-0000-0000-000000000002",
    name: "Lightweight Rain Jacket",
    slug: "lightweight-rain-jacket",
    brand: "Northline",
    category: { slug: "outerwear", name: "Outerwear" },
    active: true,
    attributes: { waterproof: true, breathable: true, colour: "navy" },
    variants: [{ sku: "SF-RAIN-M", name: "Medium", price: NumberDecimal("119.50") }],
    ratingSummary: { average: 4.2, count: 64 }
  }
]);

db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ "variants.sku": 1 }, { unique: true });
db.products.createIndex({ "category.slug": 1, active: 1, name: 1 });
db.products.createIndex({ name: "text", brand: "text", "category.name": "text" });
// A wildcard index supports category-specific fields such as attributes.recycledMaterials.
db.products.createIndex({ "attributes.$**": 1 });

printjson(db.products.getIndexes());
