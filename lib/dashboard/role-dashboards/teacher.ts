import {
  CheckCircle2,
  ClipboardList,
  FileBarChart,
  MessageSquare,
  Users2,
  FileText,
  FolderOpen,
  Link,
} from "lucide-react";
import type { RoleQuickAction } from "./types";

export const teacherQuickActions: RoleQuickAction[] = [
  { id: "attendance", label: "Mark Attendance", icon: CheckCircle2, href: "/dashboard/teacher/attendance" },
  { id: "assignment", label: "Create Assignment", icon: ClipboardList, href: "/dashboard/teacher/assignments" },
  { id: "notes", label: "Chapter Notes", icon: FolderOpen, href: "/dashboard/teacher/notes" },
  { id: "marks", label: "Enter Marks", icon: FileBarChart, href: "/dashboard/teacher/marks" },
  { id: "lesson_plans", label: "Lesson Plans", icon: FileText, href: "/dashboard/teacher/lesson-plans" },
  { id: "content", label: "Content Links", icon: Link, href: "/dashboard/teacher/content" },
  { id: "casestudy", label: "Student Case Study & Feedback", icon: Users2, href: "/dashboard/teacher/classes" },
  { id: "message", label: "Message Parents", icon: MessageSquare, href: "/dashboard/teacher/messages" },
];
