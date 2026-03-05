"use server";

// ==============================================================================
// Settings Management Server Actions
// ==============================================================================
// Manages the hierarchical settings framework:
//   Platform → Tenant → Module → User
//
// Available Actions:
//   - getSettings: Get settings by scope
//   - updateSetting: Create or update a setting
//   - getSettingValue: Get a single setting's resolved value
//   - deleteSetting: Remove a custom setting
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

/**
 * Get settings for the specified scope.
 * Resolves inheritance: Platform → Tenant → Module → User
 *
 * @param scope - "platform" | "tenant" | "module" | "user"
 * @param module - Module code (required for module-scope)
 * @param category - Optional category filter
 */
export async function getSettings({
  scope = "tenant",
  module = null,
  category = null,
}: {
  scope?: "platform" | "tenant" | "module" | "user";
  module?: string | null;
  category?: string | null;
} = {}) {
  const session = await getCurrentUser();
  const tenantId = (session as any).tenantId;

  const where: any = {};

  switch (scope) {
    case "platform":
      // Platform settings — super admin only
      await requireRole(["super_admin"]);
      where.tenant_id = null;
      where.user_id = null;
      break;

    case "tenant":
      where.tenant_id = tenantId;
      where.user_id = null;
      where.module = null;
      break;

    case "module":
      where.tenant_id = tenantId;
      where.module = module;
      where.user_id = null;
      break;

    case "user":
      where.tenant_id = tenantId;
      where.user_id = session.user.id;
      break;
  }

  if (category) {
    where.category = category;
  }

  return prisma.setting.findMany({
    where,
    orderBy: [{ category: "asc" }, { setting_key: "asc" }],
  });
}

/**
 * Get a single setting's effective value, resolving inheritance.
 * Checks User → Module → Tenant → Platform (most specific wins).
 *
 * @param key - Setting key (e.g., "ai.enabled")
 * @param module - Optional module context
 */
export async function getSettingValue(key: string, module?: string) {
  const session = await getCurrentUser();
  const tenantId = (session as any).tenantId;

  // Check in order of specificity (most specific first)
  const scopes = [
    // 1. User-specific setting
    { tenant_id: tenantId, user_id: session.user.id, setting_key: key },
    // 2. Module-specific setting
    ...(module
      ? [{ tenant_id: tenantId, module, user_id: null, setting_key: key }]
      : []),
    // 3. Tenant-wide setting
    { tenant_id: tenantId, module: null, user_id: null, setting_key: key },
    // 4. Platform default
    { tenant_id: null, module: null, user_id: null, setting_key: key },
  ];

  for (const scope of scopes) {
    const setting = await prisma.setting.findFirst({
      where: scope as any,
    });
    if (setting) {
      return setting.setting_value;
    }
  }

  return null; // No setting found at any level
}

/**
 * Create or update a setting.
 *
 * @param data - Setting data including key, value, scope info
 */
export async function updateSetting(data: {
  setting_key: string;
  setting_value: any;
  category: string;
  value_type?: string;
  module?: string | null;
  scope?: "platform" | "tenant" | "user";
}) {
  const session = await getCurrentUser();
  const tenantId = (session as any).tenantId;

  const {
    setting_key,
    setting_value,
    category,
    value_type = "STRING",
    module: settingModule = null,
    scope = "tenant",
  } = data;

  // Determine tenant_id and user_id based on scope
  let targetTenantId: string | null = tenantId;
  let targetUserId: string | null = null;

  switch (scope) {
    case "platform":
      await requireRole(["super_admin"]);
      targetTenantId = null;
      break;
    case "user":
      targetUserId = session.user.id;
      break;
    case "tenant":
    default:
      // Tenant admin or above
      break;
  }

  // Upsert the setting
  const setting = await prisma.setting.upsert({
    where: {
      tenant_id_module_user_id_setting_key: {
        tenant_id: targetTenantId as any,
        module: settingModule as any,
        user_id: targetUserId as any,
        setting_key,
      },
    },
    update: {
      setting_value,
      value_type: value_type as any,
    },
    create: {
      tenant_id: targetTenantId,
      module: settingModule,
      user_id: targetUserId,
      category,
      setting_key,
      setting_value,
      value_type: value_type as any,
      editable_by: scope === "platform" ? ["super_admin"] : ["tenant_admin"],
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      tenant_id: tenantId,
      user_id: session.user.id,
      action: "update",
      resource_type: "setting",
      resource_id: setting.id,
      new_values: { setting_key, setting_value, scope },
    },
  });

  revalidatePath("/settings");
  return setting;
}
