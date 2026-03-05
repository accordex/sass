"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Textarea, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select, Pagination } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getCourses, createCourse, updateCourse, deleteCourse, getCourseCategories } from "@/app/actions/elearning";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  thumbnail_url: string | null;
  category_id: string | null;
  level: string;
  duration_minutes: number;
  instructor_id: string | null;
  price: number;
  is_published: boolean;
  enrollment_type: string;
  certificate_enabled: boolean;
  passing_score: number;
  max_enrollments: number | null;
  tags: string[];
  is_active: boolean;
  category?: { id: string; name: string } | null;
  instructor?: { id: string; first_name: string; last_name: string } | null;
  _count?: { modules: number; enrollments: number; certificates: number };
  created_at: string;
}

interface Category { id: string; name: string; slug: string; }

const CoursesClient = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const defaultForm = {
    title: "", slug: "", description: "", short_description: "", thumbnail_url: "",
    category_id: "", level: "BEGINNER", duration_minutes: 0, price: 0,
    is_published: false, enrollment_type: "OPEN", certificate_enabled: false,
    passing_score: 70, max_enrollments: "" as string | number, tags: "" as string,
  };

  const [form, setForm] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    const [coursesRes, catRes] = await Promise.all([
      getCourses({ page, perPage: 15, search }),
      getCourseCategories({}),
    ]);
    if ("error" in coursesRes) { setError(coursesRes.error as string); }
    else {
      setCourses((coursesRes as any).courses || []);
      setTotal((coursesRes as any).total || 0);
      setTotalPages((coursesRes as any).totalPages || 1);
    }
    if (!("error" in catRes)) setCategories((catRes as any).categories || []);
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (course: Course) => {
    setEditing(course);
    setForm({
      title: course.title, slug: course.slug,
      description: course.description || "", short_description: course.short_description || "",
      thumbnail_url: course.thumbnail_url || "", category_id: course.category_id || "",
      level: course.level, duration_minutes: course.duration_minutes,
      price: Number(course.price), is_published: course.is_published,
      enrollment_type: course.enrollment_type, certificate_enabled: course.certificate_enabled,
      passing_score: course.passing_score,
      max_enrollments: course.max_enrollments ?? "",
      tags: Array.isArray(course.tags) ? course.tags.join(", ") : "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setSaving(true); setFormErrors({});
    const tagsArray = typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    const payload = {
      ...form,
      category_id: form.category_id || null,
      description: form.description || null,
      short_description: form.short_description || null,
      thumbnail_url: form.thumbnail_url || null,
      max_enrollments: form.max_enrollments ? Number(form.max_enrollments) : null,
      tags: tagsArray,
    };

    const result = editing
      ? await updateCourse(editing.id, payload)
      : await createCourse(payload);

    if ("error" in result) { setFormErrors((result as any).details || {}); setError(result.error as string); }
    else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteCourse(deleteModal);
    if ("error" in result) setError(result.error as string);
    else { setDeleteModal(null); fetchData(); }
    setDeleting(false);
  };

  const levelColors: Record<string, string> = { BEGINNER: "success", INTERMEDIATE: "warning", ADVANCED: "failure" };

  return (
    <div className="rounded-lg shadow-md bg-white dark:bg-gray-800 p-6">
      {error && <Alert color="failure" className="mb-4" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-4 items-center">
          <TextInput icon={() => <Icon icon="solar:magnifer-line-duotone" className="text-lg" />}
            placeholder="Search courses..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="max-w-xs" />
          <span className="text-sm text-gray-500">{total} course(s)</span>
        </div>
        <Button color="primary" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="mr-2 text-lg" /> New Course
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      ) : courses.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No courses found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Title</TableHeadCell>
                <TableHeadCell>Category</TableHeadCell>
                <TableHeadCell>Level</TableHeadCell>
                <TableHeadCell>Duration</TableHeadCell>
                <TableHeadCell>Price</TableHeadCell>
                <TableHeadCell>Modules</TableHeadCell>
                <TableHeadCell>Enrollments</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {courses.map(course => (
                  <TableRow key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell>
                      <div>
                        <span className="font-medium">{course.title}</span>
                        {course.short_description && <p className="text-xs text-gray-400 truncate max-w-[200px]">{course.short_description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{course.category?.name || "—"}</TableCell>
                    <TableCell><Badge color={levelColors[course.level] || "info"}>{course.level}</Badge></TableCell>
                    <TableCell>{course.duration_minutes > 0 ? `${course.duration_minutes} min` : "—"}</TableCell>
                    <TableCell>{Number(course.price) > 0 ? `₹${Number(course.price).toLocaleString()}` : "Free"}</TableCell>
                    <TableCell><Badge color="info">{course._count?.modules || 0}</Badge></TableCell>
                    <TableCell><Badge color="purple">{course._count?.enrollments || 0}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-col">
                        <Badge color={course.is_published ? "success" : "gray"}>{course.is_published ? "Published" : "Draft"}</Badge>
                        {course.certificate_enabled && <Badge color="warning" className="text-xs">Certificate</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="xs" color="info" onClick={() => openEdit(course)}><Icon icon="solar:pen-line-duotone" /></Button>
                        <Button size="xs" color="failure" onClick={() => setDeleteModal(course.id)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" /></Button>
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

      {/* Create / Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="3xl">
        <ModalHeader>{editing ? "Edit Course" : "New Course"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Title *</Label>
              <TextInput value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: editing ? f.slug : generateSlug(e.target.value) }))}
                color={formErrors.title ? "failure" : undefined} />
            </div>
            <div>
              <Label>Slug *</Label>
              <TextInput value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                color={formErrors.slug ? "failure" : undefined} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Short Description</Label>
              <TextInput value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Label>Full Description</Label>
              <Textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Level</Label>
              <Select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </Select>
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <TextInput type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Price (₹)</Label>
              <TextInput type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Enrollment Type</Label>
              <Select value={form.enrollment_type} onChange={e => setForm(f => ({ ...f, enrollment_type: e.target.value }))}>
                <option value="OPEN">Open</option>
                <option value="RESTRICTED">Restricted</option>
                <option value="ASSIGNED">Assigned</option>
              </Select>
            </div>
            <div>
              <Label>Max Enrollments</Label>
              <TextInput type="number" placeholder="Unlimited" value={form.max_enrollments} onChange={e => setForm(f => ({ ...f, max_enrollments: e.target.value }))} />
            </div>
            <div>
              <Label>Passing Score (%)</Label>
              <TextInput type="number" min={0} max={100} value={form.passing_score} onChange={e => setForm(f => ({ ...f, passing_score: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Thumbnail URL</Label>
              <TextInput value={form.thumbnail_url} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <TextInput value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="react, nextjs, web" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="rounded" />
                <span>Published</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.certificate_enabled} onChange={e => setForm(f => ({ ...f, certificate_enabled: e.target.checked }))} className="rounded" />
                <span>Certificate Enabled</span>
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null}{editing ? "Update" : "Create"}
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Are you sure you want to delete this course? This will also remove all modules, lessons, and enrollments.</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner size="sm" className="mr-2" /> : null}Delete
          </Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CoursesClient;
