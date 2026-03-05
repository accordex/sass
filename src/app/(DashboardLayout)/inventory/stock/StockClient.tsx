"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Label, Spinner, Badge, Select, Textarea, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getStockSummary, createStockAdjustment, getWarehouses, getProducts } from "@/app/actions/inventory";

interface StockItem {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  reserved: number;
  product: { sku: string; name: string; reorder_level: number; uom?: { code: string } | null };
  warehouse: { code: string; name: string };
}

const StockClient = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const [warehouses, setWarehouses] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; sku: string; name: string }>>([]);

  const [showAdjModal, setShowAdjModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adjForm, setAdjForm] = useState({
    product_id: "", warehouse_id: "", movement_type: "ADJUSTMENT_IN", quantity: 0, notes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getStockSummary({ search, warehouse_id: warehouseFilter });
    if ("error" in result) { setError(result.error as string); }
    else { setStockItems((result as any).stockItems || []); setTotal((result as any).total || 0); }
    setLoading(false);
  }, [search, warehouseFilter]);

  const fetchLookups = useCallback(async () => {
    const [whRes, pRes] = await Promise.all([getWarehouses(), getProducts({ perPage: 500 })]);
    if (!("error" in whRes)) setWarehouses(((whRes as any).warehouses || []).map((w: any) => ({ id: w.id, code: w.code, name: w.name })));
    if (!("error" in pRes)) setProducts(((pRes as any).products || []).map((p: any) => ({ id: p.id, sku: p.sku, name: p.name })));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchLookups(); }, [fetchLookups]);

  const openAdjust = () => {
    setAdjForm({ product_id: "", warehouse_id: "", movement_type: "ADJUSTMENT_IN", quantity: 0, notes: "" });
    setFormErrors({});
    setShowAdjModal(true);
  };

  const handleAdjust = async () => {
    setSaving(true);
    setFormErrors({});
    const result = await createStockAdjustment(adjForm);
    if ("error" in result) {
      if ((result as any).details) setFormErrors((result as any).details);
      else setError(result.error as string);
    } else { setShowAdjModal(false); fetchData(); }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <TextInput placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
            icon={() => <Icon icon="solar:magnifer-line-duotone" className="w-5 h-5" />} className="w-64" />
          <Select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
            <option value="">All Warehouses</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
          </Select>
        </div>
        <Button color="primary" onClick={openAdjust}>
          <Icon icon="solar:add-circle-line-duotone" className="w-5 h-5 mr-2" /> Stock Adjustment
        </Button>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadCell>SKU</TableHeadCell>
            <TableHeadCell>Product</TableHeadCell>
            <TableHeadCell>Warehouse</TableHeadCell>
            <TableHeadCell>Available</TableHeadCell>
            <TableHeadCell>Reserved</TableHeadCell>
            <TableHeadCell>UOM</TableHeadCell>
            <TableHeadCell>Reorder Level</TableHeadCell>
            <TableHeadCell>Alert</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><Spinner size="lg" /></TableCell></TableRow>
            ) : stockItems.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No stock items found</TableCell></TableRow>
            ) : stockItems.map((si) => {
              const qty = Number(si.quantity);
              const reorder = Number(si.product.reorder_level);
              const isLow = qty <= reorder && reorder > 0;
              return (
                <TableRow key={si.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-mono font-semibold">{si.product.sku}</TableCell>
                  <TableCell className="font-medium">{si.product.name}</TableCell>
                  <TableCell>{si.warehouse.name}</TableCell>
                  <TableCell className="text-right font-semibold">{qty}</TableCell>
                  <TableCell className="text-right">{Number(si.reserved)}</TableCell>
                  <TableCell>{si.product.uom?.code || "—"}</TableCell>
                  <TableCell className="text-right">{reorder}</TableCell>
                  <TableCell>{isLow ? <Badge color="warning">Low Stock</Badge> : <Badge color="success">OK</Badge>}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-gray-500">Total: {total} stock items</div>

      {/* Adjustment Modal */}
      <Modal show={showAdjModal} onClose={() => setShowAdjModal(false)} size="lg">
        <ModalHeader>Stock Adjustment</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="adj_product">Product *</Label>
              <Select id="adj_product" value={adjForm.product_id} onChange={(e) => setAdjForm({ ...adjForm, product_id: e.target.value })}>
                <option value="">— Select Product —</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="adj_wh">Warehouse *</Label>
              <Select id="adj_wh" value={adjForm.warehouse_id} onChange={(e) => setAdjForm({ ...adjForm, warehouse_id: e.target.value })}>
                <option value="">— Select Warehouse —</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="adj_type">Movement Type *</Label>
              <Select id="adj_type" value={adjForm.movement_type} onChange={(e) => setAdjForm({ ...adjForm, movement_type: e.target.value })}>
                <option value="ADJUSTMENT_IN">Adjustment IN</option>
                <option value="ADJUSTMENT_OUT">Adjustment OUT</option>
                <option value="OPENING_STOCK">Opening Stock</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="adj_qty">Quantity *</Label>
              <TextInput id="adj_qty" type="number" step="0.001" value={String(adjForm.quantity)} onChange={(e) => setAdjForm({ ...adjForm, quantity: Number(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="adj_notes">Notes</Label>
              <Textarea id="adj_notes" rows={2} value={adjForm.notes} onChange={(e) => setAdjForm({ ...adjForm, notes: e.target.value })} placeholder="Reason for adjustment" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAdjust} disabled={saving}>{saving ? <Spinner size="sm" className="mr-2" /> : null}Submit</Button>
          <Button color="gray" onClick={() => setShowAdjModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default StockClient;
