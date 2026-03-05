"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Select, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getAttendance, createAttendance, updateAttendance } from "@/app/actions/hrms";

interface AttendanceRecord {
  id: string;
  employee_id: string;
  attendance_date: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  hours_worked: number | null;
  notes: string | null;
  employee?: { id: string; first_name: string; last_name: string; employee_code: string; department?: { name: string } };
}

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "success", ABSENT: "failure", HALF_DAY: "warning", ON_LEAVE: "purple",
  HOLIDAY: "info", WEEKEND: "gray", WORK_FROM_HOME: "indigo", LATE: "warning",
};

const AttendanceClient = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ employee_id: "", attendance_date: dateFilter, status: "PRESENT", check_in: "", check_out: "", notes: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getAttendance({
      page, date: dateFilter, status: statusFilter,
    });
    if ("error" in result) {
      setError(result.error as string);
    } else {
      setRecords((result as any).records || []);
      setTotal((result as any).total || 0);
      setTotalPages((result as any).totalPages || 1);
    }
    setLoading(false);
  }, [page, dateFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEdit = (rec: AttendanceRecord) => {
    setEditing(rec);
    setForm({
      employee_id: rec.employee_id,
      attendance_date: rec.attendance_date ? new Date(rec.attendance_date).toISOString().split("T")[0] : "",
      status: rec.status,
      check_in: rec.check_in || "",
      check_out: rec.check_out || "",
      notes: rec.notes || "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const data = { ...form, check_in: form.check_in || null, check_out: form.check_out || null, notes: form.notes || null };
    const result = editing
      ? await updateAttendance(editing.id, data)
      : await createAttendance(data);
    if ("error" in result) {
      if ((result as any).details) setFormErrors((result as any).details);
      else setError(result.error as string);
    } else {
      setShowModal(false);
      fetchData();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <TextInput type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} />
        </div>
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="HALF_DAY">Half Day</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="WORK_FROM_HOME">WFH</option>
          <option value="LATE">Late</option>
        </Select>
        <span className="text-sm text-gray-500 ml-auto">Total: {total} records</span>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>Employee</TableHeadCell>
            <TableHeadCell>Code</TableHeadCell>
            <TableHeadCell>Department</TableHeadCell>
            <TableHeadCell>Date</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Check In</TableHeadCell>
            <TableHeadCell>Check Out</TableHeadCell>
            <TableHeadCell>Hours</TableHeadCell>
            <TableHeadCell>Notes</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={10} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={10} className="text-center py-8 text-gray-500">No attendance records found for this date</TableCell></TableRow>
            ) : (
              records.map((rec) => (
                <TableRow key={rec.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-medium">{rec.employee?.first_name} {rec.employee?.last_name}</TableCell>
                  <TableCell className="font-mono text-sm">{rec.employee?.employee_code}</TableCell>
                  <TableCell>{rec.employee?.department?.name || "—"}</TableCell>
                  <TableCell className="text-sm">{new Date(rec.attendance_date).toLocaleDateString()}</TableCell>
                  <TableCell><Badge color={STATUS_COLORS[rec.status] || "gray"}>{rec.status.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-sm">{rec.check_in ? new Date(rec.check_in).toLocaleTimeString() : "—"}</TableCell>
                  <TableCell className="text-sm">{rec.check_out ? new Date(rec.check_out).toLocaleTimeString() : "—"}</TableCell>
                  <TableCell>{rec.hours_worked ? `${rec.hours_worked}h` : "—"}</TableCell>
                  <TableCell className="text-sm text-gray-500 max-w-xs truncate">{rec.notes || "—"}</TableCell>
                  <TableCell>
                    <Button size="xs" color="light" onClick={() => openEdit(rec)}><Icon icon="solar:pen-new-square-line-duotone" className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <Button size="sm" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Button size="sm" color="light" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>Edit Attendance</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="WORK_FROM_HOME">Work From Home</option>
                <option value="LATE">Late</option>
                <option value="HOLIDAY">Holiday</option>
                <option value="WEEKEND">Weekend</option>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <TextInput value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner size="sm" className="mr-2" /> : null}Update</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AttendanceClient;
