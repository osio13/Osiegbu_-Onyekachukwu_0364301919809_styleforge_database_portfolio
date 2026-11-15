db = db.getSiblingDB("styleforge_catalogue");

print("Active footwear:");
db.products.find(
  { "category.slug": "footwear", active: true },
  { name: 1, brand: 1, "variants.sku": 1, "variants.price": 1 }
).sort({ name: 1 }).forEach(printjson);

print("Products using recycled materials:");
db.products.find({ "attributes.recycledMaterials": true }, { name: 1, attributes: 1 }).forEach(printjson);

print("Text search:");
db.products.find({ $text: { $search: "trail running" } }, { score: { $meta: "textScore" }, name: 1 })
  .sort({ score: { $meta: "textScore" } })
  .forEach(printjson);

print("Category plan:");
printjson(db.products.find({ "category.slug": "footwear", active: true }).explain("executionStats"));

print("Recycled-material attribute plan:");
printjson(db.products.find({ "attributes.recycledMaterials": true }).explain("executionStats"));
