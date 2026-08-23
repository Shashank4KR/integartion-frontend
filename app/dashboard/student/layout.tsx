"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, getStoredRoleId, clearAuth, getToken } from "@/lib/auth";
import { getCurrentStudent } from "@/lib/services/studentService";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    const token = getToken();
    const roleId = getStoredRoleId();

    // Check auth
    if (!user || !token || !roleId) {
      clearAuth();
      router.replace("/login");
      return;
    }

    // Role ID mapping for Student is "00000000-0000-0000-0000-000000000004"
    const studentRoleId = "00000000-0000-0000-0000-000000000004";
    const isStudent =
      roleId === studentRoleId ||
      user.role?.role_name?.toUpperCase() === "STUDENT";

    if (!isStudent) {
      // Redirect to login or appropriate dashboard
      router.replace("/login");
      return;
    }

    // Fetch and store Student Details if not present
    const storedStudent = localStorage.getItem("edtech_student");
    if (storedStudent) {
      setAuthorized(true);
      setLoading(false);
      return;
    }

    const fetchStudentProfile = async () => {
      try {
        const student = await getCurrentStudent(token);
        if (student.user_id === user.id) {
          localStorage.setItem("edtech_student", JSON.stringify(student));
          setAuthorized(true);
        } else {
          // Logged in as student role, but no student profile found in DB
          clearAuth();
          router.replace("/login");
        }
      } catch (err) {
        console.error("Failed to load student details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Securing your session...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
