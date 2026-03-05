"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Select, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getPayrollRuns, createPayrollRun, updatePayrollRun, deletePayrollRun } from "@/app/actions/payroll";

const statusColors: Record<string, string> = { DRAFT: "gray", PROCESSING: "info", PROCESSED: "warning", APPROVED: "success", PAID: "success", CANCELLED: "failure" };

const formatCurrency = (v: number | null) => v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

const PayrollRunsClient = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const currentDate = new Date();
  const defaultForm = {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    period_start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split("T")[0],
    period_end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split("T")[0],
  };
  const [form, setForm] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getPayrollRuns({ page, status: statusFilter });
    if ("error" in result) setError(result.error as string);
    else { setRuns((result as any).payrollRuns || []); setTotal((result as any).total || 0); setTotalPages((result as any).totalPages || 1); }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(defaultForm); setFormErrors({}); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const result = await createPayrollRun(form);
    if ("error" in result) { if ((result as any).details) setFormErrors((result as any).details); else setError(result.error as string); }
    else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const result = await updatePayrollRun(id, { status: newStatus });
    if ("error" in result) setError(result.error as string);
    else fetchData();
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deletePayrollRun(deleteModal);
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setDeleteModal(null);
    setDeleting(false);
  };

  const getNextStatus = (status: string) => {
    const flow: Record<string, string> = { DRAFT: "PROCESSING", PROCESSING: "PROCESSED", PROCESSED: "APPROVED", APPROVED: "PAID" };
    return flow[status] || null;
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PROCESSING">Processing</option>
          <option value="PROCESSED">Processed</option>
          <option value="APPROVED">Approved</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
        <Button color="primary" onClick={openCreate}><Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" />New Payroll Run</Button>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>Run #</TableHeadCell>
            <TableHeadCell>Period</TableHeadCell>
            <TableHeadCell>Employees</TableHeadCell>
            <TableHeadCell>Total Gross</TableHeadCell>
            <TableHeadCell>Total Deductions</TableHeadCell>
            <TableHeadCell>Total Net</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : runs.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No payroll runs found</TableCell></TableRow>
            ) : (
              runs.map((r: any) => {
                const next = getNextStatus(r.status);
                return (
                  <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <div className="font-mono font-semibold">{r.run_number}</div>
                      <div className="text-xs text-gray-400">{r.month}/{r.year}</div>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(r.period_start).toLocaleDateString()} – {new Date(r.period_end).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">{r.total_employees}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(r.total_gross)}</TableCell>
                    <TableCell className="font-mono text-red-500">{formatCurrency(r.total_deductions)}</TableCell>
                    <TableCell className="font-mono font-semibold text-green-600">{formatCurrency(r.total_net)}</TableCell>
                    <TableCell><Badge color={statusColors[r.status] || "gray"}>{r.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {next && <Button size="xs" color="light" title={`Move to ${next}`} onClick={() => handleStatusChange(r.id, next)}><Icon icon="solar:arrow-right-line-duotone" className="w-4 h-4" /></Button>}
                        {r.status === "DRAFT" && <Button size="xs" color="failure" onClick={() => setDeleteModal(r.id)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" className="w-4 h-4" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Page {page} of {totalPages} ({total} records)</span>
        <div className="flex gap-2">
          <Button size="sm" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Button size="sm" color="light" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>

      {/* Create Payroll Run Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="xl">
        <ModalHeader>New Payroll Run</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Payroll Month</Label><Select value={form.month} onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}>
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString("default", { month: "long" })}</option>)}
              </Select></div>
              <div><Label>Payroll Year</Label><TextInput type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Period Start *</Label><TextInput type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} color={formErrors.period_start ? "failure" : undefined} /></div>
              <div><Label>Period End *</Label><TextInput type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} color={formErrors.period_end ? "failure" : undefined} /></div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner size="sm" className="mr-2" /> : null}Create Run</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Delete this payroll run? This cannot be undone.</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-2" /> : null}Delete</Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PayrollRunsClient;
