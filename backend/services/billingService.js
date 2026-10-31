
import { supabase } from "../config/supabase.js";

// Run automatic billing for all eligible subscriptions
export const runBilling = async () => {
    const { data, error } = await supabase.rpc(
        "generate_due_invoices"
    );

    if (error) throw error;

    return data;
};

// Get invoices
export const getAllInvoices = async (customerId = null) => {
    let query = supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

    // Customers can only retrieve their own invoices
    if (customerId) {
        query = query.eq("customer_id", customerId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
};

// Get one invoice with its line items
export const getInvoiceById = async (invoiceId, customerId = null) => {
    let query = supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId);

    if (customerId) {
        query = query.eq("customer_id", customerId);
    }

    const { data: invoice, error } = await query.maybeSingle();

    if (error) throw error;
    if (!invoice) return null;

    const { data: items, error: itemError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId);

    if (itemError) throw itemError;

    const { data: customer, error: customerError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .eq("id", invoice.customer_id)
        .maybeSingle();

    if (customerError) throw customerError;

    return {
        ...invoice,
        customer,
        items
    };
};

// Confirm a draft invoice
export const confirmInvoice = async (invoiceId) => {
    const { data, error } = await supabase
        .from("invoices")
        .update({
            status: "confirmed",
            updated_at: new Date().toISOString()
        })
        .eq("id", invoiceId)
        .eq("status", "draft")
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
};

// Cancel an unpaid invoice
export const cancelInvoice = async (invoiceId) => {
    const { data, error } = await supabase
        .from("invoices")
        .update({
            status: "cancelled",
            updated_at: new Date().toISOString()
        })
        .eq("id", invoiceId)
        .in("status", ["draft", "confirmed"])
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
};
