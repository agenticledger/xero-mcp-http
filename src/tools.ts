import { z } from 'zod';
import { XeroClient } from './api-client.js';

interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  handler: (client: XeroClient, args: any) => Promise<any>;
}

export const tools: ToolDef[] = [
  // ── Organisation ──
  {
    name: 'org_get',
    description: 'Get organisation details',
    inputSchema: z.object({}),
    handler: async (client) => client.getOrganisation(),
  },

  // ── Accounts ──
  {
    name: 'accounts_list',
    description: 'List chart of accounts',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter e.g. Type=="REVENUE"'),
      order: z.string().optional().describe('sort e.g. Name ASC'),
    }),
    handler: async (client, args) =>
      client.listAccounts({ where: args.where, order: args.order }),
  },
  {
    name: 'account_get',
    description: 'Get account by ID',
    inputSchema: z.object({
      account_id: z.string().describe('account UUID'),
    }),
    handler: async (client, args) => client.getAccount(args.account_id),
  },
  {
    name: 'account_create',
    description: 'Create a new account',
    inputSchema: z.object({
      data: z.string().describe('account JSON with Name, Code, Type'),
    }),
    handler: async (client, args) => client.createAccount(JSON.parse(args.data)),
  },

  // ── Contacts ──
  {
    name: 'contacts_list',
    description: 'List contacts (customers and suppliers)',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
      page: z.number().optional().describe('page number'),
      include_archived: z.boolean().optional().describe('include archived'),
    }),
    handler: async (client, args) =>
      client.listContacts({
        where: args.where,
        order: args.order,
        page: args.page,
        includeArchived: args.include_archived,
      }),
  },
  {
    name: 'contact_get',
    description: 'Get contact by ID',
    inputSchema: z.object({
      contact_id: z.string().describe('contact UUID'),
    }),
    handler: async (client, args) => client.getContact(args.contact_id),
  },
  {
    name: 'contact_create',
    description: 'Create or update contacts',
    inputSchema: z.object({
      data: z.string().describe('contacts JSON with Name, EmailAddress'),
    }),
    handler: async (client, args) =>
      client.createOrUpdateContacts(JSON.parse(args.data)),
  },

  // ── Contact Groups ──
  {
    name: 'contact_groups_list',
    description: 'List contact groups',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
    }),
    handler: async (client, args) =>
      client.listContactGroups({ where: args.where, order: args.order }),
  },

  // ── Invoices ──
  {
    name: 'invoices_list',
    description: 'List invoices',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter e.g. Status=="AUTHORISED"'),
      order: z.string().optional().describe('sort field'),
      page: z.number().optional().describe('page number'),
      modified_since: z.string().optional().describe('ISO date for incremental'),
    }),
    handler: async (client, args) =>
      client.listInvoices({
        where: args.where,
        order: args.order,
        page: args.page,
        modifiedSince: args.modified_since,
      }),
  },
  {
    name: 'invoice_get',
    description: 'Get invoice by ID or number',
    inputSchema: z.object({
      invoice_id: z.string().describe('invoice UUID or number'),
    }),
    handler: async (client, args) => client.getInvoice(args.invoice_id),
  },
  {
    name: 'invoice_create',
    description: 'Create or update invoices',
    inputSchema: z.object({
      data: z.string().describe('invoice JSON with Type, Contact, LineItems'),
    }),
    handler: async (client, args) =>
      client.createOrUpdateInvoices(JSON.parse(args.data)),
  },
  {
    name: 'invoice_email',
    description: 'Email an invoice to the contact',
    inputSchema: z.object({
      invoice_id: z.string().describe('invoice UUID'),
    }),
    handler: async (client, args) => client.emailInvoice(args.invoice_id),
  },
  {
    name: 'invoice_online_url',
    description: 'Get online invoice URL for sharing',
    inputSchema: z.object({
      invoice_id: z.string().describe('invoice UUID'),
    }),
    handler: async (client, args) => client.getOnlineInvoiceUrl(args.invoice_id),
  },

  // ── Credit Notes ──
  {
    name: 'credit_notes_list',
    description: 'List credit notes',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
      page: z.number().optional().describe('page number'),
    }),
    handler: async (client, args) =>
      client.listCreditNotes({ where: args.where, order: args.order, page: args.page }),
  },
  {
    name: 'credit_note_allocate',
    description: 'Allocate credit note to invoices',
    inputSchema: z.object({
      credit_note_id: z.string().describe('credit note UUID'),
      data: z.string().describe('allocation JSON with Invoice, Amount'),
    }),
    handler: async (client, args) =>
      client.allocateCreditNote(args.credit_note_id, JSON.parse(args.data)),
  },

  // ── Payments ──
  {
    name: 'payments_list',
    description: 'List payments',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
      page: z.number().optional().describe('page number'),
    }),
    handler: async (client, args) =>
      client.listPayments({ where: args.where, order: args.order, page: args.page }),
  },
  {
    name: 'payment_create',
    description: 'Create a payment against an invoice',
    inputSchema: z.object({
      data: z.string().describe('payment JSON with Invoice, Account, Amount'),
    }),
    handler: async (client, args) => client.createPayment(JSON.parse(args.data)),
  },

  // ── Bank Transactions ──
  {
    name: 'bank_transactions_list',
    description: 'List bank transactions (spend/receive)',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
      page: z.number().optional().describe('page number'),
    }),
    handler: async (client, args) =>
      client.listBankTransactions({ where: args.where, order: args.order, page: args.page }),
  },
  {
    name: 'bank_transaction_get',
    description: 'Get bank transaction by ID',
    inputSchema: z.object({
      bank_transaction_id: z.string().describe('bank transaction UUID'),
    }),
    handler: async (client, args) =>
      client.getBankTransaction(args.bank_transaction_id),
  },
  {
    name: 'bank_transaction_create',
    description: 'Create a bank transaction',
    inputSchema: z.object({
      data: z.string().describe('bank transaction JSON with Type, Contact, LineItems, BankAccount'),
    }),
    handler: async (client, args) =>
      client.createBankTransaction(JSON.parse(args.data)),
  },

  // ── Bank Transfers ──
  {
    name: 'bank_transfers_list',
    description: 'List bank transfers',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
    }),
    handler: async (client, args) =>
      client.listBankTransfers({ where: args.where, order: args.order }),
  },
  {
    name: 'bank_transfer_create',
    description: 'Create a bank transfer',
    inputSchema: z.object({
      data: z.string().describe('transfer JSON with FromBankAccount, ToBankAccount, Amount'),
    }),
    handler: async (client, args) =>
      client.createBankTransfer(JSON.parse(args.data)),
  },

  // ── Batch Payments ──
  {
    name: 'batch_payments_list',
    description: 'List batch payments',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
    }),
    handler: async (client, args) =>
      client.listBatchPayments({ where: args.where, order: args.order }),
  },
  {
    name: 'batch_payment_create',
    description: 'Create a batch payment',
    inputSchema: z.object({
      data: z.string().describe('batch payment JSON'),
    }),
    handler: async (client, args) =>
      client.createBatchPayment(JSON.parse(args.data)),
  },

  // ── Purchase Orders ──
  {
    name: 'purchase_orders_list',
    description: 'List purchase orders',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
      page: z.number().optional().describe('page number'),
      modified_since: z.string().optional().describe('ISO date'),
    }),
    handler: async (client, args) =>
      client.listPurchaseOrders({
        where: args.where,
        order: args.order,
        page: args.page,
        modifiedSince: args.modified_since,
      }),
  },
  {
    name: 'purchase_order_get',
    description: 'Get purchase order by ID',
    inputSchema: z.object({
      purchase_order_id: z.string().describe('purchase order UUID'),
    }),
    handler: async (client, args) =>
      client.getPurchaseOrder(args.purchase_order_id),
  },

  // ── Items ──
  {
    name: 'items_list',
    description: 'List inventory items',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
    }),
    handler: async (client, args) =>
      client.listItems({ where: args.where, order: args.order }),
  },
  {
    name: 'item_get',
    description: 'Get item by ID',
    inputSchema: z.object({
      item_id: z.string().describe('item UUID'),
    }),
    handler: async (client, args) => client.getItem(args.item_id),
  },

  // ── Manual Journals ──
  {
    name: 'manual_journals_list',
    description: 'List manual journals',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
      page: z.number().optional().describe('page number'),
    }),
    handler: async (client, args) =>
      client.listManualJournals({ where: args.where, order: args.order, page: args.page }),
  },
  {
    name: 'manual_journal_create',
    description: 'Create a manual journal entry',
    inputSchema: z.object({
      data: z.string().describe('journal JSON with Narration, JournalLines'),
    }),
    handler: async (client, args) =>
      client.createManualJournal(JSON.parse(args.data)),
  },

  // ── Journals ──
  {
    name: 'journals_list',
    description: 'List all journals (read-only)',
    inputSchema: z.object({
      offset: z.number().optional().describe('journal number offset'),
      modified_since: z.string().optional().describe('ISO date'),
    }),
    handler: async (client, args) =>
      client.listJournals({ offset: args.offset, modifiedSince: args.modified_since }),
  },

  // ── Expense Claims ──
  {
    name: 'expense_claims_list',
    description: 'List expense claims',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
    }),
    handler: async (client, args) =>
      client.listExpenseClaims({ where: args.where, order: args.order }),
  },

  // ── Quotes ──
  {
    name: 'quotes_list',
    description: 'List quotes',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
      page: z.number().optional().describe('page number'),
    }),
    handler: async (client, args) =>
      client.listQuotes({ where: args.where, order: args.order, page: args.page }),
  },

  // ── Overpayments ──
  {
    name: 'overpayments_list',
    description: 'List overpayments',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
      page: z.number().optional().describe('page number'),
    }),
    handler: async (client, args) =>
      client.listOverpayments({ where: args.where, order: args.order, page: args.page }),
  },

  // ── Prepayments ──
  {
    name: 'prepayments_list',
    description: 'List prepayments',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
      page: z.number().optional().describe('page number'),
    }),
    handler: async (client, args) =>
      client.listPrepayments({ where: args.where, order: args.order, page: args.page }),
  },

  // ── Repeating Invoices ──
  {
    name: 'repeating_invoices_list',
    description: 'List repeating invoice templates',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
    }),
    handler: async (client, args) =>
      client.listRepeatingInvoices({ where: args.where, order: args.order }),
  },

  // ── Reports ──
  {
    name: 'report_balance_sheet',
    description: 'Get Balance Sheet report',
    inputSchema: z.object({
      date: z.string().optional().describe('report date YYYY-MM-DD'),
      periods: z.number().optional().describe('comparison periods'),
      timeframe: z.string().optional().describe('MONTH, QUARTER, YEAR'),
      tracking_category_id: z.string().optional().describe('tracking category UUID'),
      tracking_option_id: z.string().optional().describe('tracking option UUID'),
      standard_layout: z.boolean().optional().describe('use standard layout'),
    }),
    handler: async (client, args) =>
      client.getBalanceSheet({
        date: args.date,
        periods: args.periods,
        timeframe: args.timeframe,
        trackingCategoryID: args.tracking_category_id,
        trackingOptionID: args.tracking_option_id,
        standardLayout: args.standard_layout,
      }),
  },
  {
    name: 'report_profit_loss',
    description: 'Get Profit and Loss report',
    inputSchema: z.object({
      from_date: z.string().optional().describe('start date YYYY-MM-DD'),
      to_date: z.string().optional().describe('end date YYYY-MM-DD'),
      periods: z.number().optional().describe('comparison periods'),
      timeframe: z.string().optional().describe('MONTH, QUARTER, YEAR'),
      tracking_category_id: z.string().optional().describe('tracking category UUID'),
      tracking_option_id: z.string().optional().describe('tracking option UUID'),
      standard_layout: z.boolean().optional().describe('use standard layout'),
    }),
    handler: async (client, args) =>
      client.getProfitAndLoss({
        fromDate: args.from_date,
        toDate: args.to_date,
        periods: args.periods,
        timeframe: args.timeframe,
        trackingCategoryID: args.tracking_category_id,
        trackingOptionID: args.tracking_option_id,
        standardLayout: args.standard_layout,
      }),
  },
  {
    name: 'report_trial_balance',
    description: 'Get Trial Balance report',
    inputSchema: z.object({
      date: z.string().optional().describe('report date YYYY-MM-DD'),
      payments_only: z.boolean().optional().describe('payments only'),
    }),
    handler: async (client, args) =>
      client.getTrialBalance({ date: args.date, paymentsOnly: args.payments_only }),
  },
  {
    name: 'report_aged_payables',
    description: 'Get Aged Payables report',
    inputSchema: z.object({
      contact_id: z.string().optional().describe('contact UUID'),
      date: z.string().optional().describe('report date YYYY-MM-DD'),
      from_date: z.string().optional().describe('start date'),
      to_date: z.string().optional().describe('end date'),
    }),
    handler: async (client, args) =>
      client.getAgedPayables({
        contactId: args.contact_id,
        date: args.date,
        fromDate: args.from_date,
        toDate: args.to_date,
      }),
  },
  {
    name: 'report_aged_receivables',
    description: 'Get Aged Receivables report',
    inputSchema: z.object({
      contact_id: z.string().optional().describe('contact UUID'),
      date: z.string().optional().describe('report date YYYY-MM-DD'),
      from_date: z.string().optional().describe('start date'),
      to_date: z.string().optional().describe('end date'),
    }),
    handler: async (client, args) =>
      client.getAgedReceivables({
        contactId: args.contact_id,
        date: args.date,
        fromDate: args.from_date,
        toDate: args.to_date,
      }),
  },
  {
    name: 'report_bank_summary',
    description: 'Get Bank Summary report',
    inputSchema: z.object({
      from_date: z.string().optional().describe('start date YYYY-MM-DD'),
      to_date: z.string().optional().describe('end date YYYY-MM-DD'),
    }),
    handler: async (client, args) =>
      client.getBankSummary({ fromDate: args.from_date, toDate: args.to_date }),
  },
  {
    name: 'report_budget_summary',
    description: 'Get Budget Summary report',
    inputSchema: z.object({
      date: z.string().optional().describe('report date YYYY-MM-DD'),
      periods: z.number().optional().describe('comparison periods'),
      timeframe: z.number().optional().describe('timeframe in months'),
    }),
    handler: async (client, args) =>
      client.getBudgetSummary({ date: args.date, periods: args.periods, timeframe: args.timeframe }),
  },
  {
    name: 'report_executive_summary',
    description: 'Get Executive Summary report',
    inputSchema: z.object({
      date: z.string().optional().describe('report date YYYY-MM-DD'),
    }),
    handler: async (client, args) =>
      client.getExecutiveSummary({ date: args.date }),
  },

  // ── Tax Rates ──
  {
    name: 'tax_rates_list',
    description: 'List tax rates',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
    }),
    handler: async (client, args) =>
      client.listTaxRates({ where: args.where, order: args.order }),
  },

  // ── Currencies ──
  {
    name: 'currencies_list',
    description: 'List currencies',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
    }),
    handler: async (client, args) =>
      client.listCurrencies({ where: args.where, order: args.order }),
  },

  // ── Tracking Categories ──
  {
    name: 'tracking_categories_list',
    description: 'List tracking categories and options',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
    }),
    handler: async (client, args) =>
      client.listTrackingCategories({ where: args.where, order: args.order }),
  },

  // ── Users ──
  {
    name: 'users_list',
    description: 'List Xero users',
    inputSchema: z.object({
      where: z.string().optional().describe('OData filter'),
      order: z.string().optional().describe('sort field'),
    }),
    handler: async (client, args) =>
      client.listUsers({ where: args.where, order: args.order }),
  },

  // ── Budgets ──
  {
    name: 'budgets_list',
    description: 'List budgets',
    inputSchema: z.object({}),
    handler: async (client) => client.listBudgets(),
  },

  // ── Branding Themes ──
  {
    name: 'branding_themes_list',
    description: 'List branding themes',
    inputSchema: z.object({}),
    handler: async (client) => client.listBrandingThemes(),
  },

  // ── Linked Transactions ──
  {
    name: 'linked_transactions_list',
    description: 'List linked transactions',
    inputSchema: z.object({
      page: z.number().optional().describe('page number'),
      source_transaction_id: z.string().optional().describe('source transaction UUID'),
      contact_id: z.string().optional().describe('contact UUID'),
    }),
    handler: async (client, args) =>
      client.listLinkedTransactions({
        page: args.page,
        sourceTransactionId: args.source_transaction_id,
        contactId: args.contact_id,
      }),
  },
];
