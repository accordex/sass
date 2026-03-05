"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getUnitsOfMeasure, createUOM, updateUOM, deleteUOM } from "@/app/actions/inventory";

interface UOM {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

const UOMClient = () => {
  const [units, setUnits] = useState<UOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UOM | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({ code: "", name: "", is_active: true });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getUnitsOfMeasure({ search });
    if ("error" in result) { setError(result.error as string); }
    else { setUnits((result as any).units || []); setTotal((result as any).total || 0); }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: "", name: "", is_active: true });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (u: UOM) => {
    setEditing(u);
    setForm({ code: u.code, name: u.name, is_active: u.is_active });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const result = editing ? await updateUOM(editing.id, form) : await createUOM(form);
    if ("error" in result) {
      if ((result as any).details) setFormErrors((result as any).details);
      else setError(result.error as string);
    } else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteUOM(deleteModal);
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setDeleteModal(null);
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TextInput placeholder="Search units..." value={search} onChange={(e) => setSearch(e.target.value)}
          icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-5 h-5" />} className="w-64" />
        <Button color="primary" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" /> Add Unit
        </Button>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>Code</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : units.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">No units found</TableCell></TableRow>
            ) : units.map((u) => (
              <TableRow key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="font-mono font-semibold">{u.code}</TableCell>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell><Badge color={u.is_active ? "success" : "gray"}>{u.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="xs" color="light" onClick={() => openEdit(u)}><Icon icon="solar:pen-new-square-line-duotone" className="w-4 h-4" /></Button>
                    <Button size="xs" color="failure" onClick={() => setDeleteModal(u.id)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-gray-500">Total: {total} units</div>

      <Modal show={showModal} onClose={() => setShowModal(false)} size="md">
        <ModalHeader>{editing ? "Edit Unit" : "Add Unit"}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Code *</Label>
              <TextInput id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., KG" color={formErrors.code ? "failure" : undefined} />
            </div>
            <div>
              <Label htmlFor="name">Name *</Label>
              <TextInput id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Kilogram" color={formErrors.name ? "failure" : undefined} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner size="sm" className="mr-2" /> : null}{editing ? "Update" : "Create"}</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Are you sure you want to delete this unit? This action cannot be undone.</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-2" /> : null}Delete</Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default UOMClient;
