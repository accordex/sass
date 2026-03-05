"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button, TextInput, Label, Spinner, Badge, Textarea, Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select,
} from "flowbite-react";
import { Icon } from "@iconify/react";
import { getMdfRequests, createMdfRequest, updateMdfRequest, deleteMdfRequest, getPartnersForDropdown } from "@/app/actions/partner";

interface MdfItem {
  id: string;
  request_no: string;
  partner_id: string;
  title: string;
  description: string;
  requested_amount: number;
  approved_amount: number | null;
  status: string;
  activity_start: string | null;
  activity_end: string | null;
  approval_notes: string | null;
  utilization_report: string | null;
  partner?: { id: string; company_name: string; partner_code: string; mdf_budget: number };
  created_at: string;
}

interface PartnerOption {
  id: string; company_name: string; partner_code: string; commission_rate: number; tier: string;
}

const MDF_STATUSES = ["SUBMITTED", "APPROVED", "REJECTED", "UTILIZED", "EXPIRED"];

const statusColors: Record<string, string> = {
  SUBMITTED: "warning",
  APPROVED: "success",
  REJECTED: "failure",
  UTILIZED: "info",
  EXPIRED: "dark",
};

const MdfRequestsClient = () => {
  const [mdfRequests, setMdfRequests] = useState<MdfItem[]>([]);
  const [partnerOptions, setPartnerOptions] = useState<PartnerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MdfItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const emptyForm = {
    partner_id: "",
    title: "",
    description: "",
    requested_amount: 0,
    approved_amount: 0,
    status: "SUBMITTED",
    activity_start: "",
    activity_end: "",
    approval_notes: "",
    utilization_report: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const [mdfResult, partnersResult] = await Promise.all([
      getMdfRequests({ page, perPage: 20, search, status: filterStatus || undefined }),
      getPartnersForDropdown(),
    ]);

    if ("error" in mdfResult) setError(mdfResult.error as string);
    else {
      setMdfRequests((mdfResult as any).mdfRequests || []);
      setTotalPages((mdfResult as any).totalPages || 1);
      setTotal((mdfResult as any).total || 0);
    }

    if (!("error" in partnersResult)) setPartnerOptions((partnersResult as any).partners || []);
    setLoading(false);
  }, [page, search, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (m: MdfItem) => {
    setEditing(m);
    setForm({
      partner_id: m.partner_id,
      title: m.title,
      description: m.description,
      requested_amount: Number(m.requested_amount),
      approved_amount: m.approved_amount ? Number(m.approved_amount) : 0,
      status: m.status,
      activity_start: m.activity_start ? m.activity_start.substring(0, 10) : "",
      activity_end: m.activity_end ? m.activity_end.substring(0, 10) : "",
      approval_notes: m.approval_notes || "",
      utilization_report: m.utilization_report || "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const result = editing
      ? await updateMdfRequest(editing.id, form)
      : await createMdfRequest(form);

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
    const result = await deleteMdfRequest(deleteModal);
    if ("error" in result) setError(result.error as string);
    else { setDeleteModal(null); fetchData(); }
    setDeleting(false);
  };

  const fmtCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN") : "—";

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="flex flex-wrap gap-2 items-end">
          <TextInput
            placeholder="Search MDF requests..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-4 h-4" />}
          />
          <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {MDF_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <Button color="primary" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-1" /> Submit MDF Request
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table hoverable>
          <TableHead>
            <TableRow>
              <TableHeadCell>Request #</TableHeadCell>
              <TableHeadCell>Partner</TableHeadCell>
              <TableHeadCell>Title</TableHeadCell>
              <TableHeadCell>Requested</TableHeadCell>
              <TableHeadCell>Approved</TableHeadCell>
              <TableHeadCell>Activity Period</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : mdfRequests.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No MDF requests found</TableCell></TableRow>
            ) : mdfRequests.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-mono text-xs">{m.request_no}</TableCell>
                <TableCell>
                  <div className="font-semibold">{m.partner?.company_name}</div>
                  <div className="text-xs text-gray-500">{m.partner?.partner_code}</div>
                </TableCell>
                <TableCell>{m.title}</TableCell>
                <TableCell>{fmtCurrency(Number(m.requested_amount))}</TableCell>
                <TableCell>{m.approved_amount ? fmtCurrency(Number(m.approved_amount)) : "—"}</TableCell>
                <TableCell className="text-xs">
                  {m.activity_start ? `${fmtDate(m.activity_start)} – ${fmtDate(m.activity_end)}` : "—"}
                </TableCell>
                <TableCell><Badge color={statusColors[m.status] || "gray"}>{m.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="xs" color="light" onClick={() => openEdit(m)}>
                      <Icon icon="solar:pen-line-duotone" className="w-4 h-4" />
                    </Button>
                    <Button size="xs" color="failure" onClick={() => setDeleteModal(m.id)}>
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
        <ModalHeader>{editing ? "Edit MDF Request" : "Submit MDF Request"}</ModalHeader>
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
              <Label>Title *</Label>
              <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} color={formErrors.title ? "failure" : undefined} />
              {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title[0]}</p>}
            </div>
            <div className="md:col-span-2">
              <Label>Description *</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} color={formErrors.description ? "failure" : undefined} />
            </div>
            <div>
              <Label>Requested Amount (₹) *</Label>
              <TextInput type="number" min={0} value={form.requested_amount} onChange={(e) => setForm({ ...form, requested_amount: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Approved Amount (₹)</Label>
              <TextInput type="number" min={0} value={form.approved_amount} onChange={(e) => setForm({ ...form, approved_amount: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Activity Start</Label>
              <TextInput type="date" value={form.activity_start} onChange={(e) => setForm({ ...form, activity_start: e.target.value })} />
            </div>
            <div>
              <Label>Activity End</Label>
              <TextInput type="date" value={form.activity_end} onChange={(e) => setForm({ ...form, activity_end: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {MDF_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Approval Notes</Label>
              <Textarea rows={2} value={form.approval_notes} onChange={(e) => setForm({ ...form, approval_notes: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Utilization Report</Label>
              <Textarea rows={2} value={form.utilization_report} onChange={(e) => setForm({ ...form, utilization_report: e.target.value })} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null}{editing ? "Update" : "Submit"}
          </Button>
          <Button color="light" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Are you sure you want to delete this MDF request?</p></ModalBody>
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

export default MdfRequestsClient;
