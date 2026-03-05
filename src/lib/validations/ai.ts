// ==============================================================================
// Zod Validations — Phase 6: AI Enhancement & Optimization
// ==============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// AI Agent Schemas
// ---------------------------------------------------------------------------
export const createAIAgentSchema = z.object({
  name: z.string().min(2, "Name is required").max(255),
  code: z
    .string()
    .min(2, "Code is required")
    .max(100)
    .regex(/^[a-z0-9_]+$/, "Code must be lowercase alphanumeric with underscores"),
  agent_type: z.enum([
    "SALES",
    "SUPPORT",
    "FINANCE",
    "HR",
    "LEARNING",
    "PARTNER",
    "ORCHESTRATOR",
  ]),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]).default("ACTIVE"),
  description: z.string().optional(),
  system_prompt: z.string().min(10, "System prompt must be at least 10 characters"),
  model: z.string().min(1, "Model is required").max(100),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().int().min(100).max(128000).default(4096),
  capabilities: z.array(z.string()).default([]),
  accessible_modules: z.array(z.string()).default([]),
  rate_limit_per_min: z.number().int().min(1).max(1000).default(30),
  is_default: z.boolean().default(false),
});

export const updateAIAgentSchema = createAIAgentSchema.partial().extend({
  id: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// AI Conversation Schemas
// ---------------------------------------------------------------------------
export const createAIConversationSchema = z.object({
  agent_id: z.string().uuid("Invalid agent ID"),
  title: z.string().max(500).optional(),
  context: z.record(z.any()).default({}),
});

export const updateAIConversationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(500).optional(),
  status: z.enum(["ACTIVE", "CLOSED", "ARCHIVED"]).optional(),
});

// ---------------------------------------------------------------------------
// AI Message / Chat Schemas
// ---------------------------------------------------------------------------
export const sendMessageSchema = z.object({
  conversation_id: z.string().uuid("Invalid conversation ID"),
  content: z.string().min(1, "Message cannot be empty").max(50000),
});

export const messageFeedbackSchema = z.object({
  message_id: z.string().uuid(),
  feedback: z.number().int().min(-1).max(1), // -1 = thumbs down, 0 = neutral, 1 = thumbs up
});

// ---------------------------------------------------------------------------
// RAG Document Schemas
// ---------------------------------------------------------------------------
export const createRAGDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  file_type: z.enum(["pdf", "docx", "html", "txt", "csv", "md"]),
  source_url: z.string().url("Invalid URL").max(1000).optional(),
  file_size_bytes: z.number().int().positive().optional(),
  module: z.string().max(50).optional(),
  metadata: z.record(z.any()).default({}),
});

export const updateRAGDocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500).optional(),
  module: z.string().max(50).optional(),
  metadata: z.record(z.any()).optional(),
  status: z.enum(["PENDING", "PROCESSING", "INDEXED", "FAILED"]).optional(),
});

// ---------------------------------------------------------------------------
// Autonomous Rule Schemas
// ---------------------------------------------------------------------------
export const createAutonomousRuleSchema = z.object({
  name: z.string().min(2, "Name is required").max(255),
  description: z.string().optional(),
  decision_type: z.enum([
    "LEAD_ASSIGNMENT",
    "INVOICE_APPROVAL",
    "LEAVE_APPROVAL",
    "PAYMENT_RETRY",
    "CONTENT_MODERATION",
    "SUPPORT_ROUTING",
    "PRICE_ADJUSTMENT",
  ]),
  module: z.string().min(1, "Module is required").max(50),
  conditions: z.record(z.any()),
  actions: z.record(z.any()),
  safeguards: z.record(z.any()).default({}),
  priority: z.number().int().min(1).max(1000).default(100),
  is_active: z.boolean().default(true),
  confidence_threshold: z.number().min(0).max(1).default(0.9),
  daily_limit: z.number().int().min(0).default(0),
});

export const updateAutonomousRuleSchema = createAutonomousRuleSchema.partial().extend({
  id: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Autonomous Decision Schemas (mostly for querying / overriding)
// ---------------------------------------------------------------------------
export const overrideDecisionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED", "ROLLED_BACK"]),
  override_reason: z.string().min(5, "Please provide a reason for the override"),
});

// ---------------------------------------------------------------------------
// Analytics Dashboard Schemas
// ---------------------------------------------------------------------------
export const createDashboardSchema = z.object({
  title: z.string().min(2, "Title is required").max(255),
  description: z.string().optional(),
  is_default: z.boolean().default(false),
  is_shared: z.boolean().default(false),
  layout: z.array(z.any()).default([]),
  refresh_interval: z.number().int().min(0).max(86400).default(300),
});

export const updateDashboardSchema = createDashboardSchema.partial().extend({
  id: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Analytics Widget Schemas
// ---------------------------------------------------------------------------
export const createWidgetSchema = z.object({
  dashboard_id: z.string().uuid(),
  title: z.string().min(2, "Title is required").max(255),
  widget_type: z.enum(["chart", "kpi", "table", "list", "map"]),
  data_sources: z.string().min(1, "At least one data source is required").max(500),
  insight_type: z
    .enum([
      "CUSTOMER_360",
      "REVENUE_ATTRIBUTION",
      "EMPLOYEE_COST",
      "PARTNER_ROI",
      "CHURN_DRIVERS",
      "GROWTH_OPPORTUNITIES",
    ])
    .optional(),
  visualization: z.enum([
    "line",
    "bar",
    "pie",
    "doughnut",
    "funnel",
    "heatmap",
    "gauge",
    "table",
    "number",
    "waterfall",
  ]),
  query_config: z.record(z.any()).default({}),
  display_config: z.record(z.any()).default({}),
  position: z.record(z.any()).default({}),
  ai_enhanced: z.boolean().default(false),
  ai_config: z.record(z.any()).default({}),
  sort_order: z.number().int().min(0).default(0),
});

export const updateWidgetSchema = createWidgetSchema.partial().extend({
  id: z.string().uuid(),
});
