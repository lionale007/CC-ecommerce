const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 7070;
const mongoose = require("mongoose");
const User = require("./User");
const jwt = require("jsonwebtoken");

mongoose.connect(
    //"mongodb://localhost/auth-service",
    //"mongodb://mongo:27017",
    "mongodb://mongodb:27017",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`Auth-Service DB Connected`);
    }
);

app.use(express.json());

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ message: "User doesn't exist" });
    } else {
        if (password !== user.password) {
            return res.json({ message: "Password Incorrect" });
        }
        const payload = {
            email,
            name: user.name
        };
        jwt.sign(payload, "secret", (err, token) => {
            if (err) console.log(err);
            else return res.json({ token: token });
        });
    }
});

app.put("/auth/manage/edit", async (req, res) => {
    const { name, email, password,userId } = req.body;
    try {
        // Update the product by ID
        const updatedProduct = await User.findOneAndUpdate(
            { _id: userId }, // Find product by ID
            { name, email, password }, // Update product properties
            { new: true } // Return the updated product object
        );

        if (!updatedProduct) {
            return res.json({ message: "User not found" });
        }

        return res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


app.delete("/auth/manage/delete", async (req, res) => {
    const {userId} = req.body;
    try {
        // Delete the product by ID
        const deletedUser = await User.findOneAndRemove({ _id: userId });

        if (!deletedUser) {
            return res.json({ message: "User not found" });
        }

        return res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
    
});


app.post("/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.json({ message: "User already exists" });
    } else {
        const newUser = new User({
            email,
            name,
            password,
        });
        newUser.save();
        return res.json(newUser);
    }
});

app.post("/auth/manage", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ message: "User doesn't exist" });
    } else {
        if (password !== user.password) {
            return res.json({ message: "Password Incorrect" });
        }
        const payload = {
            email,
            name: user.name
        };
        jwt.sign(payload, "secret", (err, token) => {
            if (err) console.log(err);
            else return res.json({ token: token });
        });
    }
});

app.listen(PORT, () => {
    console.log(`Auth-Service at ${PORT}`);
});
