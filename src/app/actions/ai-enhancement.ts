"use server";

// ==============================================================================
// AI Enhancement & Optimization Server Actions — Phase 6 (PRD Phase 6)
// ==============================================================================
// CRUD for: AI Agents, AI Conversations, RAG Documents,
//           Autonomous Rules, Autonomous Decisions,
//           Analytics Dashboards, Analytics Widgets
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import {
  createAIAgentSchema,
  updateAIAgentSchema,
  createAIConversationSchema,
  updateAIConversationSchema,
  createRAGDocumentSchema,
  updateRAGDocumentSchema,
  createAutonomousRuleSchema,
  updateAutonomousRuleSchema,
  overrideDecisionSchema,
  createDashboardSchema,
  updateDashboardSchema,
  createWidgetSchema,
  updateWidgetSchema,
} from "@/lib/validations/ai";
import {
  AIAgentStatus,
  AIAgentType,
  ConversationStatus,
  RAGDocumentStatus,
  DecisionType,
  DecisionStatus,
} from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

// ==============================================================================
// AI AGENT ACTIONS
// ==============================================================================

export async function getAIAgents({
  page = 1,
  perPage = 20,
  search = "",
  agent_type,
  status,
}: {
  page?: number;
  perPage?: number;
  search?: string;
  agent_type?: string;
  status?: string;
} = {}) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (agent_type && agent_type in AIAgentType) {
    where.agent_type = agent_type as AIAgentType;
  }
  if (status && status in AIAgentStatus) {
    where.status = status as AIAgentStatus;
  }

  const [data, total] = await Promise.all([
    prisma.aIAgent.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: { _count: { select: { conversations: true } } },
    }),
    prisma.aIAgent.count({ where }),
  ]);

  return {
    data,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

export async function createAIAgent(formData: unknown) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const parsed = createAIAgentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  try {
    const agent = await prisma.aIAgent.create({
      data: {
        tenant_id: tenantId,
        ...parsed.data,
        capabilities: parsed.data.capabilities,
        accessible_modules: parsed.data.accessible_modules,
      },
    });
    revalidatePath("/ai/agents");
    return { data: agent };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Agent code already exists" };
    return { error: e.message || "Failed to create agent" };
  }
}

export async function updateAIAgent(formData: unknown) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const parsed = updateAIAgentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { id, ...data } = parsed.data;

  try {
    const agent = await prisma.aIAgent.update({
      where: { id, tenant_id: tenantId },
      data,
    });
    revalidatePath("/ai/agents");
    return { data: agent };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Agent code already exists" };
    return { error: e.message || "Failed to update agent" };
  }
}

export async function deleteAIAgent(id: string) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  try {
    await prisma.aIAgent.delete({
      where: { id, tenant_id: tenantId },
    });
    revalidatePath("/ai/agents");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to delete agent" };
  }
}

// ==============================================================================
// AI CONVERSATION ACTIONS
// ==============================================================================

export async function getAIConversations({
  page = 1,
  perPage = 20,
  search = "",
  status,
  agent_id,
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  agent_id?: string;
} = {}) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const where: any = { tenant_id: tenantId, user_id: userId };
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }
  if (status && status in ConversationStatus) {
    where.status = status as ConversationStatus;
  }
  if (agent_id) where.agent_id = agent_id;

  const [data, total] = await Promise.all([
    prisma.aIConversation.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { updated_at: "desc" },
      include: {
        agent: { select: { name: true, agent_type: true, code: true } },
      },
    }),
    prisma.aIConversation.count({ where }),
  ]);

  return {
    data,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

export async function createAIConversation(formData: unknown) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const parsed = createAIConversationSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  try {
    const conversation = await prisma.aIConversation.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        agent_id: parsed.data.agent_id,
        title: parsed.data.title,
        context: parsed.data.context,
      },
      include: {
        agent: { select: { name: true, agent_type: true } },
      },
    });
    revalidatePath("/ai/conversations");
    return { data: conversation };
  } catch (e: any) {
    return { error: e.message || "Failed to create conversation" };
  }
}

export async function updateAIConversation(formData: unknown) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const parsed = updateAIConversationSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { id, ...data } = parsed.data;

  try {
    const conversation = await prisma.aIConversation.update({
      where: { id, tenant_id: tenantId },
      data,
    });
    revalidatePath("/ai/conversations");
    return { data: conversation };
  } catch (e: any) {
    return { error: e.message || "Failed to update conversation" };
  }
}

export async function deleteAIConversation(id: string) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  try {
    await prisma.aIConversation.delete({
      where: { id, tenant_id: tenantId },
    });
    revalidatePath("/ai/conversations");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to delete conversation" };
  }
}

// ==============================================================================
// RAG DOCUMENT ACTIONS
// ==============================================================================

export async function getRAGDocuments({
  page = 1,
  perPage = 20,
  search = "",
  status,
  module,
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  module?: string;
} = {}) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const where: any = { tenant_id: tenantId };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { file_type: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status && status in RAGDocumentStatus) {
    where.status = status as RAGDocumentStatus;
  }
  if (module) where.module = module;

  const [data, total] = await Promise.all([
    prisma.rAGDocument.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: { _count: { select: { chunks: true } } },
    }),
    prisma.rAGDocument.count({ where }),
  ]);

  return {
    data,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

export async function createRAGDocument(formData: unknown) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const parsed = createRAGDocumentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  try {
    const doc = await prisma.rAGDocument.create({
      data: {
        tenant_id: tenantId,
        ...parsed.data,
      },
    });
    revalidatePath("/ai/documents");
    return { data: doc };
  } catch (e: any) {
    return { error: e.message || "Failed to create document" };
  }
}

export async function updateRAGDocument(formData: unknown) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const parsed = updateRAGDocumentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { id, ...data } = parsed.data;

  try {
    const doc = await prisma.rAGDocument.update({
      where: { id, tenant_id: tenantId },
      data,
    });
    revalidatePath("/ai/documents");
    return { data: doc };
  } catch (e: any) {
    return { error: e.message || "Failed to update document" };
  }
}

export async function deleteRAGDocument(id: string) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  try {
    await prisma.rAGDocument.delete({
      where: { id, tenant_id: tenantId },
    });
    revalidatePath("/ai/documents");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to delete document" };
  }
}

// ==============================================================================
// AUTONOMOUS RULE ACTIONS
// ==============================================================================

export async function getAutonomousRules({
  page = 1,
  perPage = 20,
  search = "",
  decision_type,
  module,
  is_active,
}: {
  page?: number;
  perPage?: number;
  search?: string;
  decision_type?: string;
  module?: string;
  is_active?: boolean;
} = {}) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const where: any = { tenant_id: tenantId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (decision_type && decision_type in DecisionType) {
    where.decision_type = decision_type as DecisionType;
  }
  if (module) where.module = module;
  if (is_active !== undefined) where.is_active = is_active;

  const [data, total] = await Promise.all([
    prisma.autonomousRule.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: [{ priority: "asc" }, { created_at: "desc" }],
      include: { _count: { select: { decisions: true } } },
    }),
    prisma.autonomousRule.count({ where }),
  ]);

  return {
    data,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

export async function createAutonomousRule(formData: unknown) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const parsed = createAutonomousRuleSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  try {
    const rule = await prisma.autonomousRule.create({
      data: {
        tenant_id: tenantId,
        ...parsed.data,
      },
    });
    revalidatePath("/ai/rules");
    return { data: rule };
  } catch (e: any) {
    return { error: e.message || "Failed to create rule" };
  }
}

export async function updateAutonomousRule(formData: unknown) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const parsed = updateAutonomousRuleSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { id, ...data } = parsed.data;

  try {
    const rule = await prisma.autonomousRule.update({
      where: { id, tenant_id: tenantId },
      data,
    });
    revalidatePath("/ai/rules");
    return { data: rule };
  } catch (e: any) {
    return { error: e.message || "Failed to update rule" };
  }
}

export async function deleteAutonomousRule(id: string) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  try {
    await prisma.autonomousRule.delete({
      where: { id, tenant_id: tenantId },
    });
    revalidatePath("/ai/rules");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to delete rule" };
  }
}

// ==============================================================================
// AUTONOMOUS DECISION ACTIONS
// ==============================================================================

export async function getAutonomousDecisions({
  page = 1,
  perPage = 20,
  search = "",
  decision_type,
  status,
  module,
}: {
  page?: number;
  perPage?: number;
  search?: string;
  decision_type?: string;
  status?: string;
  module?: string;
} = {}) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const where: any = { tenant_id: tenantId };
  if (search) {
    where.OR = [
      { resource_type: { contains: search, mode: "insensitive" } },
      { reasoning: { contains: search, mode: "insensitive" } },
    ];
  }
  if (decision_type && decision_type in DecisionType) {
    where.decision_type = decision_type as DecisionType;
  }
  if (status && status in DecisionStatus) {
    where.status = status as DecisionStatus;
  }
  if (module) where.module = module;

  const [data, total] = await Promise.all([
    prisma.autonomousDecision.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: {
        rule: { select: { name: true, decision_type: true } },
      },
    }),
    prisma.autonomousDecision.count({ where }),
  ]);

  return {
    data,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

export async function overrideAutonomousDecision(formData: unknown) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const parsed = overrideDecisionSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { id, status, override_reason } = parsed.data;

  try {
    const decision = await prisma.autonomousDecision.update({
      where: { id, tenant_id: tenantId },
      data: {
        status: status as DecisionStatus,
        was_overridden: true,
        override_reason,
        ...(status === "ROLLED_BACK" ? { rolled_back_at: new Date() } : {}),
        ...(status === "APPROVED" ? { executed_at: new Date() } : {}),
      },
    });
    revalidatePath("/ai/decisions");
    return { data: decision };
  } catch (e: any) {
    return { error: e.message || "Failed to override decision" };
  }
}

// ==============================================================================
// ANALYTICS DASHBOARD ACTIONS
// ==============================================================================

export async function getAnalyticsDashboards({
  page = 1,
  perPage = 20,
  search = "",
}: {
  page?: number;
  perPage?: number;
  search?: string;
} = {}) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const where: any = {
    tenant_id: tenantId,
    OR: [{ created_by: userId }, { is_shared: true }],
  };
  if (search) {
    where.AND = [
      {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.analyticsDashboard.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: [{ is_default: "desc" }, { created_at: "desc" }],
      include: {
        creator: { select: { first_name: true, last_name: true } },
        _count: { select: { widgets: true } },
      },
    }),
    prisma.analyticsDashboard.count({ where }),
  ]);

  return {
    data,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

export async function createAnalyticsDashboard(formData: unknown) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const parsed = createDashboardSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  try {
    const dashboard = await prisma.analyticsDashboard.create({
      data: {
        tenant_id: tenantId,
        created_by: userId,
        ...parsed.data,
      },
    });
    revalidatePath("/analytics");
    return { data: dashboard };
  } catch (e: any) {
    return { error: e.message || "Failed to create dashboard" };
  }
}

export async function updateAnalyticsDashboard(formData: unknown) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const parsed = updateDashboardSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { id, ...data } = parsed.data;

  try {
    const dashboard = await prisma.analyticsDashboard.update({
      where: { id, tenant_id: tenantId },
      data,
    });
    revalidatePath("/analytics");
    return { data: dashboard };
  } catch (e: any) {
    return { error: e.message || "Failed to update dashboard" };
  }
}

export async function deleteAnalyticsDashboard(id: string) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  try {
    await prisma.analyticsDashboard.delete({
      where: { id, tenant_id: tenantId },
    });
    revalidatePath("/analytics");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to delete dashboard" };
  }
}

// ==============================================================================
// ANALYTICS WIDGET ACTIONS
// ==============================================================================

export async function getAnalyticsWidgets(dashboardId: string) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const widgets = await prisma.analyticsWidget.findMany({
    where: {
      dashboard: { id: dashboardId, tenant_id: tenantId },
    },
    orderBy: { sort_order: "asc" },
  });

  return { data: widgets };
}

export async function createAnalyticsWidget(formData: unknown) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const parsed = createWidgetSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  try {
    const widget = await prisma.analyticsWidget.create({
      data: parsed.data,
    });
    revalidatePath("/analytics");
    return { data: widget };
  } catch (e: any) {
    return { error: e.message || "Failed to create widget" };
  }
}

export async function updateAnalyticsWidget(formData: unknown) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const parsed = updateWidgetSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { id, ...data } = parsed.data;

  try {
    const widget = await prisma.analyticsWidget.update({
      where: { id },
      data,
    });
    revalidatePath("/analytics");
    return { data: widget };
  } catch (e: any) {
    return { error: e.message || "Failed to update widget" };
  }
}

export async function deleteAnalyticsWidget(id: string) {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  try {
    await prisma.analyticsWidget.delete({ where: { id } });
    revalidatePath("/analytics");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to delete widget" };
  }
}

// ==============================================================================
// CROSS-MODULE STATS (Executive Dashboard Data)
// ==============================================================================

export async function getExecutiveDashboardStats() {
  const session = await getCurrentUser();
  if (!session) return { error: "Unauthorized" };
  const tenantId = (session as any).tenantId;
  const userId = session.user?.id;

  const [
    totalLeads,
    totalCustomers,
    totalEmployees,
    totalCourses,
    totalPartners,
    activeConversations,
    totalDecisions,
    pendingDecisions,
    ragDocuments,
    totalAgents,
  ] = await Promise.all([
    prisma.lead.count({ where: { tenant_id: tenantId, is_deleted: false } }),
    prisma.customer.count({ where: { tenant_id: tenantId, is_deleted: false } }),
    prisma.employee.count({ where: { tenant_id: tenantId, is_deleted: false } }),
    prisma.course.count({ where: { tenant_id: tenantId } }),
    prisma.partner.count({ where: { tenant_id: tenantId } }),
    prisma.aIConversation.count({
      where: { tenant_id: tenantId, status: "ACTIVE" },
    }),
    prisma.autonomousDecision.count({ where: { tenant_id: tenantId } }),
    prisma.autonomousDecision.count({
      where: { tenant_id: tenantId, status: "PENDING" },
    }),
    prisma.rAGDocument.count({ where: { tenant_id: tenantId } }),
    prisma.aIAgent.count({ where: { tenant_id: tenantId, status: "ACTIVE" } }),
  ]);

  return {
    data: {
      crm: { leads: totalLeads, customers: totalCustomers },
      hrms: { employees: totalEmployees },
      elearning: { courses: totalCourses },
      partners: { total: totalPartners },
      ai: {
        activeConversations,
        totalDecisions,
        pendingDecisions,
        ragDocuments,
        activeAgents: totalAgents,
      },
    },
  };
}
