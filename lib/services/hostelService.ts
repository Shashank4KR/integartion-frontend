const BASE = "/api/hostel";

export async function listHostelBlocks(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/blocks`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch hostel blocks.");
  }

  return (await response.json()) as any[];
}

export async function getHostelBlock(
  token: string,
  id: string,
): Promise<any> {
  const response = await fetch(`${BASE}/blocks/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch hostel block.");
  }

  return (await response.json()) as any;
}

export async function createHostelBlock(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/blocks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to create hostel block.");
  }

  return (await response.json()) as any;
}

export async function updateHostelBlock(
  token: string,
  id: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/blocks/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to update hostel block.");
  }

  return (await response.json()) as any;
}

export async function deleteHostelBlock(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${BASE}/blocks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete hostel block.");
  }
}

export async function listRooms(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/rooms`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch rooms.");
  }

  return (await response.json()) as any[];
}

export async function getRoom(
  token: string,
  id: string,
): Promise<any> {
  const response = await fetch(`${BASE}/rooms/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch room.");
  }

  return (await response.json()) as any;
}

export async function createRoom(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/rooms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to create room.");
  }

  return (await response.json()) as any;
}

export async function updateRoom(
  token: string,
  id: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/rooms/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to update room.");
  }

  return (await response.json()) as any;
}

export async function deleteRoom(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${BASE}/rooms/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete room.");
  }
}

export async function allocateStudent(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/allocate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to allocate student.");
  }

  return (await response.json()) as any;
}

export async function listHostelStudents(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/students`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch hostel students.");
  }

  return (await response.json()) as any[];
}

export async function getStudentHostelAllocation(
  token: string,
  studentId: string,
): Promise<any> {
  const response = await fetch(`${BASE}/students/${studentId}/allocation`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch hostel allocation.");
  }
  return (await response.json()) as any;
}

export async function getStudentHostelLeaveRequests(
  token: string,
  studentId: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/leave-requests?studentId=${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch leave requests.");
  }
  return (await response.json()) as any[];
}

export async function getStudentHostelComplaints(
  token: string,
  studentId: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/complaints?studentId=${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch complaints.");
  }
  return (await response.json()) as any[];
}

export async function getStudentHostelNotices(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/notices`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch notices.");
  }
  return (await response.json()) as any[];
}

export async function getStudentHostelFees(
  token: string,
  studentId: string,
): Promise<any> {
  const response = await fetch(`${BASE}/fee-summary?studentId=${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch hostel fees.");
  }
  return (await response.json()) as any;
}

export async function getHostelDashboardStats(
  token: string,
): Promise<any> {
  const response = await fetch(`${BASE}/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch dashboard stats.");
  }
  return (await response.json()) as any;
}

export async function getHostelComplaints(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/complaints`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch complaints.");
  }
  return (await response.json()) as any[];
}

export async function getComplaintSummary(
  token: string,
): Promise<any> {
  const response = await fetch(`${BASE}/complaint-summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch complaint summary.");
  }
  return (await response.json()) as any;
}

export async function getHostelLeaveRequests(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/leave-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch leave requests.");
  }
  return (await response.json()) as any[];
}

export async function getLeaveSummary(
  token: string,
): Promise<any> {
  const response = await fetch(`${BASE}/leave-summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch leave summary.");
  }
  return (await response.json()) as any;
}

export async function getMaintenanceDashboard(
  token: string,
): Promise<any> {
  const response = await fetch(`${BASE}/maintenance/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch maintenance dashboard.");
  }
  return (await response.json()) as any;
}

export async function listMaintenanceRequests(
  token: string,
): Promise<any[]> {
  const response = await fetch("/api/maintenance-requests", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch maintenance requests.");
  }
  return (await response.json()) as any[];
}

export async function getMessDashboard(
  token: string,
): Promise<any> {
  const response = await fetch(`${BASE}/mess/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch mess dashboard.");
  }
  return (await response.json()) as any;
}

export async function listPublishedHostelNotices(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/notices?status=published`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch notices.");
  }
  return (await response.json()) as any[];
}

export async function getHostelNotices(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/notices`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch notices.");
  }
  return (await response.json()) as any[];
}

export async function getHostelFeeSummary(
  token: string,
): Promise<any> {
  const response = await fetch(`${BASE}/fee-summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch fee summary.");
  }
  return (await response.json()) as any;
}

export async function getHostelBlocks(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/blocks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch blocks.");
  }
  return (await response.json()) as any[];
}

export async function getHostelRooms(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/rooms`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch rooms.");
  }
  return (await response.json()) as any[];
}

export async function getHostelBeds(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/beds`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch beds.");
  }
  return (await response.json()) as any[];
}

export async function getHostelAllocations(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/allocations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch allocations.");
  }
  return (await response.json()) as any[];
}

export async function getHostelVisitors(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/visitors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch visitors.");
  }
  return (await response.json()) as any[];
}
