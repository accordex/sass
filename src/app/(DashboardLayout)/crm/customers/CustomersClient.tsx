"use client";

// ==============================================================================
// Customers List Client Component
// ==============================================================================
// CRUD for customer records with search, pagination, and stats overview.
// ==============================================================================

import React, { useEffect, useState, useTransition } from "react";
import { Badge, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TextInput, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Label, Select } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerStats } from "@/app/actions/customer";

const typeColors: Record<string, string> = {
  INDIVIDUAL: "info",
  BUSINESS: "purple",
};

const CustomersClient = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 10, totalPages: 1 });
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    display_name: "", company_name: "", customer_type: "BUSINESS",
    email: "", phone: "", gst_number: "", pan_number: "",
    billing_address: "", shipping_address: "", payment_terms_days: "30",
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [result, statsResult] = await Promise.all([
        getCustomers({ page, perPage: 10, search }),
        getCustomerStats(),
      ]);
      if ("error" in result) {
        setError(result.error as string);
      } else {
        setCustomers(result.data || []);
        setMeta(result.meta || { total: 0, page: 1, perPage: 10, totalPages: 1 });
      }
      if (statsResult && !("error" in statsResult)) setStats(statsResult.data);
    } catch (err: any) {
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page]); // eslint-disable-line
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchData(); }, 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      display_name: "", company_name: "", customer_type: "BUSINESS",
      email: "", phone: "", gst_number: "", pan_number: "",
      billing_address: "", shipping_address: "", payment_terms_days: "30",
    });
    setModalOpen(true);
  };

  const openEditModal = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      display_name: customer.display_name || "",
      company_name: customer.company_name || "",
      customer_type: customer.customer_type || "BUSINESS",
      email: customer.email || "",
      phone: customer.phone || "",
      gst_number: customer.gst_number || "",
      pan_number: customer.pan_number || "",
      billing_address: typeof customer.billing_address === "object" ? JSON.stringify(customer.billing_address) : (customer.billing_address || ""),
      shipping_address: typeof customer.shipping_address === "object" ? JSON.stringify(customer.shipping_address) : (customer.shipping_address || ""),
      payment_terms_days: String(customer.payment_terms_days || 30),
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const submitData = {
          ...formData,
          payment_terms_days: parseInt(formData.payment_terms_days) || 30,
        };
        if (editingCustomer) {
          await updateCustomer({ id: editingCustomer.id, ...submitData });
        } else {
          await createCustomer(submitData);
        }
        setModalOpen(false);
        fetchData();
      } catch (err: any) { setError(err.message); }
    });
  };

  const handleDelete = () => {
    if (!selectedId) return;
    startTransition(async () => {
      try {
        await deleteCustomer(selectedId);
        setDeleteModalOpen(false);
        setSelectedId(null);
        fetchData();
      } catch (err: any) { setError(err.message); }
    });
  };

  return (
    <>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <CardBox className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total ?? 0}</p>
            <p className="text-sm text-gray-500">Total Customers</p>
          </CardBox>
          <CardBox className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.business ?? 0}</p>
            <p className="text-sm text-gray-500">Business</p>
          </CardBox>
          <CardBox className="text-center">
            <p className="text-2xl font-bold text-teal-600">{stats.individual ?? 0}</p>
            <p className="text-sm text-gray-500">Individual</p>
          </CardBox>
          <CardBox className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.newThisMonth ?? 0}</p>
            <p className="text-sm text-gray-500">New This Month</p>
          </CardBox>
        </div>
      )}

      {/* Filters */}
      <CardBox className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-line-duotone" height={18} />}
              placeholder="Search customers by name, company, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Badge color="dark" className="px-3 py-1">Total: {meta.total}</Badge>
          <Button color="info" onClick={openCreateModal}>
            <Icon icon="solar:add-circle-line-duotone" className="mr-2" height={18} />
            New Customer
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
              <span className="ml-3 text-gray-500">Loading customers...</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon icon="solar:users-group-two-rounded-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No customers found</p>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Customer Name</TableHeadCell>
                <TableHeadCell>Company</TableHeadCell>
                <TableHeadCell>Type</TableHeadCell>
                <TableHeadCell>Email</TableHeadCell>
                <TableHeadCell>Phone</TableHeadCell>
                <TableHeadCell>GST No.</TableHeadCell>
                <TableHeadCell>Receivable</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {customers.map((customer: any) => (
                  <TableRow key={customer.id}>
                    <TableCell className="whitespace-nowrap font-medium">{customer.display_name}</TableCell>
                    <TableCell>{customer.company_name || "—"}</TableCell>
                    <TableCell>
                      <Badge color={typeColors[customer.customer_type] || "gray"}>{customer.customer_type}</Badge>
                    </TableCell>
                    <TableCell>{customer.email || "—"}</TableCell>
                    <TableCell>{customer.phone || "—"}</TableCell>
                    <TableCell>{customer.gst_number || "—"}</TableCell>
                    <TableCell className="font-semibold">
                      ₹{Number(customer.outstanding_receivable || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="xs" color="light" title="Edit" onClick={() => openEditModal(customer)}>
                          <Icon icon="solar:pen-line-duotone" height={14} />
                        </Button>
                        <Button size="xs" color="failure" title="Delete" disabled={isPending} onClick={() => { setSelectedId(customer.id); setDeleteModalOpen(true); }}>
                          <Icon icon="solar:trash-bin-trash-line-duotone" height={14} />
                        </Button>
                      </div>
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

      {/* Create / Edit Customer Modal */}
      <Modal show={modalOpen} size="xl" onClose={() => setModalOpen(false)}>
        <ModalHeader>{editingCustomer ? "Edit Customer" : "Create New Customer"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display_name">Display Name *</Label>
              <TextInput id="display_name" value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <TextInput id="company_name" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="customer_type">Customer Type</Label>
              <Select id="customer_type" value={formData.customer_type} onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}>
                <option value="BUSINESS">Business</option>
                <option value="INDIVIDUAL">Individual</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <TextInput id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <TextInput id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="gst_number">GST Number</Label>
              <TextInput id="gst_number" value={formData.gst_number} onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })} placeholder="e.g. 29ABCDE1234F1Z5" />
            </div>
            <div>
              <Label htmlFor="pan_number">PAN Number</Label>
              <TextInput id="pan_number" value={formData.pan_number} onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })} placeholder="e.g. ABCDE1234F" />
            </div>
            <div>
              <Label htmlFor="payment_terms_days">Payment Terms (Days)</Label>
              <TextInput id="payment_terms_days" type="number" value={formData.payment_terms_days} onChange={(e) => setFormData({ ...formData, payment_terms_days: e.target.value })} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3">
          <Button color="gray" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button color="info" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Spinner size="sm" className="mr-2" /> : null}
            {editingCustomer ? "Update Customer" : "Create Customer"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={deleteModalOpen} size="md" onClose={() => setDeleteModalOpen(false)}>
        <ModalHeader>Confirm Customer Deletion</ModalHeader>
        <ModalBody>
          <div className="text-center">
            <Icon icon="solar:danger-triangle-line-duotone" height={48} className="mx-auto mb-4 text-red-500" />
            <p className="text-gray-500">Are you sure you want to delete this customer? Related invoices and records will be preserved.</p>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3">
          <Button color="gray" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button color="failure" onClick={handleDelete} disabled={isPending}>
            {isPending ? <Spinner size="sm" className="mr-2" /> : null}
            Yes, Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CustomersClient;
