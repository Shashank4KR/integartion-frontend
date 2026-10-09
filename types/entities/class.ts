export type ClassResponse = {
  id: string;
  class_name: string;
  section: string;
  academic_year: string;
  class_teacher_id?: string | null;
  room_number?: string | null;
  status?: string | null;
  created_at: string;
  updated_at: string;
};

export type ClassCreate = {
  class_name: string;
  section: string;
  academic_year: string;
  class_teacher_id?: string | null;
  room_number?: string | null;
  status?: string | null;
};

export type ClassUpdate = {
  class_name?: string;
  section?: string;
  academic_year?: string;
  class_teacher_id?: string | null;
  room_number?: string | null;
  status?: string | null;
};