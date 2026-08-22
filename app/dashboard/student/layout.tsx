"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getStoredUser,
  getStoredRoleId,
  clearAuth,
  getToken,
} from "@/lib/auth";
import { getCurrentStudent } from "@/lib/services/studentService";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    const token = getToken();
    const roleId = getStoredRoleId();

    // Check authentication
    if (!user || !token || !roleId) {
      clearAuth();
      router.replace("/login");
      return;
    }

    // Student role ID
    const studentRoleId = "00000000-0000-0000-0000-000000000004";

    const isStudent =
      roleId === studentRoleId ||
      user.role?.role_name?.toUpperCase() === "STUDENT";

    // Check student role
    if (!isStudent) {
      router.replace("/login");
      return;
    }

    // Check if student details are already stored
    const storedStudent = localStorage.getItem("edtech_student");

    if (storedStudent) {
      setAuthorized(true);
      setLoading(false);
      return;
    }

    // Fetch current student's profile
    const fetchStudentProfile = async () => {
      try {
        const student = await getCurrentStudent(token);

        if (student) {
          localStorage.setItem(
            "edtech_student",
            JSON.stringify(student),
          );

          setAuthorized(true);
        } else {
          clearAuth();
          router.replace("/login");
        }
      } catch (err) {
        console.error("Failed to load student details:", err);
        clearAuth();
        router.replace("/login");
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

          <p className="text-sm font-medium text-slate-500">
            Securing your session...
          </p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}