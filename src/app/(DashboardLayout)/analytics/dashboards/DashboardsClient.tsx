"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button, TextInput, Label, Spinner, Badge, Textarea, Modal, ModalHeader, ModalBody, ModalFooter,
  Alert, Select, ToggleSwitch, Card,
} from "flowbite-react";
import { Icon } from "@iconify/react";
import {
  getAnalyticsDashboards, createAnalyticsDashboard, updateAnalyticsDashboard, deleteAnalyticsDashboard,
} from "@/app/actions/ai-enhancement";

interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  is_default: boolean;
  is_shared: boolean;
  refresh_interval: number;
  creator: { first_name: string; last_name: string };
  _count?: { widgets: number };
  created_at: string;
}

const DashboardsClient = () => {
  const [dashboards, setDashboards] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DashboardItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const emptyForm = {
    title: "", description: "", is_default: false, is_shared: false, refresh_interval: 300,
  };
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    const result = await getAnalyticsDashboards({ page, perPage: 20, search });
    if ("error" in result) setError(result.error as string);
    else {
      setDashboards((result as any).data || []);
      setTotalPages((result as any).meta?.totalPages || 1);
      setTotal((result as any).meta?.total || 0);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormErrors({}); setShowModal(true); };
  const openEdit = (d: DashboardItem) => {
    setEditing(d);
    setForm({
      title: d.title, description: d.description || "",
      is_default: d.is_default, is_shared: d.is_shared, refresh_interval: d.refresh_interval,
    });
    setFormErrors({}); setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true); setFormErrors({});
    const payload = editing ? { id: editing.id, ...form } : form;
    const result = editing ? await updateAnalyticsDashboard(payload) : await createAnalyticsDashboard(payload);
    if ("error" in result) {
      if (typeof result.error === "object") setFormErrors(result.error as any);
      else setError(result.error as string);
    } else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteAnalyticsDashboard(deleteModal);
    if ("error" in result) setError(result.error as string);
    else { setDeleteModal(null); fetchData(); }
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center gap-3">
        <TextInput placeholder="Search dashboards..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-4 h-4" />} className="w-64" />
        <div className="flex-1" />
        <Badge color="gray">{total} dashboard{total !== 1 ? "s" : ""}</Badge>
        <Button size="sm" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-4 h-4 mr-1" /> New Dashboard
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : dashboards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No custom dashboards yet. Create your first dashboard.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboards.map((d) => (
            <Card key={d.id} className="relative">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="solar:screencast-2-line-duotone" className="w-5 h-5 text-indigo-500" />
                    <h5 className="text-lg font-semibold">{d.title}</h5>
                  </div>
                  {d.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{d.description}</p>}
                </div>
                <div className="flex gap-1">
                  {d.is_default && <Badge color="success" size="xs">Default</Badge>}
                  {d.is_shared && <Badge color="info" size="xs">Shared</Badge>}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:widget-4-line-duotone" className="w-4 h-4" />
                    {d._count?.widgets || 0} widgets
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:refresh-line-duotone" className="w-4 h-4" />
                    {d.refresh_interval}s
                  </span>
                </div>
                <span>by {d.creator.first_name} {d.creator.last_name}</span>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Button size="xs" color="light" onClick={() => openEdit(d)}>
                  <Icon icon="solar:pen-2-line-duotone" className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button size="xs" color="failure" onClick={() => setDeleteModal(d.id)}>
                  <Icon icon="solar:trash-bin-trash-line-duotone" className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button size="xs" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-gray-500">Page {page} of {totalPages}</span>
          <Button size="xs" color="light" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>{editing ? "Edit Dashboard" : "Create Dashboard"}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Dashboard Title *</Label>
              <TextInput id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                color={formErrors.title ? "failure" : undefined} />
              {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title[0]}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="refresh">Refresh Interval (seconds)</Label>
                <TextInput id="refresh" type="number" value={form.refresh_interval}
                  onChange={(e) => setForm({ ...form, refresh_interval: Number(e.target.value) })} />
              </div>
              <div className="space-y-3 pt-6">
                <ToggleSwitch checked={form.is_default} onChange={(val) => setForm({ ...form, is_default: val })} label="Default Dashboard" />
                <ToggleSwitch checked={form.is_shared} onChange={(val) => setForm({ ...form, is_shared: val })} label="Shared with Team" />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null}
            {editing ? "Update" : "Create"}
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Are you sure you want to delete this dashboard and all its widgets?</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner size="sm" className="mr-2" /> : null} Delete
          </Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DashboardsClient;
