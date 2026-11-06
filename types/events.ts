export type EventGenre =
  | "COMPETITION"
  | "CELEBRATION"
  | "ACADEMIC"
  | "SPORTS"
  | "CULTURAL"
  | "MEETING"
  | "HOLIDAY"
  | "WORKSHOP"
  | "OTHER";

export type TargetAudienceRole =
  | "ALL"
  | "STUDENTS"
  | "PARENTS"
  | "TEACHERS"
  | "PARENTS_AND_STUDENTS";

export type EventStatus =
  | "UPCOMING"
  | "TODAY"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

export interface EventItem {
  id: string;
  title: string;
  genre: EventGenre;
  targetAudience: TargetAudienceRole;
  targetClasses: string[]; // e.g. ["All Classes"] or ["Class 9", "Class 10"]
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  venue: string;
  description: string;
  eligibility?: string;
  registrationRequired: boolean;
  maxParticipants?: number;
  registrationDeadline?: string;
  coordinatorName?: string;
  coordinatorContact?: string;
  prizes?: string;
  status: EventStatus;
  registeredCount?: number;
  createdAt?: string;
}
