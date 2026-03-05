"use server";

// ==============================================================================
// Inventory & Order Management Server Actions — Phase 4
// ==============================================================================
// CRUD for: Warehouses, UOM, Product Categories, Products, Stock,
//           Purchase Orders, Sales Orders
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import {
  CreateWarehouseSchema, UpdateWarehouseSchema,
  CreateUOMSchema, UpdateUOMSchema,
  CreateProductCategorySchema, UpdateProductCategorySchema,
  CreateProductSchema, UpdateProductSchema,
  CreateStockAdjustmentSchema,
  CreatePurchaseOrderSchema, UpdatePurchaseOrderSchema,
  CreateSalesOrderSchema, UpdateSalesOrderSchema,
} from "@/lib/validations/inventory";
import { PurchaseOrderStatus, SalesOrderStatus } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

// ==============================================================================
// WAREHOUSE ACTIONS
// ==============================================================================

export async function getWarehouses({
  search = "", includeInactive = false,
}: { search?: string; includeInactive?: boolean } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (!includeInactive) where.is_active = true;
  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  const warehouses = await prisma.warehouse.findMany({
    where, orderBy: { created_at: "desc" },
    include: { _count: { select: { stock_items: true } } },
  });
  return { warehouses, total: warehouses.length };
}

export async function createWarehouse(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateWarehouseSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const warehouse = await prisma.warehouse.create({ data: { tenant_id: tenantId, ...parsed.data } });
    revalidatePath("/inventory/warehouses");
    return { warehouse };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Warehouse code already exists" };
    return { error: "Failed to create warehouse" };
  }
}

export async function updateWarehouse(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateWarehouseSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const warehouse = await prisma.warehouse.update({ where: { id }, data: parsed.data });
    revalidatePath("/inventory/warehouses");
    return { warehouse };
  } catch { return { error: "Failed to update warehouse" }; }
}

export async function deleteWarehouse(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  try {
    await prisma.warehouse.delete({ where: { id } });
    revalidatePath("/inventory/warehouses");
    return { success: true };
  } catch { return { error: "Cannot delete warehouse with existing stock" }; }
}

// ==============================================================================
// UNIT OF MEASURE ACTIONS
// ==============================================================================

export async function getUnitsOfMeasure({ search = "" }: { search?: string } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  const units = await prisma.unitOfMeasure.findMany({ where, orderBy: { code: "asc" } });
  return { units, total: units.length };
}

export async function createUOM(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateUOMSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const unit = await prisma.unitOfMeasure.create({ data: { tenant_id: tenantId, ...parsed.data } });
    revalidatePath("/inventory/uom");
    return { unit };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "UOM code already exists" };
    return { error: "Failed to create UOM" };
  }
}

export async function updateUOM(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateUOMSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const unit = await prisma.unitOfMeasure.update({ where: { id }, data: parsed.data });
    revalidatePath("/inventory/uom");
    return { unit };
  } catch { return { error: "Failed to update UOM" }; }
}

export async function deleteUOM(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  try {
    await prisma.unitOfMeasure.delete({ where: { id } });
    revalidatePath("/inventory/uom");
    return { success: true };
  } catch { return { error: "Cannot delete UOM linked to products" }; }
}

// ==============================================================================
// PRODUCT CATEGORY ACTIONS
// ==============================================================================

export async function getProductCategories({ search = "" }: { search?: string } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  const categories = await prisma.productCategory.findMany({
    where, orderBy: { sort_order: "asc" },
    include: { parent: { select: { name: true } }, _count: { select: { products: true, children: true } } },
  });
  return { categories, total: categories.length };
}

export async function createProductCategory(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateProductCategorySchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const category = await prisma.productCategory.create({ data: { tenant_id: tenantId, ...parsed.data } });
    revalidatePath("/inventory/categories");
    return { category };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Category slug already exists" };
    return { error: "Failed to create category" };
  }
}

export async function updateProductCategory(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateProductCategorySchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const category = await prisma.productCategory.update({ where: { id }, data: parsed.data });
    revalidatePath("/inventory/categories");
    return { category };
  } catch { return { error: "Failed to update category" }; }
}

export async function deleteProductCategory(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  try {
    await prisma.productCategory.delete({ where: { id } });
    revalidatePath("/inventory/categories");
    return { success: true };
  } catch { return { error: "Cannot delete category with sub-categories or products" }; }
}

// ==============================================================================
// PRODUCT ACTIONS
// ==============================================================================

export async function getProducts({
  page = 1, perPage = 20, search = "", category_id = "", product_type = "",
}: {
  page?: number; perPage?: number; search?: string;
  category_id?: string; product_type?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId, is_active: true };
  if (category_id) where.category_id = category_id;
  if (product_type) where.product_type = product_type;
  if (search) {
    where.OR = [
      { sku: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { barcode: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, skip: (page - 1) * perPage, take: perPage,
      include: {
        category: { select: { name: true } },
        uom: { select: { code: true, name: true } },
        stock_items: { select: { quantity: true, reserved: true, warehouse: { select: { name: true } } } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createProduct(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateProductSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const product = await prisma.product.create({ data: { tenant_id: tenantId, ...parsed.data } });
    revalidatePath("/inventory/products");
    return { product };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "SKU already exists" };
    return { error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateProductSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const product = await prisma.product.update({ where: { id }, data: parsed.data });
    revalidatePath("/inventory/products");
    return { product };
  } catch { return { error: "Failed to update product" }; }
}

export async function deleteProduct(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  try {
    await prisma.product.update({ where: { id }, data: { is_active: false } });
    revalidatePath("/inventory/products");
    return { success: true };
  } catch { return { error: "Failed to deactivate product" }; }
}

// ==============================================================================
// STOCK ACTIONS
// ==============================================================================

export async function getStockSummary({
  search = "", warehouse_id = "",
}: { search?: string; warehouse_id?: string } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (warehouse_id) where.warehouse_id = warehouse_id;
  if (search) {
    where.product = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const stockItems = await prisma.stockItem.findMany({
    where,
    include: {
      product: { select: { sku: true, name: true, reorder_level: true, uom: { select: { code: true } } } },
      warehouse: { select: { code: true, name: true } },
    },
    orderBy: { product: { name: "asc" } },
  });

  return { stockItems, total: stockItems.length };
}

export async function createStockAdjustment(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateStockAdjustmentSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  const { product_id, warehouse_id, movement_type, quantity, notes } = parsed.data;
  const isIn = movement_type.includes("IN") || movement_type === "OPENING_STOCK";
  const actualQty = isIn ? quantity : -quantity;

  try {
    // Upsert stock item
    await prisma.stockItem.upsert({
      where: { product_id_warehouse_id: { product_id, warehouse_id } },
      create: { tenant_id: tenantId, product_id, warehouse_id, quantity: Math.max(0, actualQty) },
      update: { quantity: { increment: actualQty } },
    });

    // Record movement
    await prisma.stockMovement.create({
      data: {
        tenant_id: tenantId,
        product_id,
        warehouse_id,
        movement_type,
        quantity: actualQty,
        notes,
        performed_by: (user as any).id,
      },
    });

    revalidatePath("/inventory/stock");
    return { success: true };
  } catch {
    return { error: "Failed to create stock adjustment" };
  }
}

export async function getStockMovements({
  page = 1, perPage = 20, product_id = "", warehouse_id = "", movement_type = "",
}: {
  page?: number; perPage?: number; product_id?: string;
  warehouse_id?: string; movement_type?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (product_id) where.product_id = product_id;
  if (warehouse_id) where.warehouse_id = warehouse_id;
  if (movement_type) where.movement_type = movement_type;

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where, skip: (page - 1) * perPage, take: perPage,
      include: {
        product: { select: { sku: true, name: true } },
        warehouse: { select: { code: true, name: true } },
      },
      orderBy: { movement_date: "desc" },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return { movements, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

// ==============================================================================
// PURCHASE ORDER ACTIONS
// ==============================================================================

export async function getPurchaseOrders({
  page = 1, perPage = 20, search = "", status = "",
}: {
  page?: number; perPage?: number; search?: string; status?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { po_number: { contains: search, mode: "insensitive" } },
      { vendor_name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [purchaseOrders, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where, skip: (page - 1) * perPage, take: perPage,
      include: { _count: { select: { items: true } }, warehouse: { select: { name: true } } },
      orderBy: { created_at: "desc" },
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  return { purchaseOrders, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createPurchaseOrder(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreatePurchaseOrderSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  const { items, order_date, expected_delivery, ...rest } = parsed.data;

  // Calculate line totals and order totals
  const lineItems = items.map((item) => {
    const gross = item.quantity * item.unit_price;
    const discount = gross * (item.discount_percent || 0) / 100;
    const taxable = gross - discount;
    const tax = taxable * (item.tax_rate || 0) / 100;
    return { ...item, tax_amount: Math.round(tax * 100) / 100, line_total: Math.round((taxable + tax) * 100) / 100 };
  });
  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const tax_amount = lineItems.reduce((s, i) => s + i.tax_amount, 0);
  const discount_amount = lineItems.reduce((s, i) => s + (i.quantity * i.unit_price * (i.discount_percent || 0) / 100), 0);
  const total_amount = lineItems.reduce((s, i) => s + i.line_total, 0);

  // Generate PO number
  const count = await prisma.purchaseOrder.count({ where: { tenant_id: tenantId } });
  const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  try {
    const po = await prisma.purchaseOrder.create({
      data: {
        tenant_id: tenantId,
        po_number: poNumber,
        ...rest,
        order_date: new Date(order_date),
        expected_delivery: expected_delivery ? new Date(expected_delivery) : null,
        subtotal, tax_amount, discount_amount, total_amount,
        created_by: (user as any).id,
        items: { create: lineItems },
      },
      include: { items: true },
    });
    revalidatePath("/orders/purchase");
    return { purchaseOrder: po };
  } catch {
    return { error: "Failed to create purchase order" };
  }
}

export async function updatePurchaseOrder(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdatePurchaseOrderSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  const updateData: any = { ...parsed.data };
  if (updateData.status) updateData.status = updateData.status as PurchaseOrderStatus;
  if (updateData.expected_delivery) updateData.expected_delivery = new Date(updateData.expected_delivery);

  try {
    const po = await prisma.purchaseOrder.update({ where: { id }, data: updateData });
    revalidatePath("/orders/purchase");
    return { purchaseOrder: po };
  } catch { return { error: "Failed to update purchase order" }; }
}

export async function deletePurchaseOrder(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const po = await prisma.purchaseOrder.findFirst({ where: { id } });
  if (!po) return { error: "Purchase order not found" };
  if (po.status !== "DRAFT") return { error: "Only DRAFT purchase orders can be deleted" };

  try {
    await prisma.purchaseOrder.delete({ where: { id } });
    revalidatePath("/orders/purchase");
    return { success: true };
  } catch { return { error: "Failed to delete purchase order" }; }
}

// ==============================================================================
// SALES ORDER ACTIONS
// ==============================================================================

export async function getSalesOrders({
  page = 1, perPage = 20, search = "", status = "",
}: {
  page?: number; perPage?: number; search?: string; status?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { so_number: { contains: search, mode: "insensitive" } },
      { customer_name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [salesOrders, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where, skip: (page - 1) * perPage, take: perPage,
      include: {
        _count: { select: { items: true } },
        customer: { select: { company_name: true } },
        warehouse: { select: { name: true } },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.salesOrder.count({ where }),
  ]);

  return { salesOrders, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createSalesOrder(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateSalesOrderSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  const { items, order_date, delivery_date, ...rest } = parsed.data;

  const lineItems = items.map((item) => {
    const gross = item.quantity * item.unit_price;
    const discount = gross * (item.discount_percent || 0) / 100;
    const taxable = gross - discount;
    const tax = taxable * (item.tax_rate || 0) / 100;
    return { ...item, tax_amount: Math.round(tax * 100) / 100, line_total: Math.round((taxable + tax) * 100) / 100 };
  });
  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const tax_amount = lineItems.reduce((s, i) => s + i.tax_amount, 0);
  const discount_amount = lineItems.reduce((s, i) => s + (i.quantity * i.unit_price * (i.discount_percent || 0) / 100), 0);
  const total_amount = lineItems.reduce((s, i) => s + i.line_total, 0);

  const count = await prisma.salesOrder.count({ where: { tenant_id: tenantId } });
  const soNumber = `SO-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  try {
    const so = await prisma.salesOrder.create({
      data: {
        tenant_id: tenantId,
        so_number: soNumber,
        ...rest,
        order_date: new Date(order_date),
        delivery_date: delivery_date ? new Date(delivery_date) : null,
        subtotal, tax_amount, discount_amount, total_amount,
        created_by: (user as any).id,
        items: { create: lineItems },
      },
      include: { items: true },
    });
    revalidatePath("/orders/sales");
    return { salesOrder: so };
  } catch {
    return { error: "Failed to create sales order" };
  }
}

export async function updateSalesOrder(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateSalesOrderSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  const updateData: any = { ...parsed.data };
  if (updateData.status) updateData.status = updateData.status as SalesOrderStatus;
  if (updateData.delivery_date) updateData.delivery_date = new Date(updateData.delivery_date);

  try {
    const so = await prisma.salesOrder.update({ where: { id }, data: updateData });
    revalidatePath("/orders/sales");
    return { salesOrder: so };
  } catch { return { error: "Failed to update sales order" }; }
}

export async function deleteSalesOrder(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const so = await prisma.salesOrder.findFirst({ where: { id } });
  if (!so) return { error: "Sales order not found" };
  if (so.status !== "DRAFT") return { error: "Only DRAFT sales orders can be deleted" };

  try {
    await prisma.salesOrder.delete({ where: { id } });
    revalidatePath("/orders/sales");
    return { success: true };
  } catch { return { error: "Failed to delete sales order" }; }
}
