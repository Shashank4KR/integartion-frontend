const BASE = "/api/students";

export type StudentAssignment = {
  id: string;
  title: string;
  description?: string | null;
  subject_id: string;
  subject_name?: string | null;
  teacher_id: string;
  teacher_name?: string | null;
  due_date: string;
  attachment?: string | null;
  submission?: {
    id: string;
    submitted_on?: string | null;
    marks?: number | string | null;
    remarks?: string | null;
  } | null;
};

export async function listStudentAssignments(
  token: string,
  studentId: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/${studentId}/assignments`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch student assignments.");
  }

  return (await response.json()) as any[];
}

export async function listCurrentStudentAssignments(
  token: string,
): Promise<StudentAssignment[]> {
  const response = await fetch(`${BASE}/me/assignments`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch your assignments.");
  }

  return (await response.json()) as StudentAssignment[];
}

export async function listStudentSubmissions(
  token: string,
  studentId: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/${studentId}/submissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch student submissions.");
  }

  return (await response.json()) as any[];
}

export async function listCurrentStudentSubmissions(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/me/submissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch your submissions.");
  }

  return (await response.json()) as any[];
}
