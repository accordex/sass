"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getSalaryStructures, createSalaryStructure, deleteSalaryStructure } from "@/app/actions/payroll";

interface SalaryStructure {
  id: string; code: string; name: string; description: string | null; base_ctc: number | null; is_active: boolean;
  lines?: any[];
  _count?: { employee_salaries: number };
}

const formatCurrency = (v: number | null) => v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

const SalaryStructuresClient = () => {
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({ code: "", name: "", description: "", base_ctc: null as number | null });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getSalaryStructures({ search });
    if ("error" in result) setError(result.error as string);
    else { setStructures((result as any).structures || []); setTotal((result as any).total || 0); }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm({ code: "", name: "", description: "", base_ctc: null }); setFormErrors({}); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const data = { ...form, base_ctc: form.base_ctc ? Number(form.base_ctc) : null };
    const result = await createSalaryStructure(data);
    if ("error" in result) { if ((result as any).details) setFormErrors((result as any).details); else setError(result.error as string); }
    else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteSalaryStructure(deleteModal);
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setDeleteModal(null);
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TextInput placeholder="Search structures..." value={search} onChange={(e) => setSearch(e.target.value)} icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-5 h-5" />} className="w-64" />
        <Button color="primary" onClick={openCreate}><Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" />Add Structure</Button>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>Code</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Description</TableHeadCell>
            <TableHeadCell>Base CTC</TableHeadCell>
            <TableHeadCell>Components</TableHeadCell>
            <TableHeadCell>Employees</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : structures.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No salary structures found</TableCell></TableRow>
            ) : (
              structures.map((s) => (
                <TableRow key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-mono font-semibold">{s.code}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm text-gray-500 max-w-xs truncate">{s.description || "—"}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(s.base_ctc)}</TableCell>
                  <TableCell><Badge color="info">{s.lines?.length || 0}</Badge></TableCell>
                  <TableCell><Badge color="purple">{s._count?.employee_salaries ?? 0}</Badge></TableCell>
                  <TableCell><Badge color={s.is_active ? "success" : "gray"}>{s.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell>
                    <Button size="xs" color="failure" onClick={() => setDeleteModal(s.id)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-500">Total: {total} structures</div>

      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>Add Salary Structure</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Code *</Label><TextInput value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., STD-L1" color={formErrors.code ? "failure" : undefined} /></div>
              <div><Label>Base CTC</Label><TextInput type="number" value={form.base_ctc ?? ""} onChange={(e) => setForm({ ...form, base_ctc: e.target.value ? parseFloat(e.target.value) : null })} placeholder="e.g., 500000" /></div>
            </div>
            <div><Label>Name *</Label><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Standard Level 1" color={formErrors.name ? "failure" : undefined} /></div>
            <div><Label>Description</Label><TextInput value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner size="sm" className="mr-2" /> : null}Create</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Delete this salary structure? This cannot be undone.</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-2" /> : null}Delete</Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default SalaryStructuresClient;
