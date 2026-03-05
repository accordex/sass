"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Textarea, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select, Pagination } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getForumPosts, createForumPost, updateForumPost, deleteForumPost, getForumCategories, getForumPost, createForumReply } from "@/app/actions/elearning";

interface ForumPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  post_type: string;
  moderation: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  upvote_count: number;
  reply_count: number;
  tags: string[];
  category?: { id: string; name: string; slug: string } | null;
  author?: { id: string; first_name: string; last_name: string; avatar_url: string | null } | null;
  _count?: { replies: number };
  created_at: string;
}

interface ForumCategory { id: string; name: string; slug: string; }

const DiscussionsClient = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    title: "", slug: "", content: "", category_id: "", post_type: "DISCUSSION", tags: "",
  });
  const [replyContent, setReplyContent] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    const [postsRes, catRes] = await Promise.all([
      getForumPosts({ page, perPage: 15, search, category_id: filterCategory || undefined, post_type: filterType || undefined }),
      getForumCategories({}),
    ]);
    if ("error" in postsRes) { setError(postsRes.error as string); }
    else {
      setPosts((postsRes as any).posts || []);
      setTotal((postsRes as any).total || 0);
      setTotalPages((postsRes as any).totalPages || 1);
    }
    if (!("error" in catRes)) setCategories((catRes as any).categories || []);
    setLoading(false);
  }, [search, page, filterCategory, filterType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

  const openCreate = () => {
    setForm({ title: "", slug: "", content: "", category_id: "", post_type: "DISCUSSION", tags: "" });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const openView = async (postId: string) => {
    const result = await getForumPost(postId);
    if ("error" in result) { setError(result.error as string); return; }
    setSelectedPost((result as any).post);
    setReplyContent("");
    setShowViewModal(true);
  };

  const handleCreate = async () => {
    setSaving(true); setFormErrors({});
    const tagsArray = form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    const payload = {
      ...form,
      slug: form.slug || generateSlug(form.title),
      category_id: form.category_id || null,
      tags: tagsArray,
    };
    const result = await createForumPost(payload);
    if ("error" in result) { setFormErrors((result as any).details || {}); setError(result.error as string); }
    else { setShowCreateModal(false); fetchData(); }
    setSaving(false);
  };

  const handleReply = async () => {
    if (!selectedPost || !replyContent.trim()) return;
    setSaving(true);
    const result = await createForumReply({ post_id: selectedPost.id, content: replyContent });
    if ("error" in result) setError(result.error as string);
    else {
      setReplyContent("");
      // Refresh post
      const fresh = await getForumPost(selectedPost.id);
      if (!("error" in fresh)) setSelectedPost((fresh as any).post);
      fetchData();
    }
    setSaving(false);
  };

  const togglePin = async (postId: string, currentPinned: boolean) => {
    await updateForumPost(postId, { is_pinned: !currentPinned });
    fetchData();
  };

  const toggleLock = async (postId: string, currentLocked: boolean) => {
    await updateForumPost(postId, { is_locked: !currentLocked });
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteForumPost(deleteModal);
    if ("error" in result) setError(result.error as string);
    else { setDeleteModal(null); fetchData(); }
    setDeleting(false);
  };

  const postTypeColors: Record<string, string> = {
    DISCUSSION: "info", QUESTION: "warning", ANNOUNCEMENT: "failure", IDEA: "purple", ARTICLE: "success",
  };

  return (
    <div className="rounded-lg shadow-md bg-white dark:bg-gray-800 p-6">
      {error && <Alert color="failure" className="mb-4" onDismiss={() => setError("")}>{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-3 flex-wrap items-center">
          <TextInput icon={() => <Icon icon="solar:magnifer-line-duotone" className="text-lg" />}
            placeholder="Search discussions..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="max-w-xs" />
          <Select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="DISCUSSION">Discussion</option>
            <option value="QUESTION">Question</option>
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="IDEA">Idea</option>
            <option value="ARTICLE">Article</option>
          </Select>
          <span className="text-sm text-gray-500">{total} post(s)</span>
        </div>
        <Button color="primary" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="mr-2 text-lg" /> New Post
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No discussions found. Start a new one!</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Title</TableHeadCell>
                <TableHeadCell>Type</TableHeadCell>
                <TableHeadCell>Category</TableHeadCell>
                <TableHeadCell>Author</TableHeadCell>
                <TableHeadCell>Replies</TableHeadCell>
                <TableHeadCell>Views</TableHeadCell>
                <TableHeadCell>Date</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {posts.map(post => (
                  <TableRow key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => openView(post.id)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {post.is_pinned && <Icon icon="solar:pin-bold-duotone" className="text-yellow-500" />}
                        {post.is_locked && <Icon icon="solar:lock-line-duotone" className="text-red-500" />}
                        <span className="font-medium">{post.title}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge color={postTypeColors[post.post_type] || "info"}>{post.post_type}</Badge></TableCell>
                    <TableCell className="text-sm">{post.category?.name || "—"}</TableCell>
                    <TableCell className="text-sm">{post.author?.first_name} {post.author?.last_name}</TableCell>
                    <TableCell><Badge color="info">{post.reply_count}</Badge></TableCell>
                    <TableCell className="text-sm text-gray-500">{post.view_count}</TableCell>
                    <TableCell className="text-sm">{new Date(post.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <Button size="xs" color={post.is_pinned ? "warning" : "gray"} onClick={() => togglePin(post.id, post.is_pinned)} title={post.is_pinned ? "Unpin" : "Pin"}>
                          <Icon icon="solar:pin-line-duotone" />
                        </Button>
                        <Button size="xs" color={post.is_locked ? "failure" : "gray"} onClick={() => toggleLock(post.id, post.is_locked)} title={post.is_locked ? "Unlock" : "Lock"}>
                          <Icon icon={post.is_locked ? "solar:lock-line-duotone" : "solar:lock-unlocked-line-duotone"} />
                        </Button>
                        <Button size="xs" color="failure" onClick={() => setDeleteModal(post.id)}>
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

      {/* Create Post Modal */}
      <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} size="2xl">
        <ModalHeader>New Discussion Post</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <TextInput value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                color={formErrors.title ? "failure" : undefined} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
              <div>
                <Label>Post Type</Label>
                <Select value={form.post_type} onChange={e => setForm(f => ({ ...f, post_type: e.target.value }))}>
                  <option value="DISCUSSION">Discussion</option>
                  <option value="QUESTION">Question</option>
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="IDEA">Idea</option>
                  <option value="ARTICLE">Article</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Content *</Label>
              <Textarea rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                color={formErrors.content ? "failure" : undefined} />
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <TextInput value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="help, bug, feature" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCreate} disabled={saving}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null}Publish
          </Button>
          <Button color="gray" onClick={() => setShowCreateModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* View Post Modal */}
      <Modal show={showViewModal} onClose={() => setShowViewModal(false)} size="3xl">
        <ModalHeader>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedPost?.is_pinned && <Badge color="warning">Pinned</Badge>}
            <Badge color={postTypeColors[selectedPost?.post_type] || "info"}>{selectedPost?.post_type}</Badge>
            <span>{selectedPost?.title}</span>
          </div>
        </ModalHeader>
        <ModalBody>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>By <strong>{selectedPost.author?.first_name} {selectedPost.author?.last_name}</strong></span>
                <span>•</span>
                <span>{new Date(selectedPost.created_at).toLocaleString()}</span>
                <span>•</span>
                <span>{selectedPost.view_count} views</span>
                {selectedPost.category && <><span>•</span><Badge color="info">{selectedPost.category.name}</Badge></>}
              </div>

              <div className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-900 p-4 rounded-lg whitespace-pre-wrap">
                {selectedPost.content}
              </div>

              {/* Replies */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">
                  <Icon icon="solar:chat-round-dots-line-duotone" className="inline mr-2" />
                  Replies ({selectedPost.replies?.length || 0})
                </h4>

                {selectedPost.replies?.map((reply: any) => (
                  <div key={reply.id} className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <strong>{reply.author?.first_name} {reply.author?.last_name}</strong>
                      <span>•</span>
                      <span>{new Date(reply.created_at).toLocaleString()}</span>
                      {reply.is_accepted && <Badge color="success">Accepted</Badge>}
                    </div>
                    <div className="whitespace-pre-wrap">{reply.content}</div>

                    {/* Nested replies */}
                    {reply.children?.map((child: any) => (
                      <div key={child.id} className="ml-6 mt-2 p-2 bg-white dark:bg-gray-800 rounded border-l-2 border-blue-300">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                          <strong>{child.author?.first_name} {child.author?.last_name}</strong>
                          <span>•</span>
                          <span>{new Date(child.created_at).toLocaleString()}</span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{child.content}</div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Reply Form */}
                {!selectedPost.is_locked && (
                  <div className="mt-4">
                    <Label>Write a Reply</Label>
                    <Textarea rows={3} value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Share your thoughts..." />
                    <Button color="primary" size="sm" className="mt-2" onClick={handleReply} disabled={saving || !replyContent.trim()}>
                      {saving ? <Spinner size="sm" className="mr-2" /> : null}Reply
                    </Button>
                  </div>
                )}
                {selectedPost.is_locked && (
                  <p className="text-sm text-gray-500 italic mt-2">
                    <Icon icon="solar:lock-line-duotone" className="inline mr-1" />This post is locked. No new replies allowed.
                  </p>
                )}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setShowViewModal(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Are you sure you want to delete this post and all its replies?</p></ModalBody>
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

export default DiscussionsClient;
