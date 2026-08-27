import { getToken } from "@/lib/auth";
import type { UserResponse } from "@/types/auth";

export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_subjects: number;
  total_fees_invoiced: number;
  total_fees_collected: number;
  outstanding_fees: number;
  today_collection: number;
  monthly_collection: number;
  upcoming_events: number;
}

export interface StudentDashboardSummary {
  attendance_percentage: number;
  total_classes: number;
  present: number;
  total_fees: number;
  paid_amount: number;
  pending_amount: number;
  student_name: string;
}

export interface TeacherDashboardSummary {
  assigned_classes: number;
  assigned_subjects: number;
  total_students: number;
  teacher_name: string;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getCurrentUserProfile(): Promise<UserResponse> {
  return requestJson<UserResponse>("/api/auth/me");
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return requestJson<DashboardStats>("/api/dashboard/stats");
}

export async function getStudentDashboardSummary(studentId: string): Promise<StudentDashboardSummary> {
  return requestJson<StudentDashboardSummary>(`/api/dashboard/student/${studentId}`);
}

export async function getCurrentStudentProfile(): Promise<{
  id: string;
  admission_no: string;
  first_name?: string | null;
  last_name?: string | null;
  class_name?: string | null;
  roll_no?: string | null;
}> {
  return requestJson(`/api/students/me`);
}

export async function getTeacherDashboardSummary(teacherId: string): Promise<TeacherDashboardSummary> {
  return requestJson<TeacherDashboardSummary>(`/api/dashboard/teacher/${teacherId}`);
}

export async function getCurrentTeacherProfile(): Promise<{
  id: string;
  employee_id: string;
  qualification?: string | null;
  department_id?: string | null;
}> {
  return requestJson(`/api/teachers/me`);
}

export async function getCurrentParentStudents(): Promise<Array<{
  id: string;
  admission_no: string;
  first_name?: string | null;
  last_name?: string | null;
  class_name?: string | null;
  roll_no?: string | null;
}>> {
  return requestJson(`/api/parents/me/students`);
}
export async function getTeacherTimetable(teacherId: string): Promise<any[]> {
  return requestJson(`/api/teachers/${teacherId}/timetable`);
}

export async function getTeacherPendingSubmissions(teacherId: string): Promise<any[]> {
  return requestJson(`/api/teachers/${teacherId}/pending-submissions`);
}

export async function getTeacherPerformance(teacherId: string): Promise<any[]> {
  return requestJson(`/api/teachers/${teacherId}/performance`);
}

export async function getTeacherMessages(teacherId: string): Promise<any[]> {
  return requestJson(`/api/teachers/${teacherId}/messages`);
}

export async function getTeacherEvents(teacherId: string): Promise<any[]> {
  return requestJson(`/api/teachers/${teacherId}/events`);
}

export async function getRecentActivities(): Promise<any[]> {
  return requestJson(`/api/audit/recent-activities`);
}

export async function getUpcomingEvents(): Promise<any[]> {
  return requestJson(`/api/events/upcoming`);
}

export async function getClasses(): Promise<any[]> {
  return requestJson(`/api/classes`);
}

export async function getStudents(): Promise<any[]> {
  return requestJson(`/api/students`);
}

export async function getStudentTimetable(): Promise<any[]> {
  return requestJson(`/api/students/me/timetable`);
}

export async function getStudentAssignments(): Promise<any[]> {
  return requestJson(`/api/students/me/assignments`);
}

export async function getExams(): Promise<any[]> {
  return requestJson(`/api/exams`);
}

export async function getAnnouncements(): Promise<any[]> {
  return requestJson(`/api/announcements`);
}
