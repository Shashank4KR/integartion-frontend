const API_BASE = "/api";

export type LessonPlan = {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  chapter_name: string;
  topic: string;
  plan_date: string;
  objectives?: string | null;
  materials_needed?: string | null;
  procedure_summary?: string | null;
  homework_notes?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  class_name?: string | null;
  subject_name?: string | null;
  teacher_name?: string | null;
};

export type ContentResource = {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  chapter_name?: string | null;
  title: string;
  url: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  class_name?: string | null;
  subject_name?: string | null;
};

export type ChapterNote = {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  chapter_name: string;
  title: string;
  file_url: string;
  file_name: string;
  file_size?: number | null;
  mime_type?: string | null;
  created_at: string;
  updated_at: string;
  class_name?: string | null;
  subject_name?: string | null;
};

export type StudentFeedback = {
  id: string;
  teacher_id: string;
  student_id: string;
  feedback_type: string;
  comment: string;
  feedback_date: string;
  created_at: string;
  updated_at: string;
  teacher_name?: string | null;
  student_name?: string | null;
};

// Lesson Plans
export async function getLessonPlans(
  token: string,
  params?: { class_id?: string; subject_id?: string; chapter_name?: string }
): Promise<LessonPlan[]> {
  const urlParams = new URLSearchParams();
  if (params?.class_id) urlParams.append("class_id", params.class_id);
  if (params?.subject_id) urlParams.append("subject_id", params.subject_id);
  if (params?.chapter_name) urlParams.append("chapter_name", params.chapter_name);

  const res = await fetch(`${API_BASE}/lesson-plans?${urlParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch lesson plans");
  return res.json();
}

export async function createLessonPlan(token: string, payload: Partial<LessonPlan>): Promise<LessonPlan> {
  const res = await fetch(`${API_BASE}/lesson-plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to create lesson plan" }));
    throw new Error(err.detail || "Failed to create lesson plan");
  }
  return res.json();
}

export async function deleteLessonPlan(token: string, planId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/lesson-plans/${planId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete lesson plan");
}

// Content Resources
export async function getContentResources(
  token: string,
  params?: { class_id?: string; subject_id?: string; chapter_name?: string }
): Promise<ContentResource[]> {
  const urlParams = new URLSearchParams();
  if (params?.class_id) urlParams.append("class_id", params.class_id);
  if (params?.subject_id) urlParams.append("subject_id", params.subject_id);
  if (params?.chapter_name) urlParams.append("chapter_name", params.chapter_name);

  const res = await fetch(`${API_BASE}/content-resources?${urlParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch content resources");
  return res.json();
}

export async function createContentResource(
  token: string,
  payload: Partial<ContentResource>
): Promise<ContentResource> {
  const res = await fetch(`${API_BASE}/content-resources`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to create resource link" }));
    throw new Error(err.detail || "Failed to create resource link");
  }
  return res.json();
}

export async function deleteContentResource(token: string, resourceId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/content-resources/${resourceId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete content resource");
}

// Chapter Notes
export async function getChapterNotes(
  token: string,
  params?: { class_id?: string; subject_id?: string; chapter_name?: string }
): Promise<ChapterNote[]> {
  const urlParams = new URLSearchParams();
  if (params?.class_id) urlParams.append("class_id", params.class_id);
  if (params?.subject_id) urlParams.append("subject_id", params.subject_id);
  if (params?.chapter_name) urlParams.append("chapter_name", params.chapter_name);

  const res = await fetch(`${API_BASE}/chapter-notes?${urlParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch chapter notes");
  return res.json();
}

export async function uploadChapterNote(token: string, formData: FormData): Promise<ChapterNote> {
  const res = await fetch(`${API_BASE}/chapter-notes/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to upload chapter note" }));
    throw new Error(err.detail || "Failed to upload chapter note");
  }
  return res.json();
}

export async function deleteChapterNote(token: string, noteId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/chapter-notes/${noteId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete chapter note");
}

// Student Feedback
export async function getStudentFeedback(token: string, studentId?: string): Promise<StudentFeedback[]> {
  const urlParams = new URLSearchParams();
  if (studentId) urlParams.append("student_id", studentId);

  const res = await fetch(`${API_BASE}/student-feedback?${urlParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch student feedback");
  return res.json();
}

export async function createStudentFeedback(
  token: string,
  payload: Partial<StudentFeedback>
): Promise<StudentFeedback> {
  const res = await fetch(`${API_BASE}/student-feedback`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to save feedback" }));
    throw new Error(err.detail || "Failed to save feedback");
  }
  return res.json();
}

export async function deleteStudentFeedback(token: string, feedbackId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/student-feedback/${feedbackId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete student feedback");
}
