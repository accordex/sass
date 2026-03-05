"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, Spinner, Badge, Select, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Textarea } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getLeaveRequests, approveRejectLeave } from "@/app/actions/hrms";

interface LeaveRequest {
  id: string; employee_id: string; leave_type_id: string; start_date: string; end_date: string;
  days_requested: number; status: string; reason: string; approver_notes: string | null;
  employee?: { id: string; first_name: string; last_name: string; employee_code: string; department?: { name: string } };
  leave_type?: { id: string; name: string; code: string };
  approver?: { id: string; first_name: string; last_name: string } | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = { PENDING: "warning", APPROVED: "success", REJECTED: "failure", CANCELLED: "gray" };

const LeaveRequestsClient = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  const [actionModal, setActionModal] = useState<{ id: string; action: "APPROVED" | "REJECTED" } | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getLeaveRequests({ page, status: statusFilter });
    if ("error" in result) {
      setError(result.error as string);
    } else {
      setRequests((result as any).requests || []);
      setTotal((result as any).total || 0);
      setTotalPages((result as any).totalPages || 1);
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async () => {
    if (!actionModal) return;
    setSaving(true);
    const result = await approveRejectLeave(actionModal.id, { status: actionModal.action, approver_notes: notes || null });
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setActionModal(null);
    setNotes("");
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
        <span className="text-sm text-gray-500 ml-auto">Total: {total} requests</span>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>Employee</TableHeadCell>
            <TableHeadCell>Department</TableHeadCell>
            <TableHeadCell>Leave Type</TableHeadCell>
            <TableHeadCell>From</TableHeadCell>
            <TableHeadCell>To</TableHeadCell>
            <TableHeadCell>Days</TableHeadCell>
            <TableHeadCell>Reason</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : requests.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">No leave requests found</TableCell></TableRow>
            ) : (
              requests.map((r) => (
                <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-medium">{r.employee?.first_name} {r.employee?.last_name}</TableCell>
                  <TableCell>{r.employee?.department?.name || "—"}</TableCell>
                  <TableCell><Badge color="purple">{r.leave_type?.name}</Badge></TableCell>
                  <TableCell className="text-sm">{new Date(r.start_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">{new Date(r.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{r.days_requested}</TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{r.reason}</TableCell>
                  <TableCell><Badge color={STATUS_COLORS[r.status] || "gray"}>{r.status}</Badge></TableCell>
                  <TableCell>
                    {r.status === "PENDING" ? (
                      <div className="flex gap-1">
                        <Button size="xs" color="success" onClick={() => setActionModal({ id: r.id, action: "APPROVED" })}><Icon icon="solar:check-circle-line-duotone" className="w-4 h-4" /></Button>
                        <Button size="xs" color="failure" onClick={() => setActionModal({ id: r.id, action: "REJECTED" })}><Icon icon="solar:close-circle-line-duotone" className="w-4 h-4" /></Button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">{r.approver ? `By ${r.approver.first_name}` : "—"}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <Button size="sm" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Button size="sm" color="light" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>

      {/* Approve/Reject Modal */}
      <Modal show={!!actionModal} onClose={() => setActionModal(null)} size="md">
        <ModalHeader>{actionModal?.action === "APPROVED" ? "Approve" : "Reject"} Leave Request</ModalHeader>
        <ModalBody>
          <div className="space-y-3">
            <p>Are you sure you want to <strong>{actionModal?.action === "APPROVED" ? "approve" : "reject"}</strong> this leave request?</p>
            <div>
              <label className="block text-sm font-medium mb-1">Notes (optional)</label>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes..." />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color={actionModal?.action === "APPROVED" ? "success" : "failure"} onClick={handleAction} disabled={saving}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null}
            {actionModal?.action === "APPROVED" ? "Approve" : "Reject"}
          </Button>
          <Button color="gray" onClick={() => setActionModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default LeaveRequestsClient;
