import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./config/supabase.js";
dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Brightloop Backend is Running!"
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "success",
        message: "Brightloop API is working!"
    });
});

const PORT = process.env.PORT || 5000;
app.get("/api/db-check", async (req, res) => {

    const { data, error } = await supabase
        .from("products")
        .select("id")
        .limit(1);

    if (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }

    res.json({
        status: "success",
        message: "Supabase connected successfully!",
        data
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});