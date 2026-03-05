"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getLeaveTypes, createLeaveType, updateLeaveType } from "@/app/actions/hrms";

interface LeaveType {
  id: string; code: string; name: string; description: string | null;
  annual_allocation: number; max_carry_forward: number; max_consecutive_days: number | null;
  is_paid: boolean; allow_half_day: boolean; is_active: boolean;
  applicable_gender: string | null; requires_doc_after_days: number | null;
}

const LeaveTypesClient = () => {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<LeaveType | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", description: "", annual_allocation: 12, max_carry_forward: 0, is_paid: true, allow_half_day: true });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await getLeaveTypes();
    if ("error" in result) setError(result.error as string);
    else setTypes((result as any).leaveTypes || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: "", name: "", description: "", annual_allocation: 12, max_carry_forward: 0, is_paid: true, allow_half_day: true });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (t: LeaveType) => {
    setEditing(t);
    setForm({ code: t.code, name: t.name, description: t.description || "", annual_allocation: t.annual_allocation, max_carry_forward: t.max_carry_forward, is_paid: t.is_paid, allow_half_day: t.allow_half_day });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const data = { ...form, annual_allocation: Number(form.annual_allocation), max_carry_forward: Number(form.max_carry_forward) };
    const result = editing ? await updateLeaveType(editing.id, data) : await createLeaveType(data);
    if ("error" in result) {
      if ((result as any).details) setFormErrors((result as any).details);
      else setError(result.error as string);
    } else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex justify-end">
        <Button color="primary" onClick={openCreate}><Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" />Add Leave Type</Button>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>Code</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Annual Days</TableHeadCell>
            <TableHeadCell>Carry Forward</TableHeadCell>
            <TableHeadCell>Paid</TableHeadCell>
            <TableHeadCell>Half Day</TableHeadCell>
            <TableHeadCell>Gender</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : types.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">No leave types found</TableCell></TableRow>
            ) : (
              types.map((t) => (
                <TableRow key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-mono font-semibold">{t.code}</TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell><Badge color="info">{t.annual_allocation}</Badge></TableCell>
                  <TableCell>{t.max_carry_forward || 0}</TableCell>
                  <TableCell><Badge color={t.is_paid ? "success" : "warning"}>{t.is_paid ? "Paid" : "Unpaid"}</Badge></TableCell>
                  <TableCell>{t.allow_half_day ? "Yes" : "No"}</TableCell>
                  <TableCell>{t.applicable_gender || "All"}</TableCell>
                  <TableCell><Badge color={t.is_active ? "success" : "gray"}>{t.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell>
                    <Button size="xs" color="light" onClick={() => openEdit(t)}><Icon icon="solar:pen-new-square-line-duotone" className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>{editing ? "Edit Leave Type" : "Add Leave Type"}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Code *</Label><TextInput value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., CL" color={formErrors.code ? "failure" : undefined} /></div>
              <div><Label>Name *</Label><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Casual Leave" color={formErrors.name ? "failure" : undefined} /></div>
            </div>
            <div><Label>Description</Label><TextInput value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Annual Allocation *</Label><TextInput type="number" value={form.annual_allocation} onChange={(e) => setForm({ ...form, annual_allocation: parseInt(e.target.value) || 0 })} /></div>
              <div><Label>Max Carry Forward</Label><TextInput type="number" value={form.max_carry_forward} onChange={(e) => setForm({ ...form, max_carry_forward: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_paid} onChange={(e) => setForm({ ...form, is_paid: e.target.checked })} className="rounded" />Paid Leave</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.allow_half_day} onChange={(e) => setForm({ ...form, allow_half_day: e.target.checked })} className="rounded" />Allow Half Day</label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner size="sm" className="mr-2" /> : null}{editing ? "Update" : "Create"}</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default LeaveTypesClient;
