"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button, TextInput, Label, Spinner, Badge, Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select,
} from "flowbite-react";
import { Icon } from "@iconify/react";
import { getRAGDocuments, createRAGDocument, updateRAGDocument, deleteRAGDocument } from "@/app/actions/ai-enhancement";

interface DocItem {
  id: string;
  title: string;
  file_type: string;
  source_url: string | null;
  file_size_bytes: number | null;
  module: string | null;
  status: string;
  chunk_count: number;
  total_tokens: number;
  metadata: any;
  processed_at: string | null;
  error_message: string | null;
  _count?: { chunks: number };
  created_at: string;
}

const FILE_TYPES = ["pdf", "docx", "html", "txt", "csv", "md"];
const STATUSES = ["PENDING", "PROCESSING", "INDEXED", "FAILED"];
const MODULES = ["crm", "accounting", "hrms", "payroll", "elearning", "partner", "general"];

const statusColors: Record<string, string> = {
  PENDING: "warning", PROCESSING: "info", INDEXED: "success", FAILED: "failure",
};

const fileTypeIcons: Record<string, string> = {
  pdf: "solar:document-text-line-duotone",
  docx: "solar:document-text-line-duotone",
  html: "solar:code-line-duotone",
  txt: "solar:text-selection-line-duotone",
  csv: "solar:chart-square-line-duotone",
  md: "solar:notebook-minimalistic-line-duotone",
};

const RAGDocumentsClient = () => {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DocItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const emptyForm = { title: "", file_type: "pdf" as string, source_url: "", module: "", metadata: {} as any };
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getRAGDocuments({
      page, perPage: 20, search,
      status: filterStatus || undefined,
      module: filterModule || undefined,
    });
    if ("error" in result) {
      setError(result.error as string);
    } else {
      setDocs((result as any).data || []);
      setTotalPages((result as any).meta?.totalPages || 1);
      setTotal((result as any).meta?.total || 0);
    }
    setLoading(false);
  }, [page, search, filterStatus, filterModule]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null); setForm(emptyForm); setFormErrors({}); setShowModal(true);
  };
  const openEdit = (d: DocItem) => {
    setEditing(d);
    setForm({ title: d.title, file_type: d.file_type, source_url: d.source_url || "", module: d.module || "", metadata: d.metadata || {} });
    setFormErrors({}); setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true); setFormErrors({});
    const payload = editing
      ? { id: editing.id, title: form.title, module: form.module || undefined, metadata: form.metadata }
      : { ...form, source_url: form.source_url || undefined, module: form.module || undefined };
    const result = editing ? await updateRAGDocument(payload) : await createRAGDocument(payload);
    if ("error" in result) {
      if (typeof result.error === "object") setFormErrors(result.error as any);
      else setError(result.error as string);
    } else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteRAGDocument(deleteModal);
    if ("error" in result) setError(result.error as string);
    else { setDeleteModal(null); fetchData(); }
    setDeleting(false);
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center gap-3">
        <TextInput placeholder="Search documents..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-4 h-4" />} className="w-64" />
        <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={filterModule} onChange={(e) => { setFilterModule(e.target.value); setPage(1); }}>
          <option value="">All Modules</option>
          {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
        </Select>
        <div className="flex-1" />
        <Badge color="gray">{total} document{total !== 1 ? "s" : ""}</Badge>
        <Button size="sm" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-4 h-4 mr-1" /> Add Document
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : docs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No documents in the knowledge base. Add your first document.</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <Table hoverable>
            <TableHead>
              <TableHeadCell>Document</TableHeadCell>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell>Module</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Chunks</TableHeadCell>
              <TableHeadCell>Size</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {docs.map((d) => (
                <TableRow key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon icon={fileTypeIcons[d.file_type] || "solar:document-text-line-duotone"} className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{d.title}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="uppercase text-xs font-mono">{d.file_type}</span></TableCell>
                  <TableCell>{d.module || "—"}</TableCell>
                  <TableCell><Badge color={statusColors[d.status] || "gray"}>{d.status}</Badge></TableCell>
                  <TableCell>{d._count?.chunks || d.chunk_count}</TableCell>
                  <TableCell>{formatBytes(d.file_size_bytes)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="xs" color="light" onClick={() => openEdit(d)}>
                        <Icon icon="solar:pen-2-line-duotone" className="w-4 h-4" />
                      </Button>
                      <Button size="xs" color="failure" onClick={() => setDeleteModal(d.id)}>
                        <Icon icon="solar:trash-bin-trash-line-duotone" className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button size="xs" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-gray-500">Page {page} of {totalPages}</span>
          <Button size="xs" color="light" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>{editing ? "Edit Document" : "Add Document"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Document Title *</Label>
              <TextInput id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                color={formErrors.title ? "failure" : undefined} />
              {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title[0]}</p>}
            </div>
            <div>
              <Label htmlFor="file_type">File Type *</Label>
              <Select id="file_type" value={form.file_type} onChange={(e) => setForm({ ...form, file_type: e.target.value })} disabled={!!editing}>
                {FILE_TYPES.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="module">Module</Label>
              <Select id="module" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}>
                <option value="">General</option>
                {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>
            {!editing && (
              <div className="md:col-span-2">
                <Label htmlFor="source_url">Source URL</Label>
                <TextInput id="source_url" type="url" value={form.source_url}
                  onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                  placeholder="https://example.com/document.pdf" />
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null}
            {editing ? "Update Document" : "Add Document"}
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Are you sure you want to delete this document and all its chunks?</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner size="sm" className="mr-2" /> : null} Delete
          </Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default RAGDocumentsClient;
