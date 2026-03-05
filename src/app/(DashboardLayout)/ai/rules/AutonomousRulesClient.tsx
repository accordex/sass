"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button, TextInput, Label, Spinner, Badge, Textarea, Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select, ToggleSwitch,
} from "flowbite-react";
import { Icon } from "@iconify/react";
import { getAutonomousRules, createAutonomousRule, updateAutonomousRule, deleteAutonomousRule } from "@/app/actions/ai-enhancement";

interface RuleItem {
  id: string;
  name: string;
  description: string | null;
  decision_type: string;
  module: string;
  conditions: any;
  actions: any;
  safeguards: any;
  priority: number;
  is_active: boolean;
  confidence_threshold: number;
  daily_limit: number;
  daily_execution_count: number;
  _count?: { decisions: number };
  created_at: string;
}

const DECISION_TYPES = [
  "LEAD_ASSIGNMENT", "INVOICE_APPROVAL", "LEAVE_APPROVAL",
  "PAYMENT_RETRY", "CONTENT_MODERATION", "SUPPORT_ROUTING", "PRICE_ADJUSTMENT",
];
const MODULES = ["crm", "accounting", "hrms", "billing", "community", "support", "partner"];

const typeColors: Record<string, string> = {
  LEAD_ASSIGNMENT: "info", INVOICE_APPROVAL: "success", LEAVE_APPROVAL: "warning",
  PAYMENT_RETRY: "purple", CONTENT_MODERATION: "dark", SUPPORT_ROUTING: "indigo",
  PRICE_ADJUSTMENT: "pink",
};

const AutonomousRulesClient = () => {
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RuleItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const emptyForm = {
    name: "", description: "", decision_type: "LEAD_ASSIGNMENT",
    module: "crm", conditions: "{}", actions: "{}", safeguards: "{}",
    priority: 100, is_active: true, confidence_threshold: 0.9, daily_limit: 0,
  };
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    const result = await getAutonomousRules({
      page, perPage: 20, search,
      decision_type: filterType || undefined,
      module: filterModule || undefined,
    });
    if ("error" in result) setError(result.error as string);
    else {
      setRules((result as any).data || []);
      setTotalPages((result as any).meta?.totalPages || 1);
      setTotal((result as any).meta?.total || 0);
    }
    setLoading(false);
  }, [page, search, filterType, filterModule]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormErrors({}); setShowModal(true); };
  const openEdit = (r: RuleItem) => {
    setEditing(r);
    setForm({
      name: r.name, description: r.description || "", decision_type: r.decision_type,
      module: r.module, conditions: JSON.stringify(r.conditions, null, 2),
      actions: JSON.stringify(r.actions, null, 2), safeguards: JSON.stringify(r.safeguards, null, 2),
      priority: r.priority, is_active: r.is_active,
      confidence_threshold: r.confidence_threshold, daily_limit: r.daily_limit,
    });
    setFormErrors({}); setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true); setFormErrors({});
    let conditions: any, actions: any, safeguards: any;
    try {
      conditions = JSON.parse(form.conditions);
      actions = JSON.parse(form.actions);
      safeguards = JSON.parse(form.safeguards);
    } catch {
      setFormErrors({ conditions: ["Invalid JSON format"] });
      setSaving(false);
      return;
    }
    const payload = editing
      ? { id: editing.id, ...form, conditions, actions, safeguards }
      : { ...form, conditions, actions, safeguards };
    const result = editing ? await updateAutonomousRule(payload) : await createAutonomousRule(payload);
    if ("error" in result) {
      if (typeof result.error === "object") setFormErrors(result.error as any);
      else setError(result.error as string);
    } else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteAutonomousRule(deleteModal);
    if ("error" in result) setError(result.error as string);
    else { setDeleteModal(null); fetchData(); }
    setDeleting(false);
  };

  const handleToggleActive = async (rule: RuleItem) => {
    await updateAutonomousRule({ id: rule.id, is_active: !rule.is_active });
    fetchData();
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center gap-3">
        <TextInput placeholder="Search rules..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-4 h-4" />} className="w-64" />
        <Select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          {DECISION_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
        </Select>
        <Select value={filterModule} onChange={(e) => { setFilterModule(e.target.value); setPage(1); }}>
          <option value="">All Modules</option>
          {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
        </Select>
        <div className="flex-1" />
        <Badge color="gray">{total} rule{total !== 1 ? "s" : ""}</Badge>
        <Button size="sm" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-4 h-4 mr-1" /> New Rule
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : rules.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No autonomous rules configured. Create your first rule.</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <Table hoverable>
            <TableHead>
              <TableHeadCell>Rule</TableHeadCell>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell>Module</TableHeadCell>
              <TableHeadCell>Priority</TableHeadCell>
              <TableHeadCell>Confidence</TableHeadCell>
              <TableHeadCell>Executions</TableHeadCell>
              <TableHeadCell>Active</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {rules.map((r) => (
                <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell>
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      {r.description && <p className="text-xs text-gray-500 line-clamp-1">{r.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell><Badge color={typeColors[r.decision_type] || "gray"}>{r.decision_type.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell className="capitalize">{r.module}</TableCell>
                  <TableCell>{r.priority}</TableCell>
                  <TableCell>{(r.confidence_threshold * 100).toFixed(0)}%</TableCell>
                  <TableCell>{r._count?.decisions || 0}{r.daily_limit > 0 ? ` / ${r.daily_limit}` : ""}</TableCell>
                  <TableCell>
                    <ToggleSwitch checked={r.is_active} onChange={() => handleToggleActive(r)} label="" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="xs" color="light" onClick={() => openEdit(r)}>
                        <Icon icon="solar:pen-2-line-duotone" className="w-4 h-4" />
                      </Button>
                      <Button size="xs" color="failure" onClick={() => setDeleteModal(r.id)}>
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
      <Modal show={showModal} onClose={() => setShowModal(false)} size="xl">
        <ModalHeader>{editing ? "Edit Rule" : "Create Autonomous Rule"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Rule Name *</Label>
              <TextInput id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                color={formErrors.name ? "failure" : undefined} />
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name[0]}</p>}
            </div>
            <div>
              <Label htmlFor="decision_type">Decision Type *</Label>
              <Select id="decision_type" value={form.decision_type} onChange={(e) => setForm({ ...form, decision_type: e.target.value })}>
                {DECISION_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="module">Module *</Label>
              <Select id="module" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}>
                {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority (lower = higher)</Label>
              <TextInput id="priority" type="number" value={form.priority}
                onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="confidence">Confidence Threshold ({(form.confidence_threshold * 100).toFixed(0)}%)</Label>
              <input id="confidence" type="range" min="0" max="1" step="0.05"
                value={form.confidence_threshold}
                onChange={(e) => setForm({ ...form, confidence_threshold: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div>
              <Label htmlFor="daily_limit">Daily Limit (0 = unlimited)</Label>
              <TextInput id="daily_limit" type="number" value={form.daily_limit}
                onChange={(e) => setForm({ ...form, daily_limit: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <ToggleSwitch checked={form.is_active} onChange={(val) => setForm({ ...form, is_active: val })} label="Active" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="conditions">Conditions (JSON) *</Label>
              <Textarea id="conditions" rows={3} value={form.conditions}
                onChange={(e) => setForm({ ...form, conditions: e.target.value })}
                className="font-mono text-sm"
                color={formErrors.conditions ? "failure" : undefined} />
              {formErrors.conditions && <p className="text-red-500 text-xs mt-1">{formErrors.conditions[0]}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="actions">Actions (JSON) *</Label>
              <Textarea id="actions" rows={3} value={form.actions}
                onChange={(e) => setForm({ ...form, actions: e.target.value })}
                className="font-mono text-sm" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="safeguards">Safeguards (JSON)</Label>
              <Textarea id="safeguards" rows={2} value={form.safeguards}
                onChange={(e) => setForm({ ...form, safeguards: e.target.value })}
                className="font-mono text-sm" />
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
            {editing ? "Update Rule" : "Create Rule"}
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Are you sure you want to delete this autonomous rule?</p></ModalBody>
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

export default AutonomousRulesClient;
