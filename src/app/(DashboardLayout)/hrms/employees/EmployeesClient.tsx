"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Select, Textarea, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getEmployeeStats } from "@/app/actions/hrms";
import { getDepartments, getDesignations } from "@/app/actions/hrms";

interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  employment_type: string;
  status: string;
  date_of_joining: string;
  department?: { id: string; name: string; dept_code: string } | null;
  designation?: { id: string; title: string; code: string } | null;
  reporting_manager?: { id: string; first_name: string; last_name: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "success", ON_NOTICE: "warning", SEPARATED: "failure",
  ON_LEAVE: "purple", SUSPENDED: "failure", ABSCONDING: "failure",
};

const EmployeesClient = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [error, setError] = useState("");

  // Lookups
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const defaultForm = {
    employee_code: "", first_name: "", last_name: "", email: "", phone: "",
    department_id: "", designation_id: "", employment_type: "FULL_TIME",
    date_of_joining: new Date().toISOString().split("T")[0],
    gender: "", status: "ACTIVE",
  };
  const [form, setForm] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getEmployees({ page, search, status: statusFilter, department_id: deptFilter });
    if ("error" in result) {
      setError(result.error as string);
    } else {
      setEmployees((result as any).employees || []);
      setTotal((result as any).total || 0);
      setTotalPages((result as any).totalPages || 1);
    }
    setLoading(false);
  }, [page, search, statusFilter, deptFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const loadLookups = async () => {
      const [deptResult, desigResult] = await Promise.all([getDepartments(), getDesignations()]);
      if (!("error" in deptResult)) setDepartments((deptResult as any).departments || []);
      if (!("error" in desigResult)) setDesignations((desigResult as any).designations || []);
    };
    loadLookups();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({
      employee_code: emp.employee_code,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone || "",
      department_id: emp.department?.id || "",
      designation_id: emp.designation?.id || "",
      employment_type: emp.employment_type,
      date_of_joining: emp.date_of_joining ? new Date(emp.date_of_joining).toISOString().split("T")[0] : "",
      gender: emp.gender || "",
      status: emp.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const data = {
      ...form,
      department_id: form.department_id || null,
      designation_id: form.designation_id || null,
      gender: form.gender || null,
    };
    const result = editing ? await updateEmployee(editing.id, data) : await createEmployee(data);
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
    const result = await deleteEmployee(deleteModal);
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setDeleteModal(null);
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <TextInput placeholder="Search employees..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-5 h-5" />} className="w-64" />
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_NOTICE">On Notice</option>
          <option value="SEPARATED">Separated</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="SUSPENDED">Suspended</option>
        </Select>
        <Select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}>
          <option value="">All Departments</option>
          {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <div className="ml-auto">
          <Button color="primary" onClick={openCreate}><Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" />Add Employee</Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>Code</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Email</TableHeadCell>
            <TableHeadCell>Department</TableHeadCell>
            <TableHeadCell>Designation</TableHeadCell>
            <TableHeadCell>Type</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Joining Date</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : employees.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">No employees found</TableCell></TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-mono text-sm">{emp.employee_code}</TableCell>
                  <TableCell className="font-medium">{emp.first_name} {emp.last_name}</TableCell>
                  <TableCell className="text-sm">{emp.email}</TableCell>
                  <TableCell><Badge color="indigo">{emp.department?.name || "—"}</Badge></TableCell>
                  <TableCell className="text-sm">{emp.designation?.title || "—"}</TableCell>
                  <TableCell><Badge color="info">{emp.employment_type.replace("_", " ")}</Badge></TableCell>
                  <TableCell><Badge color={STATUS_COLORS[emp.status] || "gray"}>{emp.status.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-sm">{emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="xs" color="light" onClick={() => openEdit(emp)}><Icon icon="solar:pen-new-square-line-duotone" className="w-4 h-4" /></Button>
                      <Button size="xs" color="failure" onClick={() => setDeleteModal(emp.id)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Showing page {page} of {totalPages} ({total} employees)</span>
        <div className="flex gap-2">
          <Button size="sm" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Button size="sm" color="light" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="2xl">
        <ModalHeader>{editing ? "Edit Employee" : "Add Employee"}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="employee_code">Employee Code *</Label>
                <TextInput id="employee_code" value={form.employee_code} onChange={(e) => setForm({ ...form, employee_code: e.target.value })} placeholder="EMP-0001" color={formErrors.employee_code ? "failure" : undefined} />
              </div>
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <TextInput id="first_name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} color={formErrors.first_name ? "failure" : undefined} />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <TextInput id="last_name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} color={formErrors.last_name ? "failure" : undefined} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <TextInput type="email" id="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} color={formErrors.email ? "failure" : undefined} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <TextInput id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="department_id">Department</Label>
                <Select id="department_id" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                  <option value="">Select Department</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="designation_id">Designation</Label>
                <Select id="designation_id" value={form.designation_id} onChange={(e) => setForm({ ...form, designation_id: e.target.value })}>
                  <option value="">Select Designation</option>
                  {designations.map((d: any) => <option key={d.id} value={d.id}>{d.title}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select id="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select id="employment_type" value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })}>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                  <option value="FREELANCER">Freelancer</option>
                  <option value="PROBATION">Probation</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_NOTICE">On Notice</option>
                  <option value="SEPARATED">Separated</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="SUSPENDED">Suspended</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="date_of_joining">Joining Date *</Label>
                <TextInput type="date" id="date_of_joining" value={form.date_of_joining} onChange={(e) => setForm({ ...form, date_of_joining: e.target.value })} color={formErrors.date_of_joining ? "failure" : undefined} />
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
        <ModalHeader>Confirm Separation</ModalHeader>
        <ModalBody><p>Are you sure you want to separate this employee? Their record will be marked as separated.</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-2" /> : null}Confirm</Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EmployeesClient;
