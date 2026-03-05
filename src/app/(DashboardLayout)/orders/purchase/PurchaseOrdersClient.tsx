"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Select, Textarea, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, getWarehouses, getProducts } from "@/app/actions/inventory";

interface POItem {
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_percent: number;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_name: string;
  status: string;
  order_date: string;
  expected_delivery: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string | null;
  warehouse?: { name: string } | null;
  _count?: { items: number };
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "gray", SENT: "info", PARTIALLY_RECEIVED: "warning", RECEIVED: "success", CANCELLED: "failure",
};

const PurchaseOrdersClient = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [warehouses, setWarehouses] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; sku: string; name: string; cost_price: number; tax_rate: number }>>([]);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusModal, setStatusModal] = useState<PurchaseOrder | null>(null);

  const emptyItem = (): POItem => ({ product_id: "", description: "", quantity: 1, unit_price: 0, tax_rate: 0, discount_percent: 0 });
  const [form, setForm] = useState({
    vendor_name: "", warehouse_id: "", order_date: new Date().toISOString().slice(0, 10), expected_delivery: "", notes: "", terms: "",
    items: [emptyItem()],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getPurchaseOrders({ page, search, status: statusFilter });
    if ("error" in result) { setError(result.error as string); }
    else {
      setOrders((result as any).purchaseOrders || []);
      setTotal((result as any).total || 0);
      setTotalPages((result as any).totalPages || 1);
    }
    setLoading(false);
  }, [search, page, statusFilter]);

  const fetchLookups = useCallback(async () => {
    const [whRes, pRes] = await Promise.all([getWarehouses(), getProducts({ perPage: 500 })]);
    if (!("error" in whRes)) setWarehouses(((whRes as any).warehouses || []).map((w: any) => ({ id: w.id, code: w.code, name: w.name })));
    if (!("error" in pRes)) setProducts(((pRes as any).products || []).map((p: any) => ({ id: p.id, sku: p.sku, name: p.name, cost_price: Number(p.cost_price), tax_rate: Number(p.tax_rate) })));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchLookups(); }, [fetchLookups]);

  const openCreate = () => {
    setForm({ vendor_name: "", warehouse_id: "", order_date: new Date().toISOString().slice(0, 10), expected_delivery: "", notes: "", terms: "", items: [emptyItem()] });
    setFormErrors({});
    setShowModal(true);
  };

  const updateItem = (idx: number, field: keyof POItem, value: any) => {
    const items = [...form.items];
    (items[idx] as any)[field] = value;

    // Auto-fill price/tax when product selected
    if (field === "product_id") {
      const prod = products.find(p => p.id === value);
      if (prod) { items[idx].unit_price = prod.cost_price; items[idx].tax_rate = prod.tax_rate; }
    }

    setForm({ ...form, items });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, emptyItem()] });
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const lineTotal = (item: POItem) => {
    const gross = item.quantity * item.unit_price;
    const disc = gross * item.discount_percent / 100;
    const taxable = gross - disc;
    return taxable + (taxable * item.tax_rate / 100);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    const result = await createPurchaseOrder(form);
    if ("error" in result) {
      if ((result as any).details) setFormErrors((result as any).details);
      else setError(result.error as string);
    } else { setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleStatusChange = async (status: string) => {
    if (!statusModal) return;
    setSaving(true);
    const result = await updatePurchaseOrder(statusModal.id, { status });
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setStatusModal(null);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const result = await deletePurchaseOrder(deleteModal);
    if ("error" in result) setError(result.error as string);
    else fetchData();
    setDeleteModal(null);
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <TextInput placeholder="Search PO..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-5 h-5" />} className="w-64" />
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PARTIALLY_RECEIVED">Partially Received</option>
            <option value="RECEIVED">Received</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
        <Button color="primary" onClick={openCreate}>
          <Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" /> New Purchase Order
        </Button>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>PO #</TableHeadCell>
            <TableHeadCell>Vendor</TableHeadCell>
            <TableHeadCell>Date</TableHeadCell>
            <TableHeadCell>Warehouse</TableHeadCell>
            <TableHeadCell>Items</TableHeadCell>
            <TableHeadCell>Total</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : orders.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No purchase orders found</TableCell></TableRow>
            ) : orders.map((po) => (
              <TableRow key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="font-mono font-semibold">{po.po_number}</TableCell>
                <TableCell className="font-medium">{po.vendor_name}</TableCell>
                <TableCell>{new Date(po.order_date).toLocaleDateString()}</TableCell>
                <TableCell>{po.warehouse?.name || "—"}</TableCell>
                <TableCell><Badge color="info">{po._count?.items ?? 0}</Badge></TableCell>
                <TableCell className="text-right font-semibold">₹{Number(po.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                <TableCell><Badge color={STATUS_COLORS[po.status] || "gray"}>{po.status.replace(/_/g, " ")}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="xs" color="light" onClick={() => setStatusModal(po)} title="Change Status"><Icon icon="solar:refresh-line-duotone" className="w-4 h-4" /></Button>
                    {po.status === "DRAFT" && (
                      <Button size="xs" color="failure" onClick={() => setDeleteModal(po.id)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" className="w-4 h-4" /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Showing {orders.length} of {total} purchase orders</span>
        <div className="flex gap-2">
          <Button size="xs" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm py-1">Page {page} of {totalPages}</span>
          <Button size="xs" color="light" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>

      {/* Create Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="7xl">
        <ModalHeader>New Purchase Order</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="vendor_name">Vendor Name *</Label>
                <TextInput id="vendor_name" value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} placeholder="Vendor name" color={formErrors.vendor_name ? "failure" : undefined} />
              </div>
              <div>
                <Label htmlFor="po_wh">Warehouse</Label>
                <Select id="po_wh" value={form.warehouse_id} onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}>
                  <option value="">— Select —</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="order_date">Order Date *</Label>
                <TextInput id="order_date" type="date" value={form.order_date} onChange={(e) => setForm({ ...form, order_date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="expected_delivery">Expected Delivery</Label>
                <TextInput id="expected_delivery" type="date" value={form.expected_delivery} onChange={(e) => setForm({ ...form, expected_delivery: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="po_notes">Notes</Label>
                <Textarea id="po_notes" rows={1} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="po_terms">Terms</Label>
                <Textarea id="po_terms" rows={1} value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Line Items</h4>
                <Button size="xs" color="light" onClick={addItem}><Icon icon="solar:add-circle-line-duotone" className="w-4 h-4 mr-1" />Add Item</Button>
              </div>
              <Table>
                <TableHead>
                  <TableHeadCell>Product</TableHeadCell>
                  <TableHeadCell>Qty</TableHeadCell>
                  <TableHeadCell>Unit Price</TableHeadCell>
                  <TableHeadCell>Tax %</TableHeadCell>
                  <TableHeadCell>Disc %</TableHeadCell>
                  <TableHeadCell>Line Total</TableHeadCell>
                  <TableHeadCell></TableHeadCell>
                </TableHead>
                <TableBody className="divide-y">
                  {form.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Select value={item.product_id} onChange={(e) => updateItem(idx, "product_id", e.target.value)}>
                          <option value="">Select...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
                        </Select>
                      </TableCell>
                      <TableCell><TextInput type="number" step="0.001" value={String(item.quantity)} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} className="w-20" /></TableCell>
                      <TableCell><TextInput type="number" step="0.01" value={String(item.unit_price)} onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))} className="w-28" /></TableCell>
                      <TableCell><TextInput type="number" step="0.01" value={String(item.tax_rate)} onChange={(e) => updateItem(idx, "tax_rate", Number(e.target.value))} className="w-20" /></TableCell>
                      <TableCell><TextInput type="number" step="0.01" value={String(item.discount_percent)} onChange={(e) => updateItem(idx, "discount_percent", Number(e.target.value))} className="w-20" /></TableCell>
                      <TableCell className="text-right font-semibold">₹{lineTotal(item).toFixed(2)}</TableCell>
                      <TableCell>{form.items.length > 1 && <Button size="xs" color="failure" onClick={() => removeItem(idx)}><Icon icon="solar:trash-bin-minimalistic-line-duotone" className="w-3 h-3" /></Button>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-right mt-2 font-bold">
                Grand Total: ₹{form.items.reduce((s, i) => s + lineTotal(i), 0).toFixed(2)}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner size="sm" className="mr-2" /> : null}Create PO</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Status Modal */}
      <Modal show={!!statusModal} onClose={() => setStatusModal(null)} size="md">
        <ModalHeader>Update Status — {statusModal?.po_number}</ModalHeader>
        <ModalBody>
          <p className="mb-3">Current status: <Badge color={STATUS_COLORS[statusModal?.status || ""] || "gray"}>{statusModal?.status?.replace(/_/g, " ")}</Badge></p>
          <div className="flex flex-wrap gap-2">
            {["DRAFT", "SENT", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"].filter(s => s !== statusModal?.status).map(s => (
              <Button key={s} size="sm" color={STATUS_COLORS[s] === "failure" ? "failure" : "light"} onClick={() => handleStatusChange(s)} disabled={saving}>
                {s.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        </ModalBody>
      </Modal>

      {/* Delete Modal */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)} size="md">
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody><p>Are you sure you want to delete this draft purchase order? This action cannot be undone.</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-2" /> : null}Delete</Button>
          <Button color="gray" onClick={() => setDeleteModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PurchaseOrdersClient;
