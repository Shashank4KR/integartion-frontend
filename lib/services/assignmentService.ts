const API_BASE = "/api";
const BASE = "/api/students";

export type AssignmentItem = {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  title: string;
  description?: string | null;
  due_date: string;
  attachment?: string | null;
  created_at: string;
  updated_at: string;
  class_name?: string | null;
  subject_name?: string | null;
};

export type AssignmentCreatePayload = {
  teacher_id: string;
  class_id: string;
  subject_id: string;
  title: string;
  description?: string | null;
  due_date: string;
  attachment?: string | null;
};

export type AssignmentSubmissionItem = {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_on: string;
  file_path?: string | null;
  marks?: number | string | null;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
  student_name?: string | null;
};

export async function createAssignment(
  token: string,
  payload: AssignmentCreatePayload,
): Promise<AssignmentItem> {
  const response = await fetch(`${API_BASE}/assignments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: "Failed to create assignment" }));
    throw new Error(data.detail ?? "Failed to create assignment.");
  }

  return (await response.json()) as AssignmentItem;
}

export async function getAllAssignments(token: string): Promise<AssignmentItem[]> {
  const response = await fetch(`${API_BASE}/assignments`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: "Failed to fetch assignments" }));
    throw new Error(data.detail ?? "Failed to fetch assignments.");
  }

  return (await response.json()) as AssignmentItem[];
}

export async function getAssignmentById(token: string, id: string): Promise<AssignmentItem> {
  const response = await fetch(`${API_BASE}/assignments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: "Failed to fetch assignment" }));
    throw new Error(data.detail ?? "Failed to fetch assignment.");
  }

  return (await response.json()) as AssignmentItem;
}

export async function updateAssignment(
  token: string,
  id: string,
  payload: Partial<AssignmentCreatePayload>,
): Promise<AssignmentItem> {
  const response = await fetch(`${API_BASE}/assignments/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: "Failed to update assignment" }));
    throw new Error(data.detail ?? "Failed to update assignment.");
  }

  return (await response.json()) as AssignmentItem;
}

export async function deleteAssignment(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/assignments/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: "Failed to delete assignment" }));
    throw new Error(data.detail ?? "Failed to delete assignment.");
  }
}

export async function getAssignmentSubmissions(
  token: string,
  assignmentId: string,
): Promise<AssignmentSubmissionItem[]> {
  const response = await fetch(`${API_BASE}/assignments/${assignmentId}/submissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: "Failed to fetch submissions" }));
    throw new Error(data.detail ?? "Failed to fetch submissions.");
  }

  return (await response.json()) as AssignmentSubmissionItem[];
}

export async function getAssignmentSummary(
  token: string,
  assignmentId: string,
): Promise<{ assignment_id: string; total_students: number; submitted: number; pending: number }> {
  const response = await fetch(`${API_BASE}/assignments/${assignmentId}/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: "Failed to fetch assignment summary" }));
    throw new Error(data.detail ?? "Failed to fetch assignment summary.");
  }

  return await response.json();
}

export async function gradeSubmission(
  token: string,
  submissionId: string,
  payload: { marks?: number | string | null; remarks?: string | null },
): Promise<AssignmentSubmissionItem> {
  const response = await fetch(`${API_BASE}/assignment-submissions/${submissionId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: "Failed to grade submission" }));
    throw new Error(data.detail ?? "Failed to grade submission.");
  }

  return (await response.json()) as AssignmentSubmissionItem;
}

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
