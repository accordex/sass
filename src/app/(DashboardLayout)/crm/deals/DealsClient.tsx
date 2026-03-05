"use client";

// ==============================================================================
// Deals List Client Component
// ==============================================================================
// CRUD for deals / opportunities with pipeline, stage filters, deal stats,
// and stage progression. Uses server actions.
// ==============================================================================

import React, { useEffect, useState, useTransition } from "react";
import { Badge, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TextInput, Select, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Label, Textarea } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import { getDeals, createDeal, updateDeal, deleteDeal, getPipelines, getDealStats } from "@/app/actions/deal";

const statusColors: Record<string, string> = {
  OPEN: "info",
  WON: "success",
  LOST: "failure",
  ABANDONED: "dark",
};

const DealsClient = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 10, totalPages: 1 });
  const [stats, setStats] = useState<any>(null);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [formData, setFormData] = useState({
    deal_name: "", deal_value: "", expected_close_date: "", pipeline_id: "",
    stage_id: "", customer_id: "", contact_id: "", description: "",
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [result, statsResult, pipelineResult] = await Promise.all([
        getDeals({ page, perPage: 10, search, pipeline_id: pipelineFilter }),
        getDealStats(),
        getPipelines(),
      ]);
      if ("error" in result) {
        setError(result.error as string);
      } else {
        setDeals(result.data || []);
        setMeta(result.meta || { total: 0, page: 1, perPage: 10, totalPages: 1 });
      }
      if (statsResult && !("error" in statsResult)) setStats(statsResult.data);
      if (pipelineResult && !("error" in pipelineResult)) setPipelines(pipelineResult.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, pipelineFilter]); // eslint-disable-line
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchData(); }, 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  const openCreateModal = () => {
    setEditingDeal(null);
    setFormData({
      deal_name: "", deal_value: "", expected_close_date: "", pipeline_id: pipelines[0]?.id || "",
      stage_id: "", customer_id: "", contact_id: "", description: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (deal: any) => {
    setEditingDeal(deal);
    setFormData({
      deal_name: deal.deal_name || "",
      deal_value: String(deal.deal_value || ""),
      expected_close_date: deal.expected_close_date ? new Date(deal.expected_close_date).toISOString().split("T")[0] : "",
      pipeline_id: deal.pipeline_id || "",
      stage_id: deal.stage_id || "",
      customer_id: deal.customer_id || "",
      contact_id: deal.contact_id || "",
      description: deal.description || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const submitData = {
          ...formData,
          deal_value: parseFloat(formData.deal_value) || 0,
        };
        if (editingDeal) {
          await updateDeal({ id: editingDeal.id, ...submitData });
        } else {
          await createDeal(submitData);
        }
        setModalOpen(false);
        fetchData();
      } catch (err: any) { setError(err.message); }
    });
  };

  const handleDelete = () => {
    if (!selectedId) return;
    startTransition(async () => {
      try {
        await deleteDeal(selectedId);
        setDeleteModalOpen(false);
        setSelectedId(null);
        fetchData();
      } catch (err: any) { setError(err.message); }
    });
  };

  // Get stages for the selected pipeline
  const selectedPipelineStages = pipelines.find((p: any) => p.id === formData.pipeline_id)?.stages || [];

  return (
    <>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <CardBox className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total ?? 0}</p>
            <p className="text-sm text-gray-500">Total Deals</p>
          </CardBox>
          <CardBox className="text-center">
            <p className="text-2xl font-bold text-green-600">
              ₹{Number(stats.totalValue ?? 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Pipeline Value</p>
          </CardBox>
          <CardBox className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.won ?? 0}</p>
            <p className="text-sm text-gray-500">Won Deals</p>
          </CardBox>
          <CardBox className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              ₹{Number(stats.wonValue ?? 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Won Value</p>
          </CardBox>
        </div>
      )}

      {/* Filters */}
      <CardBox className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-line-duotone" height={18} />}
              placeholder="Search deals by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select value={pipelineFilter} onChange={(e) => { setPipelineFilter(e.target.value); setPage(1); }}>
              <option value="">All Pipelines</option>
              {pipelines.map((p: any) => (
                <option key={p.id} value={p.id}>{p.pipeline_name}</option>
              ))}
            </Select>
          </div>
          <Badge color="dark" className="px-3 py-1">Total: {meta.total}</Badge>
          <Button color="info" onClick={openCreateModal}>
            <Icon icon="solar:add-circle-line-duotone" className="mr-2" height={18} />
            New Deal
          </Button>
        </div>
      </CardBox>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <Icon icon="solar:danger-triangle-line-duotone" className="inline mr-2" height={16} />{error}
        </div>
      )}

      <CardBox>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
              <span className="ml-3 text-gray-500">Loading deals...</span>
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon icon="solar:graph-new-up-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No deals found</p>
              <p className="text-sm">Create your first deal to start tracking opportunities.</p>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Deal Name</TableHeadCell>
                <TableHeadCell>Customer</TableHeadCell>
                <TableHeadCell>Stage</TableHeadCell>
                <TableHeadCell>Value</TableHeadCell>
                <TableHeadCell>Probability</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Expected Close</TableHeadCell>
                <TableHeadCell>Owner</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {deals.map((deal: any) => (
                  <TableRow key={deal.id}>
                    <TableCell className="whitespace-nowrap font-medium">{deal.deal_name}</TableCell>
                    <TableCell>{deal.customer?.display_name || deal.customer?.company_name || "—"}</TableCell>
                    <TableCell>
                      <Badge color="purple">{deal.stage?.stage_name || "—"}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">₹{Number(deal.deal_value || 0).toLocaleString()}</TableCell>
                    <TableCell>{deal.probability ?? "—"}%</TableCell>
                    <TableCell>
                      <Badge color={statusColors[deal.status] || "gray"}>{deal.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {deal.owner ? `${deal.owner.first_name} ${deal.owner.last_name}` : "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="xs" color="light" title="Edit" onClick={() => openEditModal(deal)}>
                          <Icon icon="solar:pen-line-duotone" height={14} />
                        </Button>
                        <Button size="xs" color="failure" title="Delete" disabled={isPending} onClick={() => { setSelectedId(deal.id); setDeleteModalOpen(true); }}>
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

      {/* Create / Edit Deal Modal */}
      <Modal show={modalOpen} size="xl" onClose={() => setModalOpen(false)}>
        <ModalHeader>{editingDeal ? "Edit Deal" : "Create New Deal"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="deal_name">Deal Name *</Label>
              <TextInput id="deal_name" value={formData.deal_name} onChange={(e) => setFormData({ ...formData, deal_name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="deal_value">Deal Value (₹)</Label>
              <TextInput id="deal_value" type="number" value={formData.deal_value} onChange={(e) => setFormData({ ...formData, deal_value: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="expected_close_date">Expected Close Date</Label>
              <TextInput id="expected_close_date" type="date" value={formData.expected_close_date} onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="pipeline_id">Pipeline *</Label>
              <Select id="pipeline_id" value={formData.pipeline_id} onChange={(e) => setFormData({ ...formData, pipeline_id: e.target.value, stage_id: "" })}>
                <option value="">Select Pipeline</option>
                {pipelines.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.pipeline_name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="stage_id">Stage</Label>
              <Select id="stage_id" value={formData.stage_id} onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })}>
                <option value="">Select Stage</option>
                {selectedPipelineStages.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.stage_name}</option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3">
          <Button color="gray" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button color="info" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Spinner size="sm" className="mr-2" /> : null}
            {editingDeal ? "Update Deal" : "Create Deal"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={deleteModalOpen} size="md" onClose={() => setDeleteModalOpen(false)}>
        <ModalHeader>Confirm Deal Deletion</ModalHeader>
        <ModalBody>
          <div className="text-center">
            <Icon icon="solar:danger-triangle-line-duotone" height={48} className="mx-auto mb-4 text-red-500" />
            <p className="text-gray-500">Are you sure you want to delete this deal?</p>
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

export default DealsClient;
