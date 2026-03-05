"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Textarea, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getCourseCategories, createCourseCategory, updateCourseCategory, deleteCourseCategory } from "@/app/actions/elearning";

interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  parent?: { id: string; name: string } | null;
  _count?: { courses: number; children: number };
  created_at: string;
}

const CourseCategoriesClient = () => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CourseCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", parent_id: "", sort_order: 0, is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    const result = await getCourseCategories({ search, includeInactive: true });
    if ("error" in result) { setError(result.error as string); }
    else { setCategories((result as any).categories || []); }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", parent_id: "", sort_order: 0, is_active: true });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (cat: CourseCategory) => {
    setEditing(cat);
    setForm({
      name: cat.name, slug: cat.slug, description: cat.description || "",
      parent_id: cat.parent_id || "", sort_order: cat.sort_order, is_active: cat.is_active,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setSaving(true); setFormErrors({});
    const payload = { ...form, parent_id: form.parent_id || null, description: form.description || null };
    const result = editing
      ? await updateCourseCategory(editing.id, payload)
      : await createCourseCategory(payload);
    if ("error" in result) { setFormErrors((result as any).details || {}); setError(result.error as string); }
    else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteCourseCategory(deleteModal);
    if ("error" in result) setError(result.error as string);
    else { setDeleteModal(null); fetchData(); }
    setDeleting(false);
  };

  return (
    <div className="rounded-lg shadow-md bg-white dark:bg-gray-800 p-6">
      {error && <Alert color="failure" className="mb-4" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <TextInput icon={() => <Icon icon="solar:magnifer-line-duotone" className="text-lg" />}
          placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Button color="primary" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="mr-2 text-lg" /> Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No course categories found.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table hoverable>
            <TableHead>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Slug</TableHeadCell>
              <TableHeadCell>Parent</TableHeadCell>
              <TableHeadCell>Courses</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {categories.map(cat => (
                <TableRow key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-gray-500 text-sm">{cat.slug}</TableCell>
                  <TableCell>{cat.parent?.name || "—"}</TableCell>
                  <TableCell><Badge color="info">{cat._count?.courses || 0}</Badge></TableCell>
                  <TableCell><Badge color={cat.is_active ? "success" : "gray"}>{cat.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="xs" color="info" onClick={() => openEdit(cat)}><Icon icon="solar:pen-line-duotone" /></Button>
                      <Button size="xs" color="failure" onClick={() => setDeleteModal(cat.id)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>{editing ? "Edit Category" : "New Course Category"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <TextInput value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value, slug: editing ? f.slug : generateSlug(e.target.value) })); }}
                color={formErrors.name ? "failure" : undefined} />
            </div>
            <div>
              <Label>Slug *</Label>
              <TextInput value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                color={formErrors.slug ? "failure" : undefined} />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Parent Category</Label>
              <Select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}>
                <option value="">None (Top Level)</option>
                {categories.filter(c => c.id !== editing?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Sort Order</Label>
              <TextInput type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" />
              <Label>Active</Label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null}{editing ? "Update" : "Create"}
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Are you sure you want to delete this course category? This action cannot be undone.</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner size="sm" className="mr-2" /> : null}Delete
          </Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CourseCategoriesClient;
