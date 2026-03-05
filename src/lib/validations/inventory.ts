// ==============================================================================
// Inventory & Order Management — Zod Validation Schemas — Phase 4
// ==============================================================================
// Covers: Warehouses, UOM, Product Categories, Products, Stock,
//         Purchase Orders, Sales Orders
// ==============================================================================

import { z } from "zod";

// ==============================================================================
// WAREHOUSE
// ==============================================================================

export const CreateWarehouseSchema = z.object({
  code: z.string().min(1, "Code is required").max(30),
  name: z.string().min(1, "Name is required").max(255),
  address: z.string().optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().max(20).optional().nullable(),
  contact_person: z.string().max(255).optional().nullable(),
  contact_phone: z.string().max(30).optional().nullable(),
  is_default: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
});

export const UpdateWarehouseSchema = CreateWarehouseSchema.partial();

// ==============================================================================
// UNIT OF MEASURE
// ==============================================================================

export const CreateUOMSchema = z.object({
  code: z.string().min(1, "Code is required").max(20),
  name: z.string().min(1, "Name is required").max(100),
  is_active: z.boolean().optional().default(true),
});

export const UpdateUOMSchema = CreateUOMSchema.partial();

// ==============================================================================
// PRODUCT CATEGORY
// ==============================================================================

export const CreateProductCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  parent_id: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  image_url: z.string().max(500).optional().nullable(),
  sort_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export const UpdateProductCategorySchema = CreateProductCategorySchema.partial();

// ==============================================================================
// PRODUCT
// ==============================================================================

export const CreateProductSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(50),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional().nullable(),
  product_type: z.enum(["GOODS", "SERVICE"]).optional().default("GOODS"),
  category_id: z.string().uuid().optional().nullable(),
  uom_id: z.string().uuid().optional().nullable(),
  hsn_sac_code: z.string().max(20).optional().nullable(),
  selling_price: z.number().min(0).optional().default(0),
  cost_price: z.number().min(0).optional().default(0),
  tax_rate: z.number().min(0).max(100).optional().default(0),
  opening_stock: z.number().min(0).optional().default(0),
  reorder_level: z.number().min(0).optional().default(0),
  reorder_quantity: z.number().min(0).optional().default(0),
  image_url: z.string().max(500).optional().nullable(),
  barcode: z.string().max(50).optional().nullable(),
  brand: z.string().max(255).optional().nullable(),
  weight: z.number().min(0).optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const UpdateProductSchema = CreateProductSchema.partial();

// ==============================================================================
// STOCK ADJUSTMENT (manual stock movement)
// ==============================================================================

export const CreateStockAdjustmentSchema = z.object({
  product_id: z.string().uuid("Product is required"),
  warehouse_id: z.string().uuid("Warehouse is required"),
  movement_type: z.enum([
    "ADJUSTMENT_IN", "ADJUSTMENT_OUT", "OPENING_STOCK",
  ]),
  quantity: z.number().min(0.001, "Quantity must be positive"),
  notes: z.string().optional().nullable(),
});

// ==============================================================================
// PURCHASE ORDER
// ==============================================================================

const PurchaseOrderItemSchema = z.object({
  product_id: z.string().uuid("Product is required"),
  description: z.string().max(500).optional().nullable(),
  quantity: z.number().min(0.001, "Quantity must be > 0"),
  unit_price: z.number().min(0, "Unit price must be >= 0"),
  tax_rate: z.number().min(0).max(100).optional().default(0),
  discount_percent: z.number().min(0).max(100).optional().default(0),
  sort_order: z.number().int().optional().default(0),
});

export const CreatePurchaseOrderSchema = z.object({
  vendor_name: z.string().min(1, "Vendor name is required").max(255),
  vendor_id: z.string().uuid().optional().nullable(),
  warehouse_id: z.string().uuid().optional().nullable(),
  order_date: z.string().min(1, "Order date is required"),
  expected_delivery: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  items: z.array(PurchaseOrderItemSchema).min(1, "At least one item is required"),
});

export const UpdatePurchaseOrderSchema = z.object({
  vendor_name: z.string().min(1).max(255).optional(),
  warehouse_id: z.string().uuid().optional().nullable(),
  expected_delivery: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "SENT", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"]).optional(),
});

// ==============================================================================
// SALES ORDER
// ==============================================================================

const SalesOrderItemSchema = z.object({
  product_id: z.string().uuid("Product is required"),
  description: z.string().max(500).optional().nullable(),
  quantity: z.number().min(0.001, "Quantity must be > 0"),
  unit_price: z.number().min(0, "Unit price must be >= 0"),
  tax_rate: z.number().min(0).max(100).optional().default(0),
  discount_percent: z.number().min(0).max(100).optional().default(0),
  sort_order: z.number().int().optional().default(0),
});

export const CreateSalesOrderSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required").max(255),
  customer_id: z.string().uuid().optional().nullable(),
  warehouse_id: z.string().uuid().optional().nullable(),
  order_date: z.string().min(1, "Order date is required"),
  delivery_date: z.string().optional().nullable(),
  shipping_address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(SalesOrderItemSchema).min(1, "At least one item is required"),
});

export const UpdateSalesOrderSchema = z.object({
  customer_name: z.string().min(1).max(255).optional(),
  warehouse_id: z.string().uuid().optional().nullable(),
  delivery_date: z.string().optional().nullable(),
  shipping_address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "CONFIRMED", "PARTIALLY_SHIPPED", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
});
