export type SubjectResponse = {
  id: string;
  subject_code: string;
  subject_name: string;
  department_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SubjectCreate = {
  subject_code: string;
  subject_name: string;
  department_id?: string | null;
};

export type SubjectUpdate = {
  subject_code?: string;
  subject_name?: string;
  department_id?: string | null;
};
