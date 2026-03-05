"use client";

// ==============================================================================
// Users List Client Component
// ==============================================================================
// Handles user list display, search, filter, create, and actions.
// Admins can create new users, update status, and soft-delete.
// ==============================================================================

import React, { useEffect, useState, useTransition } from "react";
import {
  Badge,
  Button,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  TextInput,
  Select,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
} from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import {
  getUsers,
  createUser,
  deleteUser,
  getAvailableRoles,
} from "@/app/actions/user";

// Status badge color mapping
const statusColors: Record<string, string> = {
  ACTIVE: "success",
  INACTIVE: "dark",
  SUSPENDED: "warning",
  LOCKED: "failure",
  PENDING: "info",
};

const UsersListClient = () => {
  // ----- State -----
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Create user modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    role_ids: [] as string[],
  });
  const [formError, setFormError] = useState("");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // ----- Data Fetching -----
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersResult, rolesResult] = await Promise.all([
        getUsers({ page, perPage: 10, search, status: statusFilter, roleCode: roleFilter }),
        getAvailableRoles(),
      ]);
      setUsers(usersResult.data);
      setMeta(usersResult.meta);
      setRoles(rolesResult);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, roleFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ----- Action Handlers -----

  /** Create a new user */
  const handleCreateUser = () => {
    setFormError("");
    startTransition(async () => {
      try {
        const result = await createUser(formData);
        if (result.success) {
          setCreateModalOpen(false);
          setFormData({ email: "", first_name: "", last_name: "", phone: "", password: "", role_ids: [] });
          fetchData();
        } else {
          setFormError(result.error || "Failed to create user");
        }
      } catch (err: any) {
        setFormError(err.message || "An error occurred");
      }
    });
  };

  /** Soft-delete a user */
  const handleDelete = () => {
    if (!selectedUserId) return;
    startTransition(async () => {
      try {
        const result = await deleteUser(selectedUserId);
        if (result.success) {
          setDeleteModalOpen(false);
          setSelectedUserId(null);
          fetchData();
        } else {
          setError(result.error || "Failed to delete user");
        }
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      role_ids: prev.role_ids.includes(roleId)
        ? prev.role_ids.filter((id) => id !== roleId)
        : [...prev.role_ids, roleId],
    }));
  };

  return (
    <>
      {/* Filters & Actions Bar */}
      <CardBox className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-line-duotone" height={18} />}
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="LOCKED">Locked</option>
              <option value="PENDING">Pending</option>
            </Select>
          </div>

          {/* Role Filter */}
          <div className="w-40">
            <Select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.role_code}>
                  {role.role_name}
                </option>
              ))}
            </Select>
          </div>

          {/* Create Button */}
          <Button color="info" onClick={() => setCreateModalOpen(true)}>
            <Icon icon="solar:add-circle-line-duotone" height={18} className="mr-2" />
            Add User
          </Button>

          {/* Summary */}
          <Badge color="dark" className="px-3 py-1">
            Total: {meta.total}
          </Badge>
        </div>
      </CardBox>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <Icon icon="solar:danger-triangle-line-duotone" className="inline mr-2" height={16} />
          {error}
        </div>
      )}

      {/* Users Table */}
      <CardBox>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
              <span className="ml-3 text-gray-500">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon icon="solar:users-group-rounded-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No users found</p>
              <p className="text-sm">Try adjusting your filters or add a new user.</p>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Email</TableHeadCell>
                <TableHeadCell>Roles</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Last Login</TableHeadCell>
                <TableHeadCell>Logins</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {users.map((user) => (
                  <TableRow key={user.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    {/* Name + Avatar */}
                    <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                          {user.first_name?.[0]?.toUpperCase()}{user.last_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div>{user.first_name} {user.last_name}</div>
                          {user.phone && (
                            <div className="text-xs text-gray-400">{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {user.email}
                        {user.email_verified && (
                          <Icon icon="solar:verified-check-bold" height={14} className="text-green-500" />
                        )}
                      </div>
                    </TableCell>

                    {/* Roles */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.user_roles?.map((ur: any) => (
                          <Badge key={ur.role?.role_code} color="info" size="xs">
                            {ur.role?.role_name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge color={statusColors[user.status] || "gray"}>
                        {user.status}
                      </Badge>
                    </TableCell>

                    {/* Last Login */}
                    <TableCell className="text-sm text-gray-500">
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleDateString()
                        : "Never"}
                    </TableCell>

                    {/* Login Count */}
                    <TableCell className="text-center">
                      {user.login_count || 0}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="xs" color="light" title="View Profile" href={`/admin/users/${user.id}`}>
                          <Icon icon="solar:eye-line-duotone" height={16} />
                        </Button>
                        <Button
                          size="xs"
                          color="failure"
                          title="Delete User"
                          disabled={isPending}
                          onClick={() => { setSelectedUserId(user.id); setDeleteModalOpen(true); }}
                        >
                          <Icon icon="solar:trash-bin-trash-line-duotone" height={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500">
              Showing {(meta.page - 1) * meta.perPage + 1}–{Math.min(meta.page * meta.perPage, meta.total)} of {meta.total}
            </span>
            <div className="flex gap-2">
              <Button size="xs" color="light" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button key={pageNum} size="xs" color={pageNum === page ? "info" : "light"} onClick={() => setPage(pageNum)}>
                    {pageNum}
                  </Button>
                );
              })}
              <Button size="xs" color="light" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </CardBox>

      {/* ===== Create User Modal ===== */}
      <Modal show={createModalOpen} size="lg" onClose={() => setCreateModalOpen(false)}>
        <ModalHeader>Add New User</ModalHeader>
        <ModalBody>
          {formError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="mb-2 block">First Name *</Label>
              <TextInput
                id="first_name"
                placeholder="Enter first name"
                value={formData.first_name}
                onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name" className="mb-2 block">Last Name *</Label>
              <TextInput
                id="last_name"
                placeholder="Enter last name"
                value={formData.last_name}
                onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-2 block">Email Address *</Label>
              <TextInput
                id="email"
                type="email"
                placeholder="user@company.com"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone" className="mb-2 block">Phone Number</Label>
              <TextInput
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="password" className="mb-2 block">Initial Password *</Label>
              <TextInput
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block">Assign Roles *</Label>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Button
                    key={role.id}
                    size="xs"
                    color={formData.role_ids.includes(role.id) ? "info" : "light"}
                    onClick={() => handleRoleToggle(role.id)}
                  >
                    {formData.role_ids.includes(role.id) && (
                      <Icon icon="solar:check-circle-bold" height={14} className="mr-1" />
                    )}
                    {role.role_name}
                  </Button>
                ))}
              </div>
              {roles.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">No roles available. Create roles first.</p>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3">
          <Button color="gray" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button color="info" onClick={handleCreateUser} disabled={isPending}>
            {isPending ? <Spinner size="sm" className="mr-2" /> : null}
            Create User
          </Button>
        </ModalFooter>
      </Modal>

      {/* ===== Delete Confirmation Modal ===== */}
      <Modal show={deleteModalOpen} size="md" onClose={() => setDeleteModalOpen(false)}>
        <ModalHeader>Confirm User Deletion</ModalHeader>
        <ModalBody>
          <div className="text-center">
            <Icon icon="solar:danger-triangle-line-duotone" height={48} className="mx-auto mb-4 text-red-500" />
            <h3 className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this user? They will no longer be able to log in.
            </h3>
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

export default UsersListClient;
