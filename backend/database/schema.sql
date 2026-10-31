-- ============================================================
-- BRIGHTLOOP - SUBSCRIPTION MANAGEMENT SYSTEM
-- Supabase PostgreSQL master schema
-- Run this script once in Supabase -> SQL Editor.
--
-- Security model:
--   * RLS is enabled on every application table.
--   * No broad client policies are created here (default deny).
--   * Backend endpoints must verify the user's Supabase JWT and
--     enforce admin/staff/customer permissions before using the
--     service-role client. Never expose the service-role key.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- 1. Shared updated_at trigger
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ------------------------------------------------------------
-- 2. User profiles (identity/passwords remain in Supabase Auth)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer'
        CHECK (role IN ('admin', 'staff', 'customer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a customer profile after Supabase Auth creates a user.
-- Role is always customer here; staff/admin roles must be granted
-- through a protected administrative backend operation.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        NEW.email,
        'customer'
    )
    ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ------------------------------------------------------------
-- 3. Products and variants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    product_type TEXT NOT NULL DEFAULT 'service',
    sales_price NUMERIC(12,2) NOT NULL CHECK (sales_price >= 0),
    cost_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upgrade the products table created during the initial setup.
-- These statements make this master script compatible with that table.
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'service',
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_name TEXT NOT NULL,
    brand TEXT,
    extra_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (extra_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, variant_name)
);

-- ------------------------------------------------------------
-- 4. Plans
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    billing_frequency TEXT NOT NULL
        CHECK (billing_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    minimum_quantity INTEGER NOT NULL DEFAULT 1 CHECK (minimum_quantity > 0),
    available_from DATE,
    available_until DATE,
    auto_close_on_end BOOLEAN NOT NULL DEFAULT FALSE,
    allow_early_close BOOLEAN NOT NULL DEFAULT TRUE,
    allow_pause BOOLEAN NOT NULL DEFAULT TRUE,
    allow_renewal BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        available_until IS NULL OR available_from IS NULL
        OR available_until >= available_from
    )
);

-- ------------------------------------------------------------
-- 5. Tax rules
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.taxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rate NUMERIC(7,4) NOT NULL CHECK (rate >= 0 AND rate <= 100),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 6. Quotation templates and template lines
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    validity_days INTEGER NOT NULL DEFAULT 30 CHECK (validity_days > 0),
    created_by UUID REFERENCES public.profiles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quotation_template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.quotation_templates(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    plan_id UUID REFERENCES public.plans(id),
    variant_id UUID REFERENCES public.product_variants(id),
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    tax_id UUID REFERENCES public.taxes(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 7. Quotations and quotation lines
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id),
    template_id UUID REFERENCES public.quotation_templates(id),
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted')),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (expiry_date >= issue_date)
);

CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    plan_id UUID REFERENCES public.plans(id),
    variant_id UUID REFERENCES public.product_variants(id),
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    tax_id UUID REFERENCES public.taxes(id),
    tax_rate_snapshot NUMERIC(7,4) NOT NULL DEFAULT 0 CHECK (tax_rate_snapshot >= 0),
    line_subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (line_subtotal >= 0),
    line_tax NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (line_tax >= 0),
    line_total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (line_total >= 0)
);

-- ------------------------------------------------------------
-- 8. Subscriptions and subscription lines
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id),
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    quotation_id UUID REFERENCES public.quotations(id),
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'quotation', 'confirmed', 'active', 'paused', 'closed')),
    start_date DATE NOT NULL,
    expiry_date DATE,
    next_billing_date DATE,
    payment_terms_days INTEGER NOT NULL DEFAULT 0 CHECK (payment_terms_days >= 0),
    paused_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (expiry_date IS NULL OR expiry_date >= start_date)
);

CREATE TABLE IF NOT EXISTS public.subscription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    plan_id UUID REFERENCES public.plans(id),
    variant_id UUID REFERENCES public.product_variants(id),
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    tax_id UUID REFERENCES public.taxes(id),
    tax_rate_snapshot NUMERIC(7,4) NOT NULL DEFAULT 0 CHECK (tax_rate_snapshot >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 9. Discounts and eligible products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
    value NUMERIC(12,2) NOT NULL CHECK (value >= 0),
    minimum_purchase NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (minimum_purchase >= 0),
    minimum_quantity INTEGER NOT NULL DEFAULT 1 CHECK (minimum_quantity > 0),
    applies_to TEXT NOT NULL DEFAULT 'subscription'
        CHECK (applies_to IN ('products', 'subscription')),
    start_date DATE,
    end_date DATE,
    usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),
    used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
    CHECK (discount_type <> 'percentage' OR value <= 100),
    CHECK (usage_limit IS NULL OR used_count <= usage_limit)
);

CREATE TABLE IF NOT EXISTS public.discount_products (
    discount_id UUID NOT NULL REFERENCES public.discounts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    PRIMARY KEY (discount_id, product_id)
);

-- ------------------------------------------------------------
-- 10. Invoices and invoice lines
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    subscription_id UUID REFERENCES public.subscriptions(id),
    customer_id UUID NOT NULL REFERENCES public.profiles(id),
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'confirmed', 'paid', 'cancelled')),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_id UUID REFERENCES public.discounts(id),
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (billing_period_end >= billing_period_start),
    UNIQUE (subscription_id, billing_period_start, billing_period_end)
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    tax_id UUID REFERENCES public.taxes(id),
    tax_rate_snapshot NUMERIC(7,4) NOT NULL DEFAULT 0 CHECK (tax_rate_snapshot >= 0),
    line_subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (line_subtotal >= 0),
    line_tax NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (line_tax >= 0),
    line_total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (line_total >= 0)
);

-- ------------------------------------------------------------
-- 11. Payments
-- Multiple payment rows allow partial payments.
-- Invoice paid/outstanding state should be derived/updated by
-- backend logic using SUM(payments.amount) versus invoice.total.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL
        CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'upi', 'cheque', 'other')),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    note TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 12. Billing records / idempotency
-- One record per subscription and billing period.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.billing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id),
    invoice_id UUID UNIQUE REFERENCES public.invoices(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'processed'
        CHECK (status IN ('processed', 'failed')),
    UNIQUE (subscription_id, period_start, period_end),
    CHECK (period_end >= period_start)
);

-- ------------------------------------------------------------
-- 13. Indexes for common lookups and dashboard filters
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_plans_product ON public.plans(product_id);
CREATE INDEX IF NOT EXISTS idx_plans_active_frequency ON public.plans(is_active, billing_frequency);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_status ON public.quotations(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON public.subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_next_bill ON public.subscriptions(status, next_billing_date);
CREATE INDEX IF NOT EXISTS idx_subscription_items_subscription ON public.subscription_items(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_status ON public.invoices(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_billing_records_subscription ON public.billing_records(subscription_id);

-- ------------------------------------------------------------
-- 14. updated_at triggers
-- ------------------------------------------------------------
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'profiles', 'products', 'plans', 'quotation_templates',
        'quotations', 'subscriptions', 'invoices'
    ]
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS set_%I_updated_at ON public.%I',
            table_name, table_name
        );
        EXECUTE format(
            'CREATE TRIGGER set_%I_updated_at
             BEFORE UPDATE ON public.%I
             FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
            table_name, table_name
        );
    END LOOP;
END;
$$;

-- ------------------------------------------------------------
-- 15. Enable Row Level Security on every application table
-- No permissive policies are added: client access is denied until
-- explicit policies are created. Backend must authenticate and
-- authorize every request before using its service-role client.
-- ------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- END OF BRIGHTLOOP SCHEMA
-- ------------------------------------------------------------
