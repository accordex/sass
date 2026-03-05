"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select, Pagination } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getEnrollments, createEnrollment, updateEnrollment, deleteEnrollment, getCourses, issueCertificate } from "@/app/actions/elearning";

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  progress_pct: number;
  started_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  last_accessed_at: string | null;
  user?: { id: string; first_name: string; last_name: string; email: string; avatar_url: string | null };
  course?: { id: string; title: string; slug: string };
  created_at: string;
}

interface CourseOption { id: string; title: string; }

const EnrollmentsClient = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({ user_id: "", course_id: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    const [enrollRes, courseRes] = await Promise.all([
      getEnrollments({ page, perPage: 15, search, status: filterStatus || undefined, course_id: filterCourse || undefined }),
      getCourses({ perPage: 200 }),
    ]);
    if ("error" in enrollRes) { setError(enrollRes.error as string); }
    else {
      setEnrollments((enrollRes as any).enrollments || []);
      setTotal((enrollRes as any).total || 0);
      setTotalPages((enrollRes as any).totalPages || 1);
    }
    if (!("error" in courseRes)) setCourses(((courseRes as any).courses || []).map((c: any) => ({ id: c.id, title: c.title })));
    setLoading(false);
  }, [search, page, filterStatus, filterCourse]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    setSaving(true); setFormErrors({});
    const result = await createEnrollment(form);
    if ("error" in result) { setFormErrors((result as any).details || {}); setError(result.error as string); }
    else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const result = await updateEnrollment(id, { status: newStatus });
    if ("error" in result) setError(result.error as string);
    else fetchData();
  };

  const handleIssueCertificate = async (enrollmentId: string) => {
    setSuccess(""); setError("");
    const result = await issueCertificate(enrollmentId);
    if ("error" in result) setError(result.error as string);
    else { setSuccess("Certificate issued successfully!"); fetchData(); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteEnrollment(deleteModal);
    if ("error" in result) setError(result.error as string);
    else { setDeleteModal(null); fetchData(); }
    setDeleting(false);
  };

  const statusColors: Record<string, string> = {
    ENROLLED: "info", IN_PROGRESS: "warning", COMPLETED: "success", DROPPED: "gray", EXPIRED: "failure",
  };

  return (
    <div className="rounded-lg shadow-md bg-white dark:bg-gray-800 p-6">
      {error && <Alert color="failure" className="mb-4" onDismiss={() => setError("")}>{error}</Alert>}
      {success && <Alert color="success" className="mb-4" onDismiss={() => setSuccess("")}>{success}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-3 flex-wrap items-center">
          <TextInput icon={() => <Icon icon="solar:magnifer-line-duotone" className="text-lg" />}
            placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="max-w-xs" />
          <Select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="ENROLLED">Enrolled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="DROPPED">Dropped</option>
            <option value="EXPIRED">Expired</option>
          </Select>
          <Select value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setPage(1); }}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
          <span className="text-sm text-gray-500">{total} enrollment(s)</span>
        </div>
        <Button color="primary" onClick={() => { setForm({ user_id: "", course_id: "" }); setFormErrors({}); setShowModal(true); }}>
          <Icon icon="solar:add-circle-line-duotone" className="mr-2 text-lg" /> Enroll User
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      ) : enrollments.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No enrollments found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table hoverable>
              <TableHead>
                <TableHeadCell>User</TableHeadCell>
                <TableHeadCell>Course</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Progress</TableHeadCell>
                <TableHeadCell>Enrolled On</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {enrollments.map(en => (
                  <TableRow key={en.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell>
                      <div>
                        <span className="font-medium">{en.user?.first_name} {en.user?.last_name}</span>
                        <p className="text-xs text-gray-400">{en.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{en.course?.title}</TableCell>
                    <TableCell><Badge color={statusColors[en.status] || "info"}>{en.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${en.progress_pct}%` }} />
                        </div>
                        <span className="text-sm">{en.progress_pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(en.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {en.status === "ENROLLED" && (
                          <Button size="xs" color="warning" onClick={() => handleStatusChange(en.id, "IN_PROGRESS")}>Start</Button>
                        )}
                        {en.status === "IN_PROGRESS" && (
                          <Button size="xs" color="success" onClick={() => handleStatusChange(en.id, "COMPLETED")}>Complete</Button>
                        )}
                        {en.status === "COMPLETED" && (
                          <Button size="xs" color="purple" onClick={() => handleIssueCertificate(en.id)}>
                            <Icon icon="solar:diploma-verified-line-duotone" className="mr-1" />Cert
                          </Button>
                        )}
                        {(en.status === "ENROLLED" || en.status === "IN_PROGRESS") && (
                          <Button size="xs" color="gray" onClick={() => handleStatusChange(en.id, "DROPPED")}>Drop</Button>
                        )}
                        <Button size="xs" color="failure" onClick={() => setDeleteModal(en.id)}>
                          <Icon icon="solar:trash-bin-minimalistic-line-duotone" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Enroll User Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="md">
        <ModalHeader>Enroll User in Course</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label>User ID *</Label>
              <TextInput value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                placeholder="Enter user UUID" color={formErrors.user_id ? "failure" : undefined} />
              <p className="text-xs text-gray-400 mt-1">Paste the user&apos;s UUID from the Users page</p>
            </div>
            <div>
              <Label>Course *</Label>
              <Select value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
                color={formErrors.course_id ? "failure" : undefined}>
                <option value="">Select a course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </Select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCreate} disabled={saving}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null}Enroll
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Remove Enrollment</ModalHeader>
        <ModalBody><p>Are you sure you want to remove this enrollment? Progress will be lost.</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner size="sm" className="mr-2" /> : null}Remove
          </Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EnrollmentsClient;
