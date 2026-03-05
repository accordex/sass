// ==============================================================================
// Database Seed File — Phase 1: Foundation & Core Infrastructure
// ==============================================================================
// Seeds the database with essential initial data:
//   1. Subscription Plans (Starter, Professional, Enterprise)
//   2. System Roles (Super Admin, Tenant Admin, Manager, User, Viewer)
//   3. Permissions for all Phase 1 modules (+ placeholders for Phase 2-6)
//   4. Role-Permission assignments
//   5. Default Platform Settings
//   6. Platform Tenant (for super admin)
//   7. Super Admin User
//   8. AI Provider Configurations
//   9. Notification Templates
//
// Run: npx prisma db seed
// ==============================================================================

import { PrismaClient, DataScope } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcryptjs from "bcryptjs";
import "dotenv/config";

// Prisma v7 requires passing the database adapter with the connection URL
// PrismaPg expects a config object with connectionString, not a raw URL
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ==========================================================================
  // 1. SUBSCRIPTION PLANS
  // ==========================================================================
  console.log("📦 Creating subscription plans...");

  const starterPlan = await prisma.subscriptionPlan.upsert({
    where: { plan_code: "starter" },
    update: {},
    create: {
      plan_name: "Starter",
      plan_code: "starter",
      description:
        "Perfect for small businesses getting started. Includes core modules with essential features.",
      monthly_price: 999,
      yearly_price: 9990,
      features: {
        crm: true,
        accounting: true,
        hrms: false,
        elearning: false,
        partner_program: false,
        max_invoices_per_month: 100,
        max_leads: 500,
        email_notifications: true,
        sms_notifications: false,
        ai_features: false,
      },
      max_users: 5,
      max_storage_gb: 5,
      ai_tokens_limit: 0,
      is_active: true,
      sort_order: 1,
    },
  });

  const professionalPlan = await prisma.subscriptionPlan.upsert({
    where: { plan_code: "professional" },
    update: {},
    create: {
      plan_name: "Professional",
      plan_code: "professional",
      description:
        "For growing businesses. All modules with advanced features and AI-powered insights.",
      monthly_price: 2999,
      yearly_price: 29990,
      features: {
        crm: true,
        accounting: true,
        hrms: true,
        elearning: true,
        partner_program: false,
        max_invoices_per_month: 1000,
        max_leads: 5000,
        email_notifications: true,
        sms_notifications: true,
        ai_features: true,
        ai_chat: true,
        ai_email_generation: true,
        predictive_analytics: false,
      },
      max_users: 25,
      max_storage_gb: 50,
      ai_tokens_limit: 50000,
      is_active: true,
      sort_order: 2,
    },
  });

  const enterprisePlan = await prisma.subscriptionPlan.upsert({
    where: { plan_code: "enterprise" },
    update: {},
    create: {
      plan_name: "Enterprise",
      plan_code: "enterprise",
      description:
        "Unlimited access to all modules. Full AI capabilities, priority support, and custom integrations.",
      monthly_price: 7999,
      yearly_price: 79990,
      features: {
        crm: true,
        accounting: true,
        hrms: true,
        elearning: true,
        partner_program: true,
        max_invoices_per_month: -1, // unlimited
        max_leads: -1, // unlimited
        email_notifications: true,
        sms_notifications: true,
        whatsapp_notifications: true,
        ai_features: true,
        ai_chat: true,
        ai_email_generation: true,
        predictive_analytics: true,
        autonomous_flows: true,
        custom_integrations: true,
        dedicated_support: true,
      },
      max_users: 100,
      max_storage_gb: 500,
      ai_tokens_limit: 500000,
      is_active: true,
      sort_order: 3,
    },
  });

  console.log(
    `   ✅ Plans created: ${starterPlan.plan_name}, ${professionalPlan.plan_name}, ${enterprisePlan.plan_name}`
  );

  // ==========================================================================
  // 2. PLATFORM TENANT (for Super Admin)
  // ==========================================================================
  console.log("🏢 Creating platform tenant...");

  const platformTenant = await prisma.tenant.upsert({
    where: { tenant_code: "softmerce-platform" },
    update: {},
    create: {
      tenant_code: "softmerce-platform",
      company_name: "Softmerce Platform",
      trade_name: "Softmerce",
      primary_email: "platform@softmerce.com",
      phone_number: "+919999999999",
      status: "ACTIVE",
      plan_id: enterprisePlan.id,
      subscription_status: "ACTIVE",
      tenant_settings: {
        timezone: "Asia/Kolkata",
        currency: "INR",
        date_format: "DD/MM/YYYY",
        language: "en",
        gst_registered: true,
        gstin: "",
      },
      metadata: {
        is_platform_tenant: true,
        description: "Internal platform tenant for super admin operations",
      },
    },
  });

  console.log(`   ✅ Platform tenant: ${platformTenant.company_name}`);

  // ==========================================================================
  // 3. SYSTEM ROLES
  // ==========================================================================
  console.log("👤 Creating system roles...");

  const roles = [
    {
      role_name: "Super Admin",
      role_code: "super_admin",
      description:
        "Platform-level super administrator with unrestricted access to all tenants and system settings. Only for Softmerce platform team.",
      is_system: true,
      tenant_id: null,
    },
    {
      role_name: "Tenant Administrator",
      role_code: "tenant_admin",
      description:
        "Full administrative access within the tenant. Can manage users, roles, settings, billing, and all modules.",
      is_system: true,
      tenant_id: null,
    },
    {
      role_name: "Manager",
      role_code: "manager",
      description:
        "Department/team manager with access to manage team members, approve workflows, and view reports across their scope.",
      is_system: true,
      tenant_id: null,
    },
    {
      role_name: "Standard User",
      role_code: "standard_user",
      description:
        "Regular employee/user with access to assigned modules. Can create and manage their own records.",
      is_system: true,
      tenant_id: null,
    },
    {
      role_name: "Viewer",
      role_code: "viewer",
      description:
        "Read-only access to assigned modules. Cannot create, edit, or delete any records.",
      is_system: true,
      tenant_id: null,
    },
  ];

  const createdRoles: Record<string, any> = {};
  for (const role of roles) {
    // For system roles (tenant_id = null), Prisma upsert doesn't support null
    // in composite unique keys. Use findFirst + create pattern instead.
    let created = await prisma.role.findFirst({
      where: {
        tenant_id: role.tenant_id,
        role_code: role.role_code,
      },
    });

    if (!created) {
      created = await prisma.role.create({
        data: role,
      });
    }

    createdRoles[role.role_code] = created;
  }

  console.log(`   ✅ Roles created: ${Object.keys(createdRoles).join(", ")}`);

  // ==========================================================================
  // 4. PERMISSIONS
  // ==========================================================================
  console.log("🔐 Creating permissions...");

  // Phase 1 Core Permissions
  const permissionData = [
    // --- Tenant Management ---
    { resource: "tenants", action: "create", description: "Create new tenant organizations", module: "core" },
    { resource: "tenants", action: "read", description: "View tenant details", module: "core" },
    { resource: "tenants", action: "update", description: "Modify tenant settings and details", module: "core" },
    { resource: "tenants", action: "delete", description: "Soft-delete tenant organizations", module: "core" },
    { resource: "tenants", action: "suspend", description: "Suspend tenant accounts", module: "core" },
    { resource: "tenants", action: "reactivate", description: "Reactivate suspended tenants", module: "core" },

    // --- User Management ---
    { resource: "users", action: "create", description: "Invite and create user accounts", module: "core" },
    { resource: "users", action: "read", description: "View user profiles and details", module: "core" },
    { resource: "users", action: "update", description: "Edit user information and preferences", module: "core" },
    { resource: "users", action: "delete", description: "Deactivate user accounts", module: "core" },
    { resource: "users", action: "export", description: "Export user data", module: "core" },

    // --- Role Management ---
    { resource: "roles", action: "create", description: "Create custom roles", module: "core" },
    { resource: "roles", action: "read", description: "View roles and their permissions", module: "core" },
    { resource: "roles", action: "update", description: "Modify role permissions", module: "core" },
    { resource: "roles", action: "delete", description: "Delete custom roles", module: "core" },

    // --- Settings Management ---
    { resource: "settings", action: "read", description: "View system and tenant settings", module: "core" },
    { resource: "settings", action: "update", description: "Modify settings", module: "core" },

    // --- Notification Management ---
    { resource: "notifications", action: "read", description: "View notifications", module: "core" },
    { resource: "notifications", action: "update", description: "Mark notifications as read", module: "core" },
    { resource: "notifications", action: "create", description: "Send notifications", module: "core" },
    { resource: "notification_templates", action: "create", description: "Create notification templates", module: "core" },
    { resource: "notification_templates", action: "read", description: "View notification templates", module: "core" },
    { resource: "notification_templates", action: "update", description: "Edit notification templates", module: "core" },
    { resource: "notification_templates", action: "delete", description: "Delete notification templates", module: "core" },

    // --- Audit Logs ---
    { resource: "audit_logs", action: "read", description: "View audit trail and activity logs", module: "core" },
    { resource: "audit_logs", action: "export", description: "Export audit log data", module: "core" },

    // --- AI Configuration ---
    { resource: "ai_config", action: "read", description: "View AI provider settings and usage", module: "core" },
    { resource: "ai_config", action: "update", description: "Configure AI providers and limits", module: "core" },
    { resource: "ai_usage", action: "read", description: "View AI usage statistics and costs", module: "core" },

    // --- Phase 2: CRM — Lead Management ---
    { resource: "leads", action: "create", description: "Create new leads", module: "crm" },
    { resource: "leads", action: "read", description: "View lead details", module: "crm" },
    { resource: "leads", action: "update", description: "Edit lead information", module: "crm" },
    { resource: "leads", action: "delete", description: "Delete leads", module: "crm" },
    { resource: "leads", action: "export", description: "Export lead data", module: "crm" },

    // --- Phase 2: CRM — Contact Management ---
    { resource: "contacts", action: "create", description: "Create new contacts", module: "crm" },
    { resource: "contacts", action: "read", description: "View contact details", module: "crm" },
    { resource: "contacts", action: "update", description: "Edit contact information", module: "crm" },
    { resource: "contacts", action: "delete", description: "Delete contacts", module: "crm" },
    { resource: "contacts", action: "export", description: "Export contact data", module: "crm" },

    // --- Phase 2: CRM — Customer Management ---
    { resource: "customers", action: "create", description: "Create customer accounts", module: "crm" },
    { resource: "customers", action: "read", description: "View customer details", module: "crm" },
    { resource: "customers", action: "update", description: "Edit customer information", module: "crm" },
    { resource: "customers", action: "delete", description: "Delete customer accounts", module: "crm" },

    // --- Phase 2: CRM — Deal / Opportunity Management ---
    { resource: "deals", action: "create", description: "Create new deals/opportunities", module: "crm" },
    { resource: "deals", action: "read", description: "View deal details and pipeline", module: "crm" },
    { resource: "deals", action: "update", description: "Edit deal information and move stages", module: "crm" },
    { resource: "deals", action: "delete", description: "Delete deals", module: "crm" },
    { resource: "deals", action: "export", description: "Export deal/pipeline data", module: "crm" },

    // --- Phase 2: CRM — Pipeline Management ---
    { resource: "pipelines", action: "create", description: "Create sales pipelines", module: "crm" },
    { resource: "pipelines", action: "read", description: "View pipelines and stages", module: "crm" },
    { resource: "pipelines", action: "update", description: "Edit pipeline stages and configuration", module: "crm" },
    { resource: "pipelines", action: "delete", description: "Delete pipelines", module: "crm" },

    // --- Phase 2: Subscription & Billing ---
    { resource: "subscriptions", action: "read", description: "View subscription details", module: "billing" },
    { resource: "subscriptions", action: "update", description: "Modify subscription plans", module: "billing" },
    { resource: "subscriptions", action: "cancel", description: "Cancel subscriptions", module: "billing" },
    { resource: "platform_invoices", action: "read", description: "View platform invoices", module: "billing" },
    { resource: "platform_invoices", action: "create", description: "Generate platform invoices", module: "billing" },
    { resource: "payment_methods", action: "create", description: "Add payment methods", module: "billing" },
    { resource: "payment_methods", action: "read", description: "View saved payment methods", module: "billing" },
    { resource: "payment_methods", action: "delete", description: "Remove payment methods", module: "billing" },

    // --- Phase 2: Accounting — Sales Invoices ---
    { resource: "invoices", action: "create", description: "Create sales invoices", module: "accounting" },
    { resource: "invoices", action: "read", description: "View sales invoices", module: "accounting" },
    { resource: "invoices", action: "update", description: "Edit sales invoices", module: "accounting" },
    { resource: "invoices", action: "delete", description: "Delete sales invoices", module: "accounting" },
    { resource: "invoices", action: "approve", description: "Approve invoices for sending", module: "accounting" },

    // --- Phase 2: Accounting — Purchase Bills ---
    { resource: "bills", action: "create", description: "Record purchase bills", module: "accounting" },
    { resource: "bills", action: "read", description: "View purchase bills", module: "accounting" },
    { resource: "bills", action: "update", description: "Edit purchase bills", module: "accounting" },
    { resource: "bills", action: "delete", description: "Delete purchase bills", module: "accounting" },
    { resource: "bills", action: "approve", description: "Approve purchase bills", module: "accounting" },

    // --- Phase 2: Accounting — Payments ---
    { resource: "payments", action: "create", description: "Record payments received and made", module: "accounting" },
    { resource: "payments", action: "read", description: "View payment records", module: "accounting" },
    { resource: "payments", action: "update", description: "Edit payment records", module: "accounting" },
    { resource: "payments", action: "delete", description: "Void/delete payment records", module: "accounting" },

    // --- Phase 2: Accounting — Journal Entries ---
    { resource: "journal_entries", action: "create", description: "Create manual journal entries", module: "accounting" },
    { resource: "journal_entries", action: "read", description: "View journal entries", module: "accounting" },
    { resource: "journal_entries", action: "update", description: "Edit draft journal entries", module: "accounting" },
    { resource: "journal_entries", action: "delete", description: "Delete draft journal entries", module: "accounting" },
    { resource: "journal_entries", action: "approve", description: "Post/approve journal entries", module: "accounting" },

    // --- Phase 2: Accounting — Chart of Accounts ---
    { resource: "chart_of_accounts", action: "create", description: "Create new accounts", module: "accounting" },
    { resource: "chart_of_accounts", action: "read", description: "View chart of accounts", module: "accounting" },
    { resource: "chart_of_accounts", action: "update", description: "Edit account details", module: "accounting" },
    { resource: "chart_of_accounts", action: "delete", description: "Deactivate accounts", module: "accounting" },

    // --- Phase 2: Accounting — Bank Accounts ---
    { resource: "bank_accounts", action: "create", description: "Add bank accounts", module: "accounting" },
    { resource: "bank_accounts", action: "read", description: "View bank account details and transactions", module: "accounting" },
    { resource: "bank_accounts", action: "update", description: "Edit bank account information", module: "accounting" },
    { resource: "bank_accounts", action: "reconcile", description: "Perform bank reconciliation", module: "accounting" },

    // --- Phase 2: Accounting — Credit/Debit Notes ---
    { resource: "credit_notes", action: "create", description: "Issue credit notes", module: "accounting" },
    { resource: "credit_notes", action: "read", description: "View credit notes", module: "accounting" },
    { resource: "credit_notes", action: "update", description: "Edit credit notes", module: "accounting" },
    { resource: "debit_notes", action: "create", description: "Issue debit notes", module: "accounting" },
    { resource: "debit_notes", action: "read", description: "View debit notes", module: "accounting" },
    { resource: "debit_notes", action: "update", description: "Edit debit notes", module: "accounting" },

    // --- Phase 2: Accounting — Tax Rates ---
    { resource: "tax_rates", action: "create", description: "Create tax rates", module: "accounting" },
    { resource: "tax_rates", action: "read", description: "View tax rates", module: "accounting" },
    { resource: "tax_rates", action: "update", description: "Edit tax rates", module: "accounting" },

    // --- Phase 3: HRMS — Department Management ---
    { resource: "departments", action: "create", description: "Create departments", module: "hrms" },
    { resource: "departments", action: "read", description: "View departments", module: "hrms" },
    { resource: "departments", action: "update", description: "Edit departments", module: "hrms" },
    { resource: "departments", action: "delete", description: "Delete departments", module: "hrms" },

    // --- Phase 3: HRMS — Designation Management ---
    { resource: "designations", action: "create", description: "Create designations/job titles", module: "hrms" },
    { resource: "designations", action: "read", description: "View designations", module: "hrms" },
    { resource: "designations", action: "update", description: "Edit designations", module: "hrms" },
    { resource: "designations", action: "delete", description: "Delete designations", module: "hrms" },

    // --- Phase 3: HRMS — Employee Management ---
    { resource: "employees", action: "create", description: "Onboard new employees", module: "hrms" },
    { resource: "employees", action: "read", description: "View employee records", module: "hrms" },
    { resource: "employees", action: "update", description: "Update employee information", module: "hrms" },
    { resource: "employees", action: "delete", description: "Separate employees", module: "hrms" },
    { resource: "employees", action: "export", description: "Export employee data", module: "hrms" },

    // --- Phase 3: HRMS — Attendance Management ---
    { resource: "attendance", action: "create", description: "Mark attendance", module: "hrms" },
    { resource: "attendance", action: "read", description: "View attendance records", module: "hrms" },
    { resource: "attendance", action: "update", description: "Edit attendance records", module: "hrms" },
    { resource: "attendance", action: "export", description: "Export attendance data", module: "hrms" },

    // --- Phase 3: HRMS — Leave Management ---
    { resource: "leave_types", action: "create", description: "Create leave types", module: "hrms" },
    { resource: "leave_types", action: "read", description: "View leave types", module: "hrms" },
    { resource: "leave_types", action: "update", description: "Edit leave types", module: "hrms" },
    { resource: "leave_requests", action: "create", description: "Apply for leave", module: "hrms" },
    { resource: "leave_requests", action: "read", description: "View leave requests", module: "hrms" },
    { resource: "leave_requests", action: "approve", description: "Approve/reject leave requests", module: "hrms" },

    // --- Phase 3: HRMS — Holiday Management ---
    { resource: "holidays", action: "create", description: "Add company holidays", module: "hrms" },
    { resource: "holidays", action: "read", description: "View holiday calendar", module: "hrms" },
    { resource: "holidays", action: "update", description: "Edit holiday entries", module: "hrms" },
    { resource: "holidays", action: "delete", description: "Remove holiday entries", module: "hrms" },

    // --- Phase 3: Payroll — Salary Components & Structures ---
    { resource: "salary_components", action: "create", description: "Create salary components", module: "hrms" },
    { resource: "salary_components", action: "read", description: "View salary components", module: "hrms" },
    { resource: "salary_components", action: "update", description: "Edit salary components", module: "hrms" },
    { resource: "salary_structures", action: "create", description: "Create salary structures", module: "hrms" },
    { resource: "salary_structures", action: "read", description: "View salary structures", module: "hrms" },
    { resource: "salary_structures", action: "update", description: "Edit salary structures", module: "hrms" },

    // --- Phase 3: Payroll — Payroll Processing ---
    { resource: "payroll", action: "read", description: "View payroll data", module: "hrms" },
    { resource: "payroll", action: "process", description: "Run payroll processing", module: "hrms" },
    { resource: "payroll", action: "approve", description: "Approve payroll for disbursement", module: "hrms" },
    { resource: "payslips", action: "read", description: "View payslips", module: "hrms" },
    { resource: "payslips", action: "create", description: "Generate payslips", module: "hrms" },

    // --- Phase 5: E-Learning ---
    { resource: "courses", action: "create", description: "Create courses", module: "elearning" },
    { resource: "courses", action: "read", description: "View and enroll in courses", module: "elearning" },
    { resource: "courses", action: "update", description: "Edit course content", module: "elearning" },
    { resource: "courses", action: "delete", description: "Remove courses", module: "elearning" },
    { resource: "enrollments", action: "create", description: "Enroll users in courses", module: "elearning" },
    { resource: "enrollments", action: "read", description: "View enrollment records", module: "elearning" },
    { resource: "enrollments", action: "update", description: "Update enrollment status", module: "elearning" },
    { resource: "enrollments", action: "delete", description: "Remove enrollments", module: "elearning" },
    { resource: "certificates", action: "create", description: "Issue certificates", module: "elearning" },
    { resource: "certificates", action: "read", description: "View certificates", module: "elearning" },
    { resource: "certificates", action: "update", description: "Revoke certificates", module: "elearning" },
    { resource: "forum", action: "create", description: "Create forum posts", module: "community" },
    { resource: "forum", action: "read", description: "View forum posts and replies", module: "community" },
    { resource: "forum", action: "update", description: "Edit/moderate posts", module: "community" },
    { resource: "forum", action: "delete", description: "Delete forum posts", module: "community" },

    // --- Phase 6: Partner Program ---
    { resource: "partners", action: "create", description: "Register new partners", module: "partner" },
    { resource: "partners", action: "read", description: "View partner details", module: "partner" },
    { resource: "partners", action: "update", description: "Manage partner information", module: "partner" },
    { resource: "partners", action: "delete", description: "Terminate partners", module: "partner" },
    { resource: "commissions", action: "create", description: "Create commission records", module: "partner" },
    { resource: "commissions", action: "read", description: "View commission records", module: "partner" },
    { resource: "commissions", action: "update", description: "Update commission status", module: "partner" },
    { resource: "commissions", action: "approve", description: "Approve commission payouts", module: "partner" },
    { resource: "commissions", action: "delete", description: "Delete commission records", module: "partner" },
    { resource: "payouts", action: "create", description: "Create payout batches", module: "partner" },
    { resource: "payouts", action: "read", description: "View payout records", module: "partner" },
    { resource: "payouts", action: "update", description: "Update payout status", module: "partner" },
    { resource: "payouts", action: "delete", description: "Delete payout records", module: "partner" },
    { resource: "mdf", action: "create", description: "Submit MDF requests", module: "partner" },
    { resource: "mdf", action: "read", description: "View MDF requests", module: "partner" },
    { resource: "mdf", action: "update", description: "Update MDF requests", module: "partner" },
    { resource: "mdf", action: "delete", description: "Delete MDF requests", module: "partner" },

    // --- Phase 6: Marketplace ---
    { resource: "marketplace", action: "create", description: "Create marketplace listings", module: "marketplace" },
    { resource: "marketplace", action: "read", description: "View marketplace listings", module: "marketplace" },
    { resource: "marketplace", action: "update", description: "Update marketplace listings", module: "marketplace" },
    { resource: "marketplace", action: "delete", description: "Delete marketplace listings", module: "marketplace" },
    { resource: "marketplace_reviews", action: "create", description: "Write marketplace reviews", module: "marketplace" },
    { resource: "marketplace_reviews", action: "read", description: "View marketplace reviews", module: "marketplace" },
    { resource: "marketplace_reviews", action: "delete", description: "Delete marketplace reviews", module: "marketplace" },

    // --- Phase 7: AI Enhancement & Optimization ---
    { resource: "ai_agents", action: "create", description: "Create AI agents", module: "ai" },
    { resource: "ai_agents", action: "read", description: "View AI agents", module: "ai" },
    { resource: "ai_agents", action: "update", description: "Configure AI agents", module: "ai" },
    { resource: "ai_agents", action: "delete", description: "Delete AI agents", module: "ai" },
    { resource: "ai_conversations", action: "create", description: "Start AI conversations", module: "ai" },
    { resource: "ai_conversations", action: "read", description: "View AI conversations", module: "ai" },
    { resource: "ai_conversations", action: "delete", description: "Delete AI conversations", module: "ai" },
    { resource: "rag_documents", action: "create", description: "Upload knowledge base documents", module: "ai" },
    { resource: "rag_documents", action: "read", description: "View knowledge base documents", module: "ai" },
    { resource: "rag_documents", action: "update", description: "Update knowledge base documents", module: "ai" },
    { resource: "rag_documents", action: "delete", description: "Delete knowledge base documents", module: "ai" },
    { resource: "autonomous_rules", action: "create", description: "Create autonomous decision rules", module: "ai" },
    { resource: "autonomous_rules", action: "read", description: "View autonomous rules", module: "ai" },
    { resource: "autonomous_rules", action: "update", description: "Configure autonomous rules", module: "ai" },
    { resource: "autonomous_rules", action: "delete", description: "Delete autonomous rules", module: "ai" },
    { resource: "autonomous_decisions", action: "read", description: "View autonomous decisions", module: "ai" },
    { resource: "autonomous_decisions", action: "override", description: "Override autonomous decisions", module: "ai" },
    { resource: "analytics_dashboards", action: "create", description: "Create analytics dashboards", module: "analytics" },
    { resource: "analytics_dashboards", action: "read", description: "View analytics dashboards", module: "analytics" },
    { resource: "analytics_dashboards", action: "update", description: "Edit analytics dashboards", module: "analytics" },
    { resource: "analytics_dashboards", action: "delete", description: "Delete analytics dashboards", module: "analytics" },
    { resource: "analytics_widgets", action: "create", description: "Create dashboard widgets", module: "analytics" },
    { resource: "analytics_widgets", action: "read", description: "View dashboard widgets", module: "analytics" },
    { resource: "analytics_widgets", action: "update", description: "Edit dashboard widgets", module: "analytics" },
    { resource: "analytics_widgets", action: "delete", description: "Delete dashboard widgets", module: "analytics" },
  ];

  const createdPermissions: Record<string, any> = {};
  for (const perm of permissionData) {
    const key = `${perm.resource}:${perm.action}`;
    const created = await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: perm.resource,
          action: perm.action,
        },
      },
      update: {},
      create: perm,
    });
    createdPermissions[key] = created;
  }

  console.log(`   ✅ Permissions created: ${Object.keys(createdPermissions).length} permissions`);

  // ==========================================================================
  // 5. ROLE-PERMISSION ASSIGNMENTS
  // ==========================================================================
  console.log("🔗 Assigning permissions to roles...");

  // Super Admin: gets ALL permissions with ALL data scope
  for (const [key, perm] of Object.entries(createdPermissions)) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: createdRoles.super_admin.id,
          permission_id: perm.id,
        },
      },
      update: {},
      create: {
        role_id: createdRoles.super_admin.id,
        permission_id: perm.id,
        data_scope: "ALL" as DataScope,
      },
    });
  }

  // Tenant Admin: gets all permissions EXCEPT tenant suspend/reactivate and AI config
  const tenantAdminExclude = [
    "tenants:suspend",
    "tenants:reactivate",
    "ai_config:update",
  ];
  for (const [key, perm] of Object.entries(createdPermissions)) {
    if (tenantAdminExclude.includes(key)) continue;
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: createdRoles.tenant_admin.id,
          permission_id: perm.id,
        },
      },
      update: {},
      create: {
        role_id: createdRoles.tenant_admin.id,
        permission_id: perm.id,
        data_scope: "ALL" as DataScope,
      },
    });
  }

  // Manager: department-scoped access to most operational permissions
  const managerPermissions = [
    "users:read", "users:update",
    "roles:read",
    "settings:read",
    "notifications:read", "notifications:update", "notifications:create",
    "audit_logs:read",
    "ai_usage:read",
    "leads:create", "leads:read", "leads:update", "leads:delete", "leads:export",
    "invoices:create", "invoices:read", "invoices:update", "invoices:approve",
    "employees:create", "employees:read", "employees:update",
    "payroll:read",
    "courses:read", "courses:update",
    "partners:read",
    "commissions:read",
  ];
  for (const key of managerPermissions) {
    if (!createdPermissions[key]) continue;
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: createdRoles.manager.id,
          permission_id: createdPermissions[key].id,
        },
      },
      update: {},
      create: {
        role_id: createdRoles.manager.id,
        permission_id: createdPermissions[key].id,
        data_scope: "DEPARTMENT" as DataScope,
      },
    });
  }

  // Standard User: own-record access to core functionality
  const standardUserPermissions = [
    "users:read",
    "notifications:read", "notifications:update",
    "settings:read",
    "leads:create", "leads:read", "leads:update",
    "invoices:read",
    "employees:read",
    "payroll:read",
    "courses:read",
  ];
  for (const key of standardUserPermissions) {
    if (!createdPermissions[key]) continue;
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: createdRoles.standard_user.id,
          permission_id: createdPermissions[key].id,
        },
      },
      update: {},
      create: {
        role_id: createdRoles.standard_user.id,
        permission_id: createdPermissions[key].id,
        data_scope: "OWN" as DataScope,
      },
    });
  }

  // Viewer: read-only access
  const viewerPermissions = [
    "users:read",
    "notifications:read",
    "settings:read",
    "leads:read",
    "invoices:read",
    "employees:read",
    "courses:read",
    "partners:read",
  ];
  for (const key of viewerPermissions) {
    if (!createdPermissions[key]) continue;
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: createdRoles.viewer.id,
          permission_id: createdPermissions[key].id,
        },
      },
      update: {},
      create: {
        role_id: createdRoles.viewer.id,
        permission_id: createdPermissions[key].id,
        data_scope: "OWN" as DataScope,
      },
    });
  }

  console.log("   ✅ Role-permission assignments complete");

  // ==========================================================================
  // 6. SUPER ADMIN USER
  // ==========================================================================
  console.log("🦸 Creating super admin user...");

  const adminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@softmerce.com";
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin@123";
  const passwordHash = await bcryptjs.hash(adminPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: {
      tenant_id_email: {
        tenant_id: platformTenant.id,
        email: adminEmail,
      },
    },
    update: {},
    create: {
      tenant_id: platformTenant.id,
      email: adminEmail,
      password_hash: passwordHash,
      first_name: process.env.SUPER_ADMIN_FIRST_NAME || "Super",
      last_name: process.env.SUPER_ADMIN_LAST_NAME || "Admin",
      status: "ACTIVE",
      email_verified: true,
      preferences: {
        theme: "light",
        language: "en",
        notifications: {
          email: true,
          sms: true,
          in_app: true,
        },
        dashboard_layout: "default",
      },
    },
  });

  // Assign super_admin role to the admin user
  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: superAdmin.id,
        role_id: createdRoles.super_admin.id,
      },
    },
    update: {},
    create: {
      user_id: superAdmin.id,
      role_id: createdRoles.super_admin.id,
    },
  });

  console.log(`   ✅ Super admin: ${superAdmin.email}`);

  // ==========================================================================
  // 7. DEFAULT PLATFORM SETTINGS
  // ==========================================================================
  console.log("⚙️  Creating default platform settings...");

  const platformSettings = [
    // AI Settings
    { category: "ai", setting_key: "ai.enabled", setting_value: true, value_type: "BOOLEAN" as const, description: "Master switch for AI features across the platform" },
    { category: "ai", setting_key: "ai.default_provider", setting_value: "openai", value_type: "STRING" as const, description: "Primary AI provider used when not specified" },
    { category: "ai", setting_key: "ai.rate_limit_per_user", setting_value: 100, value_type: "NUMBER" as const, description: "Maximum AI requests per user per hour" },
    { category: "ai", setting_key: "ai.monthly_budget_inr", setting_value: 10000, value_type: "NUMBER" as const, description: "Maximum AI spending per tenant per month in INR" },

    // Authentication Settings
    { category: "auth", setting_key: "auth.session_timeout_minutes", setting_value: 60, value_type: "NUMBER" as const, description: "Minutes before auto-logout from inactivity" },
    { category: "auth", setting_key: "auth.mfa_required", setting_value: "admins_only", value_type: "STRING" as const, description: "Who must use two-factor authentication" },
    { category: "auth", setting_key: "auth.max_login_attempts", setting_value: 5, value_type: "NUMBER" as const, description: "Failed login attempts before account lockout" },
    { category: "auth", setting_key: "auth.lockout_duration_minutes", setting_value: 30, value_type: "NUMBER" as const, description: "How long a locked account stays locked" },
    { category: "auth", setting_key: "auth.password_min_length", setting_value: 8, value_type: "NUMBER" as const, description: "Minimum password length requirement" },

    // Notification Settings
    { category: "notifications", setting_key: "notifications.email_enabled", setting_value: true, value_type: "BOOLEAN" as const, description: "Enable email notifications globally" },
    { category: "notifications", setting_key: "notifications.sms_enabled", setting_value: true, value_type: "BOOLEAN" as const, description: "Enable SMS notifications globally" },
    { category: "notifications", setting_key: "notifications.whatsapp_enabled", setting_value: false, value_type: "BOOLEAN" as const, description: "Enable WhatsApp notifications globally" },
    { category: "notifications", setting_key: "notifications.push_enabled", setting_value: true, value_type: "BOOLEAN" as const, description: "Enable browser/mobile push notifications" },

    // Platform Settings
    { category: "platform", setting_key: "platform.default_currency", setting_value: "INR", value_type: "STRING" as const, description: "Default currency for new tenants" },
    { category: "platform", setting_key: "platform.default_timezone", setting_value: "Asia/Kolkata", value_type: "STRING" as const, description: "Default timezone for new tenants" },
    { category: "platform", setting_key: "platform.default_date_format", setting_value: "DD/MM/YYYY", value_type: "STRING" as const, description: "Default date format for display" },
    { category: "platform", setting_key: "platform.trial_duration_days", setting_value: 14, value_type: "NUMBER" as const, description: "Number of days for free trial period" },
    { category: "platform", setting_key: "platform.gst_rate", setting_value: 18, value_type: "NUMBER" as const, description: "Standard GST rate percentage for billing" },
  ];

  for (const setting of platformSettings) {
    // Platform settings have null tenant_id, module, and user_id.
    // Prisma upsert doesn't support null in composite unique keys,
    // so we use findFirst + create pattern instead.
    const existing = await prisma.setting.findFirst({
      where: {
        tenant_id: null,
        module: null,
        user_id: null,
        setting_key: setting.setting_key,
      },
    });

    if (!existing) {
      await prisma.setting.create({
        data: {
          category: setting.category,
          setting_key: setting.setting_key,
          setting_value: setting.setting_value as any,
          value_type: setting.value_type,
          editable_by: ["super_admin"],
        },
      });
    }
  }

  console.log(`   ✅ Platform settings: ${platformSettings.length} settings created`);

  // ==========================================================================
  // 8. AI PROVIDER CONFIGURATIONS
  // ==========================================================================
  console.log("🤖 Creating AI provider configurations...");

  const aiProviders = [
    {
      provider_name: "openai",
      model_name: "gpt-4o",
      cost_per_1k_input_tokens: 0.005,
      cost_per_1k_output_tokens: 0.015,
      max_tokens: 128000,
      priority: 1,
    },
    {
      provider_name: "openai",
      model_name: "gpt-4o-mini",
      cost_per_1k_input_tokens: 0.00015,
      cost_per_1k_output_tokens: 0.0006,
      max_tokens: 128000,
      priority: 2,
    },
    {
      provider_name: "anthropic",
      model_name: "claude-3.5-sonnet",
      cost_per_1k_input_tokens: 0.003,
      cost_per_1k_output_tokens: 0.015,
      max_tokens: 200000,
      priority: 3,
    },
    {
      provider_name: "anthropic",
      model_name: "claude-3-haiku",
      cost_per_1k_input_tokens: 0.00025,
      cost_per_1k_output_tokens: 0.00125,
      max_tokens: 200000,
      priority: 4,
    },
    {
      provider_name: "google",
      model_name: "gemini-pro",
      cost_per_1k_input_tokens: 0.00025,
      cost_per_1k_output_tokens: 0.0005,
      max_tokens: 1000000,
      priority: 5,
    },
  ];

  for (const provider of aiProviders) {
    await prisma.aIProviderConfig.upsert({
      where: {
        provider_name_model_name: {
          provider_name: provider.provider_name,
          model_name: provider.model_name,
        },
      },
      update: {},
      create: provider,
    });
  }

  console.log(`   ✅ AI providers: ${aiProviders.length} configurations created`);

  // ==========================================================================
  // 9. NOTIFICATION TEMPLATES
  // ==========================================================================
  console.log("📧 Creating notification templates...");

  const templates = [
    {
      template_code: "welcome_email",
      channel: "EMAIL" as const,
      subject: "Welcome to {{company_name}} on Softmerce!",
      body_template:
        "Hi {{first_name}},\n\nWelcome to {{company_name}}! Your account has been created successfully.\n\nYou can login at: {{login_url}}\nEmail: {{email}}\n\nIf you didn't request this account, please ignore this email.\n\nBest regards,\nThe {{company_name}} Team",
      variables: ["first_name", "company_name", "login_url", "email"],
    },
    {
      template_code: "password_reset",
      channel: "EMAIL" as const,
      subject: "Reset Your Password — {{company_name}}",
      body_template:
        "Hi {{first_name}},\n\nWe received a request to reset your password. Click the link below to set a new password:\n\n{{reset_link}}\n\nThis link expires in {{expiry_hours}} hours.\n\nIf you didn't request this, please ignore this email and your password will remain unchanged.\n\nBest regards,\nThe {{company_name}} Team",
      variables: ["first_name", "company_name", "reset_link", "expiry_hours"],
    },
    {
      template_code: "trial_expiry_reminder",
      channel: "EMAIL" as const,
      subject: "Your trial ends in {{days_remaining}} days — {{company_name}}",
      body_template:
        "Hi {{first_name}},\n\nYour free trial of Softmerce for {{company_name}} will expire in {{days_remaining}} days on {{expiry_date}}.\n\nHere's what you've accomplished:\n- {{usage_summary}}\n\nUpgrade now to continue enjoying all features:\n{{upgrade_url}}\n\nQuestions? Reply to this email or contact our support team.\n\nBest regards,\nThe Softmerce Team",
      variables: [
        "first_name",
        "company_name",
        "days_remaining",
        "expiry_date",
        "usage_summary",
        "upgrade_url",
      ],
    },
    {
      template_code: "payment_failed",
      channel: "EMAIL" as const,
      subject: "Action Required: Payment Failed — {{company_name}}",
      body_template:
        "Hi {{first_name}},\n\nWe were unable to process the payment of ₹{{amount}} for your {{plan_name}} subscription.\n\nReason: {{failure_reason}}\n\nPlease update your payment method to avoid service interruption:\n{{payment_url}}\n\nWe will retry the payment in {{retry_days}} days.\n\nBest regards,\nThe Softmerce Team",
      variables: [
        "first_name",
        "company_name",
        "amount",
        "plan_name",
        "failure_reason",
        "payment_url",
        "retry_days",
      ],
    },
    {
      template_code: "login_alert",
      channel: "IN_APP" as const,
      subject: "New Login Detected",
      body_template:
        "New login to your account from {{device}} at {{location}} on {{login_time}}. If this wasn't you, change your password immediately.",
      variables: ["device", "location", "login_time"],
    },
    {
      template_code: "otp_sms",
      channel: "SMS" as const,
      subject: null,
      body_template:
        "{{otp_code}} is your Softmerce verification code. Valid for {{expiry_minutes}} minutes. Do not share this code.",
      variables: ["otp_code", "expiry_minutes"],
    },
  ];

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { template_code: template.template_code },
      update: {},
      create: template,
    });
  }

  console.log(`   ✅ Notification templates: ${templates.length} templates created`);

  // ==========================================================================
  // 10. AI PROMPT TEMPLATES
  // ==========================================================================
  console.log("💬 Creating AI prompt templates...");

  const promptTemplates = [
    {
      template_name: "Email Composer",
      template_code: "email_compose",
      system_prompt:
        "You are a professional email writer for a business context. Write clear, concise, and professional emails. Use the provided context to personalize the message. Keep the tone {{tone}} and the length {{length}}.",
      user_prompt:
        "Write an email with the following details:\nRecipient: {{recipient_name}} ({{recipient_role}})\nSubject: {{subject}}\nKey Points: {{key_points}}\nContext: {{context}}",
      variables: [
        "tone",
        "length",
        "recipient_name",
        "recipient_role",
        "subject",
        "key_points",
        "context",
      ],
      category: "email",
    },
    {
      template_name: "Text Summarizer",
      template_code: "text_summarize",
      system_prompt:
        "You are a professional text summarizer. Create concise summaries that capture the key points. Output format: {{format}}. Maximum length: {{max_length}} words.",
      user_prompt: "Summarize the following text:\n\n{{text}}",
      variables: ["format", "max_length", "text"],
      category: "summary",
    },
    {
      template_name: "Sentiment Analyzer",
      template_code: "sentiment_analyze",
      system_prompt:
        'You are a sentiment analysis expert. Analyze the given text and return a JSON response with: sentiment (positive/negative/neutral), confidence (0-1), key_phrases (array of notable phrases), and summary (brief explanation).',
      user_prompt: "Analyze the sentiment of the following text:\n\n{{text}}",
      variables: ["text"],
      category: "analysis",
    },
  ];

  for (const template of promptTemplates) {
    await prisma.aIPromptTemplate.upsert({
      where: { template_code: template.template_code },
      update: {},
      create: template,
    });
  }

  console.log(`   ✅ AI prompt templates: ${promptTemplates.length} templates created`);

  // ==========================================================================
  // 11. PHASE 2: DEFAULT PIPELINE & STAGES (for platform tenant as demo)
  // ==========================================================================
  console.log("📊 Creating default sales pipeline and stages...");

  const existingPipeline = await prisma.pipeline.findFirst({
    where: { tenant_id: platformTenant.id, name: "Default Sales Pipeline" },
  });

  let defaultPipeline = existingPipeline;
  if (!existingPipeline) {
    defaultPipeline = await prisma.pipeline.create({
      data: {
        tenant_id: platformTenant.id,
        name: "Default Sales Pipeline",
        is_default: true,
        is_active: true,
      },
    });

    const stages = [
      { name: "Prospecting", sort_order: 1, win_probability: 10, color: "#6B7280" },
      { name: "Discovery", sort_order: 2, win_probability: 20, color: "#3B82F6" },
      { name: "Proposal Sent", sort_order: 3, win_probability: 40, color: "#8B5CF6" },
      { name: "Negotiation", sort_order: 4, win_probability: 60, color: "#F59E0B" },
      { name: "Verbal Agreement", sort_order: 5, win_probability: 80, color: "#10B981" },
      { name: "Closed Won", sort_order: 6, win_probability: 100, color: "#059669" },
      { name: "Closed Lost", sort_order: 7, win_probability: 0, color: "#EF4444" },
    ];

    for (const stage of stages) {
      await prisma.pipelineStage.create({
        data: {
          pipeline_id: defaultPipeline!.id,
          ...stage,
        },
      });
    }

    console.log(`   ✅ Pipeline: ${defaultPipeline!.name} with ${stages.length} stages`);
  } else {
    console.log(`   ⏭️  Pipeline already exists: ${existingPipeline.name}`);
  }

  // ==========================================================================
  // 12. PHASE 2: DEFAULT TAX RATES (Indian GST)
  // ==========================================================================
  console.log("💰 Creating default GST tax rates...");

  const taxRates = [
    { name: "Exempt (0%)", rate_code: "exempt", rate_percent: 0, gst_type: "NONE" as const },
    { name: "GST 5%", rate_code: "gst_5", rate_percent: 5, gst_type: "IGST" as const },
    { name: "GST 12%", rate_code: "gst_12", rate_percent: 12, gst_type: "IGST" as const },
    { name: "GST 18%", rate_code: "gst_18", rate_percent: 18, gst_type: "IGST" as const },
    { name: "GST 28%", rate_code: "gst_28", rate_percent: 28, gst_type: "IGST" as const },
    { name: "CGST 2.5%", rate_code: "cgst_2_5", rate_percent: 2.5, gst_type: "CGST" as const },
    { name: "SGST 2.5%", rate_code: "sgst_2_5", rate_percent: 2.5, gst_type: "SGST" as const },
    { name: "CGST 6%", rate_code: "cgst_6", rate_percent: 6, gst_type: "CGST" as const },
    { name: "SGST 6%", rate_code: "sgst_6", rate_percent: 6, gst_type: "SGST" as const },
    { name: "CGST 9%", rate_code: "cgst_9", rate_percent: 9, gst_type: "CGST" as const },
    { name: "SGST 9%", rate_code: "sgst_9", rate_percent: 9, gst_type: "SGST" as const },
    { name: "CGST 14%", rate_code: "cgst_14", rate_percent: 14, gst_type: "CGST" as const },
    { name: "SGST 14%", rate_code: "sgst_14", rate_percent: 14, gst_type: "SGST" as const },
  ];

  for (const tax of taxRates) {
    const existing = await prisma.taxRate.findFirst({
      where: { tenant_id: platformTenant.id, rate_code: tax.rate_code },
    });
    if (!existing) {
      await prisma.taxRate.create({
        data: {
          tenant_id: platformTenant.id,
          ...tax,
        },
      });
    }
  }

  console.log(`   ✅ Tax rates: ${taxRates.length} GST rates created`);

  // ==========================================================================
  // 13. PHASE 2: DEFAULT CHART OF ACCOUNTS (Indian Standard)
  // ==========================================================================
  console.log("📒 Creating default chart of accounts...");

  const existingCoa = await prisma.chartOfAccount.findFirst({
    where: { tenant_id: platformTenant.id, account_code: "1000" },
  });

  if (!existingCoa) {
    // Standard Indian Chart of Accounts structure
    const accounts = [
      // ASSETS (1000-1999)
      { account_code: "1000", account_name: "Assets", account_type: "ASSET" as const, balance_type: "DEBIT" as const, level: 0, is_system: true },
      { account_code: "1100", account_name: "Current Assets", account_type: "ASSET" as const, balance_type: "DEBIT" as const, level: 1, parent_code: "1000", is_system: true },
      { account_code: "1110", account_name: "Cash and Bank Balances", account_type: "ASSET" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "1100", is_system: true },
      { account_code: "1120", account_name: "Accounts Receivable (Trade Debtors)", account_type: "ASSET" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "1100", is_system: true },
      { account_code: "1130", account_name: "GST Input Credit (CGST)", account_type: "ASSET" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "1100", is_system: true },
      { account_code: "1131", account_name: "GST Input Credit (SGST)", account_type: "ASSET" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "1100", is_system: true },
      { account_code: "1132", account_name: "GST Input Credit (IGST)", account_type: "ASSET" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "1100", is_system: true },
      { account_code: "1140", account_name: "TDS Receivable", account_type: "ASSET" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "1100", is_system: true },
      { account_code: "1150", account_name: "Prepaid Expenses", account_type: "ASSET" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "1100", is_system: true },
      { account_code: "1160", account_name: "Advance to Suppliers", account_type: "ASSET" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "1100", is_system: true },
      { account_code: "1200", account_name: "Fixed Assets", account_type: "ASSET" as const, balance_type: "DEBIT" as const, level: 1, parent_code: "1000", is_system: true },
      { account_code: "1210", account_name: "Furniture & Fixtures", account_type: "ASSET" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "1200", is_system: false },
      { account_code: "1220", account_name: "Computer Equipment", account_type: "ASSET" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "1200", is_system: false },
      { account_code: "1230", account_name: "Accumulated Depreciation", account_type: "ASSET" as const, balance_type: "CREDIT" as const, level: 2, parent_code: "1200", is_system: false },

      // LIABILITIES (2000-2999)
      { account_code: "2000", account_name: "Liabilities", account_type: "LIABILITY" as const, balance_type: "CREDIT" as const, level: 0, is_system: true },
      { account_code: "2100", account_name: "Current Liabilities", account_type: "LIABILITY" as const, balance_type: "CREDIT" as const, level: 1, parent_code: "2000", is_system: true },
      { account_code: "2110", account_name: "Accounts Payable (Trade Creditors)", account_type: "LIABILITY" as const, balance_type: "CREDIT" as const, level: 2, parent_code: "2100", is_system: true },
      { account_code: "2120", account_name: "GST Output Liability (CGST)", account_type: "LIABILITY" as const, balance_type: "CREDIT" as const, level: 2, parent_code: "2100", is_system: true },
      { account_code: "2121", account_name: "GST Output Liability (SGST)", account_type: "LIABILITY" as const, balance_type: "CREDIT" as const, level: 2, parent_code: "2100", is_system: true },
      { account_code: "2122", account_name: "GST Output Liability (IGST)", account_type: "LIABILITY" as const, balance_type: "CREDIT" as const, level: 2, parent_code: "2100", is_system: true },
      { account_code: "2130", account_name: "TDS Payable", account_type: "LIABILITY" as const, balance_type: "CREDIT" as const, level: 2, parent_code: "2100", is_system: true },
      { account_code: "2140", account_name: "Salary Payable", account_type: "LIABILITY" as const, balance_type: "CREDIT" as const, level: 2, parent_code: "2100", is_system: true },
      { account_code: "2150", account_name: "Advance from Customers", account_type: "LIABILITY" as const, balance_type: "CREDIT" as const, level: 2, parent_code: "2100", is_system: true },
      { account_code: "2200", account_name: "Long-term Liabilities", account_type: "LIABILITY" as const, balance_type: "CREDIT" as const, level: 1, parent_code: "2000", is_system: true },
      { account_code: "2210", account_name: "Loans Payable", account_type: "LIABILITY" as const, balance_type: "CREDIT" as const, level: 2, parent_code: "2200", is_system: false },

      // EQUITY (3000-3999)
      { account_code: "3000", account_name: "Equity", account_type: "EQUITY" as const, balance_type: "CREDIT" as const, level: 0, is_system: true },
      { account_code: "3100", account_name: "Share Capital", account_type: "EQUITY" as const, balance_type: "CREDIT" as const, level: 1, parent_code: "3000", is_system: true },
      { account_code: "3200", account_name: "Retained Earnings", account_type: "EQUITY" as const, balance_type: "CREDIT" as const, level: 1, parent_code: "3000", is_system: true },
      { account_code: "3300", account_name: "Current Year Profit/Loss", account_type: "EQUITY" as const, balance_type: "CREDIT" as const, level: 1, parent_code: "3000", is_system: true },

      // REVENUE (4000-4999)
      { account_code: "4000", account_name: "Revenue", account_type: "REVENUE" as const, balance_type: "CREDIT" as const, level: 0, is_system: true },
      { account_code: "4100", account_name: "Sales Revenue", account_type: "REVENUE" as const, balance_type: "CREDIT" as const, level: 1, parent_code: "4000", is_system: true },
      { account_code: "4110", account_name: "Product Sales", account_type: "REVENUE" as const, balance_type: "CREDIT" as const, level: 2, parent_code: "4100", is_system: false },
      { account_code: "4120", account_name: "Service Revenue", account_type: "REVENUE" as const, balance_type: "CREDIT" as const, level: 2, parent_code: "4100", is_system: false },
      { account_code: "4200", account_name: "Other Income", account_type: "REVENUE" as const, balance_type: "CREDIT" as const, level: 1, parent_code: "4000", is_system: true },
      { account_code: "4210", account_name: "Interest Income", account_type: "REVENUE" as const, balance_type: "CREDIT" as const, level: 2, parent_code: "4200", is_system: false },
      { account_code: "4220", account_name: "Discount Received", account_type: "REVENUE" as const, balance_type: "CREDIT" as const, level: 2, parent_code: "4200", is_system: false },

      // EXPENSES (5000-5999)
      { account_code: "5000", account_name: "Expenses", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 0, is_system: true },
      { account_code: "5100", account_name: "Cost of Services", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 1, parent_code: "5000", is_system: true },
      { account_code: "5200", account_name: "Operating Expenses", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 1, parent_code: "5000", is_system: true },
      { account_code: "5210", account_name: "Rent Expense", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "5200", is_system: false },
      { account_code: "5220", account_name: "Utility Expenses", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "5200", is_system: false },
      { account_code: "5230", account_name: "Office Supplies", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "5200", is_system: false },
      { account_code: "5240", account_name: "Travel & Conveyance", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "5200", is_system: false },
      { account_code: "5250", account_name: "Professional Fees", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "5200", is_system: false },
      { account_code: "5260", account_name: "Communication Expenses", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "5200", is_system: false },
      { account_code: "5270", account_name: "Insurance", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "5200", is_system: false },
      { account_code: "5280", account_name: "Depreciation", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "5200", is_system: false },
      { account_code: "5300", account_name: "Employee Costs", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 1, parent_code: "5000", is_system: true },
      { account_code: "5310", account_name: "Salaries & Wages", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "5300", is_system: false },
      { account_code: "5320", account_name: "Employer PF Contribution", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "5300", is_system: false },
      { account_code: "5330", account_name: "Employer ESI Contribution", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 2, parent_code: "5300", is_system: false },
      { account_code: "5400", account_name: "Marketing Expenses", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 1, parent_code: "5000", is_system: false },
      { account_code: "5500", account_name: "Bank Charges", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 1, parent_code: "5000", is_system: false },
      { account_code: "5600", account_name: "Discount Given", account_type: "EXPENSE" as const, balance_type: "DEBIT" as const, level: 1, parent_code: "5000", is_system: false },
    ];

    // First pass: create all accounts without parents
    const accountMap: Record<string, string> = {};
    for (const acct of accounts) {
      const { parent_code, ...data } = acct as any;
      const created = await prisma.chartOfAccount.create({
        data: {
          tenant_id: platformTenant.id,
          ...data,
        },
      });
      accountMap[acct.account_code] = created.id;
    }

    // Second pass: set parent references
    for (const acct of accounts) {
      if ((acct as any).parent_code && accountMap[(acct as any).parent_code]) {
        await prisma.chartOfAccount.update({
          where: { id: accountMap[acct.account_code] },
          data: { parent_id: accountMap[(acct as any).parent_code] },
        });
      }
    }

    console.log(`   ✅ Chart of accounts: ${accounts.length} accounts created`);
  } else {
    console.log("   ⏭️  Chart of accounts already exists");
  }

  // ==========================================================================
  // 14. PHASE 2: NOTIFICATION TEMPLATES (Billing & CRM)
  // ==========================================================================
  console.log("📧 Creating Phase 2 notification templates...");

  const phase2Templates = [
    {
      template_code: "invoice_created",
      channel: "EMAIL" as const,
      subject: "New Invoice #{{invoice_number}} — {{company_name}}",
      body_template:
        "Dear {{customer_name}},\n\nA new invoice has been generated for you:\n\nInvoice #: {{invoice_number}}\nDate: {{invoice_date}}\nAmount: ₹{{total_amount}}\nDue Date: {{due_date}}\n\nYou can view and pay this invoice at:\n{{invoice_url}}\n\nThank you for your business.\n\nRegards,\n{{company_name}}",
      variables: ["customer_name", "invoice_number", "invoice_date", "total_amount", "due_date", "invoice_url", "company_name"],
    },
    {
      template_code: "payment_received",
      channel: "EMAIL" as const,
      subject: "Payment Received — Receipt #{{receipt_number}}",
      body_template:
        "Dear {{customer_name}},\n\nWe have received your payment:\n\nReceipt #: {{receipt_number}}\nAmount: ₹{{amount}}\nPayment Mode: {{payment_mode}}\nDate: {{payment_date}}\n\nThank you for your prompt payment.\n\nRegards,\n{{company_name}}",
      variables: ["customer_name", "receipt_number", "amount", "payment_mode", "payment_date", "company_name"],
    },
    {
      template_code: "lead_assigned",
      channel: "IN_APP" as const,
      subject: "New Lead Assigned: {{lead_name}}",
      body_template:
        "A new lead has been assigned to you:\n\nName: {{lead_name}}\nCompany: {{lead_company}}\nSource: {{lead_source}}\nScore: {{lead_score}}/100\n\nFollow up by: {{follow_up_date}}",
      variables: ["lead_name", "lead_company", "lead_source", "lead_score", "follow_up_date"],
    },
    {
      template_code: "deal_won",
      channel: "IN_APP" as const,
      subject: "🎉 Deal Won: {{deal_title}}",
      body_template:
        "Congratulations! The deal '{{deal_title}}' has been marked as Won.\n\nDeal Value: ₹{{deal_value}}\nCustomer: {{customer_name}}\nClosed by: {{owner_name}}",
      variables: ["deal_title", "deal_value", "customer_name", "owner_name"],
    },
    {
      template_code: "invoice_overdue",
      channel: "EMAIL" as const,
      subject: "Payment Overdue — Invoice #{{invoice_number}}",
      body_template:
        "Dear {{customer_name}},\n\nThis is a reminder that the following invoice is now overdue:\n\nInvoice #: {{invoice_number}}\nOriginal Due Date: {{due_date}}\nOverdue Amount: ₹{{amount_due}}\nDays Overdue: {{days_overdue}}\n\nPlease arrange payment at your earliest convenience.\n\nRegards,\n{{company_name}}",
      variables: ["customer_name", "invoice_number", "due_date", "amount_due", "days_overdue", "company_name"],
    },
  ];

  for (const template of phase2Templates) {
    await prisma.notificationTemplate.upsert({
      where: { template_code: template.template_code },
      update: {},
      create: template,
    });
  }

  console.log(`   ✅ Phase 2 notification templates: ${phase2Templates.length} templates created`);

  // ==========================================================================
  // 15. PHASE 3: DEFAULT DEPARTMENTS
  // ==========================================================================
  console.log("🏢 Creating default departments...");

  const existingDept = await prisma.department.findFirst({
    where: { tenant_id: platformTenant.id, dept_code: "MGMT" },
  });

  if (!existingDept) {
    const departmentData = [
      { dept_code: "MGMT", name: "Management", description: "Executive management and leadership" },
      { dept_code: "ENG", name: "Engineering", description: "Software development and engineering" },
      { dept_code: "HR", name: "Human Resources", description: "People operations, recruitment, and employee welfare" },
      { dept_code: "FIN", name: "Finance & Accounting", description: "Financial operations, accounting, and compliance" },
      { dept_code: "SALES", name: "Sales", description: "Sales, business development, and revenue generation" },
      { dept_code: "MKT", name: "Marketing", description: "Marketing, branding, and demand generation" },
      { dept_code: "OPS", name: "Operations", description: "Business operations and process management" },
      { dept_code: "SUPPORT", name: "Customer Support", description: "Customer service and technical support" },
    ];

    for (const dept of departmentData) {
      await prisma.department.create({
        data: { tenant_id: platformTenant.id, ...dept },
      });
    }

    console.log(`   ✅ Departments: ${departmentData.length} departments created`);
  } else {
    console.log("   ⏭️  Departments already exist");
  }

  // ==========================================================================
  // 16. PHASE 3: DEFAULT DESIGNATIONS
  // ==========================================================================
  console.log("🎯 Creating default designations...");

  const existingDesig = await prisma.designation.findFirst({
    where: { tenant_id: platformTenant.id, code: "CEO" },
  });

  if (!existingDesig) {
    const designationData = [
      { code: "CEO", title: "Chief Executive Officer", grade: "C-Suite", sort_order: 1 },
      { code: "CTO", title: "Chief Technology Officer", grade: "C-Suite", sort_order: 2 },
      { code: "CFO", title: "Chief Financial Officer", grade: "C-Suite", sort_order: 3 },
      { code: "VP", title: "Vice President", grade: "L6", sort_order: 4 },
      { code: "DIR", title: "Director", grade: "L5", sort_order: 5 },
      { code: "SM", title: "Senior Manager", grade: "L4", sort_order: 6 },
      { code: "MGR", title: "Manager", grade: "L3", sort_order: 7 },
      { code: "TL", title: "Team Lead", grade: "L3", sort_order: 8 },
      { code: "SSE", title: "Senior Software Engineer", grade: "L2", sort_order: 9 },
      { code: "SE", title: "Software Engineer", grade: "L1", sort_order: 10 },
      { code: "JSE", title: "Junior Software Engineer", grade: "L0", sort_order: 11 },
      { code: "BA", title: "Business Analyst", grade: "L2", sort_order: 12 },
      { code: "QA", title: "QA Engineer", grade: "L1", sort_order: 13 },
      { code: "DES", title: "UI/UX Designer", grade: "L1", sort_order: 14 },
      { code: "EXEC", title: "Executive", grade: "L0", sort_order: 15 },
      { code: "INTERN", title: "Intern", grade: "Intern", sort_order: 16 },
    ];

    for (const desig of designationData) {
      await prisma.designation.create({
        data: { tenant_id: platformTenant.id, ...desig },
      });
    }

    console.log(`   ✅ Designations: ${designationData.length} designations created`);
  } else {
    console.log("   ⏭️  Designations already exist");
  }

  // ==========================================================================
  // 17. PHASE 3: DEFAULT LEAVE TYPES
  // ==========================================================================
  console.log("🌴 Creating default leave types...");

  const existingLeaveType = await prisma.leaveType.findFirst({
    where: { tenant_id: platformTenant.id, code: "CL" },
  });

  if (!existingLeaveType) {
    const leaveTypeData = [
      { code: "CL", name: "Casual Leave", description: "For personal matters and short absences", annual_allocation: 12, max_carry_forward: 0, max_consecutive_days: 3, is_paid: true, allow_half_day: true },
      { code: "SL", name: "Sick Leave", description: "For illness and medical reasons", annual_allocation: 12, max_carry_forward: 6, max_consecutive_days: null, is_paid: true, allow_half_day: true, requires_doc_after_days: 3 },
      { code: "EL", name: "Earned Leave", description: "Earned/privilege leave that accrues over service", annual_allocation: 15, max_carry_forward: 30, max_consecutive_days: null, is_paid: true, allow_half_day: false },
      { code: "ML", name: "Maternity Leave", description: "Leave for childbirth and recovery (26 weeks)", annual_allocation: 182, max_carry_forward: 0, max_consecutive_days: null, is_paid: true, allow_half_day: false, applicable_gender: "FEMALE" as const },
      { code: "PL", name: "Paternity Leave", description: "Leave for new fathers (15 days)", annual_allocation: 15, max_carry_forward: 0, max_consecutive_days: 15, is_paid: true, allow_half_day: false, applicable_gender: "MALE" as const },
      { code: "CO", name: "Compensatory Off", description: "Off in lieu of working on holidays/weekends", annual_allocation: 0, max_carry_forward: 0, max_consecutive_days: 1, is_paid: true, allow_half_day: true },
      { code: "LOP", name: "Loss of Pay", description: "Unpaid leave when other leave types exhausted", annual_allocation: 0, max_carry_forward: 0, max_consecutive_days: null, is_paid: false, allow_half_day: true },
    ];

    for (const lt of leaveTypeData) {
      await prisma.leaveType.create({
        data: {
          tenant_id: platformTenant.id,
          ...lt,
        },
      });
    }

    console.log(`   ✅ Leave types: ${leaveTypeData.length} types created`);
  } else {
    console.log("   ⏭️  Leave types already exist");
  }

  // ==========================================================================
  // 18. PHASE 3: DEFAULT HOLIDAYS (2026)
  // ==========================================================================
  console.log("📅 Creating default holidays for 2026...");

  const existingHoliday = await prisma.holiday.findFirst({
    where: { tenant_id: platformTenant.id, year: 2026 },
  });

  if (!existingHoliday) {
    const holidays2026 = [
      { name: "Republic Day", date: new Date("2026-01-26"), is_mandatory: true },
      { name: "Holi", date: new Date("2026-03-04"), is_mandatory: true },
      { name: "Good Friday", date: new Date("2026-04-03"), is_mandatory: true },
      { name: "Eid ul-Fitr", date: new Date("2026-03-20"), is_mandatory: true },
      { name: "Labour Day", date: new Date("2026-05-01"), is_mandatory: true },
      { name: "Independence Day", date: new Date("2026-08-15"), is_mandatory: true },
      { name: "Janmashtami", date: new Date("2026-08-25"), is_mandatory: true },
      { name: "Mahatma Gandhi Jayanti", date: new Date("2026-10-02"), is_mandatory: true },
      { name: "Dussehra", date: new Date("2026-10-02"), is_mandatory: false, is_optional: true },
      { name: "Diwali", date: new Date("2026-10-20"), is_mandatory: true },
      { name: "Diwali (Next Day)", date: new Date("2026-10-21"), is_mandatory: true },
      { name: "Guru Nanak Jayanti", date: new Date("2026-11-05"), is_mandatory: true },
      { name: "Christmas", date: new Date("2026-12-25"), is_mandatory: true },
    ];

    for (const h of holidays2026) {
      // Check for duplicate dates (Dussehra conflicts with Gandhi Jayanti)
      const exists = await prisma.holiday.findFirst({
        where: { tenant_id: platformTenant.id, date: h.date },
      });
      if (!exists) {
        await prisma.holiday.create({
          data: {
            tenant_id: platformTenant.id,
            year: 2026,
            is_optional: false,
            ...h,
          },
        });
      }
    }

    console.log(`   ✅ Holidays: 2026 holidays created`);
  } else {
    console.log("   ⏭️  Holidays already exist for 2026");
  }

  // ==========================================================================
  // 19. PHASE 3: DEFAULT SALARY COMPONENTS
  // ==========================================================================
  console.log("💰 Creating default salary components...");

  const existingComp = await prisma.salaryComponent.findFirst({
    where: { tenant_id: platformTenant.id, code: "BASIC" },
  });

  if (!existingComp) {
    const salaryComponents = [
      // EARNINGS
      { code: "BASIC", name: "Basic Salary", component_type: "EARNING" as const, calculation_method: "PERCENTAGE_OF_CTC" as const, percentage_value: 40, is_taxable: true, is_part_of_ctc: true, is_statutory: false, sort_order: 1 },
      { code: "HRA", name: "House Rent Allowance", component_type: "EARNING" as const, calculation_method: "PERCENTAGE_OF_BASIC" as const, percentage_value: 50, is_taxable: true, is_part_of_ctc: true, is_statutory: false, sort_order: 2 },
      { code: "DA", name: "Dearness Allowance", component_type: "EARNING" as const, calculation_method: "PERCENTAGE_OF_BASIC" as const, percentage_value: 10, is_taxable: true, is_part_of_ctc: true, is_statutory: false, sort_order: 3 },
      { code: "CONVEY", name: "Conveyance Allowance", component_type: "EARNING" as const, calculation_method: "FIXED" as const, is_taxable: false, is_part_of_ctc: true, is_statutory: false, sort_order: 4 },
      { code: "MEDICAL", name: "Medical Allowance", component_type: "EARNING" as const, calculation_method: "FIXED" as const, is_taxable: false, is_part_of_ctc: true, is_statutory: false, sort_order: 5 },
      { code: "SPECIAL", name: "Special Allowance", component_type: "EARNING" as const, calculation_method: "FIXED" as const, is_taxable: true, is_part_of_ctc: true, is_statutory: false, sort_order: 6 },
      { code: "BONUS", name: "Performance Bonus", component_type: "EARNING" as const, calculation_method: "FIXED" as const, is_taxable: true, is_part_of_ctc: false, is_statutory: false, sort_order: 7 },
      { code: "OT", name: "Overtime Pay", component_type: "EARNING" as const, calculation_method: "FIXED" as const, is_taxable: true, is_part_of_ctc: false, is_statutory: false, sort_order: 8 },

      // DEDUCTIONS
      { code: "PF_EE", name: "Employee PF Contribution", component_type: "DEDUCTION" as const, calculation_method: "PERCENTAGE_OF_BASIC" as const, percentage_value: 12, is_taxable: false, is_part_of_ctc: false, is_statutory: true, statutory_code: "PF", sort_order: 10 },
      { code: "PF_ER", name: "Employer PF Contribution", component_type: "DEDUCTION" as const, calculation_method: "PERCENTAGE_OF_BASIC" as const, percentage_value: 12, is_taxable: false, is_part_of_ctc: true, is_statutory: true, statutory_code: "PF", sort_order: 11 },
      { code: "ESI_EE", name: "Employee ESI Contribution", component_type: "DEDUCTION" as const, calculation_method: "PERCENTAGE_OF_GROSS" as const, percentage_value: 0.75, is_taxable: false, is_part_of_ctc: false, is_statutory: true, statutory_code: "ESI", sort_order: 12 },
      { code: "ESI_ER", name: "Employer ESI Contribution", component_type: "DEDUCTION" as const, calculation_method: "PERCENTAGE_OF_GROSS" as const, percentage_value: 3.25, is_taxable: false, is_part_of_ctc: true, is_statutory: true, statutory_code: "ESI", sort_order: 13 },
      { code: "PT", name: "Professional Tax", component_type: "DEDUCTION" as const, calculation_method: "FIXED" as const, is_taxable: false, is_part_of_ctc: false, is_statutory: true, statutory_code: "PT", sort_order: 14 },
      { code: "TDS", name: "Tax Deducted at Source", component_type: "DEDUCTION" as const, calculation_method: "FIXED" as const, is_taxable: false, is_part_of_ctc: false, is_statutory: true, statutory_code: "TDS", sort_order: 15 },
      { code: "LOP_DED", name: "Loss of Pay Deduction", component_type: "DEDUCTION" as const, calculation_method: "FIXED" as const, is_taxable: false, is_part_of_ctc: false, is_statutory: false, sort_order: 16 },
    ];

    for (const comp of salaryComponents) {
      await prisma.salaryComponent.create({
        data: { tenant_id: platformTenant.id, ...comp },
      });
    }

    console.log(`   ✅ Salary components: ${salaryComponents.length} components created`);
  } else {
    console.log("   ⏭️  Salary components already exist");
  }

  // ==========================================================================
  // 20. PHASE 3: DEFAULT SALARY STRUCTURES
  // ==========================================================================
  console.log("📊 Creating default salary structures...");

  const existingStructure = await prisma.salaryStructure.findFirst({
    where: { tenant_id: platformTenant.id, code: "STD-L1" },
  });

  if (!existingStructure) {
    const structures = [
      { code: "STD-L1", name: "Standard — Level 1 (Freshers)", description: "Entry-level salary structure for freshers and interns", base_ctc: 400000 },
      { code: "STD-L2", name: "Standard — Level 2 (Mid-Level)", description: "Mid-level salary structure for experienced professionals", base_ctc: 800000 },
      { code: "STD-L3", name: "Standard — Level 3 (Senior)", description: "Senior-level salary structure for team leads and managers", base_ctc: 1500000 },
      { code: "MGMT-L4", name: "Management — Level 4 (Director+)", description: "Management-level salary structure for directors and VPs", base_ctc: 3000000 },
    ];

    for (const struct of structures) {
      await prisma.salaryStructure.create({
        data: { tenant_id: platformTenant.id, ...struct },
      });
    }

    console.log(`   ✅ Salary structures: ${structures.length} structures created`);
  } else {
    console.log("   ⏭️  Salary structures already exist");
  }

  // ==========================================================================
  // 21. PHASE 3: HRMS NOTIFICATION TEMPLATES
  // ==========================================================================
  console.log("📧 Creating Phase 3 HRMS notification templates...");

  const phase3Templates = [
    {
      template_code: "leave_request_submitted",
      channel: "IN_APP" as const,
      subject: "Leave Request: {{employee_name}} — {{leave_type}}",
      body_template:
        "{{employee_name}} has submitted a {{leave_type}} request:\n\nFrom: {{start_date}}\nTo: {{end_date}}\nDays: {{days_requested}}\nReason: {{reason}}\n\nPlease review and approve/reject.",
      variables: ["employee_name", "leave_type", "start_date", "end_date", "days_requested", "reason"],
    },
    {
      template_code: "leave_request_approved",
      channel: "IN_APP" as const,
      subject: "Leave Approved: {{leave_type}} — {{start_date}} to {{end_date}}",
      body_template:
        "Your {{leave_type}} request has been approved:\n\nFrom: {{start_date}}\nTo: {{end_date}}\nDays: {{days_requested}}\nApproved by: {{approver_name}}\n\nNotes: {{approver_notes}}",
      variables: ["leave_type", "start_date", "end_date", "days_requested", "approver_name", "approver_notes"],
    },
    {
      template_code: "leave_request_rejected",
      channel: "IN_APP" as const,
      subject: "Leave Rejected: {{leave_type}} — {{start_date}} to {{end_date}}",
      body_template:
        "Your {{leave_type}} request has been rejected:\n\nFrom: {{start_date}}\nTo: {{end_date}}\nRejected by: {{approver_name}}\n\nReason: {{approver_notes}}",
      variables: ["leave_type", "start_date", "end_date", "approver_name", "approver_notes"],
    },
    {
      template_code: "payslip_generated",
      channel: "EMAIL" as const,
      subject: "Your Payslip for {{month}} {{year}} — {{company_name}}",
      body_template:
        "Dear {{employee_name}},\n\nYour payslip for {{month}} {{year}} has been generated.\n\nGross Salary: ₹{{gross_salary}}\nTotal Deductions: ₹{{total_deductions}}\nNet Salary: ₹{{net_salary}}\n\nYou can view and download your payslip from your dashboard.\n\nRegards,\n{{company_name}} HR Team",
      variables: ["employee_name", "month", "year", "gross_salary", "total_deductions", "net_salary", "company_name"],
    },
    {
      template_code: "employee_onboarded",
      channel: "IN_APP" as const,
      subject: "Welcome Aboard: {{employee_name}} joined {{department}}",
      body_template:
        "A new team member has joined!\n\nName: {{employee_name}}\nDesignation: {{designation}}\nDepartment: {{department}}\nJoining Date: {{joining_date}}\n\nPlease extend a warm welcome!",
      variables: ["employee_name", "designation", "department", "joining_date"],
    },
  ];

  for (const template of phase3Templates) {
    await prisma.notificationTemplate.upsert({
      where: { template_code: template.template_code },
      update: {},
      create: template,
    });
  }

  console.log(`   ✅ Phase 3 notification templates: ${phase3Templates.length} templates created`);

  // ==========================================================================
  // SEED COMPLETE
  // ==========================================================================
  // ==========================================================================
  // PHASE 4: INVENTORY & ORDER MANAGEMENT SEED DATA
  // ==========================================================================
  console.log("📦 Seeding Phase 4: Inventory & Order Management...");

  // --- Units of Measure ---
  const uomData = [
    { code: "PCS", name: "Pieces" },
    { code: "KG", name: "Kilogram" },
    { code: "GM", name: "Gram" },
    { code: "LTR", name: "Litre" },
    { code: "ML", name: "Millilitre" },
    { code: "MTR", name: "Metre" },
    { code: "CM", name: "Centimetre" },
    { code: "SQM", name: "Square Metre" },
    { code: "BOX", name: "Box" },
    { code: "SET", name: "Set" },
    { code: "PKT", name: "Packet" },
    { code: "DOZ", name: "Dozen" },
    { code: "HRS", name: "Hours" },
    { code: "PAIR", name: "Pair" },
  ];

  for (const uom of uomData) {
    await prisma.unitOfMeasure.upsert({
      where: { tenant_id_code: { tenant_id: platformTenant.id, code: uom.code } },
      update: {},
      create: { tenant_id: platformTenant.id, ...uom },
    });
  }
  console.log(`   ✅ Units of Measure: ${uomData.length} seeded`);

  // --- Warehouses ---
  const warehouseData = [
    { code: "WH-MAIN", name: "Main Warehouse", city: "Mumbai", state: "Maharashtra", is_default: true },
    { code: "WH-SEC", name: "Secondary Warehouse", city: "Pune", state: "Maharashtra", is_default: false },
    { code: "WH-RET", name: "Retail Store", city: "Delhi", state: "Delhi", is_default: false },
  ];

  for (const wh of warehouseData) {
    await prisma.warehouse.upsert({
      where: { tenant_id_code: { tenant_id: platformTenant.id, code: wh.code } },
      update: {},
      create: { tenant_id: platformTenant.id, ...wh },
    });
  }
  console.log(`   ✅ Warehouses: ${warehouseData.length} seeded`);

  // --- Product Categories ---
  const categoryData = [
    { name: "Electronics", slug: "electronics", sort_order: 1 },
    { name: "Clothing & Apparel", slug: "clothing-apparel", sort_order: 2 },
    { name: "Office Supplies", slug: "office-supplies", sort_order: 3 },
    { name: "Food & Beverages", slug: "food-beverages", sort_order: 4 },
    { name: "Hardware & Tools", slug: "hardware-tools", sort_order: 5 },
    { name: "Raw Materials", slug: "raw-materials", sort_order: 6 },
    { name: "Services", slug: "services", sort_order: 7 },
  ];

  for (const cat of categoryData) {
    await prisma.productCategory.upsert({
      where: { tenant_id_slug: { tenant_id: platformTenant.id, slug: cat.slug } },
      update: {},
      create: { tenant_id: platformTenant.id, ...cat },
    });
  }
  console.log(`   ✅ Product Categories: ${categoryData.length} seeded`);

  console.log("   ✅ Phase 4 seed complete");

  // ==========================================================================
  // PHASE 5: E-LEARNING & COMMUNITY SEED DATA
  // ==========================================================================
  console.log("📚 Seeding Phase 5: E-Learning & Community...");

  // --- Course Categories ---
  const courseCategoryData = [
    { name: "Technology & Programming", slug: "technology-programming", sort_order: 1, description: "Software development, IT, and technology courses" },
    { name: "Business & Management", slug: "business-management", sort_order: 2, description: "Business strategy, leadership, and management skills" },
    { name: "Marketing & Sales", slug: "marketing-sales", sort_order: 3, description: "Digital marketing, sales techniques, and growth strategies" },
    { name: "Finance & Accounting", slug: "finance-accounting", sort_order: 4, description: "Financial literacy, accounting, and investment" },
    { name: "HR & People Management", slug: "hr-people-management", sort_order: 5, description: "Human resources, recruitment, and employee management" },
    { name: "Compliance & Legal", slug: "compliance-legal", sort_order: 6, description: "Regulatory compliance, legal fundamentals, and policies" },
    { name: "Soft Skills", slug: "soft-skills", sort_order: 7, description: "Communication, teamwork, and personal development" },
    { name: "Product Training", slug: "product-training", sort_order: 8, description: "Internal product knowledge and feature training" },
  ];

  for (const cat of courseCategoryData) {
    await prisma.courseCategory.upsert({
      where: { tenant_id_slug: { tenant_id: platformTenant.id, slug: cat.slug } },
      update: {},
      create: { tenant_id: platformTenant.id, ...cat },
    });
  }
  console.log(`   ✅ Course Categories: ${courseCategoryData.length} seeded`);

  // --- Forum Categories ---
  const forumCategoryData = [
    { name: "General Discussion", slug: "general-discussion", sort_order: 1, description: "Open discussions on any topic", icon: "solar:chat-round-dots-line-duotone" },
    { name: "Questions & Help", slug: "questions-help", sort_order: 2, description: "Ask questions and get help from the community", icon: "solar:question-circle-line-duotone" },
    { name: "Feature Requests", slug: "feature-requests", sort_order: 3, description: "Suggest and vote on new features", icon: "solar:lightbulb-bolt-line-duotone" },
    { name: "Bug Reports", slug: "bug-reports", sort_order: 4, description: "Report bugs and issues", icon: "solar:bug-minimalistic-line-duotone" },
    { name: "Announcements", slug: "announcements", sort_order: 5, description: "Official announcements and updates", icon: "solar:speaker-minimalistic-line-duotone" },
    { name: "Tips & Tutorials", slug: "tips-tutorials", sort_order: 6, description: "Share tips, tricks, and how-to guides", icon: "solar:document-text-line-duotone" },
  ];

  for (const cat of forumCategoryData) {
    await prisma.forumCategory.upsert({
      where: { tenant_id_slug: { tenant_id: platformTenant.id, slug: cat.slug } },
      update: {},
      create: { tenant_id: platformTenant.id, ...cat },
    });
  }
  console.log(`   ✅ Forum Categories: ${forumCategoryData.length} seeded`);

  console.log("   ✅ Phase 5 seed complete");

  // ========================================================================
  // PHASE 6: PARTNER PROGRAM & MARKETPLACE SEED DATA
  // ========================================================================
  console.log("🤝 Seeding Phase 6: Partner Program & Marketplace...");

  // Marketplace Listings (internal / platform-created)
  const marketplaceListings = [
    {
      title: "CRM Power Pack",
      slug: "crm-power-pack",
      short_description: "Advanced CRM integrations and automations.",
      description: "A suite of CRM extensions including lead scoring, pipeline analytics, and email automation templates.",
      listing_type: "APP" as const,
      status: "PUBLISHED" as const,
      category: "CRM",
      tags: ["crm", "automation", "leads"],
      pricing_model: "freemium",
      price: null,
      version: "1.2.0",
      is_featured: true,
    },
    {
      title: "GST Compliance Toolkit",
      slug: "gst-compliance-toolkit",
      short_description: "Automate GSTR filing and GST reconciliation.",
      description: "Complete GST compliance automation including GSTR-1, GSTR-3B filing, e-invoicing, and GST reconciliation.",
      listing_type: "INTEGRATION" as const,
      status: "PUBLISHED" as const,
      category: "Accounting",
      tags: ["gst", "compliance", "accounting", "india"],
      pricing_model: "paid",
      price: 999,
      version: "2.0.0",
      is_featured: true,
    },
    {
      title: "HR Analytics Dashboard",
      slug: "hr-analytics-dashboard",
      short_description: "Advanced workforce analytics and reporting.",
      description: "Powerful analytics dashboard for HRMS with attrition prediction, engagement scoring, and headcount planning.",
      listing_type: "APP" as const,
      status: "PUBLISHED" as const,
      category: "HRMS",
      tags: ["hrms", "analytics", "reporting"],
      pricing_model: "paid",
      price: 499,
      version: "1.0.0",
      is_featured: false,
    },
    {
      title: "WhatsApp Business Integration",
      slug: "whatsapp-business-integration",
      short_description: "Send notifications and messages via WhatsApp.",
      description: "Official WhatsApp Business API integration for sending order confirmations, reminders, and customer communications.",
      listing_type: "INTEGRATION" as const,
      status: "PUBLISHED" as const,
      category: "Communication",
      tags: ["whatsapp", "messaging", "notifications"],
      pricing_model: "contact",
      price: null,
      version: "1.1.0",
      is_featured: false,
    },
    {
      title: "Invoice Template Pack",
      slug: "invoice-template-pack",
      short_description: "Professional invoice and billing templates.",
      description: "A collection of 20+ professionally designed invoice, quotation, and receipt templates with custom branding support.",
      listing_type: "TEMPLATE" as const,
      status: "PUBLISHED" as const,
      category: "Billing",
      tags: ["templates", "invoice", "billing", "design"],
      pricing_model: "free",
      price: null,
      version: "1.0.0",
      is_featured: false,
    },
  ];

  for (const listing of marketplaceListings) {
    await prisma.marketplaceListing.upsert({
      where: { tenant_id_slug: { tenant_id: platformTenant.id, slug: listing.slug } },
      update: {},
      create: {
        tenant_id: platformTenant.id,
        ...listing,
      },
    });
  }
  console.log(`   ✅ Marketplace Listings: ${marketplaceListings.length} seeded`);

  console.log("   ✅ Phase 6 seed complete");

  // ==========================================================================
  // Phase 7: AI Enhancement & Optimization Seed Data
  // ==========================================================================
  console.log("🤖 Seeding Phase 7: AI Enhancement & Optimization...");

  // --- AI Agents ---
  const aiAgentsData = [
    {
      name: "Sales Assistant",
      code: "sales_agent",
      agent_type: "SALES" as const,
      status: "ACTIVE" as const,
      description: "AI agent specialized in CRM, lead scoring, deal analysis, and sales recommendations",
      system_prompt: "You are an expert sales assistant for Softmerce SaaS-BOS. You help with lead qualification, deal analysis, pipeline management, and sales strategy. Always provide data-driven insights and actionable recommendations. Reference the tenant's CRM data when available.",
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 4096,
      capabilities: ["lead_scoring", "deal_analysis", "pipeline_insights", "competitor_analysis"],
      accessible_modules: ["crm", "accounting"],
      rate_limit_per_min: 30,
      is_default: true,
    },
    {
      name: "Support Agent",
      code: "support_agent",
      agent_type: "SUPPORT" as const,
      status: "ACTIVE" as const,
      description: "AI agent for customer support, ticket routing, and knowledge base search",
      system_prompt: "You are a helpful customer support agent for Softmerce SaaS-BOS. You assist with resolving customer queries, searching the knowledge base for solutions, and routing complex issues to the right team. Be empathetic, clear, and solution-oriented.",
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 2048,
      capabilities: ["ticket_routing", "kb_search", "faq_answers", "escalation"],
      accessible_modules: ["crm", "community"],
      rate_limit_per_min: 60,
      is_default: true,
    },
    {
      name: "Finance Advisor",
      code: "finance_agent",
      agent_type: "FINANCE" as const,
      status: "ACTIVE" as const,
      description: "AI agent for financial analysis, invoice processing, and accounting insights",
      system_prompt: "You are a financial advisor AI for Softmerce SaaS-BOS. You help with financial reporting, invoice analysis, cash flow forecasting, tax compliance (India-specific GST/TDS), and accounting insights. Always ensure accuracy and compliance with Indian financial regulations.",
      model: "gpt-4o",
      temperature: 0.3,
      max_tokens: 4096,
      capabilities: ["invoice_analysis", "cash_flow_forecast", "tax_compliance", "financial_reporting"],
      accessible_modules: ["accounting", "billing"],
      rate_limit_per_min: 20,
      is_default: true,
    },
    {
      name: "HR Assistant",
      code: "hr_agent",
      agent_type: "HR" as const,
      status: "ACTIVE" as const,
      description: "AI agent for HR queries, leave management, payroll insights, and employee engagement",
      system_prompt: "You are an HR assistant for Softmerce SaaS-BOS. You help with leave policy queries, payroll calculations, employee onboarding guidance, compliance with Indian labor laws, and workforce analytics. Be professional and supportive.",
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 2048,
      capabilities: ["leave_management", "payroll_insights", "policy_queries", "workforce_analytics"],
      accessible_modules: ["hrms", "payroll"],
      rate_limit_per_min: 30,
      is_default: true,
    },
    {
      name: "Orchestrator",
      code: "orchestrator",
      agent_type: "ORCHESTRATOR" as const,
      status: "ACTIVE" as const,
      description: "Meta-agent that routes requests to specialized agents and coordinates multi-agent workflows",
      system_prompt: "You are the Orchestrator AI for Softmerce SaaS-BOS. Your role is to understand user intent, route requests to the appropriate specialist agent (Sales, Support, Finance, HR, Learning, Partner), and coordinate multi-step workflows that span multiple modules. Provide a unified, seamless experience.",
      model: "gpt-4o",
      temperature: 0.5,
      max_tokens: 4096,
      capabilities: ["intent_routing", "multi_agent_coordination", "workflow_orchestration", "cross_module_analysis"],
      accessible_modules: ["crm", "accounting", "hrms", "payroll", "elearning", "partner", "billing", "community"],
      rate_limit_per_min: 50,
      is_default: true,
    },
  ];

  for (const agentData of aiAgentsData) {
    await prisma.aIAgent.upsert({
      where: {
        tenant_id_code: { tenant_id: platformTenant.id, code: agentData.code },
      },
      update: {},
      create: { tenant_id: platformTenant.id, ...agentData },
    });
  }
  console.log(`   ✅ AI Agents: ${aiAgentsData.length} seeded`);

  // --- RAG Documents ---
  const ragDocsData = [
    {
      title: "Sales Playbook - India Market",
      file_type: "pdf",
      module: "crm",
      status: "INDEXED" as const,
      chunk_count: 45,
      total_tokens: 12500,
      metadata: { author: "Sales Team", category: "playbook", version: "2.0" },
      processed_at: new Date(),
    },
    {
      title: "HR Policy Manual - India Compliance",
      file_type: "docx",
      module: "hrms",
      status: "INDEXED" as const,
      chunk_count: 78,
      total_tokens: 28000,
      metadata: { author: "HR Department", category: "policy", version: "1.5" },
      processed_at: new Date(),
    },
    {
      title: "GST & TDS Compliance Guide",
      file_type: "pdf",
      module: "accounting",
      status: "INDEXED" as const,
      chunk_count: 32,
      total_tokens: 9800,
      metadata: { author: "Finance Team", category: "compliance", version: "3.0" },
      processed_at: new Date(),
    },
    {
      title: "Product FAQ & Troubleshooting",
      file_type: "md",
      module: "general",
      status: "INDEXED" as const,
      chunk_count: 120,
      total_tokens: 35000,
      metadata: { author: "Support Team", category: "faq", version: "4.1" },
      processed_at: new Date(),
    },
    {
      title: "Partner Onboarding Guide",
      file_type: "pdf",
      module: "partner",
      status: "PENDING" as const,
      chunk_count: 0,
      total_tokens: 0,
      metadata: { author: "Partner Success", category: "onboarding" },
    },
  ];

  const existingDocs = await prisma.rAGDocument.count({ where: { tenant_id: platformTenant.id } });
  if (existingDocs === 0) {
    for (const docData of ragDocsData) {
      await prisma.rAGDocument.create({
        data: { tenant_id: platformTenant.id, ...docData },
      });
    }
    console.log(`   ✅ RAG Documents: ${ragDocsData.length} seeded`);
  } else {
    console.log(`   ⏭️  RAG Documents already exist`);
  }

  // --- Autonomous Rules ---
  const autonomousRulesData = [
    {
      name: "Auto-assign leads under ₹50K",
      description: "Automatically assign leads with estimated value under ₹50,000 to the next available sales rep",
      decision_type: "LEAD_ASSIGNMENT" as const,
      module: "crm",
      conditions: { estimated_value: { lt: 50000 }, source: { in: ["WEBSITE", "SOCIAL_MEDIA"] } },
      actions: { assign_to: "round_robin", notify_assigned: true },
      safeguards: { max_per_rep: 10, require_available: true },
      priority: 10,
      is_active: true,
      confidence_threshold: 0.85,
      daily_limit: 50,
    },
    {
      name: "Auto-approve leaves under 3 days",
      description: "Automatically approve leave requests of 3 days or fewer if the employee has sufficient balance",
      decision_type: "LEAVE_APPROVAL" as const,
      module: "hrms",
      conditions: { days: { lte: 3 }, has_balance: true, no_conflict: true },
      actions: { approve: true, notify_manager: true, update_calendar: true },
      safeguards: { min_team_coverage: 0.6, blackout_dates: [] },
      priority: 20,
      is_active: true,
      confidence_threshold: 0.95,
      daily_limit: 20,
    },
    {
      name: "Auto-approve invoices under ₹10K",
      description: "Automatically approve purchase invoices under ₹10,000 from verified vendors",
      decision_type: "INVOICE_APPROVAL" as const,
      module: "accounting",
      conditions: { amount: { lt: 10000 }, vendor_verified: true, has_po: true },
      actions: { approve: true, create_journal_entry: true, notify_accounts: true },
      safeguards: { daily_total_limit: 100000, require_matching_po: true },
      priority: 30,
      is_active: true,
      confidence_threshold: 0.9,
      daily_limit: 30,
    },
  ];

  const existingRules = await prisma.autonomousRule.count({ where: { tenant_id: platformTenant.id } });
  if (existingRules === 0) {
    for (const ruleData of autonomousRulesData) {
      await prisma.autonomousRule.create({
        data: { tenant_id: platformTenant.id, ...ruleData },
      });
    }
    console.log(`   ✅ Autonomous Rules: ${autonomousRulesData.length} seeded`);
  } else {
    console.log(`   ⏭️  Autonomous Rules already exist`);
  }

  // --- Analytics Dashboard ---
  const existingDashboards = await prisma.analyticsDashboard.count({ where: { tenant_id: platformTenant.id } });
  if (existingDashboards === 0) {
    const execDashboard = await prisma.analyticsDashboard.create({
      data: {
        tenant_id: platformTenant.id,
        created_by: superAdmin.id,
        title: "Executive Overview",
        description: "Cross-module executive dashboard with AI-enhanced insights",
        is_default: true,
        is_shared: true,
        layout: [
          { id: "w1", x: 0, y: 0, w: 4, h: 2 },
          { id: "w2", x: 4, y: 0, w: 4, h: 2 },
          { id: "w3", x: 8, y: 0, w: 4, h: 2 },
          { id: "w4", x: 0, y: 2, w: 6, h: 3 },
          { id: "w5", x: 6, y: 2, w: 6, h: 3 },
        ],
        refresh_interval: 300,
      },
    });

    // --- Analytics Widgets ---
    const widgetsData = [
      {
        title: "Revenue Overview",
        widget_type: "chart",
        data_sources: "accounting,billing",
        insight_type: "REVENUE_ATTRIBUTION" as const,
        visualization: "line",
        query_config: { metric: "revenue", period: "monthly", range: "12m" },
        display_config: { colors: ["#4F46E5", "#10B981"], showTrend: true },
        position: { x: 0, y: 0, w: 4, h: 2 },
        ai_enhanced: true,
        ai_config: { forecast: true, anomaly_detection: true },
        sort_order: 1,
      },
      {
        title: "Sales Pipeline",
        widget_type: "chart",
        data_sources: "crm",
        visualization: "funnel",
        query_config: { metric: "deals_by_stage", pipeline: "default" },
        display_config: { colors: ["#6366F1", "#8B5CF6", "#A78BFA", "#C4B5FD"] },
        position: { x: 4, y: 0, w: 4, h: 2 },
        ai_enhanced: false,
        sort_order: 2,
      },
      {
        title: "Employee Metrics",
        widget_type: "kpi",
        data_sources: "hrms,payroll",
        insight_type: "EMPLOYEE_COST" as const,
        visualization: "number",
        query_config: { metrics: ["headcount", "avg_salary", "attrition_rate"] },
        display_config: { layout: "grid" },
        position: { x: 8, y: 0, w: 4, h: 2 },
        ai_enhanced: true,
        ai_config: { trend_analysis: true },
        sort_order: 3,
      },
      {
        title: "Customer 360",
        widget_type: "table",
        data_sources: "crm,accounting,community",
        insight_type: "CUSTOMER_360" as const,
        visualization: "table",
        query_config: { top_customers: 10, include: ["revenue", "tickets", "engagement"] },
        display_config: { sortable: true, paginated: true },
        position: { x: 0, y: 2, w: 6, h: 3 },
        ai_enhanced: true,
        ai_config: { churn_prediction: true },
        sort_order: 4,
      },
      {
        title: "Partner ROI",
        widget_type: "chart",
        data_sources: "partner,accounting",
        insight_type: "PARTNER_ROI" as const,
        visualization: "bar",
        query_config: { metric: "roi_by_partner", top: 10 },
        display_config: { colors: ["#EC4899", "#F472B6"] },
        position: { x: 6, y: 2, w: 6, h: 3 },
        ai_enhanced: false,
        sort_order: 5,
      },
    ];

    for (const widgetData of widgetsData) {
      await prisma.analyticsWidget.create({
        data: { dashboard_id: execDashboard.id, ...widgetData },
      });
    }
    console.log(`   ✅ Analytics Dashboard: 1 with ${widgetsData.length} widgets seeded`);
  } else {
    console.log(`   ⏭️  Analytics Dashboards already exist`);
  }

  console.log("   ✅ Phase 7 seed complete");

  console.log("\n✅ Database seed completed successfully!");
  console.log("═══════════════════════════════════════════");
  console.log(`   Platform Tenant: ${platformTenant.company_name}`);
  console.log(`   Super Admin: ${superAdmin.email}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Plans: Starter, Professional, Enterprise`);
  console.log(`   Roles: ${Object.keys(createdRoles).join(", ")}`);
  console.log(`   Permissions: ${Object.keys(createdPermissions).length}`);
  console.log("═══════════════════════════════════════════\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
