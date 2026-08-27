import type { StudentCreate, StudentResponse } from "@/types/entities/student";

const BASE = "/api/students";

export async function listStudents(token: string): Promise<StudentResponse[]> {
  const response = await fetch(`${BASE}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch students.");
  }

  return (await response.json()) as StudentResponse[];
}
export async function getCurrentStudent(
  token: string,
): Promise<StudentResponse> {
  const response = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch your student profile.");
  }

  return (await response.json()) as StudentResponse;
}
export async function getStudent(
  token: string,
  id: string,
): Promise<StudentResponse> {
  const response = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch student.");
  }

  return (await response.json()) as StudentResponse;
}

export async function getCurrentStudent(token: string): Promise<StudentResponse> {
  const response = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch student profile.");
  }

  return (await response.json()) as StudentResponse;
}

export async function createStudent(
  token: string,
  payload: StudentCreate,
): Promise<StudentResponse> {
  const response = await fetch(`${BASE}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to create student.");
  }

  return (await response.json()) as StudentResponse;
}

export async function updateStudent(
  token: string,
  id: string,
  payload: Partial<StudentCreate>,
): Promise<StudentResponse> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to update student.");
  }

  return (await response.json()) as StudentResponse;
}

export async function deleteStudent(token: string, id: string): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete student.");
  }
}

export async function getStudentExamResults(
  token: string,
  studentId: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/${studentId}/exam-results`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch student exam results.");
  }

  return (await response.json()) as any[];
}

export async function getCurrentStudentExamResults(token: string): Promise<any[]> {
  const response = await fetch(`${BASE}/me/exam-results`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch your exam results.");
  }

  return (await response.json()) as any[];
}

export async function getStudentReportCards(
  token: string,
  studentId: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/${studentId}/report-cards`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch student report cards.");
  }

  return (await response.json()) as any[];
}

export async function getStudentPerformance(
  token: string,
  studentId: string,
): Promise<any> {
  const response = await fetch(`${BASE}/${studentId}/performance`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch student performance summary.");
  }

  return await response.json();
}

export async function getCurrentStudentSubjects(token: string): Promise<any[]> {
  const response = await fetch(`${BASE}/me/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  return (await response.json()) as any[];
}

export async function getCurrentStudentTimetable(token: string): Promise<any[]> {
  const response = await fetch(`${BASE}/me/timetable`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  return (await response.json()) as any[];
}

export async function getCurrentStudentAssignments(token: string): Promise<any[]> {
  const response = await fetch(`${BASE}/me/assignments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  return (await response.json()) as any[];
}

export async function getCurrentStudentAttendance(token: string): Promise<any> {
  const response = await fetch(`${BASE}/me/attendance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return { total_classes: 0, present: 0, absent: 0, late: 0, attendance_percentage: 0, records: [] };
  return await response.json();
}

export async function getCurrentStudentFees(token: string): Promise<any> {
  const response = await fetch(`${BASE}/me/fees`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return { total_fees: 0, paid_amount: 0, pending_amount: 0, invoices: [], payment_history: [] };
  return await response.json();
}

export async function getCurrentStudentLibrary(token: string): Promise<any> {
  const response = await fetch(`${BASE}/me/library`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return { active_books: 0, overdue_books: 0, returned_books: 0, total_fine: 0, active_issues: [], overdue_issues: [], reservations: [] };
  return await response.json();
}

export async function getCurrentStudentHostel(token: string): Promise<any> {
  const response = await fetch(`${BASE}/me/hostel`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return { allocated: false };
  return await response.json();
}

export async function getCurrentStudentTransport(token: string): Promise<any> {
  const response = await fetch(`${BASE}/me/transport`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return { assigned: false };
  return await response.json();
}

export async function submitCurrentStudentAssignment(token: string, assignmentId: string, filePath: string): Promise<any> {
  const response = await fetch(`${BASE}/me/submit-assignment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ assignment_id: assignmentId, file_path: filePath }),
  });
  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to submit assignment.");
  }
  return await response.json();
}
