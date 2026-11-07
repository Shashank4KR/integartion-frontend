import { unwrapArray } from "@/lib/utils/unwrap";
﻿const BASE = "/api/students";

export async function listStudentInvoices(
  token: string,
  studentId: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/${studentId}/fee-invoices`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch fee invoices.");
  }

  return unwrapArray(await response.json());
}

export async function listStudentPayments(
  token: string,
  studentId: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/${studentId}/payments`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch payments.");
  }

  return unwrapArray(await response.json());
}

export async function getStudentFeeSummary(
  token: string,
  studentId: string,
): Promise<any> {
  const response = await fetch(`${BASE}/${studentId}/fee-summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch fee summary.");
  }

  return await response.json();
}

export async function getCurrentStudentFees(token: string): Promise<any> {
  const response = await fetch(`${BASE}/me/fees`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch your fee information.");
  }

  return await response.json();
}
