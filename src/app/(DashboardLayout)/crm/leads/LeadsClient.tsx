"use client";

// ==============================================================================
// Leads List Client Component
// ==============================================================================
// Full CRUD for leads with search, status/source filters, pagination, and
// conversion to customer. Uses server actions via useTransition.
// ==============================================================================

import React, { useEffect, useState, useTransition } from "react";
import { Badge, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TextInput, Select, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Label, Textarea } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import { getLeads, createLead, updateLead, deleteLead, convertLead, getLeadStats } from "@/app/actions/lead";

const statusColors: Record<string, string> = {
  NEW: "info",
  CONTACTED: "purple",
  QUALIFIED: "success",
  UNQUALIFIED: "gray",
  NURTURING: "warning",
  CONVERTED: "success",
  LOST: "failure",
};

const sourceLabels: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  SOCIAL_MEDIA: "Social Media",
  COLD_CALL: "Cold Call",
  EMAIL_CAMPAIGN: "Email Campaign",
  ADVERTISEMENT: "Advertisement",
  TRADE_SHOW: "Trade Show",
  PARTNER: "Partner",
  OTHER: "Other",
};

const LeadsClient = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 10, totalPages: 1 });
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "", phone: "", company_name: "",
    designation: "", source: "WEBSITE", notes: "",
  });

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [result, statsResult] = await Promise.all([
        getLeads({ page, perPage: 10, search, status: statusFilter, source: sourceFilter }),
        getLeadStats(),
      ]);
      if ("error" in result) {
        setError(result.error as string);
      } else {
        setLeads(result.data || []);
        setMeta(result.meta || { total: 0, page: 1, perPage: 10, totalPages: 1 });
      }
      if (statsResult && !("error" in statsResult)) setStats(statsResult.data);
    } catch (err: any) {
      setError(err.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, statusFilter, sourceFilter]); // eslint-disable-line
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchData(); }, 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  const openCreateModal = () => {
    setEditingLead(null);
    setFormData({ first_name: "", last_name: "", email: "", phone: "", company_name: "", designation: "", source: "WEBSITE", notes: "" });
    setModalOpen(true);
  };

  const openEditModal = (lead: any) => {
    setEditingLead(lead);
    setFormData({
      first_name: lead.first_name || "",
      last_name: lead.last_name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company_name: lead.company_name || "",
      designation: lead.designation || "",
      source: lead.source || "WEBSITE",
      notes: lead.notes || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        if (editingLead) {
          await updateLead({ id: editingLead.id, ...formData });
        } else {
          await createLead(formData);
        }
        setModalOpen(false);
        fetchData();
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  const handleDelete = () => {
    if (!selectedLeadId) return;
    startTransition(async () => {
      try {
        await deleteLead(selectedLeadId);
        setDeleteModalOpen(false);
        setSelectedLeadId(null);
        fetchData();
      } catch (err: any) { setError(err.message); }
    });
  };

  const handleConvert = (leadId: string) => {
    startTransition(async () => {
      try {
        await convertLead(leadId, true);
        fetchData();
      } catch (err: any) { setError(err.message); }
    });
  };

  return (
    <>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <CardBox className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total ?? 0}</p>
            <p className="text-sm text-gray-500">Total Leads</p>
          </CardBox>
          <CardBox className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.qualified ?? 0}</p>
            <p className="text-sm text-gray-500">Qualified</p>
          </CardBox>
          <CardBox className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.converted ?? 0}</p>
            <p className="text-sm text-gray-500">Converted</p>
          </CardBox>
          <CardBox className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.newThisMonth ?? 0}</p>
            <p className="text-sm text-gray-500">New This Month</p>
          </CardBox>
        </div>
      )}

      {/* Filters Bar */}
      <CardBox className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-line-duotone" height={18} />}
              placeholder="Search leads by name, email, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="UNQUALIFIED">Unqualified</option>
              <option value="NURTURING">Nurturing</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </Select>
          </div>
          <div className="w-44">
            <Select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}>
              <option value="">All Sources</option>
              {Object.entries(sourceLabels).map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </Select>
          </div>
          <Button color="info" onClick={openCreateModal}>
            <Icon icon="solar:add-circle-line-duotone" className="mr-2" height={18} />
            New Lead
          </Button>
        </div>
      </CardBox>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <Icon icon="solar:danger-triangle-line-duotone" className="inline mr-2" height={16} />{error}
        </div>
      )}

      {/* Data Table */}
      <CardBox>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
              <span className="ml-3 text-gray-500">Loading leads...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon icon="solar:magnet-wave-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No leads found</p>
              <p className="text-sm">Start adding leads to your pipeline.</p>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Company</TableHeadCell>
                <TableHeadCell>Source</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Score</TableHeadCell>
                <TableHeadCell>Owner</TableHeadCell>
                <TableHeadCell>Created</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {leads.map((lead: any) => (
                  <TableRow key={lead.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {lead.first_name} {lead.last_name}
                      <div className="text-xs text-gray-500">{lead.email}</div>
                    </TableCell>
                    <TableCell>{lead.company_name || "—"}</TableCell>
                    <TableCell>
                      <Badge color="purple">{sourceLabels[lead.source] || lead.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge color={statusColors[lead.status] || "gray"}>{lead.status}</Badge>
                    </TableCell>
                    <TableCell>{lead.lead_score ?? "—"}</TableCell>
                    <TableCell className="text-sm">
                      {lead.owner ? `${lead.owner.first_name} ${lead.owner.last_name}` : "Unassigned"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="xs" color="light" title="Edit" onClick={() => openEditModal(lead)}>
                          <Icon icon="solar:pen-line-duotone" height={14} />
                        </Button>
                        {lead.status !== "CONVERTED" && (
                          <Button size="xs" color="success" title="Convert to Customer" disabled={isPending} onClick={() => handleConvert(lead.id)}>
                            <Icon icon="solar:transfer-horizontal-line-duotone" height={14} />
                          </Button>
                        )}
                        <Button size="xs" color="failure" title="Delete" disabled={isPending} onClick={() => { setSelectedLeadId(lead.id); setDeleteModalOpen(true); }}>
                          <Icon icon="solar:trash-bin-trash-line-duotone" height={14} />
                        </Button>
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
              <Button size="xs" color="light" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button size="xs" color="light" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </CardBox>

      {/* Create / Edit Lead Modal */}
      <Modal show={modalOpen} size="lg" onClose={() => setModalOpen(false)}>
        <ModalHeader>{editingLead ? "Edit Lead" : "Create New Lead"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <TextInput id="first_name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <TextInput id="last_name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <TextInput id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <TextInput id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <TextInput id="company_name" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="designation">Designation</Label>
              <TextInput id="designation" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="source">Lead Source</Label>
              <Select id="source" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })}>
                {Object.entries(sourceLabels).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3">
          <Button color="gray" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button color="info" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Spinner size="sm" className="mr-2" /> : null}
            {editingLead ? "Update Lead" : "Create Lead"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModalOpen} size="md" onClose={() => setDeleteModalOpen(false)}>
        <ModalHeader>Confirm Lead Deletion</ModalHeader>
        <ModalBody>
          <div className="text-center">
            <Icon icon="solar:danger-triangle-line-duotone" height={48} className="mx-auto mb-4 text-red-500" />
            <p className="text-gray-500">Are you sure you want to delete this lead? This action cannot be undone.</p>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3">
          <Button color="gray" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button color="failure" onClick={handleDelete} disabled={isPending}>
            {isPending ? <Spinner size="sm" className="mr-2" /> : null}
            Yes, Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default LeadsClient;
