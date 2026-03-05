"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button, TextInput, Label, Spinner, Badge, Textarea, Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select,
} from "flowbite-react";
import { Icon } from "@iconify/react";
import { getAutonomousDecisions, overrideAutonomousDecision } from "@/app/actions/ai-enhancement";

interface DecisionItem {
  id: string;
  decision_type: string;
  module: string;
  resource_type: string;
  resource_id: string | null;
  status: string;
  confidence: number | null;
  model_used: string | null;
  reasoning: string | null;
  was_overridden: boolean;
  override_reason: string | null;
  executed_at: string | null;
  rolled_back_at: string | null;
  rule: { name: string; decision_type: string } | null;
  created_at: string;
}

const DECISION_TYPES = [
  "LEAD_ASSIGNMENT", "INVOICE_APPROVAL", "LEAVE_APPROVAL",
  "PAYMENT_RETRY", "CONTENT_MODERATION", "SUPPORT_ROUTING", "PRICE_ADJUSTMENT",
];
const STATUSES = ["PENDING", "APPROVED", "REJECTED", "EXECUTED", "ROLLED_BACK"];

const statusColors: Record<string, string> = {
  PENDING: "warning", APPROVED: "info", REJECTED: "failure",
  EXECUTED: "success", ROLLED_BACK: "dark",
};

const DecisionsClient = () => {
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [overrideModal, setOverrideModal] = useState<DecisionItem | null>(null);
  const [overrideStatus, setOverrideStatus] = useState("APPROVED");
  const [overrideReason, setOverrideReason] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    const result = await getAutonomousDecisions({
      page, perPage: 20, search,
      decision_type: filterType || undefined,
      status: filterStatus || undefined,
    });
    if ("error" in result) setError(result.error as string);
    else {
      setDecisions((result as any).data || []);
      setTotalPages((result as any).meta?.totalPages || 1);
      setTotal((result as any).meta?.total || 0);
    }
    setLoading(false);
  }, [page, search, filterType, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOverride = async () => {
    if (!overrideModal) return;
    setSaving(true);
    const result = await overrideAutonomousDecision({
      id: overrideModal.id, status: overrideStatus, override_reason: overrideReason,
    });
    if ("error" in result) {
      if (typeof result.error === "string") setError(result.error);
    } else { setOverrideModal(null); setOverrideReason(""); fetchData(); }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center gap-3">
        <TextInput placeholder="Search decisions..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-4 h-4" />} className="w-64" />
        <Select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          {DECISION_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
        </Select>
        <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <div className="flex-1" />
        <Badge color="gray">{total} decision{total !== 1 ? "s" : ""}</Badge>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : decisions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No autonomous decisions recorded yet.</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <Table hoverable>
            <TableHead>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell>Module</TableHeadCell>
              <TableHeadCell>Resource</TableHeadCell>
              <TableHeadCell>Rule</TableHeadCell>
              <TableHeadCell>Confidence</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Overridden</TableHeadCell>
              <TableHeadCell>Date</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {decisions.map((d) => (
                <TableRow key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell><Badge color="info">{d.decision_type.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell className="capitalize">{d.module}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{d.resource_type}</p>
                      {d.resource_id && <p className="text-xs text-gray-400 font-mono">{d.resource_id.substring(0, 8)}...</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{d.rule?.name || "—"}</TableCell>
                  <TableCell>{d.confidence ? `${(d.confidence * 100).toFixed(0)}%` : "—"}</TableCell>
                  <TableCell><Badge color={statusColors[d.status] || "gray"}>{d.status}</Badge></TableCell>
                  <TableCell>{d.was_overridden ? <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-orange-500" /> : "—"}</TableCell>
                  <TableCell className="text-sm">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {d.status === "PENDING" && (
                      <Button size="xs" color="light" onClick={() => { setOverrideModal(d); setOverrideStatus("APPROVED"); }}>
                        <Icon icon="solar:shield-check-line-duotone" className="w-4 h-4 mr-1" /> Override
                      </Button>
                    )}
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

      {/* Override Modal */}
      <Modal show={!!overrideModal} onClose={() => setOverrideModal(null)} size="md">
        <ModalHeader>Override Decision</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {overrideModal?.reasoning && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium mb-1">AI Reasoning:</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{overrideModal.reasoning}</p>
              </div>
            )}
            <div>
              <Label htmlFor="override_status">Override Status</Label>
              <Select id="override_status" value={overrideStatus} onChange={(e) => setOverrideStatus(e.target.value)}>
                <option value="APPROVED">Approve</option>
                <option value="REJECTED">Reject</option>
                <option value="ROLLED_BACK">Roll Back</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="override_reason">Reason *</Label>
              <Textarea id="override_reason" rows={3} value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Explain why you are overriding this decision..." />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleOverride} disabled={saving || overrideReason.length < 5}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null} Confirm Override
          </Button>
          <Button color="gray" onClick={() => setOverrideModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DecisionsClient;
