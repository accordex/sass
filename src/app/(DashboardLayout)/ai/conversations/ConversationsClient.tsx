"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button, TextInput, Spinner, Badge, Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select,
} from "flowbite-react";
import { Icon } from "@iconify/react";
import { getAIConversations, createAIConversation, deleteAIConversation, getAIAgents } from "@/app/actions/ai-enhancement";

interface ConversationItem {
  id: string;
  title: string | null;
  status: string;
  total_tokens: number;
  total_cost: number;
  message_count: number;
  last_message_at: string | null;
  agent: { name: string; agent_type: string; code: string };
  created_at: string;
}

interface AgentOption { id: string; name: string; agent_type: string; }

const statusColors: Record<string, string> = {
  ACTIVE: "success", CLOSED: "gray", ARCHIVED: "dark",
};

const ConversationsClient = () => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newAgent, setNewAgent] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getAIConversations({
      page, perPage: 20, search,
      status: filterStatus || undefined,
    });
    if ("error" in result) {
      setError(result.error as string);
    } else {
      setConversations((result as any).data || []);
      setTotalPages((result as any).meta?.totalPages || 1);
      setTotal((result as any).meta?.total || 0);
    }
    setLoading(false);
  }, [page, search, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    getAIAgents({ perPage: 100, status: "ACTIVE" }).then((res) => {
      if ("data" in (res as any)) setAgents(((res as any).data || []).map((a: any) => ({ id: a.id, name: a.name, agent_type: a.agent_type })));
    });
  }, []);

  const handleCreate = async () => {
    if (!newAgent) return;
    setSaving(true);
    const result = await createAIConversation({ agent_id: newAgent, title: newTitle || undefined });
    if ("error" in result) setError(typeof result.error === "string" ? result.error : "Validation error");
    else { setShowModal(false); setNewAgent(""); setNewTitle(""); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteAIConversation(deleteModal);
    if ("error" in result) setError(result.error as string);
    else { setDeleteModal(null); fetchData(); }
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center gap-3">
        <TextInput placeholder="Search conversations..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-4 h-4" />}
          className="w-64"
        />
        <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="CLOSED">Closed</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
        <div className="flex-1" />
        <Badge color="gray">{total} conversation{total !== 1 ? "s" : ""}</Badge>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Icon icon="solar:add-circle-line-duotone" className="w-4 h-4 mr-1" /> New Conversation
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No conversations yet. Start a new conversation with an AI agent.</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <Table hoverable>
            <TableHead>
              <TableHeadCell>Title</TableHeadCell>
              <TableHeadCell>Agent</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Messages</TableHeadCell>
              <TableHeadCell>Tokens</TableHeadCell>
              <TableHeadCell>Last Activity</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {conversations.map((c) => (
                <TableRow key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell className="font-medium">{c.title || "Untitled Conversation"}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{c.agent.name}</p>
                      <p className="text-xs text-gray-500">{c.agent.agent_type}</p>
                    </div>
                  </TableCell>
                  <TableCell><Badge color={statusColors[c.status] || "gray"}>{c.status}</Badge></TableCell>
                  <TableCell>{c.message_count}</TableCell>
                  <TableCell>{c.total_tokens.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{c.last_message_at ? new Date(c.last_message_at).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>
                    <Button size="xs" color="failure" onClick={() => setDeleteModal(c.id)}>
                      <Icon icon="solar:trash-bin-trash-line-duotone" className="w-4 h-4" />
                    </Button>
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

      {/* New Conversation Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="md">
        <ModalHeader>Start New Conversation</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Select AI Agent *</label>
              <Select value={newAgent} onChange={(e) => setNewAgent(e.target.value)} required>
                <option value="">Choose an agent...</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.agent_type})</option>)}
              </Select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Title (optional)</label>
              <TextInput value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Conversation topic..." />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleCreate} disabled={saving || !newAgent}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null} Start Conversation
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Are you sure you want to delete this conversation and all its messages?</p></ModalBody>
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

export default ConversationsClient;
