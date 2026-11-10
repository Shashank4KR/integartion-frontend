export type SuperAdminUser = {
  id: string;
  username: string;
  email: string;
  role?: { role_name: string } | null;
};

export type InstitutionRecord = {
  id: string;
  name: string;
  code: string;
  board: string | null;
  status: string;
  created_at: string;
};

export type SuperAdminOverview = {
  institutions: InstitutionRecord[];
  totals: {
    students: number;
    faculty: number;
    classes: number;
  };
};

async function readError(response: Response, fallback: string): Promise<string> {
  const data = (await response.json().catch(() => ({}))) as { detail?: string };
  return data.detail || fallback;
}

export async function superAdminLogin(email: string, password: string, mfaCode?: string): Promise<void> {
  const response = await fetch("/api/superadmin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(mfaCode ? { "X-MFA-Code": mfaCode } : {}),
    },
    body: new URLSearchParams({ username: email.trim(), password }),
  });
  if (!response.ok) throw new Error(await readError(response, "Superadmin sign-in failed."));
}

export async function getSuperAdminSession(): Promise<SuperAdminUser> {
  const response = await fetch("/api/superadmin/session", { cache: "no-store" });
  if (!response.ok) throw new Error(await readError(response, "Superadmin session expired."));
  return (await response.json()) as SuperAdminUser;
}

export async function getSuperAdminOverview(): Promise<SuperAdminOverview> {
  const response = await fetch("/api/superadmin/overview", { cache: "no-store" });
  if (!response.ok) throw new Error(await readError(response, "Could not load live platform data."));
  return (await response.json()) as SuperAdminOverview;
}

export async function superAdminLogout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
