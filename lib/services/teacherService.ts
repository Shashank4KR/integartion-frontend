import type { TeacherCreate, TeacherResponse } from "@/types/entities/teacher";
import type { ClassResponse } from "@/types/entities/class";
import type { SubjectResponse } from "@/types/entities/subject";

const BASE = "/api/teachers";

export async function listTeachers(token: string): Promise<TeacherResponse[]> {
  const response = await fetch(`${BASE}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch teachers.");
  }

  return (await response.json()) as TeacherResponse[];
}

export async function getTeacher(
  token: string,
  id: string,
): Promise<TeacherResponse> {
  const response = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch teacher.");
  }

  return (await response.json()) as TeacherResponse;
}

export async function createTeacher(
  token: string,
  payload: TeacherCreate,
): Promise<TeacherResponse> {
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
    throw new Error(data.detail ?? "Failed to create teacher.");
  }

  return (await response.json()) as TeacherResponse;
}

export async function updateTeacher(
  token: string,
  id: string,
  payload: Partial<TeacherCreate>,
): Promise<TeacherResponse> {
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
    throw new Error(data.detail ?? "Failed to update teacher.");
  }

  return (await response.json()) as TeacherResponse;
}

export async function deleteTeacher(token: string, id: string): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete teacher.");
  }
}

export async function getTeacherClasses(
  token: string,
  teacherId: string,
): Promise<ClassResponse[]> {
  const response = await fetch(`${BASE}/${teacherId}/classes`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch teacher classes.");
  }

  return (await response.json()) as ClassResponse[];
}

export async function getTeacherSubjects(
  token: string,
  teacherId: string,
): Promise<SubjectResponse[]> {
  const response = await fetch(`${BASE}/${teacherId}/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch teacher subjects.");
  }

  return (await response.json()) as SubjectResponse[];
}

export async function getCurrentTeacher(token: string): Promise<TeacherResponse> {
  const response = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch teacher profile.");
  }

  return (await response.json()) as TeacherResponse;
}

export async function getTeacherTimetable(
  token: string,
  teacherId: string,
): Promise<Array<{
  id: string;
  class_name?: string | null;
  subject_name?: string | null;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_no?: string | null;
}>> {
  const response = await fetch(`${BASE}/${teacherId}/timetable`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch teacher timetable.");
  }

  return (await response.json()) as Array<{
    id: string;
    class_name?: string | null;
    subject_name?: string | null;
    day_of_week: string;
    start_time: string;
    end_time: string;
    room_no?: string | null;
  }>;
}

export async function getTeacherAssignments(
  token: string,
  teacherId: string,
): Promise<Array<{
  id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  class_name?: string | null;
  subject_name?: string | null;
  created_at?: string | null;
}>> {
  const response = await fetch(`${BASE}/${teacherId}/assignments`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch teacher assignments.");
  }

  return (await response.json()) as Array<{
    id: string;
    title: string;
    description?: string | null;
    due_date?: string | null;
    class_name?: string | null;
    subject_name?: string | null;
    created_at?: string | null;
  }>;
}

export async function getTeacherPendingSubmissions(
  token: string,
  teacherId: string,
): Promise<Array<{
  id: string;
  assignment_id: string;
  assignment_title: string;
  class_name?: string | null;
  subject_name?: string | null;
  student_name: string;
  submitted_on: string;
  file_path?: string | null;
}>> {
  const response = await fetch(`${BASE}/${teacherId}/pending-submissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch pending submissions.");
  }

  return (await response.json()) as Array<{
    id: string;
    assignment_id: string;
    assignment_title: string;
    class_name?: string | null;
    subject_name?: string | null;
    student_name: string;
    submitted_on: string;
    file_path?: string | null;
  }>;
}

export async function getTeacherPerformance(
  token: string,
  teacherId: string,
): Promise<Array<{
  class_id: string;
  class_name: string;
  average_marks: number;
}>> {
  const response = await fetch(`${BASE}/${teacherId}/performance`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch teacher performance.");
  }

  return (await response.json()) as Array<{
    class_id: string;
    class_name: string;
    average_marks: number;
  }>;
}

export async function getTeacherMessages(
  token: string,
  teacherId: string,
): Promise<Array<{
  id: string;
  sender_name: string;
  message: string;
  sent_on: string;
  is_read: boolean;
}>> {
  const response = await fetch(`${BASE}/${teacherId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch teacher messages.");
  }

  return (await response.json()) as Array<{
    id: string;
    sender_name: string;
    message: string;
    sent_on: string;
    is_read: boolean;
  }>;
}

export async function getTeacherEvents(
  token: string,
  teacherId: string,
): Promise<Array<{
  id: string;
  event_name: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
}>> {
  const response = await fetch(`${BASE}/${teacherId}/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch teacher events.");
  }

  return (await response.json()) as Array<{
    id: string;
    event_name: string;
    description?: string | null;
    start_date: string;
    end_date?: string | null;
  }>;
}

export async function getTeacherExamResults(
  token: string,
  teacherId: string,
): Promise<Array<{
  id: string;
  student_name: string;
  class_name: string;
  subject_name: string;
  exam_name: string;
  marks_obtained: number;
  max_marks: number;
  grade?: string | null;
}>> {
  const response = await fetch(`${BASE}/${teacherId}/exam-results`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch teacher marks.");
  }

  return (await response.json()) as Array<{
    id: string;
    student_name: string;
    class_name: string;
    subject_name: string;
    exam_name: string;
    marks_obtained: number;
    max_marks: number;
    grade?: string | null;
  }>;
}

