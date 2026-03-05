"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Select, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getEmployeeSalaries, createEmployeeSalary } from "@/app/actions/payroll";
import { getEmployees } from "@/app/actions/hrms";
import { getSalaryStructures } from "@/app/actions/payroll";

const formatCurrency = (v: number | null) => v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

const EmployeeSalaryClient = () => {
  const [salaries, setSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // Lookups
  const [employees, setEmployees] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const defaultForm = {
    employee_id: "", salary_structure_id: "",
    annual_ctc: 0, monthly_gross: 0, monthly_net: 0, basic_salary: 0,
    effective_from: new Date().toISOString().split("T")[0],
    tax_regime: "new", pf_applicable: true, esi_applicable: false, pt_applicable: true,
  };
  const [form, setForm] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getEmployeeSalaries({ page, search });
    if ("error" in result) setError(result.error as string);
    else { setSalaries((result as any).salaries || []); setTotal((result as any).total || 0); setTotalPages((result as any).totalPages || 1); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const loadLookups = async () => {
      const [empResult, structResult] = await Promise.all([
        getEmployees({ perPage: 100 }),
        getSalaryStructures(),
      ]);
      if (!("error" in empResult)) setEmployees((empResult as any).employees || []);
      if (!("error" in structResult)) setStructures((structResult as any).structures || []);
    };
    loadLookups();
  }, []);

  const openCreate = () => { setForm(defaultForm); setFormErrors({}); setShowModal(true); };

  // Auto-calculate basic salary (40% of CTC)
  const handleCTCChange = (ctc: number) => {
    const basic = Math.round(ctc * 0.4 / 12);
    const gross = Math.round(ctc / 12);
    const net = Math.round(gross * 0.75); // Rough estimate (25% deductions)
    setForm({ ...form, annual_ctc: ctc, basic_salary: basic, monthly_gross: gross, monthly_net: net });
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const result = await createEmployeeSalary(form);
    if ("error" in result) { if ((result as any).details) setFormErrors((result as any).details); else setError(result.error as string); }
    else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TextInput placeholder="Search employees..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-5 h-5" />} className="w-64" />
        <Button color="primary" onClick={openCreate}><Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" />Assign Salary</Button>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>Employee</TableHeadCell>
            <TableHeadCell>Department</TableHeadCell>
            <TableHeadCell>Structure</TableHeadCell>
            <TableHeadCell>Annual CTC</TableHeadCell>
            <TableHeadCell>Monthly Gross</TableHeadCell>
            <TableHeadCell>Monthly Net</TableHeadCell>
            <TableHeadCell>Basic</TableHeadCell>
            <TableHeadCell>Effective From</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : salaries.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No salary assignments found</TableCell></TableRow>
            ) : (
              salaries.map((s: any) => (
                <TableRow key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-medium">{s.employee?.first_name} {s.employee?.last_name} <span className="text-xs text-gray-400 ml-1">{s.employee?.employee_code}</span></TableCell>
                  <TableCell>{s.employee?.department?.name || "—"}</TableCell>
                  <TableCell><Badge color="indigo">{s.salary_structure?.name || "—"}</Badge></TableCell>
                  <TableCell className="font-mono">{formatCurrency(s.annual_ctc)}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(s.monthly_gross)}</TableCell>
                  <TableCell className="font-mono font-semibold text-green-600">{formatCurrency(s.monthly_net)}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(s.basic_salary)}</TableCell>
                  <TableCell className="text-sm">{new Date(s.effective_from).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Page {page} of {totalPages} ({total} records)</span>
        <div className="flex gap-2">
          <Button size="sm" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Button size="sm" color="light" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>

      {/* Assign Salary Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="2xl">
        <ModalHeader>Assign Employee Salary</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee *</Label>
                <Select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
                  <option value="">Select Employee</option>
                  {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_code})</option>)}
                </Select>
              </div>
              <div>
                <Label>Salary Structure *</Label>
                <Select value={form.salary_structure_id} onChange={(e) => setForm({ ...form, salary_structure_id: e.target.value })}>
                  <option value="">Select Structure</option>
                  {structures.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Annual CTC *</Label>
                <TextInput type="number" value={form.annual_ctc} onChange={(e) => handleCTCChange(parseFloat(e.target.value) || 0)} placeholder="e.g., 600000" />
              </div>
              <div>
                <Label>Effective From *</Label>
                <TextInput type="date" value={form.effective_from} onChange={(e) => setForm({ ...form, effective_from: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Monthly Gross</Label><TextInput type="number" value={form.monthly_gross} onChange={(e) => setForm({ ...form, monthly_gross: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Monthly Net</Label><TextInput type="number" value={form.monthly_net} onChange={(e) => setForm({ ...form, monthly_net: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Basic Salary</Label><TextInput type="number" value={form.basic_salary} onChange={(e) => setForm({ ...form, basic_salary: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.pf_applicable} onChange={(e) => setForm({ ...form, pf_applicable: e.target.checked })} className="rounded" />PF Applicable</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.esi_applicable} onChange={(e) => setForm({ ...form, esi_applicable: e.target.checked })} className="rounded" />ESI Applicable</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.pt_applicable} onChange={(e) => setForm({ ...form, pt_applicable: e.target.checked })} className="rounded" />PT Applicable</label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner size="sm" className="mr-2" /> : null}Assign Salary</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EmployeeSalaryClient;
