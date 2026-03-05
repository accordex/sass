"use client";

// ==============================================================================
// Journal Entries Client Component
// ==============================================================================
// Lists journal entries with status filter, search, and pagination.
// ==============================================================================

import React, { useEffect, useState } from "react";
import { Badge, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TextInput, Select, Spinner } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import { getJournalEntries } from "@/app/actions/accounting";

const statusColors: Record<string, string> = {
  DRAFT: "gray",
  POSTED: "success",
  REVERSED: "failure",
};

const JournalEntriesClient = () => {
  const [entries, setEntries] = useState<any[]>([]);
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
      const result = await getJournalEntries({
        page, perPage: 10, search, status: statusFilter,
        sortBy: "entry_date", sortOrder: "desc",
      });
      if ("error" in result) {
        setError(result.error as string);
      } else {
        setEntries(result.data || []);
        setMeta(result.meta || { total: 0, page: 1, perPage: 10, totalPages: 1 });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load journal entries");
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
              placeholder="Search journal entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="POSTED">Posted</option>
              <option value="REVERSED">Reversed</option>
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
              <span className="ml-3 text-gray-500">Loading journal entries...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon icon="solar:notebook-bookmark-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No journal entries found</p>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Entry #</TableHeadCell>
                <TableHeadCell>Date</TableHeadCell>
                <TableHeadCell>Reference</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Total Debit</TableHeadCell>
                <TableHeadCell>Total Credit</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Created By</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {entries.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.entry_number || entry.id?.slice(0, 8)}
                    </TableCell>
                    <TableCell>{new Date(entry.entry_date).toLocaleDateString()}</TableCell>
                    <TableCell>{entry.reference || "—"}</TableCell>
                    <TableCell className="max-w-xs truncate">{entry.description || "—"}</TableCell>
                    <TableCell className="font-semibold">₹{Number(entry.total_debit || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">₹{Number(entry.total_credit || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge color={statusColors[entry.status] || "gray"}>{entry.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.created_by_user ? `${entry.created_by_user.first_name} ${entry.created_by_user.last_name}` : "—"}
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

export default JournalEntriesClient;
