const BASE_URL = 'https://api.xero.com/api.xro/2.0';
const TOKEN_URL = 'https://identity.xero.com/connect/token';

export class XeroClient {
  private clientId: string;
  private clientSecret: string;
  private tenantId: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(clientId: string, clientSecret: string, tenantId: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.tenantId = tenantId;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Token Error ${response.status}: ${text}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    return this.accessToken!;
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      params?: Record<string, string | number | undefined>;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, params, headers: extraHeaders } = options;
    const url = new URL(`${BASE_URL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'xero-tenant-id': this.tenantId,
      'Accept': 'application/json',
      ...extraHeaders,
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (response.status === 204) return {} as T;

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error ${response.status}: ${text}`);
    }

    return response.json();
  }

  // ── Organisation ──

  async getOrganisation() {
    return this.request<any>('/Organisation');
  }

  // ── Accounts ──

  async listAccounts(opts?: { where?: string; order?: string }) {
    return this.request<any>('/Accounts', {
      params: { where: opts?.where, order: opts?.order },
    });
  }

  async getAccount(accountId: string) {
    return this.request<any>(`/Accounts/${encodeURIComponent(accountId)}`);
  }

  async createAccount(data: any) {
    return this.request<any>('/Accounts', { method: 'PUT', body: data });
  }

  // ── Contacts ──

  async listContacts(opts?: {
    where?: string;
    order?: string;
    page?: number;
    includeArchived?: boolean;
  }) {
    return this.request<any>('/Contacts', {
      params: {
        where: opts?.where,
        order: opts?.order,
        page: opts?.page,
        includeArchived: opts?.includeArchived !== undefined ? String(opts.includeArchived) : undefined,
      },
    });
  }

  async getContact(contactId: string) {
    return this.request<any>(`/Contacts/${encodeURIComponent(contactId)}`);
  }

  async createOrUpdateContacts(data: any) {
    return this.request<any>('/Contacts', { method: 'POST', body: data });
  }

  // ── Contact Groups ──

  async listContactGroups(opts?: { where?: string; order?: string }) {
    return this.request<any>('/ContactGroups', {
      params: { where: opts?.where, order: opts?.order },
    });
  }

  // ── Invoices ──

  async listInvoices(opts?: {
    where?: string;
    order?: string;
    page?: number;
    modifiedSince?: string;
  }) {
    const headers: Record<string, string> = {};
    if (opts?.modifiedSince) {
      headers['If-Modified-Since'] = opts.modifiedSince;
    }
    return this.request<any>('/Invoices', {
      params: { where: opts?.where, order: opts?.order, page: opts?.page },
      headers,
    });
  }

  async getInvoice(invoiceId: string) {
    return this.request<any>(`/Invoices/${encodeURIComponent(invoiceId)}`);
  }

  async createOrUpdateInvoices(data: any) {
    return this.request<any>('/Invoices', { method: 'POST', body: data });
  }

  async emailInvoice(invoiceId: string) {
    return this.request<any>(
      `/Invoices/${encodeURIComponent(invoiceId)}/Email`,
      { method: 'POST', body: {} }
    );
  }

  async getOnlineInvoiceUrl(invoiceId: string) {
    return this.request<any>(
      `/Invoices/${encodeURIComponent(invoiceId)}/OnlineInvoice`
    );
  }

  // ── Credit Notes ──

  async listCreditNotes(opts?: { where?: string; order?: string; page?: number }) {
    return this.request<any>('/CreditNotes', {
      params: { where: opts?.where, order: opts?.order, page: opts?.page },
    });
  }

  async allocateCreditNote(creditNoteId: string, data: any) {
    return this.request<any>(
      `/CreditNotes/${encodeURIComponent(creditNoteId)}/Allocations`,
      { method: 'PUT', body: data }
    );
  }

  // ── Payments ──

  async listPayments(opts?: { where?: string; order?: string; page?: number }) {
    return this.request<any>('/Payments', {
      params: { where: opts?.where, order: opts?.order, page: opts?.page },
    });
  }

  async createPayment(data: any) {
    return this.request<any>('/Payments', { method: 'PUT', body: data });
  }

  // ── Bank Transactions ──

  async listBankTransactions(opts?: {
    where?: string;
    order?: string;
    page?: number;
  }) {
    return this.request<any>('/BankTransactions', {
      params: { where: opts?.where, order: opts?.order, page: opts?.page },
    });
  }

  async getBankTransaction(bankTransactionId: string) {
    return this.request<any>(
      `/BankTransactions/${encodeURIComponent(bankTransactionId)}`
    );
  }

  async createBankTransaction(data: any) {
    return this.request<any>('/BankTransactions', { method: 'PUT', body: data });
  }

  // ── Bank Transfers ──

  async listBankTransfers(opts?: { where?: string; order?: string }) {
    return this.request<any>('/BankTransfers', {
      params: { where: opts?.where, order: opts?.order },
    });
  }

  async createBankTransfer(data: any) {
    return this.request<any>('/BankTransfers', { method: 'PUT', body: data });
  }

  // ── Batch Payments ──

  async listBatchPayments(opts?: { where?: string; order?: string }) {
    return this.request<any>('/BatchPayments', {
      params: { where: opts?.where, order: opts?.order },
    });
  }

  async createBatchPayment(data: any) {
    return this.request<any>('/BatchPayments', { method: 'PUT', body: data });
  }

  // ── Purchase Orders ──

  async listPurchaseOrders(opts?: {
    where?: string;
    order?: string;
    page?: number;
    modifiedSince?: string;
  }) {
    const headers: Record<string, string> = {};
    if (opts?.modifiedSince) {
      headers['If-Modified-Since'] = opts.modifiedSince;
    }
    return this.request<any>('/PurchaseOrders', {
      params: { where: opts?.where, order: opts?.order, page: opts?.page },
      headers,
    });
  }

  async getPurchaseOrder(purchaseOrderId: string) {
    return this.request<any>(
      `/PurchaseOrders/${encodeURIComponent(purchaseOrderId)}`
    );
  }

  // ── Items ──

  async listItems(opts?: { where?: string; order?: string }) {
    return this.request<any>('/Items', {
      params: { where: opts?.where, order: opts?.order },
    });
  }

  async getItem(itemId: string) {
    return this.request<any>(`/Items/${encodeURIComponent(itemId)}`);
  }

  // ── Manual Journals ──

  async listManualJournals(opts?: {
    where?: string;
    order?: string;
    page?: number;
  }) {
    return this.request<any>('/ManualJournals', {
      params: { where: opts?.where, order: opts?.order, page: opts?.page },
    });
  }

  async createManualJournal(data: any) {
    return this.request<any>('/ManualJournals', { method: 'PUT', body: data });
  }

  // ── Journals ──

  async listJournals(opts?: { offset?: number; modifiedSince?: string }) {
    const headers: Record<string, string> = {};
    if (opts?.modifiedSince) {
      headers['If-Modified-Since'] = opts.modifiedSince;
    }
    return this.request<any>('/Journals', {
      params: { offset: opts?.offset },
      headers,
    });
  }

  // ── Expense Claims ──

  async listExpenseClaims(opts?: { where?: string; order?: string }) {
    return this.request<any>('/ExpenseClaims', {
      params: { where: opts?.where, order: opts?.order },
    });
  }

  // ── Quotes ──

  async listQuotes(opts?: {
    where?: string;
    order?: string;
    page?: number;
  }) {
    return this.request<any>('/Quotes', {
      params: { where: opts?.where, order: opts?.order, page: opts?.page },
    });
  }

  // ── Overpayments ──

  async listOverpayments(opts?: { where?: string; order?: string; page?: number }) {
    return this.request<any>('/Overpayments', {
      params: { where: opts?.where, order: opts?.order, page: opts?.page },
    });
  }

  // ── Prepayments ──

  async listPrepayments(opts?: { where?: string; order?: string; page?: number }) {
    return this.request<any>('/Prepayments', {
      params: { where: opts?.where, order: opts?.order, page: opts?.page },
    });
  }

  // ── Repeating Invoices ──

  async listRepeatingInvoices(opts?: { where?: string; order?: string }) {
    return this.request<any>('/RepeatingInvoices', {
      params: { where: opts?.where, order: opts?.order },
    });
  }

  // ── Reports ──

  async getBalanceSheet(opts?: { date?: string; periods?: number; timeframe?: string; trackingCategoryID?: string; trackingOptionID?: string; standardLayout?: boolean }) {
    return this.request<any>('/Reports/BalanceSheet', {
      params: {
        date: opts?.date,
        periods: opts?.periods,
        timeframe: opts?.timeframe,
        trackingCategoryID: opts?.trackingCategoryID,
        trackingOptionID: opts?.trackingOptionID,
        standardLayout: opts?.standardLayout !== undefined ? String(opts.standardLayout) : undefined,
      },
    });
  }

  async getProfitAndLoss(opts?: { fromDate?: string; toDate?: string; periods?: number; timeframe?: string; trackingCategoryID?: string; trackingOptionID?: string; standardLayout?: boolean }) {
    return this.request<any>('/Reports/ProfitAndLoss', {
      params: {
        fromDate: opts?.fromDate,
        toDate: opts?.toDate,
        periods: opts?.periods,
        timeframe: opts?.timeframe,
        trackingCategoryID: opts?.trackingCategoryID,
        trackingOptionID: opts?.trackingOptionID,
        standardLayout: opts?.standardLayout !== undefined ? String(opts.standardLayout) : undefined,
      },
    });
  }

  async getTrialBalance(opts?: { date?: string; paymentsOnly?: boolean }) {
    return this.request<any>('/Reports/TrialBalance', {
      params: {
        date: opts?.date,
        paymentsOnly: opts?.paymentsOnly !== undefined ? String(opts.paymentsOnly) : undefined,
      },
    });
  }

  async getAgedPayables(opts?: { contactId?: string; date?: string; fromDate?: string; toDate?: string }) {
    return this.request<any>('/Reports/AgedPayablesByContact', {
      params: { contactId: opts?.contactId, date: opts?.date, fromDate: opts?.fromDate, toDate: opts?.toDate },
    });
  }

  async getAgedReceivables(opts?: { contactId?: string; date?: string; fromDate?: string; toDate?: string }) {
    return this.request<any>('/Reports/AgedReceivablesByContact', {
      params: { contactId: opts?.contactId, date: opts?.date, fromDate: opts?.fromDate, toDate: opts?.toDate },
    });
  }

  async getBankSummary(opts?: { fromDate?: string; toDate?: string }) {
    return this.request<any>('/Reports/BankSummary', {
      params: { fromDate: opts?.fromDate, toDate: opts?.toDate },
    });
  }

  async getBudgetSummary(opts?: { date?: string; periods?: number; timeframe?: number }) {
    return this.request<any>('/Reports/BudgetSummary', {
      params: { date: opts?.date, periods: opts?.periods, timeframe: opts?.timeframe },
    });
  }

  async getExecutiveSummary(opts?: { date?: string }) {
    return this.request<any>('/Reports/ExecutiveSummary', {
      params: { date: opts?.date },
    });
  }

  // ── Tax Rates ──

  async listTaxRates(opts?: { where?: string; order?: string }) {
    return this.request<any>('/TaxRates', {
      params: { where: opts?.where, order: opts?.order },
    });
  }

  // ── Currencies ──

  async listCurrencies(opts?: { where?: string; order?: string }) {
    return this.request<any>('/Currencies', {
      params: { where: opts?.where, order: opts?.order },
    });
  }

  // ── Tracking Categories ──

  async listTrackingCategories(opts?: { where?: string; order?: string }) {
    return this.request<any>('/TrackingCategories', {
      params: { where: opts?.where, order: opts?.order },
    });
  }

  // ── Users ──

  async listUsers(opts?: { where?: string; order?: string }) {
    return this.request<any>('/Users', {
      params: { where: opts?.where, order: opts?.order },
    });
  }

  // ── Budgets ──

  async listBudgets() {
    return this.request<any>('/Budgets');
  }

  // ── Branding Themes ──

  async listBrandingThemes() {
    return this.request<any>('/BrandingThemes');
  }

  // ── Linked Transactions ──

  async listLinkedTransactions(opts?: { page?: number; sourceTransactionId?: string; contactId?: string }) {
    return this.request<any>('/LinkedTransactions', {
      params: { page: opts?.page, SourceTransactionID: opts?.sourceTransactionId, ContactID: opts?.contactId },
    });
  }
}
