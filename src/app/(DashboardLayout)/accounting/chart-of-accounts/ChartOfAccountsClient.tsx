"use client";

// ==============================================================================
// Chart of Accounts Client Component
// ==============================================================================
// Lists all ledger accounts with filtering by type, search, and CRUD.
// ==============================================================================

import React, { useEffect, useState, useTransition } from "react";
import { Badge, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TextInput, Select, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Label } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import { getChartOfAccounts, createChartOfAccount } from "@/app/actions/accounting";

const typeColors: Record<string, string> = {
  ASSET: "info",
  LIABILITY: "warning",
  EQUITY: "purple",
  REVENUE: "success",
  EXPENSE: "failure",
};

const ChartOfAccountsClient = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 50, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Create modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    account_code: "", account_name: "", account_type: "ASSET",
    balance_type: "DEBIT", description: "", parent_account_id: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getChartOfAccounts({
        page, perPage: 50, search, account_type: typeFilter,
        sortBy: "account_code", sortOrder: "asc",
      });
      if ("error" in result) {
        setError(result.error as string);
      } else {
        setAccounts(result.data || []);
        setMeta({ total: (result as any).total || 0, page: (result as any).page || 1, perPage: (result as any).perPage || 50, totalPages: (result as any).totalPages || 1 });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load chart of accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, typeFilter]); // eslint-disable-line
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchData(); }, 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  const handleCreate = () => {
    startTransition(async () => {
      try {
        const data: any = { ...formData };
        if (!data.parent_account_id) delete data.parent_account_id;
        await createChartOfAccount(data);
        setModalOpen(false);
        setFormData({ account_code: "", account_name: "", account_type: "ASSET", balance_type: "DEBIT", description: "", parent_account_id: "" });
        fetchData();
      } catch (err: any) { setError(err.message); }
    });
  };

  return (
    <>
      <CardBox className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-line-duotone" height={18} />}
              placeholder="Search by account code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              <option value="ASSET">Asset</option>
              <option value="LIABILITY">Liability</option>
              <option value="EQUITY">Equity</option>
              <option value="REVENUE">Revenue</option>
              <option value="EXPENSE">Expense</option>
            </Select>
          </div>
          <Badge color="dark" className="px-3 py-1">Total: {meta.total}</Badge>
          <Button color="info" onClick={() => setModalOpen(true)}>
            <Icon icon="solar:add-circle-line-duotone" className="mr-2" height={18} />
            New Account
          </Button>
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
              <span className="ml-3 text-gray-500">Loading chart of accounts...</span>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon icon="solar:document-text-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No accounts found</p>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Code</TableHeadCell>
                <TableHeadCell>Account Name</TableHeadCell>
                <TableHeadCell>Type</TableHeadCell>
                <TableHeadCell>Balance Type</TableHeadCell>
                <TableHeadCell>Current Balance</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {accounts.map((acc: any) => (
                  <TableRow key={acc.id}>
                    <TableCell>
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {acc.account_code}
                      </code>
                    </TableCell>
                    <TableCell className="font-medium">{acc.account_name}</TableCell>
                    <TableCell>
                      <Badge color={typeColors[acc.account_type] || "gray"}>{acc.account_type}</Badge>
                    </TableCell>
                    <TableCell>{acc.balance_type}</TableCell>
                    <TableCell className="font-semibold">
                      ₹{Number(acc.current_balance || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge color={acc.is_active ? "success" : "gray"}>
                        {acc.is_active ? "Active" : "Inactive"}
                      </Badge>
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

      {/* Create Account Modal */}
      <Modal show={modalOpen} size="lg" onClose={() => setModalOpen(false)}>
        <ModalHeader>Create New Ledger Account</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account_code">Account Code *</Label>
              <TextInput id="account_code" value={formData.account_code} onChange={(e) => setFormData({ ...formData, account_code: e.target.value })} placeholder="e.g. 1001" required />
            </div>
            <div>
              <Label htmlFor="account_name">Account Name *</Label>
              <TextInput id="account_name" value={formData.account_name} onChange={(e) => setFormData({ ...formData, account_name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="account_type">Account Type *</Label>
              <Select id="account_type" value={formData.account_type} onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}>
                <option value="ASSET">Asset</option>
                <option value="LIABILITY">Liability</option>
                <option value="EQUITY">Equity</option>
                <option value="REVENUE">Revenue</option>
                <option value="EXPENSE">Expense</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="balance_type">Balance Type *</Label>
              <Select id="balance_type" value={formData.balance_type} onChange={(e) => setFormData({ ...formData, balance_type: e.target.value })}>
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <TextInput id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3">
          <Button color="gray" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button color="info" onClick={handleCreate} disabled={isPending}>
            {isPending ? <Spinner size="sm" className="mr-2" /> : null}
            Create Account
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ChartOfAccountsClient;
