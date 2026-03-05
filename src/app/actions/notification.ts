"use server";

// ==============================================================================
// Notification Server Actions
// ==============================================================================
// Manages notification retrieval and status updates.
//
// Available Actions:
//   - getNotifications: List notifications for current user
//   - markAsRead: Mark notification(s) as read
//   - markAllAsRead: Mark all notifications as read
//   - getUnreadCount: Get count of unread notifications
//   - deleteNotification: Delete a notification
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

/**
 * Get notifications for the current user with pagination.
 *
 * @param page - Page number (1-based)
 * @param perPage - Records per page
 * @param status - Filter by status (unread, all)
 * @param type - Filter by notification type
 */
export async function getNotifications({
  page = 1,
  perPage = 20,
  filter = "all",
  type = "",
}: {
  page?: number;
  perPage?: number;
  filter?: "all" | "unread" | "read";
  type?: string;
} = {}) {
  const session = await getCurrentUser();
  const tenantId = (session as any).tenantId;
  const skip = (page - 1) * perPage;

  const where: any = {
    tenant_id: tenantId,
    user_id: session.user.id,
  };

  if (filter === "unread") {
    where.read_at = null;
    where.status = { in: ["PENDING", "SENT", "DELIVERED"] };
  } else if (filter === "read") {
    where.read_at = { not: null };
  }

  if (type) {
    where.type = type;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { created_at: "desc" },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    data: notifications,
    meta: {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

/**
 * Get the count of unread notifications for the header badge.
 */
export async function getUnreadCount() {
  const session = await getCurrentUser();
  const tenantId = (session as any).tenantId;

  return prisma.notification.count({
    where: {
      tenant_id: tenantId,
      user_id: session.user.id,
      read_at: null,
      status: { in: ["PENDING", "SENT", "DELIVERED"] },
    },
  });
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId: string) {
  const session = await getCurrentUser();

  await prisma.notification.update({
    where: {
      id: notificationId,
      user_id: session.user.id, // Ensure user owns this notification
    },
    data: {
      read_at: new Date(),
      status: "READ",
    },
  });

  revalidatePath("/notifications");
  return { success: true };
}

/**
 * Mark all notifications as read for the current user.
 */
export async function markAllAsRead() {
  const session = await getCurrentUser();
  const tenantId = (session as any).tenantId;

  await prisma.notification.updateMany({
    where: {
      tenant_id: tenantId,
      user_id: session.user.id,
      read_at: null,
    },
    data: {
      read_at: new Date(),
      status: "READ",
    },
  });

  revalidatePath("/notifications");
  return { success: true };
}

/**
 * Delete a notification (removes from user's view).
 */
export async function deleteNotification(notificationId: string) {
  const session = await getCurrentUser();

  await prisma.notification.delete({
    where: {
      id: notificationId,
      user_id: session.user.id,
    },
  });

  revalidatePath("/notifications");
  return { success: true };
}
