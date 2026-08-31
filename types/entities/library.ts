export type BookCategoryCreate = {
  category_name: string;
  description?: string | null;
  status?: boolean;
};

export type BookCategoryUpdate = Partial<BookCategoryCreate>;

export type BookCategoryResponse = {
  id: string;
  category_name: string;
  description?: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthorCreate = {
  name: string;
  biography?: string | null;
  status?: boolean;
};

export type AuthorUpdate = Partial<AuthorCreate>;

export type AuthorResponse = {
  id: string;
  name: string;
  biography?: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
};

export type PublisherCreate = {
  name: string;
  contact_info?: string | null;
  address?: string | null;
  status?: boolean;
};

export type PublisherUpdate = Partial<PublisherCreate>;

export type PublisherResponse = {
  id: string;
  name: string;
  contact_info?: string | null;
  address?: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
};

export type BookCreate = {
  isbn: string;
  title: string;
  subtitle?: string | null;
  author: string;
  author_id?: string | null;
  publisher?: string | null;
  publisher_id?: string | null;
  category_id: string;
  edition?: string | null;
  language?: string | null;
  rack_number?: string | null;
  shelf_number?: string | null;
  total_copies: number;
  available_copies: number;
  cover_image?: string | null;
  description?: string | null;
  status?: boolean;
};

export type BookUpdate = Partial<BookCreate> & {
  is_deleted?: boolean;
};

export type BookResponse = {
  id: string;
  isbn: string;
  title: string;
  subtitle?: string | null;
  author: string;
  author_id?: string | null;
  publisher?: string | null;
  publisher_id?: string | null;
  category_id: string;
  edition?: string | null;
  language?: string | null;
  rack_number?: string | null;
  shelf_number?: string | null;
  total_copies: number;
  available_copies: number;
  cover_image?: string | null;
  description?: string | null;
  status: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

export type BookIssueCreate = {
  book_id: string;
  student_id: string;
  issue_date: string;
  due_date: string;
};

export type BookIssueUpdate = {
  issue_date?: string;
  due_date?: string;
  status?: string;
  fine_amount?: number;
  fine_paid?: boolean;
};

export type BookIssueResponse = {
  id: string;
  book_id: string;
  student_id: string;
  issue_date: string;
  due_date: string;
  return_date?: string | null;
  fine_amount: number;
  fine_paid: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  book_title?: string | null;
  book_author?: string | null;
  student_name?: string | null;
  student_class?: string | null;
  overdue_days?: number | null;
};

export type BookReturnRequest = {
  return_date?: string | null;
};

export type BookReservationCreate = {
  book_id: string;
  student_id: string;
  reservation_date?: string;
};

export type BookReservationUpdate = {
  status?: string;
  approval_date?: string | null;
};

export type BookReservationResponse = {
  id: string;
  book_id: string;
  student_id: string;
  reservation_date: string;
  status: string;
  approval_date?: string | null;
  created_at: string;
  updated_at: string;
  book_title?: string | null;
  book_author?: string | null;
  student_name?: string | null;
  student_class?: string | null;
};

export type LibrarySettingsCreate = {
  max_books_per_student: number;
  fine_per_day: number;
  reservation_limit: number;
  borrow_duration: number;
};

export type LibrarySettingsUpdate = Partial<LibrarySettingsCreate>;

export type LibrarySettingsResponse = {
  id: string;
  max_books_per_student: number;
  fine_per_day: number;
  reservation_limit: number;
  borrow_duration: number;
  created_at: string;
  updated_at: string;
};

export type FinePaymentCreate = {
  issue_id: string;
  amount: number;
  status?: string;
};

export type FinePaymentUpdate = {
  amount?: number;
  status?: string;
};

export type FinePaymentResponse = {
  id: string;
  issue_id: string;
  amount: number;
  payment_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  book_title?: string | null;
  student_name?: string | null;
};

export type LibrarySummaryResponse = {
  total_books: number;
  available_books: number;
  issued_books: number;
  overdue_books: number;
};

export type LibraryDashboardAnalytics = {
  total_books: number;
  available_books: number;
  issued_books: number;
  overdue_books: number;
  reserved_books: number;
  total_fine: number;
  fine_collected: number;
  active_students: number;
  issued_today: number;
  returned_today: number;
  active_loans: number;
  overdue_loans: number;
  pending_reservations: number;
};

export type LibraryStudentDashboard = {
  active_books: number;
  overdue_books: number;
  returned_books: number;
  total_fine: number;
  active_reservations: number;
};

export type LibraryReport = {
  date?: string;
  period?: string;
  books_issued: number;
  books_returned: number;
  overdue_books: number;
  total_fine: number;
};
