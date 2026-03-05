"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Select, Textarea, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getProductCategories, createProductCategory, updateProductCategory, deleteProductCategory } from "@/app/actions/inventory";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  parent?: { name: string } | null;
  _count?: { products: number; children: number };
  created_at: string;
}

const CategoriesClient = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({ name: "", slug: "", description: "", parent_id: "", sort_order: 0, is_active: true });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getProductCategories({ search });
    if ("error" in result) { setError(result.error as string); }
    else { setCategories((result as any).categories || []); setTotal((result as any).total || 0); }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", parent_id: "", sort_order: 0, is_active: true });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name, slug: c.slug, description: c.description || "",
      parent_id: c.parent_id || "", sort_order: c.sort_order, is_active: c.is_active,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const payload = { ...form, parent_id: form.parent_id || null };
    const result = editing ? await updateProductCategory(editing.id, payload) : await createProductCategory(payload);
    if ("error" in result) {
      if ((result as any).details) setFormErrors((result as any).details);
      else setError(result.error as string);
    } else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteProductCategory(deleteModal);
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setDeleteModal(null);
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TextInput placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)}
          icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-5 h-5" />} className="w-64" />
        <Button color="primary" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" /> Add Category
        </Button>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Slug</TableHeadCell>
            <TableHeadCell>Parent</TableHeadCell>
            <TableHeadCell>Products</TableHeadCell>
            <TableHeadCell>Sub-Categories</TableHeadCell>
            <TableHeadCell>Order</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : categories.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No categories found</TableCell></TableRow>
            ) : categories.map((c) => (
              <TableRow key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="font-mono text-sm text-gray-500">{c.slug}</TableCell>
                <TableCell>{c.parent?.name || "—"}</TableCell>
                <TableCell><Badge color="info">{c._count?.products ?? 0}</Badge></TableCell>
                <TableCell><Badge color="purple">{c._count?.children ?? 0}</Badge></TableCell>
                <TableCell>{c.sort_order}</TableCell>
                <TableCell><Badge color={c.is_active ? "success" : "gray"}>{c.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="xs" color="light" onClick={() => openEdit(c)}><Icon icon="solar:pen-new-square-line-duotone" className="w-4 h-4" /></Button>
                    <Button size="xs" color="failure" onClick={() => setDeleteModal(c.id)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-gray-500">Total: {total} categories</div>

      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>{editing ? "Edit Category" : "Add Category"}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <TextInput id="name" value={form.name}
                onChange={(e) => { const n = e.target.value; setForm({ ...form, name: n, slug: editing ? form.slug : autoSlug(n) }); }}
                placeholder="e.g., Electronics" color={formErrors.name ? "failure" : undefined} />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <TextInput id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="electronics" color={formErrors.slug ? "failure" : undefined} />
            </div>
            <div>
              <Label htmlFor="parent_id">Parent Category</Label>
              <Select id="parent_id" value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
                <option value="">— None (Top Level) —</option>
                {categories.filter(c => c.id !== editing?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <TextInput id="sort_order" type="number" value={String(form.sort_order)} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
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
        <ModalBody><p>Are you sure you want to delete this category? Sub-categories and products won&apos;t be deleted but will be unlinked.</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-2" /> : null}Delete</Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CategoriesClient;
