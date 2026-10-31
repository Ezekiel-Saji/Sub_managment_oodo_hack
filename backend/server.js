
import "./load-env.js";
import express from "express";
import cors from "cors";

import { supabase } from "./config/supabase.js";
import { authClient } from "./config/auth.js";

import billingRoutes from "./routes/billingRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";

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

// PASSWORD VALIDATION

const isStrongPassword = (password) => {
  return (
    typeof password === "string" &&
    password.length > 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

// GET USER PROFILE

const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error("User profile not found.");
  }

  return data;
};

// ROOT ROUTE

app.get("/", (req, res) => {
  res.json({
    message: "Brightloop Backend is Running!",
  });
});

// HEALTH CHECK

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "Brightloop API is working!",
  });
});

// DATABASE CHECK

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
      data,
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Database connection failed.",
    });
  }
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
      !isStrongPassword(password)
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Password must be more than 8 characters and contain uppercase, lowercase and special characters.",
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
    console.error("Signup error:", error.message);

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

    const { data, error } = await authClient.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password.",
      });
    }

    const profile = await getUserProfile(data.user.id);

    res.json({
      status: "success",
      message: "Login successful.",
      user: profile,
      session: data.session,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(403).json({
      status: "error",
      message: "Unable to load your account profile.",
    });
  }
});

// VERIFY AUTHENTICATED USER

app.get("/api/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Authentication token required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await authClient.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid or expired token.",
      });
    }

    const profile = await getUserProfile(data.user.id);

    res.json({
      status: "success",
      user: profile,
    });
  } catch (error) {
    console.error("Authentication error:", error.message);

    res.status(403).json({
      status: "error",
      message: "Unable to verify user profile.",
    });
  }
});

// FORGOT PASSWORD

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Please enter your email address.",
      });
    }

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const { error } = await authClient.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${frontendUrl}/reset-password`,
      }
    );

    if (error) {
      console.error("Recovery email error:", error.message);
    }

    res.json({
      status: "success",
      message:
        "If an account exists for this email, a password reset link will be sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Unable to process password recovery.",
    });
  }
});

// RESET PASSWORD

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { password } = req.body;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Recovery token required.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        status: "error",
        message:
          "Password must be more than 8 characters and contain uppercase, lowercase and special characters.",
      });
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await authClient.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid or expired recovery session.",
      });
    }

    const { error: updateError } =
      await supabase.auth.admin.updateUserById(data.user.id, {
        password,
      });

    if (updateError) {
      throw updateError;
    }

    res.json({
      status: "success",
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Password reset error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Unable to reset password.",
    });
  }
});

// BILLING ROUTES

app.use("/api/billing", billingRoutes);

// INVOICE ROUTES

app.use("/api/invoices", invoiceRoutes);

// START SERVER

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
