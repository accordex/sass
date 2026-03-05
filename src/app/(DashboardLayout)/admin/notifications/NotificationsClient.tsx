"use client";

// ==============================================================================
// Notifications Client Component
// ==============================================================================
// Lists notifications with filter (all/unread/read), mark as read, delete.
// Real-time count badge can be added in future via WebSocket or polling.
// ==============================================================================

import React, { useEffect, useState, useTransition } from "react";
import { Badge, Button, Spinner } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "@/app/actions/notification";

// Priority color mapping
const priorityColors: Record<string, string> = {
  LOW: "gray",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "failure",
};

// Notification type icon mapping
const typeIcons: Record<string, string> = {
  user_created: "solar:user-plus-line-duotone",
  system_alert: "solar:bell-bing-line-duotone",
  setting_changed: "solar:settings-line-duotone",
  tenant_suspended: "solar:lock-line-duotone",
  default: "solar:bell-line-duotone",
};

const NotificationsClient = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 20, totalPages: 1 });
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [page, setPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // ----- Data Fetching -----
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [notifResult, count] = await Promise.all([
        getNotifications({ page, perPage: 20, filter }),
        getUnreadCount(),
      ]);
      setNotifications(notifResult.data);
      setMeta(notifResult.meta);
      setUnreadCount(count);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  // ----- Handlers -----
  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      await markAsRead(id);
      fetchData();
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      await markAllAsRead();
      fetchData();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteNotification(id);
      fetchData();
    });
  };

  return (
    <>
      {/* Filter Bar */}
      <CardBox className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {(["all", "unread", "read"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                color={filter === f ? "info" : "light"}
                onClick={() => { setFilter(f); setPage(1); }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "unread" && unreadCount > 0 && (
                  <Badge color="failure" size="xs" className="ml-2">{unreadCount}</Badge>
                )}
              </Button>
            ))}
          </div>

          {unreadCount > 0 && (
            <Button size="sm" color="light" onClick={handleMarkAllAsRead} disabled={isPending}>
              <Icon icon="solar:check-read-line-duotone" height={16} className="mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>
      </CardBox>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <Icon icon="solar:danger-triangle-line-duotone" className="inline mr-2" height={16} />
          {error}
        </div>
      )}

      {/* Notifications List */}
      {loading ? (
        <CardBox>
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-500">Loading notifications...</span>
          </div>
        </CardBox>
      ) : notifications.length === 0 ? (
        <CardBox>
          <div className="text-center py-12 text-gray-500">
            <Icon icon="solar:bell-off-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg">No notifications</p>
            <p className="text-sm">You&apos;re all caught up!</p>
          </div>
        </CardBox>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <CardBox
              key={notif.id}
              className={`transition-all ${
                !notif.read_at ? "border-l-4 border-l-primary" : "opacity-80"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  !notif.read_at ? "bg-primary/10" : "bg-gray-100 dark:bg-gray-700"
                }`}>
                  <Icon
                    icon={typeIcons[notif.type] || typeIcons.default}
                    height={20}
                    className={!notif.read_at ? "text-primary" : "text-gray-400"}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h6 className={`text-sm font-semibold ${
                      !notif.read_at ? "text-gray-900 dark:text-white" : "text-gray-500"
                    }`}>
                      {notif.title}
                    </h6>
                    <Badge color={priorityColors[notif.priority] || "gray"} size="xs">
                      {notif.priority}
                    </Badge>
                    {!notif.read_at && (
                      <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{notif.body}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{new Date(notif.created_at).toLocaleString()}</span>
                    <span>Channel: {notif.channel}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  {!notif.read_at && (
                    <Button
                      size="xs"
                      color="light"
                      title="Mark as Read"
                      disabled={isPending}
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      <Icon icon="solar:check-read-line-duotone" height={14} />
                    </Button>
                  )}
                  <Button
                    size="xs"
                    color="failure"
                    title="Delete"
                    disabled={isPending}
                    onClick={() => handleDelete(notif.id)}
                  >
                    <Icon icon="solar:trash-bin-trash-line-duotone" height={14} />
                  </Button>
                </div>
              </div>
            </CardBox>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-gray-500">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </span>
          <div className="flex gap-2">
            <Button size="xs" color="light" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button size="xs" color="light" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationsClient;
