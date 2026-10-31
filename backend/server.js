
import "./load-env.js";
import express from "express";
import cors from "cors";
import { supabase } from "./config/supabase.js";
import { authClient } from "./config/auth.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
  })
);

app.use(express.json());

// BASIC ROUTES

app.get("/", (req, res) => {
  res.json({
    message: "Brightloop Backend is Running!",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "Brightloop API is working!",
  });
});

// DATABASE CONNECTION CHECK

app.get("/api/db-check", async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .limit(1);

  if (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }

  res.json({
    status: "success",
    message: "Supabase connected successfully!",
    data,
  });
});

// SIGN UP

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        status: "error",
        message: "Enter a name, valid email and password of at least 8 characters.",
      });
    }

    const { data, error } = await authClient.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    res.status(201).json({
      status: "success",
      message: data.session
        ? "Account created successfully."
        : "Account created. Please verify your email before signing in.",
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Unable to create account.",
    });
  }
});

// LOGIN

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required.",
      });
    }

    const { data, error } =
      await authClient.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password.",
      });
    }

    res.json({
      status: "success",
      message: "Login successful.",
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Unable to log in.",
    });
  }
});

// AUTHENTICATED USER

app.get("/api/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Authentication token required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const { data, error } =
      await authClient.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid or expired token.",
      });
    }

    res.json({
      status: "success",
      user: data.user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Unable to verify user.",
    });
  }
});

// START SERVER

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
