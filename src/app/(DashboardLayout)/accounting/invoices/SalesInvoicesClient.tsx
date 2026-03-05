"use client";

// ==============================================================================
// Sales Invoices Client Component
// ==============================================================================
// Lists sales invoices with search, status filter, pagination.
// ==============================================================================

import React, { useEffect, useState } from "react";
import { Badge, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TextInput, Select, Spinner } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import { getSalesInvoices } from "@/app/actions/accounting";

const statusColors: Record<string, string> = {
  DRAFT: "gray",
  SENT: "info",
  PARTIALLY_PAID: "warning",
  PAID: "success",
  OVERDUE: "failure",
  CANCELLED: "dark",
  VOID: "dark",
};

const SalesInvoicesClient = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getSalesInvoices({
        page, perPage: 10, search, status: statusFilter,
        sortBy: "invoice_date", sortOrder: "desc",
      });
      if ("error" in result) {
        setError(result.error as string);
      } else {
        setInvoices(result.data || []);
        setMeta(result.meta || { total: 0, page: 1, perPage: 10, totalPages: 1 });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]); // eslint-disable-line
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchData(); }, 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  return (
    <>
      <CardBox className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-line-duotone" height={18} />}
              placeholder="Search invoices by number or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
          <Badge color="dark" className="px-3 py-1">Total: {meta.total}</Badge>
        </div>
      </CardBox>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <Icon icon="solar:danger-triangle-line-duotone" className="inline mr-2" height={16} />{error}
        </div>
      )}

      <CardBox>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
              <span className="ml-3 text-gray-500">Loading invoices...</span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon icon="solar:bill-check-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No sales invoices found</p>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Invoice #</TableHeadCell>
                <TableHeadCell>Customer</TableHeadCell>
                <TableHeadCell>Invoice Date</TableHeadCell>
                <TableHeadCell>Due Date</TableHeadCell>
                <TableHeadCell>Sub Total</TableHeadCell>
                <TableHeadCell>Tax</TableHeadCell>
                <TableHeadCell>Total</TableHeadCell>
                <TableHeadCell>Balance Due</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {invoices.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                    <TableCell>{inv.customer?.display_name || inv.customer?.company_name || "—"}</TableCell>
                    <TableCell>{new Date(inv.invoice_date).toLocaleDateString()}</TableCell>
                    <TableCell>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>₹{Number(inv.sub_total || 0).toLocaleString()}</TableCell>
                    <TableCell>₹{Number(inv.tax_amount || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">₹{Number(inv.total_amount || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-red-600">
                      ₹{Number(inv.balance_due || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge color={statusColors[inv.status] || "gray"}>{inv.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500">
              Showing {(meta.page - 1) * meta.perPage + 1}–{Math.min(meta.page * meta.perPage, meta.total)} of {meta.total}
            </span>
            <div className="flex gap-2">
              <Button size="xs" color="light" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button size="xs" color="light" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </CardBox>
    </>
  );
};

export default SalesInvoicesClient;
