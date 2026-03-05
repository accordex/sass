"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button, TextInput, Label, Spinner, Badge, Textarea, Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select,
} from "flowbite-react";
import { Icon } from "@iconify/react";
import {
  getMarketplaceListings, createMarketplaceListing, updateMarketplaceListing, deleteMarketplaceListing, getPartnersForDropdown,
} from "@/app/actions/partner";

interface ListingItem {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string;
  listing_type: string;
  status: string;
  category: string | null;
  tags: string[];
  logo_url: string | null;
  pricing_model: string | null;
  price: number | null;
  avg_rating: number;
  review_count: number;
  install_count: number;
  external_url: string | null;
  version: string | null;
  is_featured: boolean;
  partner?: { id: string; company_name: string; partner_code: string } | null;
  _count?: { reviews: number };
  created_at: string;
}

interface PartnerOption {
  id: string; company_name: string; partner_code: string; commission_rate: number; tier: string;
}

const LISTING_TYPES = ["APP", "SERVICE", "INTEGRATION", "TEMPLATE"];
const LISTING_STATUSES = ["DRAFT", "SUBMITTED", "PUBLISHED", "REJECTED", "ARCHIVED"];
const PRICING_MODELS = ["free", "paid", "freemium", "contact"];

const statusColors: Record<string, string> = {
  DRAFT: "gray",
  SUBMITTED: "warning",
  PUBLISHED: "success",
  REJECTED: "failure",
  ARCHIVED: "dark",
};

const typeColors: Record<string, string> = {
  APP: "info",
  SERVICE: "purple",
  INTEGRATION: "indigo",
  TEMPLATE: "pink",
};

const MarketplaceClient = () => {
  const [listings, setListings] = useState<ListingItem[]>([]);
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
  const [editing, setEditing] = useState<ListingItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const emptyForm = {
    partner_id: "",
    title: "",
    slug: "",
    short_description: "",
    description: "",
    listing_type: "APP",
    status: "DRAFT",
    category: "",
    tags: [] as string[],
    logo_url: "",
    pricing_model: "free",
    price: 0,
    external_url: "",
    version: "",
    is_featured: false,
  };

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [tagsInput, setTagsInput] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const [listResult, partnersResult] = await Promise.all([
      getMarketplaceListings({
        page, perPage: 20, search,
        status: filterStatus || undefined,
        listing_type: filterType || undefined,
      }),
      getPartnersForDropdown(),
    ]);

    if ("error" in listResult) setError(listResult.error as string);
    else {
      setListings((listResult as any).listings || []);
      setTotalPages((listResult as any).totalPages || 1);
      setTotal((listResult as any).total || 0);
    }

    if (!("error" in partnersResult)) setPartnerOptions((partnersResult as any).partners || []);
    setLoading(false);
  }, [page, search, filterStatus, filterType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setTagsInput("");
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (l: ListingItem) => {
    setEditing(l);
    const tags = Array.isArray(l.tags) ? l.tags : [];
    setForm({
      partner_id: l.partner?.id || "",
      title: l.title,
      slug: l.slug,
      short_description: l.short_description || "",
      description: l.description,
      listing_type: l.listing_type,
      status: l.status,
      category: l.category || "",
      tags,
      logo_url: l.logo_url || "",
      pricing_model: l.pricing_model || "free",
      price: l.price ? Number(l.price) : 0,
      external_url: l.external_url || "",
      version: l.version || "",
      is_featured: l.is_featured,
    });
    setTagsInput(tags.join(", "));
    setFormErrors({});
    setShowModal(true);
  };

  const handleTagsChange = (val: string) => {
    setTagsInput(val);
    setForm((f) => ({
      ...f,
      tags: val.split(",").map((t) => t.trim()).filter(Boolean),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const result = editing
      ? await updateMarketplaceListing(editing.id, form)
      : await createMarketplaceListing(form);

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
    const result = await deleteMarketplaceListing(deleteModal);
    if ("error" in result) setError(result.error as string);
    else { setDeleteModal(null); fetchData(); }
    setDeleting(false);
  };

  const fmtCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="flex flex-wrap gap-2 items-end">
          <TextInput
            placeholder="Search listings..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-4 h-4" />}
          />
          <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {LISTING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            {LISTING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
        <Button color="primary" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-1" /> Add Listing
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table hoverable>
          <TableHead>
            <TableRow>
              <TableHeadCell>Title</TableHeadCell>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell>Partner</TableHeadCell>
              <TableHeadCell>Pricing</TableHeadCell>
              <TableHeadCell>Rating</TableHeadCell>
              <TableHeadCell>Reviews</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Featured</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : listings.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">No listings found</TableCell></TableRow>
            ) : listings.map((l) => (
              <TableRow key={l.id}>
                <TableCell>
                  <div className="font-semibold">{l.title}</div>
                  <div className="text-xs text-gray-500">{l.short_description || l.slug}</div>
                </TableCell>
                <TableCell><Badge color={typeColors[l.listing_type] || "gray"}>{l.listing_type}</Badge></TableCell>
                <TableCell>
                  {l.partner ? (
                    <div className="text-sm">{l.partner.company_name}</div>
                  ) : <span className="text-gray-400">—</span>}
                </TableCell>
                <TableCell>
                  {l.pricing_model === "free" ? (
                    <Badge color="success">Free</Badge>
                  ) : l.pricing_model === "paid" && l.price ? (
                    <span className="text-sm">{fmtCurrency(Number(l.price))}</span>
                  ) : (
                    <span className="text-sm capitalize">{l.pricing_model}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:star-bold" className="w-4 h-4 text-yellow-400" />
                    <span>{Number(l.avg_rating).toFixed(1)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{l._count?.reviews || l.review_count}</TableCell>
                <TableCell><Badge color={statusColors[l.status] || "gray"}>{l.status}</Badge></TableCell>
                <TableCell>
                  {l.is_featured ? (
                    <Icon icon="solar:star-bold" className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Icon icon="solar:star-line-duotone" className="w-5 h-5 text-gray-300" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="xs" color="light" onClick={() => openEdit(l)}>
                      <Icon icon="solar:pen-line-duotone" className="w-4 h-4" />
                    </Button>
                    <Button size="xs" color="failure" onClick={() => setDeleteModal(l.id)}>
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
      <Modal show={showModal} onClose={() => setShowModal(false)} size="4xl">
        <ModalHeader>{editing ? "Edit Listing" : "Add New Listing"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Title *</Label>
              <TextInput
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value, slug: editing ? form.slug : generateSlug(e.target.value) });
                }}
                color={formErrors.title ? "failure" : undefined}
              />
              {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title[0]}</p>}
            </div>
            <div>
              <Label>Slug *</Label>
              <TextInput value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} color={formErrors.slug ? "failure" : undefined} />
            </div>
            <div className="md:col-span-2">
              <Label>Short Description</Label>
              <TextInput value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} placeholder="Brief summary for cards" />
            </div>
            <div className="md:col-span-2">
              <Label>Description *</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} color={formErrors.description ? "failure" : undefined} />
            </div>
            <div>
              <Label>Partner</Label>
              <Select value={form.partner_id} onChange={(e) => setForm({ ...form, partner_id: e.target.value })}>
                <option value="">No Partner (Internal)</option>
                {partnerOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.company_name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Listing Type</Label>
              <Select value={form.listing_type} onChange={(e) => setForm({ ...form, listing_type: e.target.value })}>
                {LISTING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {LISTING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <TextInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., CRM, Accounting" />
            </div>
            <div>
              <Label>Pricing Model</Label>
              <Select value={form.pricing_model} onChange={(e) => setForm({ ...form, pricing_model: e.target.value })}>
                {PRICING_MODELS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </Select>
            </div>
            <div>
              <Label>Price (₹)</Label>
              <TextInput type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} disabled={form.pricing_model === "free"} />
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <TextInput value={tagsInput} onChange={(e) => handleTagsChange(e.target.value)} placeholder="crm, integration, automation" />
            </div>
            <div>
              <Label>Version</Label>
              <TextInput value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="e.g., 1.0.0" />
            </div>
            <div>
              <Label>Logo URL</Label>
              <TextInput value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>External URL</Label>
              <TextInput value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded" />
              <Label>Featured Listing</Label>
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
        <ModalBody><p>Are you sure you want to remove this listing?</p></ModalBody>
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

export default MarketplaceClient;
