"use client";

// ==============================================================================
// Bank Accounts Client Component
// ==============================================================================
// Lists bank accounts with create functionality and balance display.
// ==============================================================================

import React, { useEffect, useState, useTransition } from "react";
import { Badge, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Label, TextInput } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import { getBankAccounts, createBankAccount } from "@/app/actions/accounting";

const BankAccountsClient = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Create modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    account_name: "", bank_name: "", account_number: "",
    ifsc_code: "", branch_name: "", opening_balance: "0",
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getBankAccounts();
      if ("error" in result) {
        setError(result.error as string);
      } else {
        setAccounts(result.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const handleCreate = () => {
    startTransition(async () => {
      try {
        await createBankAccount({
          ...formData,
          opening_balance: parseFloat(formData.opening_balance) || 0,
        });
        setModalOpen(false);
        setFormData({ account_name: "", bank_name: "", account_number: "", ifsc_code: "", branch_name: "", opening_balance: "0" });
        fetchData();
      } catch (err: any) { setError(err.message); }
    });
  };

  return (
    <>
      <CardBox className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h5 className="text-lg font-semibold flex items-center gap-2">
              <Icon icon="solar:safe-2-line-duotone" height={22} />
              Registered Bank Accounts
            </h5>
            <p className="text-sm text-gray-500 mt-1">Manage bank accounts for payment reconciliation</p>
          </div>
          <Button color="info" onClick={() => setModalOpen(true)}>
            <Icon icon="solar:add-circle-line-duotone" className="mr-2" height={18} />
            Add Bank Account
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
              <span className="ml-3 text-gray-500">Loading bank accounts...</span>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon icon="solar:safe-2-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No bank accounts registered</p>
              <p className="text-sm">Add your first bank account to start tracking finances.</p>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Account Name</TableHeadCell>
                <TableHeadCell>Bank Name</TableHeadCell>
                <TableHeadCell>Account Number</TableHeadCell>
                <TableHeadCell>IFSC Code</TableHeadCell>
                <TableHeadCell>Branch</TableHeadCell>
                <TableHeadCell>Current Balance</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {accounts.map((acc: any) => (
                  <TableRow key={acc.id}>
                    <TableCell className="font-medium">{acc.account_name}</TableCell>
                    <TableCell>{acc.bank_name || "—"}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {acc.account_number ? `****${acc.account_number.slice(-4)}` : "—"}
                      </code>
                    </TableCell>
                    <TableCell>{acc.ifsc_code || "—"}</TableCell>
                    <TableCell>{acc.branch_name || "—"}</TableCell>
                    <TableCell className="font-semibold">
                      ₹{Number(acc.current_balance || acc.opening_balance || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge color={acc.is_active !== false ? "success" : "gray"}>
                        {acc.is_active !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardBox>

      {/* Create Bank Account Modal */}
      <Modal show={modalOpen} size="lg" onClose={() => setModalOpen(false)}>
        <ModalHeader>Add New Bank Account</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account_name">Account Name *</Label>
              <TextInput id="account_name" value={formData.account_name} onChange={(e) => setFormData({ ...formData, account_name: e.target.value })} placeholder="e.g. Primary Business Account" required />
            </div>
            <div>
              <Label htmlFor="bank_name">Bank Name *</Label>
              <TextInput id="bank_name" value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} placeholder="e.g. HDFC Bank" required />
            </div>
            <div>
              <Label htmlFor="account_number">Account Number *</Label>
              <TextInput id="account_number" value={formData.account_number} onChange={(e) => setFormData({ ...formData, account_number: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="ifsc_code">IFSC Code</Label>
              <TextInput id="ifsc_code" value={formData.ifsc_code} onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })} placeholder="e.g. HDFC0001234" />
            </div>
            <div>
              <Label htmlFor="branch_name">Branch Name</Label>
              <TextInput id="branch_name" value={formData.branch_name} onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="opening_balance">Opening Balance (₹)</Label>
              <TextInput id="opening_balance" type="number" value={formData.opening_balance} onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3">
          <Button color="gray" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button color="info" onClick={handleCreate} disabled={isPending}>
            {isPending ? <Spinner size="sm" className="mr-2" /> : null}
            Add Bank Account
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default BankAccountsClient;
