"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getHolidays, createHoliday, updateHoliday, deleteHoliday } from "@/app/actions/hrms";

interface Holiday {
  id: string; name: string; date: string; year: number;
  is_mandatory: boolean; is_optional: boolean; description: string | null;
}

const HolidaysClient = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({ name: "", date: "", year: year, is_mandatory: true, is_optional: false, description: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getHolidays({ year });
    if ("error" in result) setError(result.error as string);
    else setHolidays((result as any).holidays || []);
    setLoading(false);
  }, [year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", date: "", year, is_mandatory: true, is_optional: false, description: "" });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (h: Holiday) => {
    setEditing(h);
    setForm({ name: h.name, date: new Date(h.date).toISOString().split("T")[0], year: h.year, is_mandatory: h.is_mandatory, is_optional: h.is_optional, description: h.description || "" });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const result = editing ? await updateHoliday(editing.id, form) : await createHoliday(form);
    if ("error" in result) {
      if ((result as any).details) setFormErrors((result as any).details);
      else setError(result.error as string);
    } else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteHoliday(deleteModal);
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setDeleteModal(null);
    setDeleting(false);
  };

  const dayOfWeek = (d: string) => new Date(d).toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
          <span className="text-sm text-gray-500">{holidays.length} holidays</span>
        </div>
        <Button color="primary" onClick={openCreate}><Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" />Add Holiday</Button>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>#</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Date</TableHeadCell>
            <TableHeadCell>Day</TableHeadCell>
            <TableHeadCell>Type</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : holidays.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No holidays for {year}</TableCell></TableRow>
            ) : (
              holidays.map((h, i) => (
                <TableRow key={h.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">{h.name}</TableCell>
                  <TableCell>{new Date(h.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                  <TableCell>{dayOfWeek(h.date)}</TableCell>
                  <TableCell>
                    {h.is_mandatory ? <Badge color="success">Mandatory</Badge> : <Badge color="purple">Optional</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="xs" color="light" onClick={() => openEdit(h)}><Icon icon="solar:pen-new-square-line-duotone" className="w-4 h-4" /></Button>
                      <Button size="xs" color="failure" onClick={() => setDeleteModal(h.id)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>{editing ? "Edit Holiday" : "Add Holiday"}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div><Label>Holiday Name *</Label><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Republic Day" color={formErrors.name ? "failure" : undefined} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Date *</Label><TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} color={formErrors.date ? "failure" : undefined} /></div>
              <div><Label>Year</Label><TextInput type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || year })} /></div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2"><input type="radio" name="type" checked={form.is_mandatory} onChange={() => setForm({ ...form, is_mandatory: true, is_optional: false })} />Mandatory</label>
              <label className="flex items-center gap-2"><input type="radio" name="type" checked={form.is_optional} onChange={() => setForm({ ...form, is_mandatory: false, is_optional: true })} />Optional</label>
            </div>
            <div><Label>Description</Label><TextInput value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional notes" /></div>
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
        <ModalBody><p>Are you sure you want to remove this holiday?</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-2" /> : null}Delete</Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default HolidaysClient;
