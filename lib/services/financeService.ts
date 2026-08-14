const BASE = "/api/finance";

function unwrapData<T>(payload: unknown, fallback: T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    return (data ?? fallback) as T;
  }
  return (payload ?? fallback) as T;
}

function unwrapItems(payload: unknown): any[] {
  const data = unwrapData<unknown>(payload, []);
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: any[] }).items;
  }
  return [];
}

export async function getFinanceOverview(
  token: string,
): Promise<any> {
  const response = await fetch(`${BASE}/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch finance overview.");
  }

  return unwrapData(await response.json(), {});
}

export async function listFeeStructures(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/fee-structures`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch fee structures.");
  }

  return unwrapItems(await response.json());
}

export async function createFeeStructure(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/fee-structures`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to create fee structure.");
  }

  return (await response.json()) as any;
}

export async function updateFeeStructure(
  token: string,
  id: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/fee-structures/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to update fee structure.");
  }

  return (await response.json()) as any;
}

export async function deleteFeeStructure(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${BASE}/fee-structures/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete fee structure.");
  }
}

export async function listInvoices(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/invoices`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch invoices.");
  }

  return unwrapItems(await response.json());
}

export async function generateInvoice(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/invoices/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to generate invoice.");
  }

  return (await response.json()) as any;
}

export async function listExpenses(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/expenses`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch expenses.");
  }

  return unwrapItems(await response.json());
}

export async function addExpense(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/expenses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to add expense.");
  }

  return (await response.json()) as any;
}

export async function listTransactions(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch transactions.");
  }

  return unwrapItems(await response.json());
}

export async function recordTransaction(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to record transaction.");
  }

  return (await response.json()) as any;
}

export async function listSalaryRecords(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/salary`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch salary records.");
  }

  return unwrapItems(await response.json());
}

export async function processSalary(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/salary/process`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to process salary.");
  }

  return (await response.json()) as any;
}

export async function getFeesSummary(token: string): Promise<any> {
  const response = await fetch("/api/fees/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch fee summary.");
  }
  return await response.json();
}

export async function listFeeInstallments(token: string): Promise<any[]> {
  const response = await fetch("/api/finance/fee-installments", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch fee installments.");
  }
  return unwrapItems(await response.json());
}

export async function createFeePayment(token: string, payload: any): Promise<any> {
  const response = await fetch("/api/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to add payment.");
  }
  return await response.json();
}
