"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getCurrentTeacher, getTeacherClasses, getTeacherSubjects } from "@/lib/services/teacherService";
import { getClassStudents } from "@/lib/services/classService";
import { createBulkAttendance, getAllAttendance } from "@/lib/services/attendanceService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, CheckCircle2, Calendar, UserCheck, Save } from "lucide-react";

export default function TeacherAttendancePage() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [classes, setClasses] = useState<Array<{ id: string; class_name: string; section?: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; subject_name: string }>>([]);
  
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split("T")[0]);
  
  const [students, setStudents] = useState<Array<{ id: string; first_name?: string; last_name?: string; admission_no: string; roll_no?: string }>>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE" | "EXCUSED">>({});
  
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const storedToken = getToken();
        if (!storedToken) {
          router.replace("/login");
          return;
        }
        setToken(storedToken);

        const teacher = await getCurrentTeacher(storedToken);
        setTeacherId(teacher.id);

        const [assignedClasses, assignedSubjects] = await Promise.all([
          getTeacherClasses(storedToken, teacher.id),
          getTeacherSubjects(storedToken, teacher.id),
        ]);

        setClasses(assignedClasses);
        setSubjects(assignedSubjects);

        if (assignedClasses.length > 0) {
          setSelectedClass(assignedClasses[0].id);
        }
        if (assignedSubjects.length > 0) {
          setSelectedSubject(assignedSubjects[0].id);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to initialize teacher attendance page.");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [router]);

  useEffect(() => {
    if (!selectedClass || !token) return;

    async function loadStudentsAndExistingAttendance() {
      setLoadingStudents(true);
      setError(null);
      setSuccess(null);
      try {
        const classStudents = await getClassStudents(token, selectedClass);
        setStudents(classStudents);

        const initialMap: Record<string, "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"> = {};
        classStudents.forEach((s) => {
          initialMap[s.id] = "PRESENT";
        });

        if (selectedSubject && attendanceDate) {
          try {
            const existing = await getAllAttendance(token, {
              class_id: selectedClass,
              subject_id: selectedSubject,
              start_date: attendanceDate,
              end_date: attendanceDate,
            });
            existing.forEach((rec) => {
              if (rec.student_id && rec.status) {
                initialMap[rec.student_id] = rec.status as any;
              }
            });
          } catch {
            // Ignore if search fails
          }
        }

        setAttendanceState(initialMap);
      } catch (err: any) {
        setError(err?.message || "Failed to load students for selected class.");
      } finally {
        setLoadingStudents(false);
      }
    }

    void loadStudentsAndExistingAttendance();
  }, [selectedClass, selectedSubject, attendanceDate, token]);

  const handleStatusChange = (studentId: string, status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") => {
    setAttendanceState((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: "PRESENT" | "ABSENT") => {
    const updated: Record<string, "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceState(updated);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedSubject || !attendanceDate) {
      setError("Please select class, subject, and date.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const records = students.map((s) => ({
        student_id: s.id,
        status: attendanceState[s.id] || "PRESENT",
      }));

      await createBulkAttendance(token, {
        class_id: selectedClass,
        subject_id: selectedSubject,
        teacher_id: teacherId,
        attendance_date: attendanceDate,
        period_no: 1,
        marked_by: teacherId,
        records,
      });


      setSuccess(`Successfully saved attendance for ${students.length} students.`);
    } catch (err: any) {
      setError(err?.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <RoleDashboardLayout config={ROLE_CONFIGS.teacher}>
        <Card className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </Card>
      </RoleDashboardLayout>
    );
  }

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.teacher}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-purple-600" />
            Mark Class Attendance
          </h1>
          <p className="text-slate-600 mt-1">Select assigned class, subject, and date to record live student attendance.</p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </Card>
        )}

        {success && (
          <Card className="border-emerald-200 bg-emerald-50 p-4 text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-medium">{success}</p>
          </Card>
        )}

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class / Section</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name} {cls.section ? `(${cls.section})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              >
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </Card>

        {loadingStudents ? (
          <Card className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span className="ml-2 text-slate-600 text-sm">Loading student list...</span>
          </Card>
        ) : students.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            No students found for the selected class.
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Student Roll Call ({students.length})</h2>
                <p className="text-xs text-slate-500">Click options to mark status per student</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleMarkAll("PRESENT")}
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded border border-emerald-200 hover:bg-emerald-100"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => handleMarkAll("ABSENT")}
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 rounded border border-rose-200 hover:bg-rose-100"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-3 px-4">Roll / Adm No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => {
                    const fullName = `${student.first_name || ""} ${student.last_name || ""}`.trim() || "Student";
                    const currentStatus = attendanceState[student.id] || "PRESENT";

                    return (

                      <tr key={student.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                          {student.roll_no || student.admission_no}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">{fullName}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-2">
                            {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const).map((st) => {
                              const isSelected = currentStatus === st;
                              let activeClass = "";
                              if (isSelected) {
                                if (st === "PRESENT") activeClass = "bg-emerald-600 text-white font-semibold";
                                else if (st === "ABSENT") activeClass = "bg-rose-600 text-white font-semibold";
                                else if (st === "LATE") activeClass = "bg-amber-500 text-white font-semibold";
                                else if (st === "EXCUSED") activeClass = "bg-blue-600 text-white font-semibold";
                              } else {
                                activeClass = "bg-slate-100 text-slate-600 hover:bg-slate-200";
                              }

                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleStatusChange(student.id, st)}
                                  className={`px-3 py-1 text-xs rounded transition-colors ${activeClass}`}
                                >
                                  {st}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveAttendance}
                disabled={saving}
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Attendance
                  </>
                )}
              </button>
            </div>
          </Card>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
