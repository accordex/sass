-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('RESELLER', 'REFERRAL', 'TECHNOLOGY', 'AFFILIATE');

-- CreateEnum
CREATE TYPE "PartnerTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('REFERRAL', 'RESALE', 'RENEWAL', 'EXPANSION');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CLAWED_BACK');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "MdfStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'UTILIZED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('APP', 'SERVICE', 'INTEGRATION', 'TEMPLATE');

-- CreateTable
CREATE TABLE "partners" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "partner_code" VARCHAR(50) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "contact_name" VARCHAR(255) NOT NULL,
    "contact_email" VARCHAR(255) NOT NULL,
    "contact_phone" VARCHAR(20),
    "website" VARCHAR(500),
    "partner_type" "PartnerType" NOT NULL DEFAULT 'REFERRAL',
    "tier" "PartnerTier" NOT NULL DEFAULT 'BRONZE',
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDING',
    "commission_rate" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "partner_manager_id" UUID,
    "agreement_signed_at" TIMESTAMP(3),
    "mdf_budget" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "specializations" JSONB NOT NULL DEFAULT '[]',
    "certifications" JSONB NOT NULL DEFAULT '[]',
    "portal_access" BOOLEAN NOT NULL DEFAULT true,
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "pincode" VARCHAR(20),
    "gstin" VARCHAR(20),
    "pan" VARCHAR(15),
    "bank_details" JSONB,
    "notes" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "commission_no" VARCHAR(50) NOT NULL,
    "commission_type" "CommissionType" NOT NULL DEFAULT 'REFERRAL',
    "deal_reference" VARCHAR(255),
    "deal_id" UUID,
    "base_amount" DECIMAL(14,2) NOT NULL,
    "commission_rate" DECIMAL(5,2) NOT NULL,
    "commission_amount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "clawback_eligible" BOOLEAN NOT NULL DEFAULT true,
    "clawback_until" TIMESTAMP(3),
    "payout_id" UUID,
    "paid_at" TIMESTAMP(3),
    "approval_notes" TEXT,
    "approved_by" VARCHAR(255),
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_payouts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "payout_no" VARCHAR(50) NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "tds_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "PayoutStatus" NOT NULL DEFAULT 'DRAFT',
    "payment_method" VARCHAR(50),
    "payment_ref" VARCHAR(100),
    "processed_at" TIMESTAMP(3),
    "processed_by" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdf_requests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "request_no" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "requested_amount" DECIMAL(14,2) NOT NULL,
    "approved_amount" DECIMAL(14,2),
    "status" "MdfStatus" NOT NULL DEFAULT 'SUBMITTED',
    "activity_start" TIMESTAMP(3),
    "activity_end" TIMESTAMP(3),
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "approval_notes" TEXT,
    "utilization_report" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdf_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_listings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "partner_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "short_description" VARCHAR(500),
    "description" TEXT NOT NULL,
    "listing_type" "ListingType" NOT NULL DEFAULT 'APP',
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "category" VARCHAR(100),
    "tags" JSONB NOT NULL DEFAULT '[]',
    "logo_url" VARCHAR(500),
    "screenshots" JSONB NOT NULL DEFAULT '[]',
    "pricing_model" VARCHAR(50),
    "price" DECIMAL(10,2),
    "avg_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "install_count" INTEGER NOT NULL DEFAULT 0,
    "external_url" VARCHAR(500),
    "version" VARCHAR(30),
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_reviews" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "content" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "moderation" "ModerationStatus" NOT NULL DEFAULT 'APPROVED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "partners_tenant_id_idx" ON "partners"("tenant_id");

-- CreateIndex
CREATE INDEX "partners_status_idx" ON "partners"("status");

-- CreateIndex
CREATE INDEX "partners_partner_type_idx" ON "partners"("partner_type");

-- CreateIndex
CREATE INDEX "partners_tier_idx" ON "partners"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "partners_tenant_id_partner_code_key" ON "partners"("tenant_id", "partner_code");

-- CreateIndex
CREATE UNIQUE INDEX "partners_tenant_id_contact_email_key" ON "partners"("tenant_id", "contact_email");

-- CreateIndex
CREATE INDEX "commissions_tenant_id_idx" ON "commissions"("tenant_id");

-- CreateIndex
CREATE INDEX "commissions_partner_id_idx" ON "commissions"("partner_id");

-- CreateIndex
CREATE INDEX "commissions_status_idx" ON "commissions"("status");

-- CreateIndex
CREATE INDEX "commissions_payout_id_idx" ON "commissions"("payout_id");

-- CreateIndex
CREATE UNIQUE INDEX "commissions_tenant_id_commission_no_key" ON "commissions"("tenant_id", "commission_no");

-- CreateIndex
CREATE INDEX "partner_payouts_tenant_id_idx" ON "partner_payouts"("tenant_id");

-- CreateIndex
CREATE INDEX "partner_payouts_partner_id_idx" ON "partner_payouts"("partner_id");

-- CreateIndex
CREATE INDEX "partner_payouts_status_idx" ON "partner_payouts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "partner_payouts_tenant_id_payout_no_key" ON "partner_payouts"("tenant_id", "payout_no");

-- CreateIndex
CREATE INDEX "mdf_requests_tenant_id_idx" ON "mdf_requests"("tenant_id");

-- CreateIndex
CREATE INDEX "mdf_requests_partner_id_idx" ON "mdf_requests"("partner_id");

-- CreateIndex
CREATE INDEX "mdf_requests_status_idx" ON "mdf_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "mdf_requests_tenant_id_request_no_key" ON "mdf_requests"("tenant_id", "request_no");

-- CreateIndex
CREATE INDEX "marketplace_listings_tenant_id_idx" ON "marketplace_listings"("tenant_id");

-- CreateIndex
CREATE INDEX "marketplace_listings_partner_id_idx" ON "marketplace_listings"("partner_id");

-- CreateIndex
CREATE INDEX "marketplace_listings_status_idx" ON "marketplace_listings"("status");

-- CreateIndex
CREATE INDEX "marketplace_listings_listing_type_idx" ON "marketplace_listings"("listing_type");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_listings_tenant_id_slug_key" ON "marketplace_listings"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "marketplace_reviews_tenant_id_idx" ON "marketplace_reviews"("tenant_id");

-- CreateIndex
CREATE INDEX "marketplace_reviews_listing_id_idx" ON "marketplace_reviews"("listing_id");

-- CreateIndex
CREATE INDEX "marketplace_reviews_reviewer_id_idx" ON "marketplace_reviews"("reviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_reviews_listing_id_reviewer_id_key" ON "marketplace_reviews"("listing_id", "reviewer_id");

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_partner_manager_id_fkey" FOREIGN KEY ("partner_manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_payout_id_fkey" FOREIGN KEY ("payout_id") REFERENCES "partner_payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_payouts" ADD CONSTRAINT "partner_payouts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_payouts" ADD CONSTRAINT "partner_payouts_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdf_requests" ADD CONSTRAINT "mdf_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdf_requests" ADD CONSTRAINT "mdf_requests_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "marketplace_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
