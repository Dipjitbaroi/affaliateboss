-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'suspended', 'pending');

-- CreateEnum
CREATE TYPE "UserTier" AS ENUM ('bronze', 'silver', 'gold', 'premium', 'platinum', 'diamond');

-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('active', 'paused', 'inactive');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('percentage', 'fixed', 'product_sale', 'bonus', 'referral', 'tier_bonus');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('active', 'inactive', 'discontinued');

-- CreateEnum
CREATE TYPE "ShopifyStoreStatus" AS ENUM ('connected', 'connecting', 'error', 'disconnected');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('pending', 'confirmed', 'paid', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('stripe', 'paypal', 'wire', 'check');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('requested', 'processing', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "ApiKeyStatus" AS ENUM ('active', 'inactive', 'revoked');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password_hash" TEXT,
    "api_key" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "tier" "UserTier" NOT NULL DEFAULT 'bronze',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "avatar_url" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "language" TEXT NOT NULL DEFAULT 'en',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "total_earnings" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "total_clicks" INTEGER NOT NULL DEFAULT 0,
    "total_conversions" INTEGER NOT NULL DEFAULT 0,
    "conversion_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_links" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "original_url" TEXT NOT NULL,
    "short_code" TEXT NOT NULL,
    "short_url" TEXT NOT NULL,
    "status" "LinkStatus" NOT NULL DEFAULT 'active',
    "category" TEXT NOT NULL DEFAULT 'general',
    "tags" TEXT,
    "notes" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "utm_term" TEXT,
    "total_clicks" INTEGER NOT NULL DEFAULT 0,
    "unique_clicks" INTEGER NOT NULL DEFAULT 0,
    "total_conversions" INTEGER NOT NULL DEFAULT 0,
    "conversion_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "total_earnings" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "geo_targeting" TEXT,
    "device_targeting" TEXT,
    "schedule_settings" TEXT,
    "click_fraud_protection" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_click_at" TIMESTAMP(3),

    CONSTRAINT "affiliate_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "image_url" TEXT,
    "category" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "sku" TEXT,
    "commission_rate" DECIMAL(5,2) NOT NULL,
    "commission_type" "CommissionType" NOT NULL DEFAULT 'percentage',
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "track_inventory" BOOLEAN NOT NULL DEFAULT true,
    "weight" TEXT,
    "dimensions" TEXT,
    "tags" TEXT,
    "shopify_product_id" TEXT,
    "shopify_store_id" INTEGER,
    "total_sales" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "total_commissions_paid" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "status" "ProductStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopify_stores" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shopify_domain" TEXT NOT NULL,
    "store_url" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "owner_email" TEXT,
    "phone" TEXT,
    "country_code" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT,
    "plan_name" TEXT,
    "webhook_endpoint" TEXT,
    "webhook_status" TEXT NOT NULL DEFAULT 'pending',
    "auto_sync_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sync_frequency" TEXT NOT NULL DEFAULT 'daily',
    "last_sync" TIMESTAMP(3),
    "next_sync" TIMESTAMP(3),
    "products_count" INTEGER NOT NULL DEFAULT 0,
    "orders_count" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "commission_earned" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "commission_default" DECIMAL(5,2) NOT NULL DEFAULT 15.0,
    "status" "ShopifyStoreStatus" NOT NULL DEFAULT 'connected',
    "connection_status" TEXT NOT NULL DEFAULT 'healthy',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopify_stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "link_id" INTEGER,
    "product_id" INTEGER,
    "commission_type" "CommissionType" NOT NULL DEFAULT 'product_sale',
    "sale_amount" DECIMAL(15,2) NOT NULL,
    "commission_rate" DECIMAL(5,2) NOT NULL,
    "commission_amount" DECIMAL(15,2) NOT NULL,
    "base_commission_rate" DECIMAL(5,2),
    "tier_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "user_tier" TEXT,
    "order_id" TEXT,
    "shopify_order_id" TEXT,
    "customer_email" TEXT,
    "customer_country" TEXT,
    "referrer_source" TEXT,
    "device_type" TEXT,
    "browser" TEXT,
    "ip_address" TEXT,
    "status" "CommissionStatus" NOT NULL DEFAULT 'pending',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "payout_batch_id" TEXT,
    "sale_date" TIMESTAMP(3) NOT NULL,
    "confirmed_date" TIMESTAMP(3),
    "paid_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "click_tracking" (
    "id" SERIAL NOT NULL,
    "link_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referer" TEXT,
    "country" TEXT,
    "city" TEXT,
    "region" TEXT,
    "device_type" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "conversion_value" DECIMAL(15,2),
    "order_id" TEXT,
    "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "converted_at" TIMESTAMP(3),

    CONSTRAINT "click_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verification_status" TEXT NOT NULL DEFAULT 'pending',
    "last_used_at" TIMESTAMP(3),
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "payment_method_id" INTEGER NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "net_amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "processing_fee" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "platform_fee" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "total_fees" DECIMAL(15,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'requested',
    "external_id" TEXT,
    "failure_reason" TEXT,
    "commission_count" INTEGER NOT NULL,
    "commission_period_start" DATE,
    "commission_period_end" DATE,
    "requested_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "language" TEXT NOT NULL DEFAULT 'en',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "date_format" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    "time_format" TEXT NOT NULL DEFAULT '12_hour',
    "profile_visibility" TEXT NOT NULL DEFAULT 'public',
    "show_earnings_publicly" BOOLEAN NOT NULL DEFAULT false,
    "show_statistics_publicly" BOOLEAN NOT NULL DEFAULT true,
    "allow_contact_from_others" BOOLEAN NOT NULL DEFAULT true,
    "marketing_emails" BOOLEAN NOT NULL DEFAULT true,
    "default_link_category" TEXT NOT NULL DEFAULT 'General',
    "auto_generate_links" BOOLEAN NOT NULL DEFAULT true,
    "link_cloaking_enabled" BOOLEAN NOT NULL DEFAULT true,
    "click_fraud_protection" BOOLEAN NOT NULL DEFAULT true,
    "monthly_earnings_goal" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "monthly_clicks_goal" INTEGER NOT NULL DEFAULT 0,
    "monthly_conversions_goal" INTEGER NOT NULL DEFAULT 0,
    "minimum_payout" DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    "auto_payout_enabled" BOOLEAN NOT NULL DEFAULT false,
    "auto_payout_frequency" TEXT NOT NULL DEFAULT 'weekly',
    "default_payout_method_id" INTEGER,
    "email_notifications" TEXT,
    "sms_notifications" TEXT,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_method" TEXT NOT NULL DEFAULT 'sms',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_preview" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "last_used_at" TIMESTAMP(3),
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "status" "ApiKeyStatus" NOT NULL DEFAULT 'active',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "device_info" TEXT,
    "ip_address" TEXT,
    "location" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_api_key_key" ON "users"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_links_short_code_key" ON "affiliate_links"("short_code");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_api_key" ON "users"("api_key");

-- CreateIndex
CREATE INDEX "idx_affiliate_links_user_id" ON "affiliate_links"("user_id");

-- CreateIndex
CREATE INDEX "idx_affiliate_links_short_code" ON "affiliate_links"("short_code");

-- CreateIndex
CREATE INDEX "idx_products_category" ON "products"("category");

-- CreateIndex
CREATE INDEX "idx_commissions_user_id" ON "commissions"("user_id");

-- CreateIndex
CREATE INDEX "idx_commissions_status" ON "commissions"("status");

-- CreateIndex
CREATE INDEX "idx_click_tracking_link_id" ON "click_tracking"("link_id");

-- CreateIndex
CREATE INDEX "idx_click_tracking_clicked_at" ON "click_tracking"("clicked_at");

-- CreateIndex
CREATE INDEX "idx_payouts_user_id" ON "payouts"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_sessions_token" ON "user_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "idx_otp_codes_phone" ON "otp_codes"("phone", "expires_at");

-- AddForeignKey
ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_shopify_store_id_fkey" FOREIGN KEY ("shopify_store_id") REFERENCES "shopify_stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopify_stores" ADD CONSTRAINT "shopify_stores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "affiliate_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "click_tracking" ADD CONSTRAINT "click_tracking_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "affiliate_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "click_tracking" ADD CONSTRAINT "click_tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_default_payout_method_id_fkey" FOREIGN KEY ("default_payout_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
