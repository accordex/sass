"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button, TextInput, Label, Spinner, Badge, Textarea, Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select,
} from "flowbite-react";
import { Icon } from "@iconify/react";
import { getPartners, createPartner, updatePartner, deletePartner } from "@/app/actions/partner";

interface PartnerItem {
  id: string;
  partner_code: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  partner_type: string;
  tier: string;
  status: string;
  commission_rate: number;
  portal_access: boolean;
  mdf_budget: number;
  specializations: string[];
  certifications: string[];
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gstin: string | null;
  pan: string | null;
  notes: string | null;
  partner_manager?: { id: string; first_name: string; last_name: string } | null;
  _count?: { commissions: number; payouts: number; mdf_requests: number };
  created_at: string;
}

const PARTNER_TYPES = ["RESELLER", "REFERRAL", "TECHNOLOGY", "AFFILIATE"];
const TIERS = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];
const STATUSES = ["PENDING", "ACTIVE", "SUSPENDED", "TERMINATED"];

const tierColors: Record<string, string> = {
  BRONZE: "warning",
  SILVER: "gray",
  GOLD: "yellow",
  PLATINUM: "purple",
};

const statusColors: Record<string, string> = {
  PENDING: "warning",
  ACTIVE: "success",
  SUSPENDED: "failure",
  TERMINATED: "dark",
};

const PartnersClient = () => {
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PartnerItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const emptyForm = {
    company_name: "", contact_name: "", contact_email: "", contact_phone: "",
    website: "", partner_type: "REFERRAL", tier: "BRONZE", status: "PENDING",
    commission_rate: 10, portal_access: true, mdf_budget: 0,
    specializations: [] as string[], certifications: [] as string[],
    address: "", city: "", state: "", pincode: "", gstin: "", pan: "", notes: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getPartners({
      page, perPage: 20, search,
      status: filterStatus || undefined,
      partner_type: filterType || undefined,
      tier: filterTier || undefined,
    });
    if ("error" in result) {
      setError(result.error as string);
    } else {
      setPartners((result as any).partners || []);
      setTotalPages((result as any).totalPages || 1);
      setTotal((result as any).total || 0);
    }
    setLoading(false);
  }, [page, search, filterStatus, filterType, filterTier]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (p: PartnerItem) => {
    setEditing(p);
    setForm({
      company_name: p.company_name,
      contact_name: p.contact_name,
      contact_email: p.contact_email,
      contact_phone: p.contact_phone || "",
      website: p.website || "",
      partner_type: p.partner_type,
      tier: p.tier,
      status: p.status,
      commission_rate: Number(p.commission_rate),
      portal_access: p.portal_access,
      mdf_budget: Number(p.mdf_budget),
      specializations: p.specializations || [],
      certifications: p.certifications || [],
      address: p.address || "",
      city: p.city || "",
      state: p.state || "",
      pincode: p.pincode || "",
      gstin: p.gstin || "",
      pan: p.pan || "",
      notes: p.notes || "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const payload = {
      ...form,
      commission_rate: Number(form.commission_rate),
      mdf_budget: Number(form.mdf_budget),
    };
    const result = editing
      ? await updatePartner(editing.id, payload)
      : await createPartner(payload);

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
    const result = await deletePartner(deleteModal);
    if ("error" in result) setError(result.error as string);
    else { setDeleteModal(null); fetchData(); }
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <TextInput
              placeholder="Search partners..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-4 h-4" />}
            />
          </div>
          <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            {PARTNER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select value={filterTier} onChange={(e) => { setFilterTier(e.target.value); setPage(1); }}>
            <option value="">All Tiers</option>
            {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
        <Button color="primary" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-1" /> Add Partner
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table hoverable>
          <TableHead>
            <TableRow>
              <TableHeadCell>Code</TableHeadCell>
              <TableHeadCell>Company</TableHeadCell>
              <TableHeadCell>Contact</TableHeadCell>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell>Tier</TableHeadCell>
              <TableHeadCell>Commission %</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Commissions</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : partners.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">No partners found</TableCell></TableRow>
            ) : partners.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.partner_code}</TableCell>
                <TableCell>
                  <div className="font-semibold">{p.company_name}</div>
                  {p.city && <div className="text-xs text-gray-500">{p.city}{p.state ? `, ${p.state}` : ""}</div>}
                </TableCell>
                <TableCell>
                  <div>{p.contact_name}</div>
                  <div className="text-xs text-gray-500">{p.contact_email}</div>
                </TableCell>
                <TableCell><Badge color="info">{p.partner_type}</Badge></TableCell>
                <TableCell><Badge color={tierColors[p.tier] || "gray"}>{p.tier}</Badge></TableCell>
                <TableCell className="text-center">{Number(p.commission_rate)}%</TableCell>
                <TableCell><Badge color={statusColors[p.status] || "gray"}>{p.status}</Badge></TableCell>
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
      <Modal show={showModal} onClose={() => setShowModal(false)} size="4xl">
        <ModalHeader>{editing ? "Edit Partner" : "Add New Partner"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Company Name *</Label>
              <TextInput value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} color={formErrors.company_name ? "failure" : undefined} />
              {formErrors.company_name && <p className="text-red-500 text-xs mt-1">{formErrors.company_name[0]}</p>}
            </div>
            <div>
              <Label>Contact Name *</Label>
              <TextInput value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} color={formErrors.contact_name ? "failure" : undefined} />
              {formErrors.contact_name && <p className="text-red-500 text-xs mt-1">{formErrors.contact_name[0]}</p>}
            </div>
            <div>
              <Label>Contact Email *</Label>
              <TextInput type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} color={formErrors.contact_email ? "failure" : undefined} />
              {formErrors.contact_email && <p className="text-red-500 text-xs mt-1">{formErrors.contact_email[0]}</p>}
            </div>
            <div>
              <Label>Contact Phone</Label>
              <TextInput value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            </div>
            <div>
              <Label>Website</Label>
              <TextInput value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Partner Type</Label>
              <Select value={form.partner_type} onChange={(e) => setForm({ ...form, partner_type: e.target.value })}>
                {PARTNER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <Label>Tier</Label>
              <Select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}>
                {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div>
              <Label>Commission Rate (%)</Label>
              <TextInput type="number" min={0} max={100} step={0.5} value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: Number(e.target.value) })} />
            </div>
            <div>
              <Label>MDF Budget (₹)</Label>
              <TextInput type="number" min={0} value={form.mdf_budget} onChange={(e) => setForm({ ...form, mdf_budget: Number(e.target.value) })} />
            </div>
            <div>
              <Label>GSTIN</Label>
              <TextInput value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
            </div>
            <div>
              <Label>PAN</Label>
              <TextInput value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} />
            </div>
            <div>
              <Label>Address</Label>
              <TextInput value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <Label>City</Label>
              <TextInput value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <Label>State</Label>
              <TextInput value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div>
              <Label>Pincode</Label>
              <TextInput value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.portal_access} onChange={(e) => setForm({ ...form, portal_access: e.target.checked })} className="rounded" />
              <Label>Portal Access</Label>
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
        <ModalBody><p>Are you sure you want to delete this partner? This action cannot be undone.</p></ModalBody>
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

export default PartnersClient;
