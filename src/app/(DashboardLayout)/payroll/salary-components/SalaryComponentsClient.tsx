"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Select, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getSalaryComponents, createSalaryComponent, updateSalaryComponent, deleteSalaryComponent } from "@/app/actions/payroll";

interface SalaryComponent {
  id: string; code: string; name: string; description: string | null;
  component_type: string; calculation_method: string; percentage_value: number | null;
  is_taxable: boolean; is_part_of_ctc: boolean; is_statutory: boolean;
  statutory_code: string | null; sort_order: number; is_active: boolean;
}

const SalaryComponentsClient = () => {
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SalaryComponent | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const defaultForm = { code: "", name: "", description: "", component_type: "EARNING", calculation_method: "FIXED", percentage_value: null as number | null, is_taxable: true, is_part_of_ctc: true, is_statutory: false, statutory_code: "", sort_order: 0 };
  const [form, setForm] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getSalaryComponents({ search, component_type: typeFilter });
    if ("error" in result) setError(result.error as string);
    else { setComponents((result as any).components || []); setTotal((result as any).total || 0); }
    setLoading(false);
  }, [search, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setFormErrors({}); setShowModal(true); };

  const openEdit = (c: SalaryComponent) => {
    setEditing(c);
    setForm({ code: c.code, name: c.name, description: c.description || "", component_type: c.component_type, calculation_method: c.calculation_method, percentage_value: c.percentage_value, is_taxable: c.is_taxable, is_part_of_ctc: c.is_part_of_ctc, is_statutory: c.is_statutory, statutory_code: c.statutory_code || "", sort_order: c.sort_order });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const data = { ...form, sort_order: Number(form.sort_order), percentage_value: form.percentage_value ? Number(form.percentage_value) : null, statutory_code: form.statutory_code || null };
    const result = editing ? await updateSalaryComponent(editing.id, data) : await createSalaryComponent(data);
    if ("error" in result) { if ((result as any).details) setFormErrors((result as any).details); else setError(result.error as string); }
    else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteSalaryComponent(deleteModal);
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setDeleteModal(null);
    setDeleting(false);
  };

  const earnings = components.filter((c) => c.component_type === "EARNING");
  const deductions = components.filter((c) => c.component_type === "DEDUCTION");

  const renderTable = (items: SalaryComponent[], label: string, color: string) => (
    <div>
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Badge color={color as any}>{label}</Badge><span className="text-sm text-gray-400">({items.length})</span></h3>
      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>Code</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Method</TableHeadCell>
            <TableHeadCell>%</TableHeadCell>
            <TableHeadCell>Taxable</TableHeadCell>
            <TableHeadCell>CTC</TableHeadCell>
            <TableHeadCell>Statutory</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-4 text-gray-500">No {label.toLowerCase()}</TableCell></TableRow>
            ) : items.map((c) => (
              <TableRow key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell><Badge color="gray">{c.calculation_method.replace(/_/g, " ")}</Badge></TableCell>
                <TableCell>{c.percentage_value != null ? `${c.percentage_value}%` : "—"}</TableCell>
                <TableCell>{c.is_taxable ? <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-green-500" /> : <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-gray-300" />}</TableCell>
                <TableCell>{c.is_part_of_ctc ? "Yes" : "No"}</TableCell>
                <TableCell>{c.is_statutory ? <Badge color="indigo">{c.statutory_code || "Yes"}</Badge> : "No"}</TableCell>
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
    </div>
  );

  return (
    <div className="space-y-6">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <TextInput placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-5 h-5" />} className="w-64" />
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="EARNING">Earnings</option>
            <option value="DEDUCTION">Deductions</option>
          </Select>
        </div>
        <Button color="primary" onClick={openCreate}><Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" />Add Component</Button>
      </div>

      {loading ? <div className="text-center py-12"><Spinner size="xl" /></div> : (
        <div className="space-y-6">
          {(!typeFilter || typeFilter === "EARNING") && renderTable(earnings, "Earnings", "success")}
          {(!typeFilter || typeFilter === "DEDUCTION") && renderTable(deductions, "Deductions", "failure")}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="xl">
        <ModalHeader>{editing ? "Edit Component" : "Add Salary Component"}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Code *</Label><TextInput value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., BASIC" color={formErrors.code ? "failure" : undefined} /></div>
              <div><Label>Name *</Label><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Basic Salary" color={formErrors.name ? "failure" : undefined} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Type *</Label><Select value={form.component_type} onChange={(e) => setForm({ ...form, component_type: e.target.value })}><option value="EARNING">Earning</option><option value="DEDUCTION">Deduction</option></Select></div>
              <div><Label>Calculation Method</Label><Select value={form.calculation_method} onChange={(e) => setForm({ ...form, calculation_method: e.target.value })}>
                <option value="FIXED">Fixed</option><option value="PERCENTAGE_OF_BASIC">% of Basic</option><option value="PERCENTAGE_OF_GROSS">% of Gross</option><option value="PERCENTAGE_OF_CTC">% of CTC</option><option value="FORMULA">Formula</option>
              </Select></div>
              <div><Label>Percentage Value</Label><TextInput type="number" step="0.01" value={form.percentage_value ?? ""} onChange={(e) => setForm({ ...form, percentage_value: e.target.value ? parseFloat(e.target.value) : null })} /></div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_taxable} onChange={(e) => setForm({ ...form, is_taxable: e.target.checked })} className="rounded" />Taxable</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_part_of_ctc} onChange={(e) => setForm({ ...form, is_part_of_ctc: e.target.checked })} className="rounded" />Part of CTC</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_statutory} onChange={(e) => setForm({ ...form, is_statutory: e.target.checked })} className="rounded" />Statutory</label>
            </div>
            {form.is_statutory && <div><Label>Statutory Code</Label><TextInput value={form.statutory_code} onChange={(e) => setForm({ ...form, statutory_code: e.target.value })} placeholder="e.g., PF, ESI, PT" /></div>}
            <div><Label>Sort Order</Label><TextInput type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
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
        <ModalBody><p>Are you sure you want to delete this salary component?</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-2" /> : null}Delete</Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default SalaryComponentsClient;
