import { formatApiError } from "@/lib/services/apiError";
import type {
  AttendanceCreate,
  AttendanceListParams,
  AttendanceResponse,
  AttendanceUpdate,
  BulkAttendanceCreate,
  ClassAttendanceSummary,
  StudentAttendanceReport,
  StudentAttendanceSummary,
  SubjectAttendanceSummary,
  TeacherAttendanceSummary,
} from "@/types/entities/attendance";

const BASE = "/api/attendance";

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!response.ok) {
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }
    }
    if (!parsed) {
      throw new Error(
        response.statusText || `Request failed with status ${response.status}.`,
      );
    }
    throw new Error(formatApiError(parsed, "Request failed.", response.statusText));
  }

  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

function buildQueryString(params: AttendanceListParams): string {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.page_size !== undefined)
    searchParams.set("page_size", String(params.page_size));
  if (params.class_id) searchParams.set("class_id", params.class_id);
  if (params.student_id) searchParams.set("student_id", params.student_id);
  if (params.teacher_id) searchParams.set("teacher_id", params.teacher_id);
  if (params.subject_id) searchParams.set("subject_id", params.subject_id);
  if (params.start_date) searchParams.set("start_date", params.start_date);
  if (params.end_date) searchParams.set("end_date", params.end_date);
  if (params.status) searchParams.set("status", params.status);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export async function getAllAttendance(
  token: string,
  params: AttendanceListParams = {},
): Promise<AttendanceResponse[]> {
  const queryString = buildQueryString(params);
  return request<AttendanceResponse[]>(queryString, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAttendanceById(
  token: string,
  attendanceId: string,
): Promise<AttendanceResponse> {
  return request<AttendanceResponse>(`/${attendanceId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createAttendance(
  token: string,
  payload: AttendanceCreate,
): Promise<AttendanceResponse> {
  return request<AttendanceResponse>("", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function createBulkAttendance(
  token: string,
  payload: BulkAttendanceCreate,
): Promise<AttendanceResponse[]> {
  return request<AttendanceResponse[]>("/bulk", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function updateAttendance(
  token: string,
  attendanceId: string,
  payload: AttendanceUpdate,
): Promise<AttendanceResponse> {
  return request<AttendanceResponse>(`/${attendanceId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function deleteAttendance(
  token: string,
  attendanceId: string,
): Promise<void> {
  return request<void>(`/${attendanceId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAttendanceByStudent(
  token: string,
  studentId: string,
): Promise<AttendanceResponse[]> {
  return request<AttendanceResponse[]>(`/student/${studentId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getStudentAttendanceReport(
  token: string,
  studentId: string,
  params: { start_date: string; end_date: string },
): Promise<StudentAttendanceReport> {
  const qs = `?start_date=${encodeURIComponent(params.start_date)}&end_date=${encodeURIComponent(params.end_date)}`;
  return request<StudentAttendanceReport>(
    `/student/${studentId}/report${qs}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

export async function getStudentAttendanceSummary(
  token: string,
  studentId: string,
): Promise<StudentAttendanceSummary> {
  return request<StudentAttendanceSummary>(`/student/${studentId}/summary`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getCurrentStudentAttendanceSummary(
  token: string,
): Promise<StudentAttendanceSummary> {
  const response = await fetch("/api/students/me/attendance", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch your attendance summary.");
  }

  return (await response.json()) as StudentAttendanceSummary;
}

export async function getAttendanceByTeacher(
  token: string,
  teacherId: string,
): Promise<AttendanceResponse[]> {
  return request<AttendanceResponse[]>(`/teacher/${teacherId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getTeacherAttendanceSummary(
  token: string,
  teacherId: string,
): Promise<TeacherAttendanceSummary> {
  return request<TeacherAttendanceSummary>(`/teacher/${teacherId}/summary`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAttendanceByClass(
  token: string,
  classId: string,
): Promise<AttendanceResponse[]> {
  return request<AttendanceResponse[]>(`/class/${classId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAttendanceByDate(
  token: string,
  attendanceDate: string,
): Promise<AttendanceResponse[]> {
  return request<AttendanceResponse[]>(`/date/${attendanceDate}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getClassAttendanceSummary(
  token: string,
  classId: string,
): Promise<ClassAttendanceSummary> {
  return request<ClassAttendanceSummary>(`/class/${classId}/summary`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getSubjectAttendanceSummary(
  token: string,
  subjectId: string,
): Promise<SubjectAttendanceSummary> {
  return request<SubjectAttendanceSummary>(`/subject/${subjectId}/summary`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

