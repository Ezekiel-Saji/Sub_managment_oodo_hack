
import { supabase } from "../config/supabase.js";

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        const { data: authData, error: authError } =
            await supabase.auth.getUser(token);

        if (authError || !authData.user) {
            return res.status(401).json({
                status: "error",
                message: "Invalid or expired token"
            });
        }

        const { data: profile, error: profileError } =
            await supabase
                .from("profiles")
                .select("id, role, full_name, email")
                .eq("id", authData.user.id)
                .single();

        if (profileError || !profile) {
            return res.status(403).json({
                status: "error",
                message: "User profile not found"
            });
        }

        req.user = {
            id: authData.user.id,
            role: profile.role,
            email: profile.email
        };

        next();

    } catch (error) {
        console.error("Authentication error:", error);

        res.status(500).json({
            status: "error",
            message: "Authentication failed"
        });
    }
};

export const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                status: "error",
                message: "You do not have permission"
            });
        }

        next();
    };
};
