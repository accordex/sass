-- CreateEnum
CREATE TYPE "AIAgentType" AS ENUM ('SALES', 'SUPPORT', 'FINANCE', 'HR', 'LEARNING', 'PARTNER', 'ORCHESTRATOR');

-- CreateEnum
CREATE TYPE "AIAgentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RAGDocumentStatus" AS ENUM ('PENDING', 'PROCESSING', 'INDEXED', 'FAILED');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('LEAD_ASSIGNMENT', 'INVOICE_APPROVAL', 'LEAVE_APPROVAL', 'PAYMENT_RETRY', 'CONTENT_MODERATION', 'SUPPORT_ROUTING', 'PRICE_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('CUSTOMER_360', 'REVENUE_ATTRIBUTION', 'EMPLOYEE_COST', 'PARTNER_ROI', 'CHURN_DRIVERS', 'GROWTH_OPPORTUNITIES');

-- CreateTable
CREATE TABLE "ai_agents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "agent_type" "AIAgentType" NOT NULL,
    "status" "AIAgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "system_prompt" TEXT NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "max_tokens" INTEGER NOT NULL DEFAULT 4096,
    "capabilities" JSONB NOT NULL DEFAULT '[]',
    "accessible_modules" JSONB NOT NULL DEFAULT '[]',
    "rate_limit_per_min" INTEGER NOT NULL DEFAULT 30,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "title" VARCHAR(500),
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "context" JSONB NOT NULL DEFAULT '{}',
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "user_id" UUID,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "cost" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "model_used" VARCHAR(100),
    "latency_ms" INTEGER,
    "tool_calls" JSONB,
    "citations" JSONB,
    "feedback" SMALLINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rag_documents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(20) NOT NULL,
    "source_url" VARCHAR(1000),
    "file_size_bytes" INTEGER,
    "module" VARCHAR(50),
    "status" "RAGDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "chunk_count" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "error_message" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rag_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rag_chunks" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "token_count" INTEGER NOT NULL DEFAULT 0,
    "vector_id" VARCHAR(255),
    "embedding_model" VARCHAR(100),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rag_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autonomous_rules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "decision_type" "DecisionType" NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "safeguards" JSONB NOT NULL DEFAULT '{}',
    "priority" INTEGER NOT NULL DEFAULT 100,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "confidence_threshold" DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    "daily_limit" INTEGER NOT NULL DEFAULT 0,
    "daily_execution_count" INTEGER NOT NULL DEFAULT 0,
    "last_reset_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "autonomous_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autonomous_decisions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "rule_id" UUID,
    "decision_type" "DecisionType" NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "resource_type" VARCHAR(100) NOT NULL,
    "resource_id" UUID,
    "status" "DecisionStatus" NOT NULL DEFAULT 'PENDING',
    "confidence" DOUBLE PRECISION,
    "model_used" VARCHAR(100),
    "input_data" JSONB NOT NULL DEFAULT '{}',
    "output_data" JSONB NOT NULL DEFAULT '{}',
    "reasoning" TEXT,
    "was_overridden" BOOLEAN NOT NULL DEFAULT false,
    "override_reason" TEXT,
    "executed_at" TIMESTAMP(3),
    "rolled_back_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "autonomous_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_dashboards" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "layout" JSONB NOT NULL DEFAULT '[]',
    "refresh_interval" INTEGER NOT NULL DEFAULT 300,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_widgets" (
    "id" UUID NOT NULL,
    "dashboard_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "widget_type" VARCHAR(50) NOT NULL,
    "data_sources" VARCHAR(500) NOT NULL,
    "insight_type" "InsightType",
    "visualization" VARCHAR(50) NOT NULL,
    "query_config" JSONB NOT NULL DEFAULT '{}',
    "display_config" JSONB NOT NULL DEFAULT '{}',
    "position" JSONB NOT NULL DEFAULT '{}',
    "ai_enhanced" BOOLEAN NOT NULL DEFAULT false,
    "ai_config" JSONB NOT NULL DEFAULT '{}',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_agents_tenant_id_idx" ON "ai_agents"("tenant_id");

-- CreateIndex
CREATE INDEX "ai_agents_agent_type_idx" ON "ai_agents"("agent_type");

-- CreateIndex
CREATE INDEX "ai_agents_status_idx" ON "ai_agents"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ai_agents_tenant_id_code_key" ON "ai_agents"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "ai_conversations_tenant_id_idx" ON "ai_conversations"("tenant_id");

-- CreateIndex
CREATE INDEX "ai_conversations_user_id_idx" ON "ai_conversations"("user_id");

-- CreateIndex
CREATE INDEX "ai_conversations_agent_id_idx" ON "ai_conversations"("agent_id");

-- CreateIndex
CREATE INDEX "ai_conversations_status_idx" ON "ai_conversations"("status");

-- CreateIndex
CREATE INDEX "ai_messages_conversation_id_idx" ON "ai_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "ai_messages_user_id_idx" ON "ai_messages"("user_id");

-- CreateIndex
CREATE INDEX "ai_messages_role_idx" ON "ai_messages"("role");

-- CreateIndex
CREATE INDEX "rag_documents_tenant_id_idx" ON "rag_documents"("tenant_id");

-- CreateIndex
CREATE INDEX "rag_documents_module_idx" ON "rag_documents"("module");

-- CreateIndex
CREATE INDEX "rag_documents_status_idx" ON "rag_documents"("status");

-- CreateIndex
CREATE INDEX "rag_chunks_document_id_idx" ON "rag_chunks"("document_id");

-- CreateIndex
CREATE INDEX "rag_chunks_vector_id_idx" ON "rag_chunks"("vector_id");

-- CreateIndex
CREATE UNIQUE INDEX "rag_chunks_document_id_chunk_index_key" ON "rag_chunks"("document_id", "chunk_index");

-- CreateIndex
CREATE INDEX "autonomous_rules_tenant_id_idx" ON "autonomous_rules"("tenant_id");

-- CreateIndex
CREATE INDEX "autonomous_rules_decision_type_idx" ON "autonomous_rules"("decision_type");

-- CreateIndex
CREATE INDEX "autonomous_rules_module_idx" ON "autonomous_rules"("module");

-- CreateIndex
CREATE INDEX "autonomous_rules_is_active_idx" ON "autonomous_rules"("is_active");

-- CreateIndex
CREATE INDEX "autonomous_decisions_tenant_id_idx" ON "autonomous_decisions"("tenant_id");

-- CreateIndex
CREATE INDEX "autonomous_decisions_rule_id_idx" ON "autonomous_decisions"("rule_id");

-- CreateIndex
CREATE INDEX "autonomous_decisions_decision_type_idx" ON "autonomous_decisions"("decision_type");

-- CreateIndex
CREATE INDEX "autonomous_decisions_status_idx" ON "autonomous_decisions"("status");

-- CreateIndex
CREATE INDEX "autonomous_decisions_module_idx" ON "autonomous_decisions"("module");

-- CreateIndex
CREATE INDEX "analytics_dashboards_tenant_id_idx" ON "analytics_dashboards"("tenant_id");

-- CreateIndex
CREATE INDEX "analytics_dashboards_created_by_idx" ON "analytics_dashboards"("created_by");

-- CreateIndex
CREATE INDEX "analytics_widgets_dashboard_id_idx" ON "analytics_widgets"("dashboard_id");

-- CreateIndex
CREATE INDEX "analytics_widgets_insight_type_idx" ON "analytics_widgets"("insight_type");

-- AddForeignKey
ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "ai_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rag_documents" ADD CONSTRAINT "rag_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rag_chunks" ADD CONSTRAINT "rag_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "rag_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autonomous_rules" ADD CONSTRAINT "autonomous_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autonomous_decisions" ADD CONSTRAINT "autonomous_decisions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autonomous_decisions" ADD CONSTRAINT "autonomous_decisions_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "autonomous_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_dashboards" ADD CONSTRAINT "analytics_dashboards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_dashboards" ADD CONSTRAINT "analytics_dashboards_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_widgets" ADD CONSTRAINT "analytics_widgets_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "analytics_dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
