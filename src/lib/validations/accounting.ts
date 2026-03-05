// ==============================================================================
// Zod Validations — Accounting Module
// ==============================================================================

import { z } from "zod";

// --- Sales Invoice ---

const InvoiceItemSchema = z.object({
  description: z
    .string()
    .min(1, "Item description is required")
    .max(500),
  hsn_sac: z.string().max(10).optional().nullable(),
  quantity: z.number().positive("Quantity must be greater than 0").default(1),
  unit: z.string().max(20).optional().nullable(),
  unit_price: z.number().min(0, "Unit price must be 0 or more"),
  discount_rate: z.number().min(0).max(100).default(0),
  tax_rate: z.number().min(0).max(100).default(0),
  sort_order: z.number().int().default(0),
});

export const CreateSalesInvoiceSchema = z.object({
  customer_id: z.string().uuid("Please select a customer"),
  invoice_date: z.string().min(1, "Invoice date is required"),
  due_date: z.string().min(1, "Due date is required"),
  place_of_supply: z.string().max(2).optional().nullable(),
  terms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  customer_notes: z.string().optional().nullable(),
  items: z.array(InvoiceItemSchema).min(1, "At least one item is required"),
});

export const UpdateSalesInvoiceSchema = CreateSalesInvoiceSchema.partial().extend({
  id: z.string().uuid("Invalid invoice ID"),
});

// --- Purchase Bill ---

const BillItemSchema = z.object({
  description: z
    .string()
    .min(1, "Item description is required")
    .max(500),
  hsn_sac: z.string().max(10).optional().nullable(),
  quantity: z.number().positive("Quantity must be greater than 0").default(1),
  unit: z.string().max(20).optional().nullable(),
  unit_price: z.number().min(0, "Unit price must be 0 or more"),
  tax_rate: z.number().min(0).max(100).default(0),
  sort_order: z.number().int().default(0),
});

export const CreatePurchaseBillSchema = z.object({
  vendor_name: z
    .string()
    .min(1, "Vendor name is required")
    .max(255),
  vendor_gstin: z.string().max(15).optional().nullable(),
  vendor_bill_number: z.string().max(100).optional().nullable(),
  bill_date: z.string().min(1, "Bill date is required"),
  due_date: z.string().min(1, "Due date is required"),
  place_of_supply: z.string().max(2).optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(BillItemSchema).min(1, "At least one item is required"),
});

export const UpdatePurchaseBillSchema = CreatePurchaseBillSchema.partial().extend({
  id: z.string().uuid("Invalid bill ID"),
});

// --- Payment Receipt ---

export const CreatePaymentReceiptSchema = z.object({
  customer_id: z.string().uuid("Please select a customer"),
  amount: z.number().positive("Amount must be greater than 0"),
  payment_mode: z.enum([
    "CASH",
    "BANK_TRANSFER",
    "UPI",
    "CREDIT_CARD",
    "DEBIT_CARD",
    "NET_BANKING",
    "CHEQUE",
    "WALLET",
    "EMI",
    "OTHER",
  ]),
  payment_date: z.string().min(1, "Payment date is required"),
  reference_number: z.string().max(255).optional().nullable(),
  notes: z.string().optional().nullable(),
  bank_account_id: z.string().uuid().optional().nullable(),
  // Allocations: which invoices this payment applies to
  allocations: z
    .array(
      z.object({
        invoice_id: z.string().uuid(),
        amount: z.number().positive(),
      })
    )
    .optional()
    .default([]),
});

// --- Payment Made ---

export const CreatePaymentMadeSchema = z.object({
  vendor_name: z
    .string()
    .min(1, "Vendor name is required")
    .max(255),
  amount: z.number().positive("Amount must be greater than 0"),
  payment_mode: z.enum([
    "CASH",
    "BANK_TRANSFER",
    "UPI",
    "CREDIT_CARD",
    "DEBIT_CARD",
    "NET_BANKING",
    "CHEQUE",
    "WALLET",
    "EMI",
    "OTHER",
  ]),
  payment_date: z.string().min(1, "Payment date is required"),
  reference_number: z.string().max(255).optional().nullable(),
  tds_amount: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  bank_account_id: z.string().uuid().optional().nullable(),
  allocations: z
    .array(
      z.object({
        bill_id: z.string().uuid(),
        amount: z.number().positive(),
      })
    )
    .optional()
    .default([]),
});

// --- Journal Entry ---

const JournalLineSchema = z.object({
  debit_account_id: z.string().uuid().optional().nullable(),
  credit_account_id: z.string().uuid().optional().nullable(),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().max(500).optional().nullable(),
});

export const CreateJournalEntrySchema = z.object({
  entry_date: z.string().min(1, "Entry date is required"),
  description: z.string().min(1, "Description is required"),
  reference: z.string().max(255).optional().nullable(),
  lines: z
    .array(JournalLineSchema)
    .min(2, "At least two lines (debit and credit) are required"),
});

// --- Chart of Account ---

export const CreateChartOfAccountSchema = z.object({
  account_code: z
    .string()
    .min(1, "Account code is required")
    .max(20),
  account_name: z
    .string()
    .min(1, "Account name is required")
    .max(255),
  account_type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  balance_type: z.enum(["DEBIT", "CREDIT"]),
  parent_id: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
});

// --- Bank Account ---

export const CreateBankAccountSchema = z.object({
  account_name: z
    .string()
    .min(1, "Account name is required")
    .max(255),
  bank_name: z
    .string()
    .min(1, "Bank name is required")
    .max(255),
  account_number: z
    .string()
    .min(1, "Account number is required")
    .max(50),
  ifsc_code: z
    .string()
    .max(11)
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$|^$/, "Invalid IFSC code format")
    .optional()
    .nullable()
    .or(z.literal("")),
  swift_code: z.string().max(11).optional().nullable(),
  account_type: z.string().min(1, "Account type is required").max(50),
  currency: z.string().max(3).default("INR"),
  chart_account_id: z.string().uuid().optional().nullable(),
});

// --- Credit Note ---

const CreditNoteItemSchema = z.object({
  description: z.string().min(1, "Item description is required").max(500),
  hsn_sac: z.string().max(10).optional().nullable(),
  quantity: z.number().positive().default(1),
  unit_price: z.number().min(0),
  tax_rate: z.number().min(0).max(100).default(0),
  sort_order: z.number().int().default(0),
});

export const CreateCreditNoteSchema = z.object({
  customer_id: z.string().uuid("Please select a customer"),
  invoice_id: z.string().uuid().optional().nullable(),
  cn_date: z.string().min(1, "Credit note date is required"),
  reason: z.string().min(1, "Reason is required"),
  items: z.array(CreditNoteItemSchema).min(1, "At least one item is required"),
});

// --- Debit Note ---

const DebitNoteItemSchema = z.object({
  description: z.string().min(1, "Item description is required").max(500),
  hsn_sac: z.string().max(10).optional().nullable(),
  quantity: z.number().positive().default(1),
  unit_price: z.number().min(0),
  tax_rate: z.number().min(0).max(100).default(0),
  sort_order: z.number().int().default(0),
});

export const CreateDebitNoteSchema = z.object({
  bill_id: z.string().uuid().optional().nullable(),
  vendor_name: z.string().min(1, "Vendor name is required").max(255),
  dn_date: z.string().min(1, "Debit note date is required"),
  reason: z.string().min(1, "Reason is required"),
  items: z.array(DebitNoteItemSchema).min(1, "At least one item is required"),
});

// Export types
export type CreateSalesInvoiceInput = z.infer<typeof CreateSalesInvoiceSchema>;
export type UpdateSalesInvoiceInput = z.infer<typeof UpdateSalesInvoiceSchema>;
export type CreatePurchaseBillInput = z.infer<typeof CreatePurchaseBillSchema>;
export type CreatePaymentReceiptInput = z.infer<typeof CreatePaymentReceiptSchema>;
export type CreatePaymentMadeInput = z.infer<typeof CreatePaymentMadeSchema>;
export type CreateJournalEntryInput = z.infer<typeof CreateJournalEntrySchema>;
export type CreateChartOfAccountInput = z.infer<typeof CreateChartOfAccountSchema>;
export type CreateBankAccountInput = z.infer<typeof CreateBankAccountSchema>;
export type CreateCreditNoteInput = z.infer<typeof CreateCreditNoteSchema>;
export type CreateDebitNoteInput = z.infer<typeof CreateDebitNoteSchema>;
