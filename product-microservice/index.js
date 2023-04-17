const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 8080;
const mongoose = require("mongoose");
const Product = require("./Product");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
//const isAuthenticated = require("../isAuthenticated");
const isAuthenticated = require("./isAuthenticated");
var order;

var channel, connection;

app.use(express.json());
mongoose.connect(
    //"mongodb://localhost/product-service",
    "mongodb://mongodb:27017",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`Product-Service DB Connected`);
    }
);

async function connect() {
    const amqpServer = "amqp://rabbitmq:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("PRODUCT");
}
connect();

app.post("/product/buy", isAuthenticated, async (req, res) => {
    const { ids } = req.body;
    const products = await Product.find({ _id: { $in: ids } });
    channel.sendToQueue(
        "ORDER",
        Buffer.from(
            JSON.stringify({
                products,
                userEmail: req.user.email,
            })
        )
    );
    channel.consume("PRODUCT", (data) => {
        order = JSON.parse(data.content);
    });
    return res.json(order);
});

app.post("/product/create", isAuthenticated, async (req, res) => {
    const { name, description, price } = req.body;
    const newProduct = new Product({
        name,
        description,
        price,
    });
    newProduct.save();
    return res.json(newProduct);
});

app.put("/product/edit", isAuthenticated, async (req, res) => {
    const { name, description, price, productId } = req.body;
    try {
        // Update the product by ID
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId }, // Find product by ID
            { name, description, price }, // Update product properties
            { new: true } // Return the updated product object
        );

        if (!updatedProduct) {
            return res.json({ message: "Product not found" });
        }

        return res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});



app.delete("/product/delete", isAuthenticated, async (req, res) => {
    const {productId} = req.body;
    try {
        // Delete the product by ID
        const deletedProduct = await Product.findOneAndRemove({ _id: productId });

        if (!deletedProduct) {
            return res.json({ message: "Product not found" });
        }

        return res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
    
});

app.get("/product/view", isAuthenticated, async (req, res) => {
    try {
        // Retrieve all products from the collection
        const products = await Product.find();

        return res.json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/product/search", isAuthenticated, async (req, res) => {
    const {productId} = req.body;
    try {
        
        // Retrieve product by productId from the collection
        const product = await Product.findOne({ _id: productId });
        
        if (!product) {
            return res.json({ message: "Product not found" });
        }

        return res.json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Product-Service at ${PORT}`);
});
