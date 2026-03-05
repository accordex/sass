"use client";

// ==============================================================================
// Audit Logs Client Component
// ==============================================================================
// Displays audit trail entries in a filterable table.
// Read-only — no editing or deletion of audit entries.
// Supports filtering by action, resource type, user, and date range.
// ==============================================================================

import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  TextInput,
  Select,
  Spinner,
} from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import { getAuditLogs } from "@/app/actions/audit";

// Action badge colors
const actionColors: Record<string, string> = {
  create: "success",
  update: "info",
  delete: "failure",
  login: "warning",
  logout: "gray",
  suspend: "warning",
  reactivate: "success",
};

// Action icons
const actionIcons: Record<string, string> = {
  create: "solar:add-circle-line-duotone",
  update: "solar:pen-new-round-line-duotone",
  delete: "solar:trash-bin-trash-line-duotone",
  login: "solar:login-3-line-duotone",
  logout: "solar:logout-3-line-duotone",
  suspend: "solar:lock-line-duotone",
  reactivate: "solar:lock-unlocked-line-duotone",
};

const AuditLogsClient = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 25, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ----- Fetch data -----
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAuditLogs({
        page,
        perPage: 25,
        action: actionFilter,
        resourceType: resourceFilter,
        dateFrom,
        dateTo,
      });
      setLogs(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Re-fetch when filters change (with reset to page 1)
  const applyFilters = () => {
    setPage(1);
    fetchData();
  };

  return (
    <>
      {/* Filters Bar */}
      <CardBox className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          {/* Action filter */}
          <div className="w-40">
            <label className="block text-xs text-gray-500 mb-1">Action</label>
            <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="suspend">Suspend</option>
              <option value="reactivate">Reactivate</option>
            </Select>
          </div>

          {/* Resource type filter */}
          <div className="w-40">
            <label className="block text-xs text-gray-500 mb-1">Resource Type</label>
            <Select value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)}>
              <option value="">All Resources</option>
              <option value="tenant">Tenant</option>
              <option value="user">User</option>
              <option value="role">Role</option>
              <option value="setting">Setting</option>
              <option value="notification">Notification</option>
            </Select>
          </div>

          {/* Date range */}
          <div className="w-40">
            <label className="block text-xs text-gray-500 mb-1">From Date</label>
            <TextInput
              type="date"
              sizing="sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="w-40">
            <label className="block text-xs text-gray-500 mb-1">To Date</label>
            <TextInput
              type="date"
              sizing="sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {/* Apply button */}
          <Button size="sm" color="info" onClick={applyFilters}>
            <Icon icon="solar:magnifer-line-duotone" height={16} className="mr-2" />
            Apply Filters
          </Button>

          {/* Total badge */}
          <Badge color="dark" className="px-3 py-1 self-end">
            Total: {meta.total}
          </Badge>
        </div>
      </CardBox>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <Icon icon="solar:danger-triangle-line-duotone" className="inline mr-2" height={16} />
          {error}
        </div>
      )}

      {/* Audit Logs Table */}
      <CardBox>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
              <span className="ml-3 text-gray-500">Loading audit trail...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon icon="solar:shield-check-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No audit entries found</p>
              <p className="text-sm">Activities will appear here as users interact with the system.</p>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Timestamp</TableHeadCell>
                <TableHeadCell>User</TableHeadCell>
                <TableHeadCell>Action</TableHeadCell>
                <TableHeadCell>Resource</TableHeadCell>
                <TableHeadCell>Resource ID</TableHeadCell>
                <TableHeadCell>Details</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {logs.map((log) => (
                  <TableRow key={log.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    {/* Timestamp */}
                    <TableCell className="whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>

                    {/* User */}
                    <TableCell>
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-semibold">
                            {log.user.first_name?.[0]}{log.user.last_name?.[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {log.user.first_name} {log.user.last_name}
                            </div>
                            <div className="text-xs text-gray-400">{log.user.email}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">System</span>
                      )}
                    </TableCell>

                    {/* Action */}
                    <TableCell>
                      <Badge color={actionColors[log.action] || "gray"} className="inline-flex items-center gap-1">
                        <Icon icon={actionIcons[log.action] || "solar:document-line-duotone"} height={12} />
                        {log.action}
                      </Badge>
                    </TableCell>

                    {/* Resource Type */}
                    <TableCell>
                      <Badge color="light">
                        {log.resource_type}
                      </Badge>
                    </TableCell>

                    {/* Resource ID */}
                    <TableCell>
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded truncate max-w-[120px] inline-block">
                        {log.resource_id ? log.resource_id.substring(0, 8) + "..." : "—"}
                      </code>
                    </TableCell>

                    {/* Details (old/new values preview) */}
                    <TableCell>
                      {log.new_values ? (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-primary hover:underline">
                            View Changes
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs overflow-auto max-h-32 max-w-xs">
                            {JSON.stringify(log.new_values, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500">
              Showing {(meta.page - 1) * meta.perPage + 1}–{Math.min(meta.page * meta.perPage, meta.total)} of {meta.total}
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
      </CardBox>
    </>
  );
};

export default AuditLogsClient;
