const BASE = "/api/transport";

async function parseError(response: Response, fallback: string): Promise<Error> {
  try {
    const data = (await response.json()) as { detail?: string; message?: string };
    return new Error(data.detail ?? data.message ?? fallback);
  } catch {
    return new Error(fallback);
  }
}

function unwrapItems(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const record = payload as {
    data?: unknown;
    items?: unknown;
    results?: unknown;
  };

  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.results)) return record.results;

  if (record.data && typeof record.data === "object") {
    const data = record.data as { items?: unknown; results?: unknown };
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.results)) return data.results;
  }

  return [];
}

export async function listTransportRoutes(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/routes`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch transport routes.");
  }

  return unwrapItems(await response.json());
}

export async function getTransportRoute(
  token: string,
  id: string,
): Promise<any> {
  const response = await fetch(`${BASE}/routes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch transport route.");
  }

  return (await response.json()) as any;
}

export async function createTransportRoute(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/routes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to create transport route.");
  }

  return (await response.json()) as any;
}

export async function updateTransportRoute(
  token: string,
  id: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/routes/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to update transport route.");
  }

  return (await response.json()) as any;
}

export async function deleteTransportRoute(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${BASE}/routes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to delete transport route.");
  }
}

export async function listVehicles(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/vehicles`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch vehicles.");
  }

  return unwrapItems(await response.json());
}

export async function getVehicle(
  token: string,
  id: string,
): Promise<any> {
  const response = await fetch(`${BASE}/vehicles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch vehicle.");
  }

  return (await response.json()) as any;
}

export async function createVehicle(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/vehicles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to create vehicle.");
  }

  return (await response.json()) as any;
}

export async function updateVehicle(
  token: string,
  id: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/vehicles/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to update vehicle.");
  }

  return (await response.json()) as any;
}

export async function deleteVehicle(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${BASE}/vehicles/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to delete vehicle.");
  }
}

export async function listDrivers(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/drivers`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch drivers.");
  }

  return unwrapItems(await response.json());
}

export async function assignDriver(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/drivers/assign`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to assign driver.");
  }

  return (await response.json()) as any;
}
