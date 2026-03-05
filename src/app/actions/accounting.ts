"use server";

// ==============================================================================
// Accounting Module Server Actions
// ==============================================================================
// Handles: Chart of Accounts, Journal Entries, Sales Invoices, Purchase Bills,
//          Payment Receipts, Payments Made, Credit/Debit Notes, Bank Accounts.
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import {
  CreateSalesInvoiceSchema,
  CreatePurchaseBillSchema,
  CreatePaymentReceiptSchema,
  CreatePaymentMadeSchema,
  CreateJournalEntrySchema,
  CreateChartOfAccountSchema,
  CreateBankAccountSchema,
  CreateCreditNoteSchema,
  CreateDebitNoteSchema,
} from "@/lib/validations/accounting";
import { revalidatePath } from "next/cache";

// ==============================================================================
// CHART OF ACCOUNTS
// ==============================================================================

/**
 * Get chart of accounts (tree structure).
 */
export async function getChartOfAccounts({
  type = "",
  includeInactive = false,
  page = 1,
  perPage = 100,
  search = "",
  account_type = "",
  sortBy = "account_code",
  sortOrder = "asc",
}: {
  type?: string; includeInactive?: boolean;
  page?: number; perPage?: number; search?: string;
  account_type?: string; sortBy?: string; sortOrder?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const where: any = { tenant_id: (user as any).tenantId };
  if (type || account_type) where.account_type = type || account_type;
  if (!includeInactive) where.is_active = true;
  if (search) {
    where.OR = [
      { account_code: { contains: search, mode: "insensitive" } },
      { account_name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [accounts, total] = await Promise.all([
    prisma.chartOfAccount.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.chartOfAccount.count({ where }),
  ]);

  return { data: accounts, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

/**
 * Create a new chart of account entry.
 */
export async function createChartOfAccount(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateChartOfAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  try {
    // Determine level from parent
    let level = 0;
    if (parsed.data.parent_id) {
      const parent = await prisma.chartOfAccount.findUnique({
        where: { id: parsed.data.parent_id },
      });
      if (parent) level = parent.level + 1;
    }

    const account = await prisma.chartOfAccount.create({
      data: {
        tenant_id: (user as any).tenantId,
        ...parsed.data,
        level,
      },
    });

    revalidatePath("/accounting/chart-of-accounts");
    return { data: account, success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "An account with this code already exists" };
    }
    console.error("Create account error:", error);
    return { error: error.message || "Failed to create account" };
  }
}

// ==============================================================================
// SALES INVOICES
// ==============================================================================

/**
 * List sales invoices with pagination and filtering.
 */
export async function getSalesInvoices({
  page = 1,
  perPage = 10,
  search = "",
  status = "",
  customer_id = "",
  sortBy = "invoice_date",
  sortOrder = "desc",
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  customer_id?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const tenantId = (user as any).tenantId;
  const skip = (page - 1) * perPage;

  const where: any = { tenant_id: tenantId, is_deleted: false };

  if (search) {
    where.OR = [
      { invoice_number: { contains: search, mode: "insensitive" } },
      { customer: { company_name: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (status) where.status = status;
  if (customer_id) where.customer_id = customer_id;

  const [invoices, total] = await Promise.all([
    prisma.salesInvoice.findMany({
      where,
      include: {
        customer: { select: { id: true, company_name: true, customer_code: true } },
        _count: { select: { items: true } },
      },
      skip,
      take: perPage,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.salesInvoice.count({ where }),
  ]);

  return {
    data: invoices,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

/**
 * Get a single sales invoice by ID.
 */
export async function getSalesInvoiceById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const invoice = await prisma.salesInvoice.findFirst({
    where: { id, tenant_id: (user as any).tenantId, is_deleted: false },
    include: {
      customer: true,
      items: { orderBy: { sort_order: "asc" } },
      payment_allocations: {
        include: {
          receipt: { select: { receipt_number: true, payment_date: true, payment_mode: true } },
        },
      },
      credit_notes: { where: { is_deleted: false } },
    },
  });

  if (!invoice) return { error: "Invoice not found" };
  return { data: invoice };
}

/**
 * Create a new sales invoice with line items.
 * Automatically calculates subtotal, tax, and total amounts.
 */
export async function createSalesInvoice(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateSalesInvoiceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  try {
    const tenantId = (user as any).tenantId;

    // Auto-generate invoice number
    const count = await prisma.salesInvoice.count({ where: { tenant_id: tenantId } });
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(5, "0")}`;

    // Calculate line amounts
    let subtotal = 0;
    let totalTax = 0;

    const processedItems = parsed.data.items.map((item, index) => {
      const lineSubtotal = item.quantity * item.unit_price;
      const discountAmount = lineSubtotal * (item.discount_rate / 100);
      const taxableAmount = lineSubtotal - discountAmount;
      const taxAmount = taxableAmount * (item.tax_rate / 100);
      const lineTotal = taxableAmount + taxAmount;

      subtotal += taxableAmount;
      totalTax += taxAmount;

      return {
        ...item,
        tax_amount: Math.round(taxAmount * 100) / 100,
        amount: Math.round(lineTotal * 100) / 100,
        sort_order: item.sort_order || index,
      };
    });

    const totalAmount = Math.round((subtotal + totalTax) * 100) / 100;

    const invoice = await prisma.salesInvoice.create({
      data: {
        tenant_id: tenantId,
        customer_id: parsed.data.customer_id,
        invoice_number: invoiceNumber,
        invoice_date: new Date(parsed.data.invoice_date),
        due_date: new Date(parsed.data.due_date),
        place_of_supply: parsed.data.place_of_supply,
        terms: parsed.data.terms,
        notes: parsed.data.notes,
        customer_notes: parsed.data.customer_notes,
        subtotal: Math.round(subtotal * 100) / 100,
        tax_amount: Math.round(totalTax * 100) / 100,
        total_amount: totalAmount,
        amount_due: totalAmount,
        items: {
          create: processedItems,
        },
      },
      include: { items: true },
    });

    revalidatePath("/accounting/invoices");
    return { data: invoice, success: true };
  } catch (error: any) {
    console.error("Create invoice error:", error);
    return { error: error.message || "Failed to create invoice" };
  }
}

/**
 * Delete (soft) a sales invoice. Only DRAFT invoices can be deleted.
 */
export async function deleteSalesInvoice(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const existing = await prisma.salesInvoice.findFirst({
      where: { id, tenant_id: (user as any).tenantId, is_deleted: false },
    });
    if (!existing) return { error: "Invoice not found" };
    if (existing.status !== "DRAFT") {
      return { error: "Only draft invoices can be deleted" };
    }

    await prisma.salesInvoice.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date(), status: "CANCELLED" },
    });

    revalidatePath("/accounting/invoices");
    return { success: true };
  } catch (error: any) {
    console.error("Delete invoice error:", error);
    return { error: error.message || "Failed to delete invoice" };
  }
}

// ==============================================================================
// PURCHASE BILLS
// ==============================================================================

/**
 * List purchase bills with pagination and filtering.
 */
export async function getPurchaseBills({
  page = 1,
  perPage = 10,
  search = "",
  status = "",
  sortBy = "bill_date",
  sortOrder = "desc",
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const tenantId = (user as any).tenantId;
  const skip = (page - 1) * perPage;

  const where: any = { tenant_id: tenantId, is_deleted: false };
  if (search) {
    where.OR = [
      { bill_number: { contains: search, mode: "insensitive" } },
      { vendor_name: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;

  const [bills, total] = await Promise.all([
    prisma.purchaseBill.findMany({
      where,
      include: { _count: { select: { items: true } } },
      skip,
      take: perPage,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.purchaseBill.count({ where }),
  ]);

  return {
    data: bills,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

/**
 * Create a new purchase bill with line items.
 */
export async function createPurchaseBill(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreatePurchaseBillSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  try {
    const tenantId = (user as any).tenantId;

    // Auto-generate bill number
    const count = await prisma.purchaseBill.count({ where: { tenant_id: tenantId } });
    const year = new Date().getFullYear();
    const billNumber = `BILL-${year}-${String(count + 1).padStart(5, "0")}`;

    let subtotal = 0;
    let totalTax = 0;

    const processedItems = parsed.data.items.map((item, index) => {
      const lineSubtotal = item.quantity * item.unit_price;
      const taxAmount = lineSubtotal * (item.tax_rate / 100);
      const lineTotal = lineSubtotal + taxAmount;

      subtotal += lineSubtotal;
      totalTax += taxAmount;

      return {
        ...item,
        tax_amount: Math.round(taxAmount * 100) / 100,
        amount: Math.round(lineTotal * 100) / 100,
        sort_order: item.sort_order || index,
      };
    });

    const totalAmount = Math.round((subtotal + totalTax) * 100) / 100;

    const bill = await prisma.purchaseBill.create({
      data: {
        tenant_id: tenantId,
        vendor_name: parsed.data.vendor_name,
        vendor_gstin: parsed.data.vendor_gstin,
        vendor_bill_number: parsed.data.vendor_bill_number,
        bill_number: billNumber,
        bill_date: new Date(parsed.data.bill_date),
        due_date: new Date(parsed.data.due_date),
        place_of_supply: parsed.data.place_of_supply,
        notes: parsed.data.notes,
        subtotal: Math.round(subtotal * 100) / 100,
        tax_amount: Math.round(totalTax * 100) / 100,
        total_amount: totalAmount,
        amount_due: totalAmount,
        items: {
          create: processedItems,
        },
      },
      include: { items: true },
    });

    revalidatePath("/accounting/bills");
    return { data: bill, success: true };
  } catch (error: any) {
    console.error("Create bill error:", error);
    return { error: error.message || "Failed to create bill" };
  }
}

// ==============================================================================
// PAYMENT RECEIPTS (Customer Payments)
// ==============================================================================

/**
 * List payment receipts with pagination and filtering.
 */
export async function getPaymentReceipts({
  page = 1,
  perPage = 10,
  search = "",
  status = "",
  sortBy = "payment_date",
  sortOrder = "desc",
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const tenantId = (user as any).tenantId;
  const skip = (page - 1) * perPage;

  const where: any = { tenant_id: tenantId };
  if (search) {
    where.OR = [
      { receipt_number: { contains: search, mode: "insensitive" } },
      { customer: { company_name: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (status) where.status = status;

  const [receipts, total] = await Promise.all([
    prisma.paymentReceipt.findMany({
      where,
      include: {
        customer: { select: { id: true, company_name: true } },
        bank_account: { select: { id: true, account_name: true } },
      },
      skip,
      take: perPage,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.paymentReceipt.count({ where }),
  ]);

  return {
    data: receipts,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

/**
 * Record a new payment receipt from a customer.
 */
export async function createPaymentReceipt(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreatePaymentReceiptSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  try {
    const tenantId = (user as any).tenantId;

    // Auto-generate receipt number
    const count = await prisma.paymentReceipt.count({ where: { tenant_id: tenantId } });
    const year = new Date().getFullYear();
    const receiptNumber = `REC-${year}-${String(count + 1).padStart(5, "0")}`;

    const receipt = await prisma.$transaction(async (tx) => {
      // Create the receipt
      const newReceipt = await tx.paymentReceipt.create({
        data: {
          tenant_id: tenantId,
          customer_id: parsed.data.customer_id,
          receipt_number: receiptNumber,
          amount: parsed.data.amount,
          status: "COMPLETED",
          payment_mode: parsed.data.payment_mode,
          payment_date: new Date(parsed.data.payment_date),
          reference_number: parsed.data.reference_number,
          notes: parsed.data.notes,
          bank_account_id: parsed.data.bank_account_id,
        },
      });

      // Create allocations and update invoice balances
      if (parsed.data.allocations.length > 0) {
        for (const alloc of parsed.data.allocations) {
          await tx.paymentReceiptAllocation.create({
            data: {
              receipt_id: newReceipt.id,
              invoice_id: alloc.invoice_id,
              amount: alloc.amount,
            },
          });

          // Update invoice paid amount and status
          const invoice = await tx.salesInvoice.findUnique({
            where: { id: alloc.invoice_id },
          });
          if (invoice) {
            const newAmountPaid = Number(invoice.amount_paid) + alloc.amount;
            const newAmountDue = Number(invoice.total_amount) - newAmountPaid;
            const newStatus = newAmountDue <= 0 ? "PAID" : "PARTIALLY_PAID";

            await tx.salesInvoice.update({
              where: { id: alloc.invoice_id },
              data: {
                amount_paid: newAmountPaid,
                amount_due: Math.max(0, newAmountDue),
                status: newStatus,
              },
            });
          }
        }
      }

      // Update customer outstanding amount
      await tx.customer.update({
        where: { id: parsed.data.customer_id },
        data: {
          outstanding_amount: { decrement: parsed.data.amount },
        },
      });

      return newReceipt;
    });

    revalidatePath("/accounting/payments");
    revalidatePath("/accounting/invoices");
    return { data: receipt, success: true };
  } catch (error: any) {
    console.error("Create payment receipt error:", error);
    return { error: error.message || "Failed to record payment" };
  }
}

// ==============================================================================
// PAYMENTS MADE (Vendor Payments)
// ==============================================================================

/**
 * List payments made to vendors.
 */
export async function getPaymentsMade({
  page = 1,
  perPage = 10,
  search = "",
  status = "",
  sortBy = "payment_date",
  sortOrder = "desc",
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const tenantId = (user as any).tenantId;
  const skip = (page - 1) * perPage;

  const where: any = { tenant_id: tenantId };
  if (search) {
    where.OR = [
      { payment_number: { contains: search, mode: "insensitive" } },
      { vendor_name: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;

  const [payments, total] = await Promise.all([
    prisma.paymentMade.findMany({
      where,
      include: {
        bank_account: { select: { id: true, account_name: true } },
      },
      skip,
      take: perPage,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.paymentMade.count({ where }),
  ]);

  return {
    data: payments,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

/**
 * Record a new payment made to a vendor.
 */
export async function createPaymentMade(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreatePaymentMadeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  try {
    const tenantId = (user as any).tenantId;

    const count = await prisma.paymentMade.count({ where: { tenant_id: tenantId } });
    const year = new Date().getFullYear();
    const paymentNumber = `PAY-${year}-${String(count + 1).padStart(5, "0")}`;

    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.paymentMade.create({
        data: {
          tenant_id: tenantId,
          vendor_name: parsed.data.vendor_name,
          payment_number: paymentNumber,
          amount: parsed.data.amount,
          status: "COMPLETED",
          payment_mode: parsed.data.payment_mode,
          payment_date: new Date(parsed.data.payment_date),
          reference_number: parsed.data.reference_number,
          tds_amount: parsed.data.tds_amount,
          notes: parsed.data.notes,
          bank_account_id: parsed.data.bank_account_id,
        },
      });

      // Create allocations and update bill balances
      if (parsed.data.allocations.length > 0) {
        for (const alloc of parsed.data.allocations) {
          await tx.paymentMadeAllocation.create({
            data: {
              payment_id: newPayment.id,
              bill_id: alloc.bill_id,
              amount: alloc.amount,
            },
          });

          const bill = await tx.purchaseBill.findUnique({
            where: { id: alloc.bill_id },
          });
          if (bill) {
            const newAmountPaid = Number(bill.amount_paid) + alloc.amount;
            const newAmountDue = Number(bill.total_amount) - newAmountPaid;
            const newStatus = newAmountDue <= 0 ? "PAID" : "PARTIALLY_PAID";

            await tx.purchaseBill.update({
              where: { id: alloc.bill_id },
              data: {
                amount_paid: newAmountPaid,
                amount_due: Math.max(0, newAmountDue),
                status: newStatus,
              },
            });
          }
        }
      }

      return newPayment;
    });

    revalidatePath("/accounting/payments");
    revalidatePath("/accounting/bills");
    return { data: payment, success: true };
  } catch (error: any) {
    console.error("Create payment made error:", error);
    return { error: error.message || "Failed to record payment" };
  }
}

// ==============================================================================
// JOURNAL ENTRIES
// ==============================================================================

/**
 * List journal entries.
 */
export async function getJournalEntries({
  page = 1,
  perPage = 10,
  search = "",
  status = "",
  sortBy = "entry_date",
  sortOrder = "desc",
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const tenantId = (user as any).tenantId;
  const skip = (page - 1) * perPage;

  const where: any = { tenant_id: tenantId };
  if (search) {
    where.OR = [
      { entry_number: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;

  const [entries, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where,
      include: {
        creator: { select: { id: true, first_name: true, last_name: true } },
        _count: { select: { lines: true } },
      },
      skip,
      take: perPage,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.journalEntry.count({ where }),
  ]);

  return {
    data: entries,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

/**
 * Create a manual journal entry.
 */
export async function createJournalEntry(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateJournalEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  // Validate balanced debits/credits
  let totalDebits = 0;
  let totalCredits = 0;
  for (const line of parsed.data.lines) {
    if (line.debit_account_id) totalDebits += line.amount;
    if (line.credit_account_id) totalCredits += line.amount;
  }

  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    return { error: "Journal entry must be balanced. Total debits must equal total credits." };
  }

  try {
    const tenantId = (user as any).tenantId;

    const count = await prisma.journalEntry.count({ where: { tenant_id: tenantId } });
    const year = new Date().getFullYear();
    const entryNumber = `JE-${year}-${String(count + 1).padStart(5, "0")}`;

    const entry = await prisma.journalEntry.create({
      data: {
        tenant_id: tenantId,
        entry_number: entryNumber,
        entry_date: new Date(parsed.data.entry_date),
        description: parsed.data.description,
        reference: parsed.data.reference,
        created_by: (user as any).id!,
        lines: {
          create: parsed.data.lines,
        },
      },
      include: { lines: true },
    });

    revalidatePath("/accounting/journal-entries");
    return { data: entry, success: true };
  } catch (error: any) {
    console.error("Create journal entry error:", error);
    return { error: error.message || "Failed to create journal entry" };
  }
}

// ==============================================================================
// BANK ACCOUNTS
// ==============================================================================

/**
 * List bank accounts for the tenant.
 */
export async function getBankAccounts() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const accounts = await prisma.bankAccount.findMany({
    where: { tenant_id: (user as any).tenantId },
    orderBy: { account_name: "asc" },
  });

  return { data: accounts };
}

/**
 * Create a new bank account.
 */
export async function createBankAccount(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateBankAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  try {
    const account = await prisma.bankAccount.create({
      data: {
        tenant_id: (user as any).tenantId,
        ...parsed.data,
      },
    });

    revalidatePath("/accounting/bank-accounts");
    return { data: account, success: true };
  } catch (error: any) {
    console.error("Create bank account error:", error);
    return { error: error.message || "Failed to create bank account" };
  }
}

// ==============================================================================
// ACCOUNTING DASHBOARD STATS
// ==============================================================================

/**
 * Get accounting dashboard statistics.
 */
export async function getAccountingStats() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const tenantId = (user as any).tenantId;

  const [
    totalReceivable,
    totalPayable,
    invoiceCount,
    billCount,
    overdueInvoices,
    overdueBills,
  ] = await Promise.all([
    prisma.salesInvoice.aggregate({
      where: {
        tenant_id: tenantId,
        is_deleted: false,
        status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] },
      },
      _sum: { amount_due: true },
    }),
    prisma.purchaseBill.aggregate({
      where: {
        tenant_id: tenantId,
        is_deleted: false,
        status: { in: ["RECEIVED", "PARTIALLY_PAID", "OVERDUE"] },
      },
      _sum: { amount_due: true },
    }),
    prisma.salesInvoice.count({
      where: { tenant_id: tenantId, is_deleted: false },
    }),
    prisma.purchaseBill.count({
      where: { tenant_id: tenantId, is_deleted: false },
    }),
    prisma.salesInvoice.count({
      where: { tenant_id: tenantId, is_deleted: false, status: "OVERDUE" },
    }),
    prisma.purchaseBill.count({
      where: { tenant_id: tenantId, is_deleted: false, status: "OVERDUE" },
    }),
  ]);

  return {
    data: {
      totalReceivable: totalReceivable._sum.amount_due || 0,
      totalPayable: totalPayable._sum.amount_due || 0,
      invoiceCount,
      billCount,
      overdueInvoices,
      overdueBills,
    },
  };
}
