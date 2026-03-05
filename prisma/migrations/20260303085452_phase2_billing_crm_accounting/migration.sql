-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'REFERRAL', 'COLD_CALL', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'TRADE_SHOW', 'PARTNER', 'EMAIL_CAMPAIGN', 'ORGANIC_SEARCH', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'NURTURING', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('PROSPECTING', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'VOID');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('DRAFT', 'RECEIVED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'CHEQUE', 'WALLET', 'EMI', 'OTHER');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "BalanceType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "JournalStatus" AS ENUM ('DRAFT', 'POSTED', 'REVERSED');

-- CreateEnum
CREATE TYPE "NoteStatus" AS ENUM ('DRAFT', 'APPROVED', 'APPLIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PlatformInvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "GstType" AS ENUM ('CGST', 'SGST', 'IGST', 'CESS', 'NONE');

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "cancelled_at" TIMESTAMP(3),
    "trial_end" TIMESTAMP(3),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "discount_id" UUID,
    "payment_method_id" UUID,
    "next_invoice_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" UUID NOT NULL,
    "coupon_code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "discount_percent" DECIMAL(5,2),
    "flat_amount" DECIMAL(10,2),
    "max_discount" DECIMAL(10,2),
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "max_redemptions" INTEGER,
    "times_redeemed" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "method_type" VARCHAR(50) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "provider_method_id" VARCHAR(255),
    "last_four" VARCHAR(4),
    "brand" VARCHAR(50),
    "expiry_month" INTEGER,
    "expiry_year" INTEGER,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_invoices" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "subscription_id" UUID,
    "invoice_number" VARCHAR(50) NOT NULL,
    "status" "PlatformInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax_amount" DECIMAL(12,2) NOT NULL,
    "cgst_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sgst_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "igst_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amount_due" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "pdf_url" VARCHAR(500),
    "irn" VARCHAR(64),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_invoice_items" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "hsn_sac" VARCHAR(10),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 18,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "platform_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_payments" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "payment_method_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_mode" "PaymentMode" NOT NULL DEFAULT 'OTHER',
    "gateway" VARCHAR(50),
    "gateway_payment_id" VARCHAR(255),
    "gateway_order_id" VARCHAR(255),
    "failure_reason" TEXT,
    "metadata" JSONB,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipelines" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_stages" (
    "id" UUID NOT NULL,
    "pipeline_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "win_probability" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "color" VARCHAR(7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "company_name" VARCHAR(255),
    "job_title" VARCHAR(100),
    "source" "LeadSource" NOT NULL DEFAULT 'OTHER',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "lead_score" INTEGER NOT NULL DEFAULT 0,
    "owner_id" UUID NOT NULL,
    "is_converted" BOOLEAN NOT NULL DEFAULT false,
    "converted_at" TIMESTAMP(3),
    "last_activity_at" TIMESTAMP(3),
    "next_follow_up" TIMESTAMP(3),
    "tags" JSONB NOT NULL DEFAULT '[]',
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "contact_id" UUID,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_activities" (
    "id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "performed_by" UUID NOT NULL,
    "activity_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "outcome" VARCHAR(100),
    "activity_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_mins" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "job_title" VARCHAR(100),
    "department" VARCHAR(100),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_code" VARCHAR(50) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "trade_name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "website" VARCHAR(500),
    "gstin" VARCHAR(15),
    "pan_number" VARCHAR(10),
    "billing_address" JSONB,
    "shipping_address" JSONB,
    "payment_terms" INTEGER NOT NULL DEFAULT 30,
    "credit_limit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "outstanding_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "deal_number" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "customer_id" UUID,
    "pipeline_id" UUID NOT NULL,
    "stage_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "deal_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "win_probability" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "expected_close" TIMESTAMP(3),
    "actual_close" TIMESTAMP(3),
    "loss_reason" TEXT,
    "source" VARCHAR(100),
    "tags" JSONB NOT NULL DEFAULT '[]',
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "rate_code" VARCHAR(50) NOT NULL,
    "rate_percent" DECIMAL(5,2) NOT NULL,
    "gst_type" "GstType" NOT NULL DEFAULT 'NONE',
    "hsn_sac" VARCHAR(10),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_of_accounts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "account_code" VARCHAR(20) NOT NULL,
    "account_name" VARCHAR(255) NOT NULL,
    "account_type" "AccountType" NOT NULL,
    "balance_type" "BalanceType" NOT NULL,
    "parent_id" UUID,
    "level" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "current_balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "entry_number" VARCHAR(50) NOT NULL,
    "entry_date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "reference" VARCHAR(255),
    "source_type" VARCHAR(50),
    "source_id" UUID,
    "status" "JournalStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" UUID NOT NULL,
    "reversed_entry_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entry_lines" (
    "id" UUID NOT NULL,
    "journal_entry_id" UUID NOT NULL,
    "debit_account_id" UUID,
    "credit_account_id" UUID,
    "amount" DECIMAL(14,2) NOT NULL,
    "description" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entry_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_invoices" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "invoice_number" VARCHAR(50) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "invoice_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "amount_paid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "amount_due" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "place_of_supply" VARCHAR(2),
    "terms" TEXT,
    "notes" TEXT,
    "customer_notes" TEXT,
    "pdf_url" VARCHAR(500),
    "irn" VARCHAR(64),
    "journal_entry_id" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_invoice_items" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "hsn_sac" VARCHAR(10),
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unit" VARCHAR(20),
    "unit_price" DECIMAL(14,2) NOT NULL,
    "discount_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "amount" DECIMAL(14,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sales_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_bills" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "vendor_name" VARCHAR(255) NOT NULL,
    "vendor_gstin" VARCHAR(15),
    "bill_number" VARCHAR(50) NOT NULL,
    "vendor_bill_number" VARCHAR(100),
    "status" "BillStatus" NOT NULL DEFAULT 'DRAFT',
    "bill_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tds_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "amount_paid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "amount_due" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "place_of_supply" VARCHAR(2),
    "notes" TEXT,
    "journal_entry_id" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_bill_items" (
    "id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "hsn_sac" VARCHAR(10),
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unit" VARCHAR(20),
    "unit_price" DECIMAL(14,2) NOT NULL,
    "tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "amount" DECIMAL(14,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "purchase_bill_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_receipts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "receipt_number" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_mode" "PaymentMode" NOT NULL DEFAULT 'BANK_TRANSFER',
    "payment_date" DATE NOT NULL,
    "reference_number" VARCHAR(255),
    "notes" TEXT,
    "bank_account_id" UUID,
    "journal_entry_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_receipt_allocations" (
    "id" UUID NOT NULL,
    "receipt_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_receipt_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments_made" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "vendor_name" VARCHAR(255) NOT NULL,
    "payment_number" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_mode" "PaymentMode" NOT NULL DEFAULT 'BANK_TRANSFER',
    "payment_date" DATE NOT NULL,
    "reference_number" VARCHAR(255),
    "tds_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "bank_account_id" UUID,
    "journal_entry_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_made_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_made_allocations" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_made_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_notes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "invoice_id" UUID,
    "cn_number" VARCHAR(50) NOT NULL,
    "status" "NoteStatus" NOT NULL DEFAULT 'DRAFT',
    "cn_date" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "journal_entry_id" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_note_items" (
    "id" UUID NOT NULL,
    "credit_note_id" UUID NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "hsn_sac" VARCHAR(10),
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "amount" DECIMAL(14,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "credit_note_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debit_notes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "bill_id" UUID,
    "dn_number" VARCHAR(50) NOT NULL,
    "vendor_name" VARCHAR(255) NOT NULL,
    "status" "NoteStatus" NOT NULL DEFAULT 'DRAFT',
    "dn_date" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "journal_entry_id" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debit_note_items" (
    "id" UUID NOT NULL,
    "debit_note_id" UUID NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "hsn_sac" VARCHAR(10),
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "amount" DECIMAL(14,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "debit_note_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "account_name" VARCHAR(255) NOT NULL,
    "bank_name" VARCHAR(255) NOT NULL,
    "account_number" VARCHAR(50) NOT NULL,
    "ifsc_code" VARCHAR(11),
    "swift_code" VARCHAR(11),
    "account_type" VARCHAR(50) NOT NULL,
    "current_balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "chart_account_id" UUID,
    "last_reconciled_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_transactions" (
    "id" UUID NOT NULL,
    "bank_account_id" UUID NOT NULL,
    "transaction_date" DATE NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "balance" DECIMAL(14,2),
    "transaction_type" VARCHAR(50) NOT NULL,
    "reference" VARCHAR(255),
    "is_reconciled" BOOLEAN NOT NULL DEFAULT false,
    "matched_reference" VARCHAR(255),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subscriptions_tenant_id_idx" ON "subscriptions"("tenant_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_next_invoice_at_idx" ON "subscriptions"("next_invoice_at");

-- CreateIndex
CREATE UNIQUE INDEX "discounts_coupon_code_key" ON "discounts"("coupon_code");

-- CreateIndex
CREATE INDEX "discounts_coupon_code_idx" ON "discounts"("coupon_code");

-- CreateIndex
CREATE INDEX "discounts_is_active_idx" ON "discounts"("is_active");

-- CreateIndex
CREATE INDEX "payment_methods_tenant_id_idx" ON "payment_methods"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_invoices_invoice_number_key" ON "platform_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "platform_invoices_tenant_id_idx" ON "platform_invoices"("tenant_id");

-- CreateIndex
CREATE INDEX "platform_invoices_status_idx" ON "platform_invoices"("status");

-- CreateIndex
CREATE INDEX "platform_invoices_due_date_idx" ON "platform_invoices"("due_date");

-- CreateIndex
CREATE INDEX "platform_invoices_invoice_number_idx" ON "platform_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "platform_payments_invoice_id_idx" ON "platform_payments"("invoice_id");

-- CreateIndex
CREATE INDEX "platform_payments_status_idx" ON "platform_payments"("status");

-- CreateIndex
CREATE INDEX "platform_payments_gateway_payment_id_idx" ON "platform_payments"("gateway_payment_id");

-- CreateIndex
CREATE INDEX "pipelines_tenant_id_idx" ON "pipelines"("tenant_id");

-- CreateIndex
CREATE INDEX "pipeline_stages_pipeline_id_idx" ON "pipeline_stages"("pipeline_id");

-- CreateIndex
CREATE INDEX "leads_tenant_id_idx" ON "leads"("tenant_id");

-- CreateIndex
CREATE INDEX "leads_owner_id_idx" ON "leads"("owner_id");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_source_idx" ON "leads"("source");

-- CreateIndex
CREATE INDEX "leads_lead_score_idx" ON "leads"("lead_score");

-- CreateIndex
CREATE INDEX "leads_is_converted_idx" ON "leads"("is_converted");

-- CreateIndex
CREATE INDEX "leads_is_deleted_idx" ON "leads"("is_deleted");

-- CreateIndex
CREATE INDEX "leads_next_follow_up_idx" ON "leads"("next_follow_up");

-- CreateIndex
CREATE INDEX "lead_activities_lead_id_idx" ON "lead_activities"("lead_id");

-- CreateIndex
CREATE INDEX "lead_activities_performed_by_idx" ON "lead_activities"("performed_by");

-- CreateIndex
CREATE INDEX "lead_activities_activity_type_idx" ON "lead_activities"("activity_type");

-- CreateIndex
CREATE INDEX "lead_activities_activity_date_idx" ON "lead_activities"("activity_date");

-- CreateIndex
CREATE INDEX "contacts_tenant_id_idx" ON "contacts"("tenant_id");

-- CreateIndex
CREATE INDEX "contacts_customer_id_idx" ON "contacts"("customer_id");

-- CreateIndex
CREATE INDEX "contacts_email_idx" ON "contacts"("email");

-- CreateIndex
CREATE INDEX "contacts_is_deleted_idx" ON "contacts"("is_deleted");

-- CreateIndex
CREATE INDEX "customers_tenant_id_idx" ON "customers"("tenant_id");

-- CreateIndex
CREATE INDEX "customers_company_name_idx" ON "customers"("company_name");

-- CreateIndex
CREATE INDEX "customers_gstin_idx" ON "customers"("gstin");

-- CreateIndex
CREATE INDEX "customers_is_active_idx" ON "customers"("is_active");

-- CreateIndex
CREATE INDEX "customers_is_deleted_idx" ON "customers"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenant_id_customer_code_key" ON "customers"("tenant_id", "customer_code");

-- CreateIndex
CREATE INDEX "deals_tenant_id_idx" ON "deals"("tenant_id");

-- CreateIndex
CREATE INDEX "deals_customer_id_idx" ON "deals"("customer_id");

-- CreateIndex
CREATE INDEX "deals_pipeline_id_idx" ON "deals"("pipeline_id");

-- CreateIndex
CREATE INDEX "deals_stage_id_idx" ON "deals"("stage_id");

-- CreateIndex
CREATE INDEX "deals_owner_id_idx" ON "deals"("owner_id");

-- CreateIndex
CREATE INDEX "deals_expected_close_idx" ON "deals"("expected_close");

-- CreateIndex
CREATE INDEX "deals_is_deleted_idx" ON "deals"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "deals_tenant_id_deal_number_key" ON "deals"("tenant_id", "deal_number");

-- CreateIndex
CREATE INDEX "tax_rates_tenant_id_idx" ON "tax_rates"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tax_rates_tenant_id_rate_code_key" ON "tax_rates"("tenant_id", "rate_code");

-- CreateIndex
CREATE INDEX "chart_of_accounts_tenant_id_idx" ON "chart_of_accounts"("tenant_id");

-- CreateIndex
CREATE INDEX "chart_of_accounts_account_type_idx" ON "chart_of_accounts"("account_type");

-- CreateIndex
CREATE INDEX "chart_of_accounts_parent_id_idx" ON "chart_of_accounts"("parent_id");

-- CreateIndex
CREATE INDEX "chart_of_accounts_is_active_idx" ON "chart_of_accounts"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_accounts_tenant_id_account_code_key" ON "chart_of_accounts"("tenant_id", "account_code");

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_idx" ON "journal_entries"("tenant_id");

-- CreateIndex
CREATE INDEX "journal_entries_entry_date_idx" ON "journal_entries"("entry_date");

-- CreateIndex
CREATE INDEX "journal_entries_status_idx" ON "journal_entries"("status");

-- CreateIndex
CREATE INDEX "journal_entries_source_type_source_id_idx" ON "journal_entries"("source_type", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_tenant_id_entry_number_key" ON "journal_entries"("tenant_id", "entry_number");

-- CreateIndex
CREATE INDEX "journal_entry_lines_journal_entry_id_idx" ON "journal_entry_lines"("journal_entry_id");

-- CreateIndex
CREATE INDEX "sales_invoices_tenant_id_idx" ON "sales_invoices"("tenant_id");

-- CreateIndex
CREATE INDEX "sales_invoices_customer_id_idx" ON "sales_invoices"("customer_id");

-- CreateIndex
CREATE INDEX "sales_invoices_status_idx" ON "sales_invoices"("status");

-- CreateIndex
CREATE INDEX "sales_invoices_invoice_date_idx" ON "sales_invoices"("invoice_date");

-- CreateIndex
CREATE INDEX "sales_invoices_due_date_idx" ON "sales_invoices"("due_date");

-- CreateIndex
CREATE INDEX "sales_invoices_is_deleted_idx" ON "sales_invoices"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "sales_invoices_tenant_id_invoice_number_key" ON "sales_invoices"("tenant_id", "invoice_number");

-- CreateIndex
CREATE INDEX "sales_invoice_items_invoice_id_idx" ON "sales_invoice_items"("invoice_id");

-- CreateIndex
CREATE INDEX "purchase_bills_tenant_id_idx" ON "purchase_bills"("tenant_id");

-- CreateIndex
CREATE INDEX "purchase_bills_status_idx" ON "purchase_bills"("status");

-- CreateIndex
CREATE INDEX "purchase_bills_bill_date_idx" ON "purchase_bills"("bill_date");

-- CreateIndex
CREATE INDEX "purchase_bills_due_date_idx" ON "purchase_bills"("due_date");

-- CreateIndex
CREATE INDEX "purchase_bills_is_deleted_idx" ON "purchase_bills"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_bills_tenant_id_bill_number_key" ON "purchase_bills"("tenant_id", "bill_number");

-- CreateIndex
CREATE INDEX "purchase_bill_items_bill_id_idx" ON "purchase_bill_items"("bill_id");

-- CreateIndex
CREATE INDEX "payment_receipts_tenant_id_idx" ON "payment_receipts"("tenant_id");

-- CreateIndex
CREATE INDEX "payment_receipts_customer_id_idx" ON "payment_receipts"("customer_id");

-- CreateIndex
CREATE INDEX "payment_receipts_status_idx" ON "payment_receipts"("status");

-- CreateIndex
CREATE INDEX "payment_receipts_payment_date_idx" ON "payment_receipts"("payment_date");

-- CreateIndex
CREATE UNIQUE INDEX "payment_receipts_tenant_id_receipt_number_key" ON "payment_receipts"("tenant_id", "receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "payment_receipt_allocations_receipt_id_invoice_id_key" ON "payment_receipt_allocations"("receipt_id", "invoice_id");

-- CreateIndex
CREATE INDEX "payments_made_tenant_id_idx" ON "payments_made"("tenant_id");

-- CreateIndex
CREATE INDEX "payments_made_status_idx" ON "payments_made"("status");

-- CreateIndex
CREATE INDEX "payments_made_payment_date_idx" ON "payments_made"("payment_date");

-- CreateIndex
CREATE UNIQUE INDEX "payments_made_tenant_id_payment_number_key" ON "payments_made"("tenant_id", "payment_number");

-- CreateIndex
CREATE UNIQUE INDEX "payment_made_allocations_payment_id_bill_id_key" ON "payment_made_allocations"("payment_id", "bill_id");

-- CreateIndex
CREATE INDEX "credit_notes_tenant_id_idx" ON "credit_notes"("tenant_id");

-- CreateIndex
CREATE INDEX "credit_notes_customer_id_idx" ON "credit_notes"("customer_id");

-- CreateIndex
CREATE INDEX "credit_notes_invoice_id_idx" ON "credit_notes"("invoice_id");

-- CreateIndex
CREATE INDEX "credit_notes_status_idx" ON "credit_notes"("status");

-- CreateIndex
CREATE INDEX "credit_notes_is_deleted_idx" ON "credit_notes"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "credit_notes_tenant_id_cn_number_key" ON "credit_notes"("tenant_id", "cn_number");

-- CreateIndex
CREATE INDEX "credit_note_items_credit_note_id_idx" ON "credit_note_items"("credit_note_id");

-- CreateIndex
CREATE INDEX "debit_notes_tenant_id_idx" ON "debit_notes"("tenant_id");

-- CreateIndex
CREATE INDEX "debit_notes_bill_id_idx" ON "debit_notes"("bill_id");

-- CreateIndex
CREATE INDEX "debit_notes_status_idx" ON "debit_notes"("status");

-- CreateIndex
CREATE INDEX "debit_notes_is_deleted_idx" ON "debit_notes"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "debit_notes_tenant_id_dn_number_key" ON "debit_notes"("tenant_id", "dn_number");

-- CreateIndex
CREATE INDEX "debit_note_items_debit_note_id_idx" ON "debit_note_items"("debit_note_id");

-- CreateIndex
CREATE INDEX "bank_accounts_tenant_id_idx" ON "bank_accounts"("tenant_id");

-- CreateIndex
CREATE INDEX "bank_accounts_is_active_idx" ON "bank_accounts"("is_active");

-- CreateIndex
CREATE INDEX "bank_transactions_bank_account_id_idx" ON "bank_transactions"("bank_account_id");

-- CreateIndex
CREATE INDEX "bank_transactions_transaction_date_idx" ON "bank_transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "bank_transactions_is_reconciled_idx" ON "bank_transactions"("is_reconciled");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_invoices" ADD CONSTRAINT "platform_invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_invoices" ADD CONSTRAINT "platform_invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_invoice_items" ADD CONSTRAINT "platform_invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "platform_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_payments" ADD CONSTRAINT "platform_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "platform_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_payments" ADD CONSTRAINT "platform_payments_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "pipeline_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_debit_account_id_fkey" FOREIGN KEY ("debit_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_credit_account_id_fkey" FOREIGN KEY ("credit_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_invoice_items" ADD CONSTRAINT "sales_invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "sales_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_bills" ADD CONSTRAINT "purchase_bills_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_bill_items" ADD CONSTRAINT "purchase_bill_items_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "purchase_bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipt_allocations" ADD CONSTRAINT "payment_receipt_allocations_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "payment_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipt_allocations" ADD CONSTRAINT "payment_receipt_allocations_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "sales_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments_made" ADD CONSTRAINT "payments_made_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments_made" ADD CONSTRAINT "payments_made_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_made_allocations" ADD CONSTRAINT "payment_made_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments_made"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_made_allocations" ADD CONSTRAINT "payment_made_allocations_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "purchase_bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "sales_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_items" ADD CONSTRAINT "credit_note_items_credit_note_id_fkey" FOREIGN KEY ("credit_note_id") REFERENCES "credit_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debit_notes" ADD CONSTRAINT "debit_notes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debit_notes" ADD CONSTRAINT "debit_notes_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "purchase_bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debit_note_items" ADD CONSTRAINT "debit_note_items_debit_note_id_fkey" FOREIGN KEY ("debit_note_id") REFERENCES "debit_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_chart_account_id_fkey" FOREIGN KEY ("chart_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
