const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = "./products.json";


// GET ALL PRODUCTS
app.get("/products", (req, res) => {
    const data = fs.readFileSync(DATA_FILE);
    res.json(JSON.parse(data));
});


// UPDATE PRODUCT (ADMIN)
app.post("/update-product", (req, res) => {
    const { id, basePrice, demand } = req.body;

    let data = JSON.parse(fs.readFileSync(DATA_FILE));

    const product = data.find(p => p.id === id);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    product.basePrice = basePrice;
    product.demand = demand;

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json({ message: "Product updated successfully" });
});


app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});