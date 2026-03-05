"use client";

// ==============================================================================
// Contacts List Client Component
// ==============================================================================
// CRUD for contact records with search, pagination.
// ==============================================================================

import React, { useEffect, useState, useTransition } from "react";
import { Badge, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TextInput, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Label, Select } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import { getContacts, createContact, updateContact, deleteContact } from "@/app/actions/contact";

const statusColors: Record<string, string> = {
  ACTIVE: "success",
  INACTIVE: "gray",
  BOUNCED: "failure",
  UNSUBSCRIBED: "warning",
};

const ContactsClient = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "", phone: "", mobile: "",
    designation: "", department: "", status: "ACTIVE",
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getContacts({ page, perPage: 10, search });
      if ("error" in result) {
        setError(result.error as string);
      } else {
        setContacts(result.data || []);
        setMeta(result.meta || { total: 0, page: 1, perPage: 10, totalPages: 1 });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load contacts");
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
    setEditingContact(null);
    setFormData({ first_name: "", last_name: "", email: "", phone: "", mobile: "", designation: "", department: "", status: "ACTIVE" });
    setModalOpen(true);
  };

  const openEditModal = (contact: any) => {
    setEditingContact(contact);
    setFormData({
      first_name: contact.first_name || "",
      last_name: contact.last_name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      mobile: contact.mobile || "",
      designation: contact.designation || "",
      department: contact.department || "",
      status: contact.status || "ACTIVE",
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        if (editingContact) {
          await updateContact({ id: editingContact.id, ...formData });
        } else {
          await createContact(formData);
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
        await deleteContact(selectedId);
        setDeleteModalOpen(false);
        setSelectedId(null);
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
              placeholder="Search contacts by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Badge color="dark" className="px-3 py-1">Total: {meta.total}</Badge>
          <Button color="info" onClick={openCreateModal}>
            <Icon icon="solar:add-circle-line-duotone" className="mr-2" height={18} />
            New Contact
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
              <span className="ml-3 text-gray-500">Loading contacts...</span>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon icon="solar:phone-calling-rounded-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No contacts found</p>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Email</TableHeadCell>
                <TableHeadCell>Phone</TableHeadCell>
                <TableHeadCell>Department</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Customer</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {contacts.map((contact: any) => (
                  <TableRow key={contact.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {contact.first_name} {contact.last_name}
                      {contact.designation && <div className="text-xs text-gray-500">{contact.designation}</div>}
                    </TableCell>
                    <TableCell>{contact.email || "—"}</TableCell>
                    <TableCell>{contact.phone || contact.mobile || "—"}</TableCell>
                    <TableCell>{contact.department || "—"}</TableCell>
                    <TableCell>
                      <Badge color={statusColors[contact.status] || "gray"}>{contact.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {contact.customer ? contact.customer.company_name || contact.customer.display_name : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="xs" color="light" title="Edit" onClick={() => openEditModal(contact)}>
                          <Icon icon="solar:pen-line-duotone" height={14} />
                        </Button>
                        <Button size="xs" color="failure" title="Delete" disabled={isPending} onClick={() => { setSelectedId(contact.id); setDeleteModalOpen(true); }}>
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

      {/* Create / Edit Contact Modal */}
      <Modal show={modalOpen} size="lg" onClose={() => setModalOpen(false)}>
        <ModalHeader>{editingContact ? "Edit Contact" : "Create New Contact"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <TextInput id="first_name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <TextInput id="last_name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
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
              <Label htmlFor="mobile">Mobile</Label>
              <TextInput id="mobile" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="designation">Designation</Label>
              <TextInput id="designation" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <TextInput id="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3">
          <Button color="gray" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button color="info" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Spinner size="sm" className="mr-2" /> : null}
            {editingContact ? "Update Contact" : "Create Contact"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={deleteModalOpen} size="md" onClose={() => setDeleteModalOpen(false)}>
        <ModalHeader>Confirm Contact Deletion</ModalHeader>
        <ModalBody>
          <div className="text-center">
            <Icon icon="solar:danger-triangle-line-duotone" height={48} className="mx-auto mb-4 text-red-500" />
            <p className="text-gray-500">Are you sure you want to delete this contact?</p>
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

export default ContactsClient;
