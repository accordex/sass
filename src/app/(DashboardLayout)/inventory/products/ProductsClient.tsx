"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Select, Textarea, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getProducts, createProduct, updateProduct, deleteProduct, getProductCategories, getUnitsOfMeasure } from "@/app/actions/inventory";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  product_type: string;
  category_id: string | null;
  uom_id: string | null;
  hsn_sac_code: string | null;
  selling_price: number;
  cost_price: number;
  tax_rate: number;
  opening_stock: number;
  reorder_level: number;
  reorder_quantity: number;
  image_url: string | null;
  barcode: string | null;
  brand: string | null;
  weight: number | null;
  is_active: boolean;
  category?: { name: string } | null;
  uom?: { code: string; name: string } | null;
  stock_items?: Array<{ quantity: number; reserved: number; warehouse: { name: string } }>;
  created_at: string;
}

interface LookupItem { id: string; name: string; code?: string }

const ProductsClient = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState<LookupItem[]>([]);
  const [uoms, setUoms] = useState<LookupItem[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState<Product | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const emptyForm = {
    sku: "", name: "", description: "", product_type: "GOODS", category_id: "", uom_id: "",
    hsn_sac_code: "", selling_price: 0, cost_price: 0, tax_rate: 0, opening_stock: 0,
    reorder_level: 0, reorder_quantity: 0, barcode: "", brand: "", weight: 0, is_active: true,
  };
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getProducts({ page, search });
    if ("error" in result) { setError(result.error as string); }
    else {
      setProducts((result as any).products || []);
      setTotal((result as any).total || 0);
      setTotalPages((result as any).totalPages || 1);
    }
    setLoading(false);
  }, [search, page]);

  const fetchLookups = useCallback(async () => {
    const [catRes, uomRes] = await Promise.all([getProductCategories(), getUnitsOfMeasure()]);
    if (!("error" in catRes)) setCategories(((catRes as any).categories || []).map((c: any) => ({ id: c.id, name: c.name })));
    if (!("error" in uomRes)) setUoms(((uomRes as any).units || []).map((u: any) => ({ id: u.id, name: u.name, code: u.code })));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchLookups(); }, [fetchLookups]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      sku: p.sku, name: p.name, description: p.description || "", product_type: p.product_type,
      category_id: p.category_id || "", uom_id: p.uom_id || "", hsn_sac_code: p.hsn_sac_code || "",
      selling_price: Number(p.selling_price), cost_price: Number(p.cost_price), tax_rate: Number(p.tax_rate),
      opening_stock: Number(p.opening_stock), reorder_level: Number(p.reorder_level),
      reorder_quantity: Number(p.reorder_quantity), barcode: p.barcode || "", brand: p.brand || "",
      weight: p.weight ? Number(p.weight) : 0, is_active: p.is_active,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const payload = { ...form, category_id: form.category_id || null, uom_id: form.uom_id || null };
    const result = editing ? await updateProduct(editing.id, payload) : await createProduct(payload);
    if ("error" in result) {
      if ((result as any).details) setFormErrors((result as any).details);
      else setError(result.error as string);
    } else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deleteProduct(deleteModal);
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setDeleteModal(null);
    setDeleting(false);
  };

  const totalStock = (p: Product) => (p.stock_items || []).reduce((s, si) => s + Number(si.quantity), 0);

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TextInput placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-5 h-5" />} className="w-64" />
        <Button color="primary" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" /> Add Product
        </Button>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>SKU</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Type</TableHeadCell>
            <TableHeadCell>Category</TableHeadCell>
            <TableHeadCell>Selling Price</TableHeadCell>
            <TableHeadCell>Cost Price</TableHeadCell>
            <TableHeadCell>Stock</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">No products found</TableCell></TableRow>
            ) : products.map((p) => (
              <TableRow key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => setViewModal(p)}>
                <TableCell className="font-mono font-semibold">{p.sku}</TableCell>
                <TableCell className="font-medium">{p.name}{p.brand && <span className="text-xs text-gray-400 ml-1">({p.brand})</span>}</TableCell>
                <TableCell><Badge color={p.product_type === "GOODS" ? "info" : "purple"}>{p.product_type}</Badge></TableCell>
                <TableCell>{p.category?.name || "—"}</TableCell>
                <TableCell className="text-right">₹{Number(p.selling_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-right">₹{Number(p.cost_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>
                  <Badge color={totalStock(p) <= Number(p.reorder_level) && p.product_type === "GOODS" ? "warning" : "success"}>
                    {totalStock(p)} {p.uom?.code || ""}
                  </Badge>
                </TableCell>
                <TableCell><Badge color={p.is_active ? "success" : "gray"}>{p.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="xs" color="light" onClick={() => openEdit(p)}><Icon icon="solar:pen-new-square-line-duotone" className="w-4 h-4" /></Button>
                    <Button size="xs" color="failure" onClick={() => setDeleteModal(p.id)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Showing {products.length} of {total} products</span>
        <div className="flex gap-2">
          <Button size="xs" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm py-1">Page {page} of {totalPages}</span>
          <Button size="xs" color="light" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>

      {/* View Modal */}
      <Modal show={!!viewModal} onClose={() => setViewModal(null)} size="xl">
        <ModalHeader>Product Details — {viewModal?.sku}</ModalHeader>
        <ModalBody>
          {viewModal && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Name:</strong> {viewModal.name}</div>
              <div><strong>Type:</strong> {viewModal.product_type}</div>
              <div><strong>Brand:</strong> {viewModal.brand || "—"}</div>
              <div><strong>Category:</strong> {viewModal.category?.name || "—"}</div>
              <div><strong>UOM:</strong> {viewModal.uom?.name || "—"}</div>
              <div><strong>HSN/SAC:</strong> {viewModal.hsn_sac_code || "—"}</div>
              <div><strong>Selling Price:</strong> ₹{Number(viewModal.selling_price).toFixed(2)}</div>
              <div><strong>Cost Price:</strong> ₹{Number(viewModal.cost_price).toFixed(2)}</div>
              <div><strong>Tax Rate:</strong> {Number(viewModal.tax_rate)}%</div>
              <div><strong>Barcode:</strong> {viewModal.barcode || "—"}</div>
              <div><strong>Weight:</strong> {viewModal.weight ? `${Number(viewModal.weight)} kg` : "—"}</div>
              <div><strong>Reorder Level:</strong> {Number(viewModal.reorder_level)}</div>
              <div className="col-span-2"><strong>Description:</strong> {viewModal.description || "—"}</div>
              {viewModal.stock_items && viewModal.stock_items.length > 0 && (
                <div className="col-span-2">
                  <strong>Stock by Warehouse:</strong>
                  <Table className="mt-2">
                    <TableHead><TableHeadCell>Warehouse</TableHeadCell><TableHeadCell>Quantity</TableHeadCell><TableHeadCell>Reserved</TableHeadCell></TableHead>
                    <TableBody className="divide-y">
                      {viewModal.stock_items.map((si, idx) => (
                        <TableRow key={idx}><TableCell>{si.warehouse.name}</TableCell><TableCell>{Number(si.quantity)}</TableCell><TableCell>{Number(si.reserved)}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </ModalBody>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="4xl">
        <ModalHeader>{editing ? "Edit Product" : "Add Product"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <TextInput id="sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g., SKU-0001" color={formErrors.sku ? "failure" : undefined} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="p_name">Name *</Label>
              <TextInput id="p_name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" color={formErrors.name ? "failure" : undefined} />
            </div>
            <div>
              <Label htmlFor="product_type">Type</Label>
              <Select id="product_type" value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })}>
                <option value="GOODS">Goods</option>
                <option value="SERVICE">Service</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="category_id">Category</Label>
              <Select id="category_id" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">— None —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="uom_id">Unit of Measure</Label>
              <Select id="uom_id" value={form.uom_id} onChange={(e) => setForm({ ...form, uom_id: e.target.value })}>
                <option value="">— None —</option>
                {uoms.map(u => <option key={u.id} value={u.id}>{u.code} — {u.name}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="selling_price">Selling Price (₹)</Label>
              <TextInput id="selling_price" type="number" step="0.01" value={String(form.selling_price)} onChange={(e) => setForm({ ...form, selling_price: Number(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="cost_price">Cost Price (₹)</Label>
              <TextInput id="cost_price" type="number" step="0.01" value={String(form.cost_price)} onChange={(e) => setForm({ ...form, cost_price: Number(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <TextInput id="tax_rate" type="number" step="0.01" value={String(form.tax_rate)} onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="hsn_sac_code">HSN/SAC Code</Label>
              <TextInput id="hsn_sac_code" value={form.hsn_sac_code} onChange={(e) => setForm({ ...form, hsn_sac_code: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <TextInput id="barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <TextInput id="brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="opening_stock">Opening Stock</Label>
              <TextInput id="opening_stock" type="number" value={String(form.opening_stock)} onChange={(e) => setForm({ ...form, opening_stock: Number(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="reorder_level">Reorder Level</Label>
              <TextInput id="reorder_level" type="number" value={String(form.reorder_level)} onChange={(e) => setForm({ ...form, reorder_level: Number(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="reorder_quantity">Reorder Qty</Label>
              <TextInput id="reorder_quantity" type="number" value={String(form.reorder_quantity)} onChange={(e) => setForm({ ...form, reorder_quantity: Number(e.target.value) })} />
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active_p" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
              <Label htmlFor="is_active_p">Active</Label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner size="sm" className="mr-2" /> : null}{editing ? "Update" : "Create"}</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Deactivation</ModalHeader>
        <ModalBody><p>Are you sure you want to deactivate this product? It will no longer appear in listings.</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-2" /> : null}Deactivate</Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProductsClient;
