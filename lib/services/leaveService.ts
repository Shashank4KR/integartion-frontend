const LEAVE_REQUESTS_BASE = "/api/leave-requests";
const LEAVE_TYPES_BASE = "/api/leave-types";

// --- Leave Requests ---

export async function listLeaveRequests(
  token: string,
): Promise<any[]> {
  const response = await fetch(LEAVE_REQUESTS_BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch leave requests.");
  }

  return (await response.json()) as any[];
}

export async function getLeaveRequest(
  token: string,
  id: string,
): Promise<any> {
  const response = await fetch(`${LEAVE_REQUESTS_BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch leave request.");
  }

  return (await response.json()) as any;
}

export async function createLeaveRequest(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(LEAVE_REQUESTS_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to create leave request.");
  }

  return (await response.json()) as any;
}

export async function approveLeaveRequest(
  token: string,
  id: string,
  remarks?: string,
): Promise<any> {
  const response = await fetch(`${LEAVE_REQUESTS_BASE}/${id}/approve`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ remarks: remarks || "" }),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to approve leave request.");
  }

  return (await response.json()) as any;
}

export async function rejectLeaveRequest(
  token: string,
  id: string,
  remarks?: string,
): Promise<any> {
  const response = await fetch(`${LEAVE_REQUESTS_BASE}/${id}/reject`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ remarks: remarks || "" }),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to reject leave request.");
  }

  return (await response.json()) as any;
}

export async function cancelLeaveRequest(
  token: string,
  id: string,
): Promise<any> {
  const response = await fetch(`${LEAVE_REQUESTS_BASE}/${id}/cancel`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to cancel leave request.");
  }

  return (await response.json()) as any;
}

export async function getPendingLeaveRequests(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${LEAVE_REQUESTS_BASE}/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch pending leave requests.");
  }

  return (await response.json()) as any[];
}

export async function getLeaveSummary(
  token: string,
): Promise<any> {
  const response = await fetch(`${LEAVE_REQUESTS_BASE}/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch leave summary.");
  }

  return (await response.json()) as any;
}

export async function getLeaveBalance(
  token: string,
  userId: string,
): Promise<any> {
  const response = await fetch(`/api/users/${userId}/leave-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch leave balance.");
  }

  return (await response.json()) as any;
}

// --- Leave Types ---

export async function listLeaveTypes(
  token: string,
): Promise<any[]> {
  const response = await fetch(LEAVE_TYPES_BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch leave types.");
  }

  return (await response.json()) as any[];
}

export async function getLeaveType(
  token: string,
  id: string,
): Promise<any> {
  const response = await fetch(`${LEAVE_TYPES_BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch leave type.");
  }

  return (await response.json()) as any;
}

export async function createLeaveType(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(LEAVE_TYPES_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to create leave type.");
  }

  return (await response.json()) as any;
}

export async function updateLeaveType(
  token: string,
  id: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${LEAVE_TYPES_BASE}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to update leave type.");
  }

  return (await response.json()) as any;
}

export async function deleteLeaveType(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${LEAVE_TYPES_BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete leave type.");
  }
}