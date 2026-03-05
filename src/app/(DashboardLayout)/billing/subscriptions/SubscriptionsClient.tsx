"use client";

// ==============================================================================
// Subscriptions List Client Component
// ==============================================================================
// Lists all subscriptions with search, filter, pagination.
// Super admin / admin view for managing platform subscriptions.
// ==============================================================================

import React, { useEffect, useState, useTransition } from "react";
import { Badge, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TextInput, Select, Spinner, Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import { getAllSubscriptions, cancelSubscription } from "@/app/actions/billing";

const statusColors: Record<string, string> = {
  ACTIVE: "success",
  TRIALING: "info",
  PAST_DUE: "warning",
  CANCELLED: "failure",
  EXPIRED: "dark",
  PAUSED: "gray",
};

const SubscriptionsClient = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAllSubscriptions({ page, perPage: 10, search, status: statusFilter });
      if ("error" in result) {
        setError(result.error as string);
      } else {
        setSubscriptions(result.data || []);
        setMeta(result.meta || { total: 0, page: 1, perPage: 10, totalPages: 1 });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchData(); }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleCancel = () => {
    if (!selectedSubId) return;
    startTransition(async () => {
      try {
        await cancelSubscription(selectedSubId);
        setCancelModalOpen(false);
        setSelectedSubId(null);
        fetchData();
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  return (
    <>
      {/* Filters */}
      <CardBox className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-line-duotone" height={18} />}
              placeholder="Search by tenant name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIALING">Trialing</option>
              <option value="PAST_DUE">Past Due</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </Select>
          </div>
          <Badge color="dark" className="px-3 py-1">Total: {meta.total}</Badge>
        </div>
      </CardBox>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <Icon icon="solar:danger-triangle-line-duotone" className="inline mr-2" height={16} />
          {error}
        </div>
      )}

      <CardBox>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
              <span className="ml-3 text-gray-500">Loading subscriptions...</span>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon icon="solar:card-recive-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No subscriptions found</p>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Tenant</TableHeadCell>
                <TableHeadCell>Plan</TableHeadCell>
                <TableHeadCell>Billing Cycle</TableHeadCell>
                <TableHeadCell>Amount</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Period End</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {subscriptions.map((sub: any) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.tenant?.company_name || "—"}</TableCell>
                    <TableCell>{sub.plan?.plan_name || "—"}</TableCell>
                    <TableCell>{sub.billing_cycle}</TableCell>
                    <TableCell>₹{Number(sub.amount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge color={statusColors[sub.status] || "gray"}>{sub.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {sub.status === "ACTIVE" && (
                          <Button
                            size="xs"
                            color="failure"
                            title="Cancel Subscription"
                            disabled={isPending}
                            onClick={() => { setSelectedSubId(sub.id); setCancelModalOpen(true); }}
                          >
                            <Icon icon="solar:close-circle-line-duotone" height={16} />
                          </Button>
                        )}
                      </div>
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
              <Button size="xs" color="light" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <Button size="xs" color="light" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </CardBox>

      {/* Cancel Confirmation Modal */}
      <Modal show={cancelModalOpen} size="md" onClose={() => setCancelModalOpen(false)}>
        <ModalHeader>Cancel Subscription</ModalHeader>
        <ModalBody>
          <div className="text-center">
            <Icon icon="solar:danger-triangle-line-duotone" height={48} className="mx-auto mb-4 text-red-500" />
            <p className="text-gray-500 dark:text-gray-400">
              Are you sure you want to cancel this subscription? The tenant will lose access at the end of the current billing period.
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3">
          <Button color="gray" onClick={() => setCancelModalOpen(false)}>Keep Active</Button>
          <Button color="failure" onClick={handleCancel} disabled={isPending}>
            {isPending ? <Spinner size="sm" className="mr-2" /> : null}
            Yes, Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default SubscriptionsClient;
