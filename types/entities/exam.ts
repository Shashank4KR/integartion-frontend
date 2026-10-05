export type ExamCreate = {
  exam_name: string;
  exam_type: string;
  class_id: string;
  start_date: string;
  end_date: string;
  max_marks: number;
};

export type ExamUpdate = {
  exam_name?: string;
  exam_type?: string;
  class_id?: string;
  start_date?: string;
  end_date?: string;
  max_marks?: number;
};

export type ExamResponse = {
  id: string;
  exam_name: string;
  exam_type: string;
  class_id: string;
  class_name?: string;
  section?: string;
  start_date: string;
  end_date: string;
  max_marks: number;
  created_at: string;
  updated_at: string;
};

export type ExamTopper = {
  rank: number;
  student_name: string;
  percentage: number;
};
