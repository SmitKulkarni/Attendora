-- ====================================================================================
-- ATTENDORA - MIGRATION 001: PLATFORM METADATA SCHEMA
-- Target Database: PostgreSQL 16+
-- ====================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Subscription plan types for institutional tenants
DO $$ BEGIN
    CREATE TYPE subscription_plan_type AS ENUM ('FREE_TIER', 'PRO_COLLEGE', 'INSTITUTIONAL_ENTERPRISE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status_type AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------------
-- TABLE: tenants
-- Multi-tenant institutional partition root.
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    custom_domain VARCHAR(255) UNIQUE,
    subscription_plan subscription_plan_type NOT NULL DEFAULT 'FREE_TIER',
    subscription_status subscription_status_type NOT NULL DEFAULT 'ACTIVE',
    student_quota_limit INTEGER NOT NULL DEFAULT 500,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON tenants(custom_domain);

-- ------------------------------------------------------------------------------------
-- TABLE: platform_superadmins
-- Global administrators with cross-tenant management privileges.
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_superadmins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ------------------------------------------------------------------------------------
-- TABLE: tenant_subscriptions
-- Stripe / Razorpay payment gateway mapping and billing cycles.
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_customer_id VARCHAR(255),
    external_subscription_id VARCHAR(255),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    current_period_end TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_id ON tenant_subscriptions(tenant_id);

