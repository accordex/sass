"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button, TextInput, Label, Spinner, Badge, Textarea, Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select,
} from "flowbite-react";
import { Icon } from "@iconify/react";
import { getCommissions, createCommission, updateCommission, deleteCommission, getPartnersForDropdown } from "@/app/actions/partner";

interface CommissionItem {
  id: string;
  commission_no: string;
  partner_id: string;
  commission_type: string;
  deal_reference: string | null;
  base_amount: number;
  commission_rate: number;
  commission_amount: number;
  currency: string;
  status: string;
  clawback_eligible: boolean;
  clawback_until: string | null;
  approval_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  paid_at: string | null;
  partner?: { id: string; company_name: string; partner_code: string; tier: string };
  payout?: { id: string; payout_no: string; status: string } | null;
  created_at: string;
}

interface PartnerOption {
  id: string;
  company_name: string;
  partner_code: string;
  commission_rate: number;
  tier: string;
}

const COMMISSION_TYPES = ["REFERRAL", "RESALE", "RENEWAL", "EXPANSION"];
const COMMISSION_STATUSES = ["PENDING", "APPROVED", "PAID", "CLAWED_BACK"];

const statusColors: Record<string, string> = {
  PENDING: "warning",
  APPROVED: "info",
  PAID: "success",
  CLAWED_BACK: "failure",
};

const CommissionsClient = () => {
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [partnerOptions, setPartnerOptions] = useState<PartnerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CommissionItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const emptyForm = {
    partner_id: "",
    commission_type: "REFERRAL",
    deal_reference: "",
    base_amount: 0,
    commission_rate: 10,
    commission_amount: 0,
    currency: "INR",
    status: "PENDING",
    clawback_eligible: true,
    clawback_until: "",
    approval_notes: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const [commResult, partnersResult] = await Promise.all([
      getCommissions({ page, perPage: 20, search, status: filterStatus || undefined, commission_type: filterType || undefined }),
      getPartnersForDropdown(),
    ]);

    if ("error" in commResult) setError(commResult.error as string);
    else {
      setCommissions((commResult as any).commissions || []);
      setTotalPages((commResult as any).totalPages || 1);
      setTotal((commResult as any).total || 0);
    }

    if (!("error" in partnersResult)) setPartnerOptions((partnersResult as any).partners || []);
    setLoading(false);
  }, [page, search, filterStatus, filterType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-calculate commission amount when base_amount or commission_rate changes
  const updateCalc = (baseAmount: number, rate: number) => {
    const amount = (baseAmount * rate) / 100;
    setForm((f) => ({ ...f, base_amount: baseAmount, commission_rate: rate, commission_amount: Math.round(amount * 100) / 100 }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (c: CommissionItem) => {
    setEditing(c);
    setForm({
      partner_id: c.partner_id,
      commission_type: c.commission_type,
      deal_reference: c.deal_reference || "",
      base_amount: Number(c.base_amount),
      commission_rate: Number(c.commission_rate),
      commission_amount: Number(c.commission_amount),
      currency: c.currency,
      status: c.status,
      clawback_eligible: c.clawback_eligible,
      clawback_until: c.clawback_until ? c.clawback_until.substring(0, 10) : "",
      approval_notes: c.approval_notes || "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handlePartnerChange = (partnerId: string) => {
    const p = partnerOptions.find((po) => po.id === partnerId);
    setForm((f) => ({
      ...f,
      partner_id: partnerId,
      commission_rate: p ? Number(p.commission_rate) : f.commission_rate,
      commission_amount: p ? Math.round((f.base_amount * Number(p.commission_rate)) / 100 * 100) / 100 : f.commission_amount,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const result = editing
      ? await updateCommission(editing.id, form)
      : await createCommission(form);

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
    const result = await deleteCommission(deleteModal);
    if ("error" in result) setError(result.error as string);
    else { setDeleteModal(null); fetchData(); }
    setDeleting(false);
  };

  const fmtCurrency = (amount: number, currency = "INR") =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="flex flex-wrap gap-2 items-end">
          <TextInput
            placeholder="Search commissions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-4 h-4" />}
          />
          <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {COMMISSION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            {COMMISSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
        <Button color="primary" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-1" /> Add Commission
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table hoverable>
          <TableHead>
            <TableRow>
              <TableHeadCell>Commission #</TableHeadCell>
              <TableHeadCell>Partner</TableHeadCell>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell>Deal Ref</TableHeadCell>
              <TableHeadCell>Base Amount</TableHeadCell>
              <TableHeadCell>Rate</TableHeadCell>
              <TableHeadCell>Commission</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : commissions.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">No commissions found</TableCell></TableRow>
            ) : commissions.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.commission_no}</TableCell>
                <TableCell>
                  <div className="font-semibold">{c.partner?.company_name}</div>
                  <div className="text-xs text-gray-500">{c.partner?.partner_code}</div>
                </TableCell>
                <TableCell><Badge color="info">{c.commission_type}</Badge></TableCell>
                <TableCell className="text-xs">{c.deal_reference || "—"}</TableCell>
                <TableCell>{fmtCurrency(Number(c.base_amount), c.currency)}</TableCell>
                <TableCell className="text-center">{Number(c.commission_rate)}%</TableCell>
                <TableCell className="font-semibold">{fmtCurrency(Number(c.commission_amount), c.currency)}</TableCell>
                <TableCell><Badge color={statusColors[c.status] || "gray"}>{c.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="xs" color="light" onClick={() => openEdit(c)}>
                      <Icon icon="solar:pen-line-duotone" className="w-4 h-4" />
                    </Button>
                    <Button size="xs" color="failure" onClick={() => setDeleteModal(c.id)}>
                      <Icon icon="solar:trash-bin-trash-line-duotone" className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
        <ModalHeader>{editing ? "Edit Commission" : "Add New Commission"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Partner *</Label>
              <Select value={form.partner_id} onChange={(e) => handlePartnerChange(e.target.value)} color={formErrors.partner_id ? "failure" : undefined}>
                <option value="">Select Partner</option>
                {partnerOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.company_name} ({p.partner_code})</option>
                ))}
              </Select>
              {formErrors.partner_id && <p className="text-red-500 text-xs mt-1">{formErrors.partner_id[0]}</p>}
            </div>
            <div>
              <Label>Commission Type</Label>
              <Select value={form.commission_type} onChange={(e) => setForm({ ...form, commission_type: e.target.value })}>
                {COMMISSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <Label>Deal Reference</Label>
              <TextInput value={form.deal_reference} onChange={(e) => setForm({ ...form, deal_reference: e.target.value })} placeholder="e.g., DEAL-2026-0001" />
            </div>
            <div>
              <Label>Base Amount (₹) *</Label>
              <TextInput type="number" min={0} value={form.base_amount} onChange={(e) => updateCalc(Number(e.target.value), form.commission_rate)} color={formErrors.base_amount ? "failure" : undefined} />
            </div>
            <div>
              <Label>Commission Rate (%) *</Label>
              <TextInput type="number" min={0} max={100} step={0.5} value={form.commission_rate} onChange={(e) => updateCalc(form.base_amount, Number(e.target.value))} />
            </div>
            <div>
              <Label>Commission Amount (₹)</Label>
              <TextInput type="number" value={form.commission_amount} onChange={(e) => setForm({ ...form, commission_amount: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {COMMISSION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div>
              <Label>Clawback Until</Label>
              <TextInput type="date" value={form.clawback_until} onChange={(e) => setForm({ ...form, clawback_until: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" checked={form.clawback_eligible} onChange={(e) => setForm({ ...form, clawback_eligible: e.target.checked })} className="rounded" />
              <Label>Clawback Eligible</Label>
            </div>
            <div className="md:col-span-2">
              <Label>Approval Notes</Label>
              <Textarea rows={2} value={form.approval_notes} onChange={(e) => setForm({ ...form, approval_notes: e.target.value })} />
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
        <ModalBody><p>Are you sure you want to delete this commission record?</p></ModalBody>
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

export default CommissionsClient;
