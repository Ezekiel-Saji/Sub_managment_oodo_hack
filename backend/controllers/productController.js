import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deactivateProduct,
    getVariantsByProduct,
    createVariant,
    updateVariant,
    deleteVariant
} from "../services/productService.js";

// GET /api/products
export const listProducts = async (req, res) => {
    try {
        const includeInactive = req.user.role === "admin" && req.query.all === "true";
        const products = await getAllProducts(includeInactive);
        res.json({ data: products });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/products/:id
export const getProduct = async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found." });
        res.json({ data: product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/products  (admin only)
export const addProduct = async (req, res) => {
    try {
        const { name, product_type, sales_price, cost_price, notes } = req.body;

        if (!name || sales_price === undefined) {
            return res.status(400).json({ error: "name and sales_price are required." });
        }
        if (Number(sales_price) < 0 || (cost_price !== undefined && Number(cost_price) < 0)) {
            return res.status(400).json({ error: "Prices must be non-negative." });
        }

        const product = await createProduct({ name, product_type, sales_price, cost_price, notes });
        res.status(201).json({ data: product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/products/:id  (admin only)
export const editProduct = async (req, res) => {
    try {
        const { sales_price, cost_price } = req.body;
        if (sales_price !== undefined && Number(sales_price) < 0) {
            return res.status(400).json({ error: "sales_price must be non-negative." });
        }
        if (cost_price !== undefined && Number(cost_price) < 0) {
            return res.status(400).json({ error: "cost_price must be non-negative." });
        }

        const product = await updateProduct(req.params.id, req.body);
        if (!product) return res.status(404).json({ error: "Product not found." });
        res.json({ data: product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/products/:id  (admin only – soft delete)
export const removeProduct = async (req, res) => {
    try {
        const product = await deactivateProduct(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found." });
        res.json({ message: "Product deactivated.", data: product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── Variants ──────────────────────────────────────────────────────────────────

// GET /api/products/:id/variants
export const listVariants = async (req, res) => {
    try {
        const variants = await getVariantsByProduct(req.params.id);
        res.json({ data: variants });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/products/:id/variants  (admin only)
export const addVariant = async (req, res) => {
    try {
        const { variant_name, brand, extra_price } = req.body;
        if (!variant_name) return res.status(400).json({ error: "variant_name is required." });
        if (extra_price !== undefined && Number(extra_price) < 0) {
            return res.status(400).json({ error: "extra_price must be non-negative." });
        }

        const variant = await createVariant(req.params.id, { variant_name, brand, extra_price });
        res.status(201).json({ data: variant });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "A variant with that name already exists for this product." });
        }
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/variants/:variantId  (admin only)
export const editVariant = async (req, res) => {
    try {
        const variant = await updateVariant(req.params.variantId, req.body);
        if (!variant) return res.status(404).json({ error: "Variant not found." });
        res.json({ data: variant });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/variants/:variantId  (admin only – soft delete)
export const removeVariant = async (req, res) => {
    try {
        const variant = await deleteVariant(req.params.variantId);
        if (!variant) return res.status(404).json({ error: "Variant not found." });
        res.json({ message: "Variant removed.", data: variant });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
