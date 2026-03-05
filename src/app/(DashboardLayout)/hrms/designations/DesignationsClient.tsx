"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Textarea, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getDesignations, createDesignation, updateDesignation, deleteDesignation } from "@/app/actions/hrms";

interface Designation {
  id: string;
  code: string;
  title: string;
  description: string | null;
  grade: string | null;
  sort_order: number;
  is_active: boolean;
  _count?: { employees: number };
}

const DesignationsClient = () => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Designation | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({ code: "", title: "", description: "", grade: "", sort_order: 0, is_active: true });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getDesignations({ search });
    if ("error" in result) {
      setError(result.error as string);
    } else {
      setDesignations((result as any).designations || []);
      setTotal((result as any).total || 0);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: "", title: "", description: "", grade: "", sort_order: 0, is_active: true });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (d: Designation) => {
    setEditing(d);
    setForm({ code: d.code, title: d.title, description: d.description || "", grade: d.grade || "", sort_order: d.sort_order, is_active: d.is_active });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const data = { ...form, sort_order: Number(form.sort_order) };
    const result = editing ? await updateDesignation(editing.id, data) : await createDesignation(data);
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
    const result = await deleteDesignation(deleteModal);
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setDeleteModal(null);
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TextInput placeholder="Search designations..." value={search} onChange={(e) => setSearch(e.target.value)} icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-5 h-5" />} className="w-64" />
        <Button color="primary" onClick={openCreate}><Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" />Add Designation</Button>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>Code</TableHeadCell>
            <TableHeadCell>Title</TableHeadCell>
            <TableHeadCell>Grade</TableHeadCell>
            <TableHeadCell>Employees</TableHeadCell>
            <TableHeadCell>Order</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : designations.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No designations found</TableCell></TableRow>
            ) : (
              designations.map((d) => (
                <TableRow key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-mono font-semibold">{d.code}</TableCell>
                  <TableCell className="font-medium">{d.title}</TableCell>
                  <TableCell><Badge color="purple">{d.grade || "—"}</Badge></TableCell>
                  <TableCell><Badge color="info">{d._count?.employees ?? 0}</Badge></TableCell>
                  <TableCell>{d.sort_order}</TableCell>
                  <TableCell><Badge color={d.is_active ? "success" : "gray"}>{d.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="xs" color="light" onClick={() => openEdit(d)}><Icon icon="solar:pen-new-square-line-duotone" className="w-4 h-4" /></Button>
                      <Button size="xs" color="failure" onClick={() => setDeleteModal(d.id)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-500">Total: {total} designations</div>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>{editing ? "Edit Designation" : "Add Designation"}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Code *</Label>
                <TextInput id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., SE" color={formErrors.code ? "failure" : undefined} />
              </div>
              <div>
                <Label htmlFor="grade">Grade</Label>
                <TextInput id="grade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="e.g., L1" />
              </div>
            </div>
            <div>
              <Label htmlFor="title">Title *</Label>
              <TextInput id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Software Engineer" color={formErrors.title ? "failure" : undefined} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <TextInput type="number" id="sort_order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner size="sm" className="mr-2" /> : null}{editing ? "Update" : "Create"}</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Are you sure you want to delete this designation?</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-2" /> : null}Delete</Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DesignationsClient;
