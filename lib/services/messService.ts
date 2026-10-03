const BASE = "/api/mess";

export async function listMenus(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/menus`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch mess menus.");
  }

  return (await response.json()) as any[];
}

export async function getMenu(
  token: string,
  id: string,
): Promise<any> {
  const response = await fetch(`${BASE}/menus/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch mess menu.");
  }

  return (await response.json()) as any;
}

export async function createMenu(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/menus`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to create mess menu.");
  }

  return (await response.json()) as any;
}

export async function updateMenu(
  token: string,
  id: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/menus/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to update mess menu.");
  }

  return (await response.json()) as any;
}

export async function deleteMenu(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${BASE}/menus/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete mess menu.");
  }
}

export async function recordMealAttendance(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/meal-attendance`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to record meal attendance.");
  }

  return (await response.json()) as any;
}

export async function listCollections(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/collections`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch mess collections.");
  }

  return (await response.json()) as any[];
}

export async function recordCollection(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/collections`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to record mess collection.");
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
    throw new Error(data.detail ?? "Failed to fetch mess expenses.");
  }

  return (await response.json()) as any[];
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
    throw new Error(data.detail ?? "Failed to add mess expense.");
  }

  return (await response.json()) as any;
}

export async function listMealAttendance(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/meal-attendance`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch meal attendance.");
  }

  return (await response.json()) as any[];
}