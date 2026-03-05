"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button, TextInput, Label, Spinner, Badge, Textarea, Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select,
} from "flowbite-react";
import { Icon } from "@iconify/react";
import { getPayouts, createPayout, updatePayout, deletePayout, getPartnersForDropdown } from "@/app/actions/partner";

interface PayoutItem {
  id: string;
  payout_no: string;
  partner_id: string;
  period_start: string;
  period_end: string;
  total_amount: number;
  tds_amount: number;
  net_amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  payment_ref: string | null;
  processed_at: string | null;
  processed_by: string | null;
  notes: string | null;
  partner?: { id: string; company_name: string; partner_code: string };
  _count?: { commissions: number };
  created_at: string;
}

interface PartnerOption {
  id: string; company_name: string; partner_code: string; commission_rate: number; tier: string;
}

const PAYOUT_STATUSES = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "PROCESSING", "COMPLETED", "FAILED"];

const statusColors: Record<string, string> = {
  DRAFT: "gray",
  PENDING_APPROVAL: "warning",
  APPROVED: "info",
  PROCESSING: "purple",
  COMPLETED: "success",
  FAILED: "failure",
};

const PayoutsClient = () => {
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [partnerOptions, setPartnerOptions] = useState<PartnerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PayoutItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const emptyForm = {
    partner_id: "",
    period_start: "",
    period_end: "",
    total_amount: 0,
    tds_amount: 0,
    net_amount: 0,
    currency: "INR",
    status: "DRAFT",
    payment_method: "",
    payment_ref: "",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const [payResult, partnersResult] = await Promise.all([
      getPayouts({ page, perPage: 20, search, status: filterStatus || undefined }),
      getPartnersForDropdown(),
    ]);

    if ("error" in payResult) setError(payResult.error as string);
    else {
      setPayouts((payResult as any).payouts || []);
      setTotalPages((payResult as any).totalPages || 1);
      setTotal((payResult as any).total || 0);
    }

    if (!("error" in partnersResult)) setPartnerOptions((partnersResult as any).partners || []);
    setLoading(false);
  }, [page, search, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const recalcNet = (totalAmt: number, tds: number) => {
    setForm((f) => ({ ...f, total_amount: totalAmt, tds_amount: tds, net_amount: Math.max(0, totalAmt - tds) }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (p: PayoutItem) => {
    setEditing(p);
    setForm({
      partner_id: p.partner_id,
      period_start: p.period_start ? p.period_start.substring(0, 10) : "",
      period_end: p.period_end ? p.period_end.substring(0, 10) : "",
      total_amount: Number(p.total_amount),
      tds_amount: Number(p.tds_amount),
      net_amount: Number(p.net_amount),
      currency: p.currency,
      status: p.status,
      payment_method: p.payment_method || "",
      payment_ref: p.payment_ref || "",
      notes: p.notes || "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const result = editing
      ? await updatePayout(editing.id, form)
      : await createPayout(form);

    if ("error" in result) {
      if ((result as any).details) setFormErrors((result as any).details);
      else setError(result.error as string);
    } else {
      setShowModal(false);
      fetchData();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deletePayout(deleteModal);
    if ("error" in result) setError(result.error as string);
    else { setDeleteModal(null); fetchData(); }
    setDeleting(false);
  };

  const fmtCurrency = (amount: number, currency = "INR") =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN") : "—";

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="flex flex-wrap gap-2 items-end">
          <TextInput
            placeholder="Search payouts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-4 h-4" />}
          />
          <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {PAYOUT_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </Select>
        </div>
        <Button color="primary" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-1" /> Create Payout
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table hoverable>
          <TableHead>
            <TableRow>
              <TableHeadCell>Payout #</TableHeadCell>
              <TableHeadCell>Partner</TableHeadCell>
              <TableHeadCell>Period</TableHeadCell>
              <TableHeadCell>Total</TableHeadCell>
              <TableHeadCell>TDS</TableHeadCell>
              <TableHeadCell>Net Amount</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Commissions</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : payouts.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">No payouts found</TableCell></TableRow>
            ) : payouts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.payout_no}</TableCell>
                <TableCell>
                  <div className="font-semibold">{p.partner?.company_name}</div>
                  <div className="text-xs text-gray-500">{p.partner?.partner_code}</div>
                </TableCell>
                <TableCell className="text-xs">
                  {fmtDate(p.period_start)} – {fmtDate(p.period_end)}
                </TableCell>
                <TableCell>{fmtCurrency(Number(p.total_amount), p.currency)}</TableCell>
                <TableCell className="text-red-600">{fmtCurrency(Number(p.tds_amount), p.currency)}</TableCell>
                <TableCell className="font-semibold">{fmtCurrency(Number(p.net_amount), p.currency)}</TableCell>
                <TableCell><Badge color={statusColors[p.status] || "gray"}>{p.status.replace("_", " ")}</Badge></TableCell>
                <TableCell className="text-center">{p._count?.commissions || 0}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="xs" color="light" onClick={() => openEdit(p)}>
                      <Icon icon="solar:pen-line-duotone" className="w-4 h-4" />
                    </Button>
                    <Button size="xs" color="failure" onClick={() => setDeleteModal(p.id)}>
                      <Icon icon="solar:trash-bin-trash-line-duotone" className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Showing page {page} of {totalPages} ({total} total)</span>
          <div className="flex gap-2">
            <Button size="xs" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button size="xs" color="light" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="3xl">
        <ModalHeader>{editing ? "Edit Payout" : "Create Payout Batch"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Partner *</Label>
              <Select value={form.partner_id} onChange={(e) => setForm({ ...form, partner_id: e.target.value })} color={formErrors.partner_id ? "failure" : undefined}>
                <option value="">Select Partner</option>
                {partnerOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.company_name} ({p.partner_code})</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {PAYOUT_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </Select>
            </div>
            <div>
              <Label>Period Start *</Label>
              <TextInput type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} />
            </div>
            <div>
              <Label>Period End *</Label>
              <TextInput type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} />
            </div>
            <div>
              <Label>Total Amount (₹)</Label>
              <TextInput type="number" min={0} value={form.total_amount} onChange={(e) => recalcNet(Number(e.target.value), form.tds_amount)} />
            </div>
            <div>
              <Label>TDS Deducted (₹)</Label>
              <TextInput type="number" min={0} value={form.tds_amount} onChange={(e) => recalcNet(form.total_amount, Number(e.target.value))} />
            </div>
            <div>
              <Label>Net Amount (₹)</Label>
              <TextInput type="number" value={form.net_amount} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                <option value="">Select</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
                <option value="neft">NEFT</option>
                <option value="rtgs">RTGS</option>
              </Select>
            </div>
            <div>
              <Label>Payment Reference / UTR</Label>
              <TextInput value={form.payment_ref} onChange={(e) => setForm({ ...form, payment_ref: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null}{editing ? "Update" : "Create"}
          </Button>
          <Button color="light" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Are you sure you want to delete this payout batch?</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner size="sm" className="mr-2" /> : null}Delete
          </Button>
          <Button color="light" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PayoutsClient;
