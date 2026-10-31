import { supabase } from "../config/supabase.js";

// ── Products ──────────────────────────────────────────────────────────────────

export const getAllProducts = async (includeInactive = false) => {
    let query = supabase
        .from("products")
        .select("*, product_variants(*)")
        .order("created_at", { ascending: false });

    if (!includeInactive) {
        query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const getProductById = async (id) => {
    const { data, error } = await supabase
        .from("products")
        .select("*, product_variants(*)")
        .eq("id", id)
        .maybeSingle();

    if (error) throw error;
    return data;
};

export const createProduct = async (payload) => {
    const { data, error } = await supabase
        .from("products")
        .insert([payload])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateProduct = async (id, payload) => {
    const { data, error } = await supabase
        .from("products")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
};

// Soft-delete: set is_active = false
export const deactivateProduct = async (id) => {
    const { data, error } = await supabase
        .from("products")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
};

// ── Product Variants ──────────────────────────────────────────────────────────

export const getVariantsByProduct = async (productId) => {
    const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .eq("is_active", true);

    if (error) throw error;
    return data;
};

export const createVariant = async (productId, payload) => {
    const { data, error } = await supabase
        .from("product_variants")
        .insert([{ ...payload, product_id: productId }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateVariant = async (variantId, payload) => {
    const { data, error } = await supabase
        .from("product_variants")
        .update(payload)
        .eq("id", variantId)
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
};

export const deleteVariant = async (variantId) => {
    const { data, error } = await supabase
        .from("product_variants")
        .update({ is_active: false })
        .eq("id", variantId)
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
};
