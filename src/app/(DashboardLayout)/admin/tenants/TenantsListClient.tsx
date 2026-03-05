"use client";

// ==============================================================================
// Tenants List Client Component
// ==============================================================================
// Handles client-side interactions: search, pagination, actions (suspend,
// reactivate, delete). Uses server actions via useTransition for mutations.
// ==============================================================================

import React, { useEffect, useState, useTransition } from "react";
import { Badge, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TextInput, Select, Spinner, Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import {
  getTenants,
  suspendTenant,
  reactivateTenant,
  deleteTenant,
} from "@/app/actions/tenant";
import Link from "next/link";

// Status badge color mapping for visual indicators
const statusColors: Record<string, string> = {
  ACTIVE: "success",
  TRIAL: "info",
  SUSPENDED: "warning",
  CANCELLED: "failure",
  EXPIRED: "dark",
};

const TenantsListClient = () => {
  // ----- State -----
  const [tenants, setTenants] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal state for delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  // ----- Data Fetching -----
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getTenants({ page, perPage: 10, search, status: statusFilter });
      setTenants(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      setError(err.message || "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  // Debounced search — triggers refetch after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ----- Action Handlers -----

  /** Suspend a tenant — sets status to SUSPENDED */
  const handleSuspend = (tenantId: string) => {
    startTransition(async () => {
      try {
        await suspendTenant(tenantId, "Suspended from admin panel");
        fetchData();
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  /** Reactivate a suspended tenant — sets status to ACTIVE */
  const handleReactivate = (tenantId: string) => {
    startTransition(async () => {
      try {
        await reactivateTenant(tenantId);
        fetchData();
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  /** Soft-delete a tenant (confirmation modal required) */
  const handleDelete = () => {
    if (!selectedTenantId) return;
    startTransition(async () => {
      try {
        await deleteTenant(selectedTenantId);
        setDeleteModalOpen(false);
        setSelectedTenantId(null);
        fetchData();
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  const openDeleteModal = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setDeleteModalOpen(true);
  };

  return (
    <>
      {/* Filters Bar */}
      <CardBox className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-line-duotone" height={18} />}
              placeholder="Search by company name, code, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="w-44">
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </Select>
          </div>

          {/* Summary Badge */}
          <Badge color="dark" className="px-3 py-1">
            Total: {meta.total}
          </Badge>
        </div>
      </CardBox>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <Icon icon="solar:danger-triangle-line-duotone" className="inline mr-2" height={16} />
          {error}
        </div>
      )}

      {/* Data Table */}
      <CardBox>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
              <span className="ml-3 text-gray-500">Loading tenants...</span>
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon icon="solar:buildings-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No tenants found</p>
              <p className="text-sm">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Company</TableHeadCell>
                <TableHeadCell>Tenant Code</TableHeadCell>
                <TableHeadCell>Plan</TableHeadCell>
                <TableHeadCell>Users</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Created</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    {/* Company Name */}
                    <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      <Link href={`/admin/tenants/${tenant.id}`} className="hover:text-primary hover:underline">
                        {tenant.company_name}
                      </Link>
                      <div className="text-xs text-gray-500">{tenant.primary_email}</div>
                    </TableCell>

                    {/* Tenant Code */}
                    <TableCell>
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {tenant.tenant_code}
                      </code>
                    </TableCell>

                    {/* Subscription Plan */}
                    <TableCell>{tenant.plan?.plan_name || "—"}</TableCell>

                    {/* User Count */}
                    <TableCell>
                      <Badge color="info">{tenant._count?.users ?? 0}</Badge>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <Badge color={statusColors[tenant.status] || "gray"}>
                        {tenant.status}
                      </Badge>
                    </TableCell>

                    {/* Creation Date */}
                    <TableCell className="text-sm text-gray-500">
                      {new Date(tenant.created_at).toLocaleDateString()}
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell>
                      <div className="flex gap-2">
                        {/* View / Edit */}
                        <Link href={`/admin/tenants/${tenant.id}`}>
                          <Button size="xs" color="light" title="View Details">
                            <Icon icon="solar:eye-line-duotone" height={16} />
                          </Button>
                        </Link>

                        {/* Suspend / Reactivate toggle */}
                        {tenant.status === "ACTIVE" || tenant.status === "TRIAL" ? (
                          <Button
                            size="xs"
                            color="warning"
                            title="Suspend Tenant"
                            disabled={isPending}
                            onClick={() => handleSuspend(tenant.id)}
                          >
                            <Icon icon="solar:lock-line-duotone" height={16} />
                          </Button>
                        ) : tenant.status === "SUSPENDED" ? (
                          <Button
                            size="xs"
                            color="success"
                            title="Reactivate Tenant"
                            disabled={isPending}
                            onClick={() => handleReactivate(tenant.id)}
                          >
                            <Icon icon="solar:lock-unlocked-line-duotone" height={16} />
                          </Button>
                        ) : null}

                        {/* Delete */}
                        <Button
                          size="xs"
                          color="failure"
                          title="Delete Tenant"
                          disabled={isPending}
                          onClick={() => openDeleteModal(tenant.id)}
                        >
                          <Icon icon="solar:trash-bin-trash-line-duotone" height={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Controls */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500">
              Showing {(meta.page - 1) * meta.perPage + 1}–{Math.min(meta.page * meta.perPage, meta.total)} of {meta.total}
            </span>
            <div className="flex gap-2">
              <Button
                size="xs"
                color="light"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              {/* Page number indicators */}
              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    size="xs"
                    color={pageNum === page ? "info" : "light"}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                size="xs"
                color="light"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardBox>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModalOpen} size="md" onClose={() => setDeleteModalOpen(false)}>
        <ModalHeader>Confirm Tenant Deletion</ModalHeader>
        <ModalBody>
          <div className="text-center">
            <Icon icon="solar:danger-triangle-line-duotone" height={48} className="mx-auto mb-4 text-red-500" />
            <h3 className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this tenant? This will soft-delete the tenant and all associated data will become inaccessible.
            </h3>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3">
          <Button color="gray" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button color="failure" onClick={handleDelete} disabled={isPending}>
            {isPending ? <Spinner size="sm" className="mr-2" /> : null}
            Yes, Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default TenantsListClient;
