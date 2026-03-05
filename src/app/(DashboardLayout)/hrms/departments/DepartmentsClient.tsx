"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Select, Textarea, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "@/app/actions/hrms";

interface Department {
  id: string;
  dept_code: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  head_id: string | null;
  is_active: boolean;
  parent?: { id: string; name: string } | null;
  head?: { id: string; first_name: string; last_name: string } | null;
  _count?: { employees: number };
  created_at: string;
}

const DepartmentsClient = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form
  const [form, setForm] = useState({ dept_code: "", name: "", description: "", is_active: true });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getDepartments({ search });
    if ("error" in result) {
      setError(result.error as string);
    } else {
      setDepartments((result as any).departments || []);
      setTotal((result as any).total || 0);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingDept(null);
    setForm({ dept_code: "", name: "", description: "", is_active: true });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (dept: Department) => {
    setEditingDept(dept);
    setForm({ dept_code: dept.dept_code, name: dept.name, description: dept.description || "", is_active: dept.is_active });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const result = editingDept
      ? await updateDepartment(editingDept.id, form)
      : await createDepartment(form);

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
    const result = await deleteDepartment(deleteModal);
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setDeleteModal(null);
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TextInput
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-5 h-5" />}
          className="w-64"
        />
        <Button color="primary" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>Code</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Description</TableHeadCell>
            <TableHeadCell>Employees</TableHeadCell>
            <TableHeadCell>Head</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : departments.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No departments found</TableCell></TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-mono font-semibold">{dept.dept_code}</TableCell>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="text-gray-500 max-w-xs truncate">{dept.description || "—"}</TableCell>
                  <TableCell><Badge color="info">{dept._count?.employees ?? 0}</Badge></TableCell>
                  <TableCell>{dept.head ? `${dept.head.first_name} ${dept.head.last_name}` : "—"}</TableCell>
                  <TableCell><Badge color={dept.is_active ? "success" : "gray"}>{dept.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="xs" color="light" onClick={() => openEdit(dept)}><Icon icon="solar:pen-new-square-line-duotone" className="w-4 h-4" /></Button>
                      <Button size="xs" color="failure" onClick={() => setDeleteModal(dept.id)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-500">Total: {total} departments</div>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>{editingDept ? "Edit Department" : "Add Department"}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dept_code">Department Code *</Label>
              <TextInput id="dept_code" value={form.dept_code} onChange={(e) => setForm({ ...form, dept_code: e.target.value })} placeholder="e.g., ENG" color={formErrors.dept_code ? "failure" : undefined} />
            </div>
            <div>
              <Label htmlFor="name">Name *</Label>
              <TextInput id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Engineering" color={formErrors.name ? "failure" : undefined} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the department" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null}
            {editingDept ? "Update" : "Create"}
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Are you sure you want to delete this department? This action cannot be undone.</p></ModalBody>
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

export default DepartmentsClient;
