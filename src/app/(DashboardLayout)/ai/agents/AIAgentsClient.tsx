"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button, TextInput, Label, Spinner, Badge, Textarea, Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select,
} from "flowbite-react";
import { Icon } from "@iconify/react";
import { getAIAgents, createAIAgent, updateAIAgent, deleteAIAgent } from "@/app/actions/ai-enhancement";

interface AgentItem {
  id: string;
  name: string;
  code: string;
  agent_type: string;
  status: string;
  description: string | null;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  capabilities: string[];
  accessible_modules: string[];
  rate_limit_per_min: number;
  is_default: boolean;
  _count?: { conversations: number };
  created_at: string;
}

const AGENT_TYPES = ["SALES", "SUPPORT", "FINANCE", "HR", "LEARNING", "PARTNER", "ORCHESTRATOR"];
const STATUSES = ["ACTIVE", "INACTIVE", "MAINTENANCE"];
const MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo", "claude-3.5-sonnet", "claude-3-haiku", "gemini-pro", "gemini-flash"];

const typeColors: Record<string, string> = {
  SALES: "info", SUPPORT: "purple", FINANCE: "success", HR: "warning",
  LEARNING: "indigo", PARTNER: "pink", ORCHESTRATOR: "dark",
};
const statusColors: Record<string, string> = {
  ACTIVE: "success", INACTIVE: "gray", MAINTENANCE: "warning",
};

const AIAgentsClient = () => {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AgentItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const emptyForm = {
    name: "", code: "", agent_type: "SALES", status: "ACTIVE",
    description: "", system_prompt: "", model: "gpt-4o",
    temperature: 0.7, max_tokens: 4096,
    capabilities: [] as string[], accessible_modules: [] as string[],
    rate_limit_per_min: 30, is_default: false,
  };

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getAIAgents({
      page, perPage: 20, search,
      agent_type: filterType || undefined,
      status: filterStatus || undefined,
    });
    if ("error" in result) {
      setError(result.error as string);
    } else {
      setAgents((result as any).data || []);
      setTotalPages((result as any).meta?.totalPages || 1);
      setTotal((result as any).meta?.total || 0);
    }
    setLoading(false);
  }, [page, search, filterType, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (agent: AgentItem) => {
    setEditing(agent);
    setForm({
      name: agent.name,
      code: agent.code,
      agent_type: agent.agent_type,
      status: agent.status,
      description: agent.description || "",
      system_prompt: agent.system_prompt,
      model: agent.model,
      temperature: agent.temperature,
      max_tokens: agent.max_tokens,
      capabilities: agent.capabilities || [],
      accessible_modules: agent.accessible_modules || [],
      rate_limit_per_min: agent.rate_limit_per_min,
      is_default: agent.is_default,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const payload = editing ? { id: editing.id, ...form } : form;
    const result = editing ? await updateAIAgent(payload) : await createAIAgent(payload);
    if ("error" in result) {
      if (typeof result.error === "object") setFormErrors(result.error as any);
      else setError(result.error as string);
    } else {
      setShowModal(false);
      fetchData();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteAIAgent(deleteModal);
    if ("error" in result) setError(result.error as string);
    else { setDeleteModal(null); fetchData(); }
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <TextInput placeholder="Search agents..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-4 h-4" />}
          className="w-64"
        />
        <Select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          {AGENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <div className="flex-1" />
        <Badge color="gray">{total} agent{total !== 1 ? "s" : ""}</Badge>
        <Button size="sm" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-4 h-4 mr-1" /> New Agent
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No AI agents found. Create your first agent.</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <Table hoverable>
            <TableHead>
              <TableHeadCell>Agent</TableHeadCell>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell>Model</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Conversations</TableHeadCell>
              <TableHeadCell>Default</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {agents.map((a) => (
                <TableRow key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell>
                    <div>
                      <p className="font-semibold">{a.name}</p>
                      <p className="text-xs text-gray-500">{a.code}</p>
                    </div>
                  </TableCell>
                  <TableCell><Badge color={typeColors[a.agent_type] || "gray"}>{a.agent_type}</Badge></TableCell>
                  <TableCell><span className="text-sm font-mono">{a.model}</span></TableCell>
                  <TableCell><Badge color={statusColors[a.status] || "gray"}>{a.status}</Badge></TableCell>
                  <TableCell>{a._count?.conversations || 0}</TableCell>
                  <TableCell>{a.is_default ? <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-green-500" /> : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="xs" color="light" onClick={() => openEdit(a)}>
                        <Icon icon="solar:pen-2-line-duotone" className="w-4 h-4" />
                      </Button>
                      <Button size="xs" color="failure" onClick={() => setDeleteModal(a.id)}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button size="xs" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-gray-500">Page {page} of {totalPages}</span>
          <Button size="xs" color="light" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="xl">
        <ModalHeader>{editing ? "Edit AI Agent" : "Create AI Agent"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Agent Name *</Label>
              <TextInput id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                color={formErrors.name ? "failure" : undefined} />
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name[0]}</p>}
            </div>
            <div>
              <Label htmlFor="code">Agent Code *</Label>
              <TextInput id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g., sales_agent" disabled={!!editing}
                color={formErrors.code ? "failure" : undefined} />
              {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code[0]}</p>}
            </div>
            <div>
              <Label htmlFor="agent_type">Agent Type *</Label>
              <Select id="agent_type" value={form.agent_type} onChange={(e) => setForm({ ...form, agent_type: e.target.value })}>
                {AGENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="model">AI Model *</Label>
              <Select id="model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}>
                {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="temperature">Temperature ({form.temperature})</Label>
              <input id="temperature" type="range" min="0" max="2" step="0.1"
                value={form.temperature} onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div>
              <Label htmlFor="max_tokens">Max Tokens</Label>
              <TextInput id="max_tokens" type="number" value={form.max_tokens}
                onChange={(e) => setForm({ ...form, max_tokens: Number(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="rate_limit">Rate Limit / Min</Label>
              <TextInput id="rate_limit" type="number" value={form.rate_limit_per_min}
                onChange={(e) => setForm({ ...form, rate_limit_per_min: Number(e.target.value) })} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="system_prompt">System Prompt *</Label>
              <Textarea id="system_prompt" rows={4} value={form.system_prompt}
                onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                placeholder="You are a helpful sales assistant..."
                color={formErrors.system_prompt ? "failure" : undefined} />
              {formErrors.system_prompt && <p className="text-red-500 text-xs mt-1">{formErrors.system_prompt[0]}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null}
            {editing ? "Update Agent" : "Create Agent"}
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Are you sure you want to delete this AI agent? All conversations will be deleted.</p></ModalBody>
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

export default AIAgentsClient;
