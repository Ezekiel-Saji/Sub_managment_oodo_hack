
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { supabase } from "./config/supabase.js";
import billingRoutes from "./routes/billingRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// Root route
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

// Supabase connection check
app.get("/api/db-check", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("id")
            .limit(1);

        if (error) throw error;

        res.json({
            status: "success",
            message: "Supabase connected successfully!",
            data
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// Billing routes
app.use("/api/billing", billingRoutes);

// Invoice routes
app.use("/api/invoices", invoiceRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
