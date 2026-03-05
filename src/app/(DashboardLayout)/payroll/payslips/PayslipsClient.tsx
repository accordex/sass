"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Spinner, Badge, Select, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getPayslips, deletePayslip } from "@/app/actions/payroll";

const statusColors: Record<string, string> = { DRAFT: "gray", PROCESSING: "info", PROCESSED: "warning", APPROVED: "success", PAID: "success", CANCELLED: "failure" };

const formatCurrency = (v: number | null) => v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

const PayslipsClient = () => {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  const [viewModal, setViewModal] = useState<any | null>(null);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getPayslips({ page, search, status: statusFilter });
    if ("error" in result) setError(result.error as string);
    else { setPayslips((result as any).payslips || []); setTotal((result as any).total || 0); setTotalPages((result as any).totalPages || 1); }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deletePayslip(deleteModal);
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setDeleteModal(null);
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <TextInput placeholder="Search employees..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-5 h-5" />} className="w-64" />
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PROCESSING">Processing</option>
            <option value="PROCESSED">Processed</option>
            <option value="APPROVED">Approved</option>
            <option value="PAID">Paid</option>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>Payslip #</TableHeadCell>
            <TableHeadCell>Employee</TableHeadCell>
            <TableHeadCell>Month/Year</TableHeadCell>
            <TableHeadCell>Working Days</TableHeadCell>
            <TableHeadCell>Gross Salary</TableHeadCell>
            <TableHeadCell>Deductions</TableHeadCell>
            <TableHeadCell>Net Salary</TableHeadCell>
            <TableHeadCell>Run Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : payslips.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">No payslips found</TableCell></TableRow>
            ) : (
              payslips.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-mono text-sm">{p.payslip_number || "—"}</TableCell>
                  <TableCell>
                    <div className="font-medium">{p.employee?.first_name} {p.employee?.last_name}</div>
                    <div className="text-xs text-gray-400">{p.employee?.employee_code}</div>
                  </TableCell>
                  <TableCell>{p.month}/{p.year}</TableCell>
                  <TableCell className="text-center">{Number(p.working_days)}/{Number(p.days_worked)}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(p.gross_salary)}</TableCell>
                  <TableCell className="font-mono text-red-500">{formatCurrency(p.total_deductions)}</TableCell>
                  <TableCell className="font-mono font-semibold text-green-600">{formatCurrency(p.net_salary)}</TableCell>
                  <TableCell><Badge color={statusColors[p.payroll_run?.status] || "gray"}>{p.payroll_run?.status || "—"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="xs" color="light" onClick={() => setViewModal(p)} title="View Details"><Icon icon="solar:eye-line-duotone" className="w-4 h-4" /></Button>
                      {p.payroll_run?.status === "DRAFT" && <Button size="xs" color="failure" onClick={() => setDeleteModal(p.id)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" className="w-4 h-4" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Page {page} of {totalPages} ({total} payslips)</span>
        <div className="flex gap-2">
          <Button size="sm" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Button size="sm" color="light" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>

      {/* Payslip Detail Modal */}
      <Modal show={!!viewModal} onClose={() => setViewModal(null)} size="2xl">
        <ModalHeader>Payslip Details — {viewModal?.payslip_number || "—"}</ModalHeader>
        <ModalBody>
          {viewModal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-600">Employee</p>
                  <p className="text-lg">{viewModal.employee?.first_name} {viewModal.employee?.last_name}</p>
                  <p className="text-xs text-gray-400">{viewModal.employee?.employee_code}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Period</p>
                  <p className="text-lg">{viewModal.month}/{viewModal.year}</p>
                  <p className="text-xs text-gray-400">Working: {Number(viewModal.working_days)} | Worked: {Number(viewModal.days_worked)} | LOP: {Number(viewModal.lop_days)}</p>
                </div>
              </div>

              {/* Payslip Lines */}
              {viewModal.lines && viewModal.lines.length > 0 ? (
                <div className="border rounded-lg divide-y dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-800 font-semibold text-sm">
                    <div>Component</div><div>Type</div><div className="text-right">Amount</div>
                  </div>
                  {viewModal.lines.map((line: any, i: number) => (
                    <div key={i} className="grid grid-cols-3 gap-4 p-3 text-sm">
                      <div className="font-medium">{line.component_name}</div>
                      <div><Badge color={line.component_type === "EARNING" ? "success" : "failure"} size="xs">{line.component_type}</Badge></div>
                      <div className={`text-right font-mono ${line.component_type === "DEDUCTION" ? "text-red-500" : "text-green-600"}`}>{formatCurrency(line.amount)}</div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-sm italic">No line items</p>}

              <div className="grid grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Gross Salary</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(viewModal.gross_salary)}</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Deductions</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(viewModal.total_deductions)}</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Net Salary</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(viewModal.net_salary)}</p>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setViewModal(null)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Delete this payslip?</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-2" /> : null}Delete</Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PayslipsClient;
