"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Textarea, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from "@/app/actions/inventory";

interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  is_default: boolean;
  is_active: boolean;
  _count?: { stock_items: number };
  created_at: string;
}

const WarehousesClient = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    code: "", name: "", address: "", city: "", state: "", pincode: "",
    contact_person: "", contact_phone: "", is_default: false, is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getWarehouses({ search });
    if ("error" in result) { setError(result.error as string); }
    else { setWarehouses((result as any).warehouses || []); setTotal((result as any).total || 0); }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: "", name: "", address: "", city: "", state: "", pincode: "", contact_person: "", contact_phone: "", is_default: false, is_active: true });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (w: Warehouse) => {
    setEditing(w);
    setForm({
      code: w.code, name: w.name, address: w.address || "", city: w.city || "",
      state: w.state || "", pincode: w.pincode || "", contact_person: w.contact_person || "",
      contact_phone: w.contact_phone || "", is_default: w.is_default, is_active: w.is_active,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const result = editing ? await updateWarehouse(editing.id, form) : await createWarehouse(form);
    if ("error" in result) {
      if ((result as any).details) setFormErrors((result as any).details);
      else setError(result.error as string);
    } else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteWarehouse(deleteModal);
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setDeleteModal(null);
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TextInput placeholder="Search warehouses..." value={search} onChange={(e) => setSearch(e.target.value)}
          icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-5 h-5" />} className="w-64" />
        <Button color="primary" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" /> Add Warehouse
        </Button>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>Code</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>City</TableHeadCell>
            <TableHeadCell>Contact</TableHeadCell>
            <TableHeadCell>Stock Items</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : warehouses.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No warehouses found</TableCell></TableRow>
            ) : warehouses.map((w) => (
              <TableRow key={w.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="font-mono font-semibold">{w.code}</TableCell>
                <TableCell className="font-medium">
                  {w.name}
                  {w.is_default && <Badge color="purple" className="ml-2 inline">Default</Badge>}
                </TableCell>
                <TableCell>{w.city || "—"}</TableCell>
                <TableCell className="text-sm">{w.contact_person || "—"}<br /><span className="text-gray-400">{w.contact_phone || ""}</span></TableCell>
                <TableCell><Badge color="info">{w._count?.stock_items ?? 0}</Badge></TableCell>
                <TableCell><Badge color={w.is_active ? "success" : "gray"}>{w.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="xs" color="light" onClick={() => openEdit(w)}><Icon icon="solar:pen-new-square-line-duotone" className="w-4 h-4" /></Button>
                    <Button size="xs" color="failure" onClick={() => setDeleteModal(w.id)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-gray-500">Total: {total} warehouses</div>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="xl">
        <ModalHeader>{editing ? "Edit Warehouse" : "Add Warehouse"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Code *</Label>
              <TextInput id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., WH-MAIN" color={formErrors.code ? "failure" : undefined} />
            </div>
            <div>
              <Label htmlFor="name">Name *</Label>
              <TextInput id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Main Warehouse" color={formErrors.name ? "failure" : undefined} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <TextInput id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <TextInput id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <TextInput id="pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="contact_person">Contact Person</Label>
              <TextInput id="contact_person" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <TextInput id="contact_phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_default" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="rounded" />
                <Label htmlFor="is_default">Default Warehouse</Label>
              </div>
              <div className="flex items-center gap-2">
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
        <ModalBody><p>Are you sure you want to delete this warehouse? This action cannot be undone.</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-2" /> : null}Delete</Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default WarehousesClient;
