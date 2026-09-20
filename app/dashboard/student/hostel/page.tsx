"use client";

import { useState, useEffect, useMemo } from "react";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import WelcomeBanner from "@/components/dashboard/role-dashboards/WelcomeBanner";
import StatGrid from "@/components/dashboard/role-dashboards/StatGrid";
import QuickActions from "@/components/dashboard/role-dashboards/QuickActions";
import DashboardCard from "@/components/dashboard/role-dashboards/DashboardCard";
import InfoList from "@/components/dashboard/role-dashboards/InfoList";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import {
  getStudentHostelAllocation,
  getStudentHostelLeaveRequests,
  getStudentHostelComplaints,
  getStudentHostelNotices,
  getStudentHostelFees,
  getHostelDashboardStats,
} from "@/lib/services/hostelService";
import { getToken, getStoredUser } from "@/lib/auth";
import { COMPANY_INFO } from "@/lib/constants";
import { BedDouble, Home, Wallet, FileText, AlertTriangle, CheckCircle2, Megaphone } from "lucide-react";

export default function StudentHostelPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allocation, setAllocation] = useState<any>(null);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const user = getStoredUser();
        if (!token || !user) {
          setError("Authentication required.");
          setLoading(false);
          return;
        }

        let studentId = user.id;
        try {
          const profileRes = await fetch("/api/students/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            if (profile?.id) {
              studentId = profile.id;
            }
          }
        } catch (err) {
          console.warn("[StudentHostel] Profile lookup error, falling back to user.id:", err);
        }

        const [allocData, leaveData, complaintData, noticeData, feeData, statsData] = await Promise.all([
          getStudentHostelAllocation(token, studentId).catch((err) => { console.warn("[StudentHostel] getStudentHostelAllocation error:", err); return null; }),
          getStudentHostelLeaveRequests(token, studentId).catch((err) => { console.warn("[StudentHostel] getStudentHostelLeaveRequests error:", err); return []; }),
          getStudentHostelComplaints(token, studentId).catch((err) => { console.warn("[StudentHostel] getStudentHostelComplaints error:", err); return []; }),
          getStudentHostelNotices(token).catch((err) => { console.warn("[StudentHostel] getStudentHostelNotices error:", err); return []; }),
          getStudentHostelFees(token, studentId).catch((err) => { console.warn("[StudentHostel] getStudentHostelFees error:", err); return []; }),
          getHostelDashboardStats(token).catch((err) => { console.warn("[StudentHostel] getHostelDashboardStats error:", err); return null; }),
        ]);

        setAllocation(allocData);
        setLeaveRequests(leaveData);
        setComplaints(complaintData);
        setNotices(noticeData);
        setFees(feeData);
        setDashboardStats(statsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching student hostel data:", err);
        setError(err instanceof Error ? err.message : "Failed to load hostel data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const studentName = (getStoredUser() as any)?.full_name || (getStoredUser() as any)?.username || "Student";

  const myRoomDetails: any[] = allocation
    ? [
        { id: "1", title: "Hostel", description: allocation.block_name || allocation.block || "N/A", meta: "", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
        { id: "2", title: "Room No.", description: String(allocation.room_no || allocation.roomNo || "N/A"), meta: "", iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
        { id: "3", title: "Bed No.", description: String(allocation.bed_no || allocation.bedNo || "N/A"), meta: "", iconBg: "bg-purple-50", iconColor: "text-purple-500" },
        { id: "4", title: "Floor", description: String(allocation.floor_no || allocation.floorNo || "N/A"), meta: "", iconBg: "bg-amber-50", iconColor: "text-amber-500" },
        { id: "5", title: "Check-in Date", description: allocation.check_in_date || allocation.checkInDate || "N/A", meta: "", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
      ]
    : [
        { id: "1", title: "Hostel", description: "Not allocated", meta: "", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
        { id: "2", title: "Room No.", description: "N/A", meta: "", iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
        { id: "3", title: "Bed No.", description: "N/A", meta: "", iconBg: "bg-purple-50", iconColor: "text-purple-500" },
        { id: "4", title: "Floor", description: "N/A", meta: "", iconBg: "bg-amber-50", iconColor: "text-amber-500" },
        { id: "5", title: "Check-in Date", description: "N/A", meta: "", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
      ];

  const myLeaveRequests: any[] = leaveRequests.length > 0
    ? leaveRequests.map((lr: any) => ({
        id: lr.id,
        title: lr.reason || "Leave Request",
        description: `${lr.start_date || lr.startDate} - ${lr.end_date || lr.endDate}`,
        meta: lr.status || "Pending",
        badge: {
          label: lr.status || "Pending",
          variant: lr.status === "APPROVED" ? "success" : lr.status === "REJECTED" ? "error" : "warning",
        },
      }))
    : [{ id: "1", title: "No leave requests", description: "", meta: "", iconBg: "bg-slate-50", iconColor: "text-slate-400" }];

  const myComplaints: any[] = complaints.length > 0
    ? complaints.map((c: any) => ({
        id: c.id,
        title: c.category || "Complaint",
        description: c.description || "",
        meta: c.resolution_status || c.resolutionStatus || "Open",
        badge: {
          label: c.resolution_status || c.resolutionStatus || "Open",
          variant: c.resolution_status === "RESOLVED" ? "success" : c.resolution_status === "IN_PROGRESS" ? "warning" : "default",
        },
      }))
    : [{ id: "1", title: "No complaints", description: "", meta: "", iconBg: "bg-slate-50", iconColor: "text-slate-400" }];

  const hostelNotices: any[] = notices.length > 0
    ? notices.map((n: any) => ({
        id: n.id,
        title: n.title || "",
        description: n.description || "",
        meta: n.publish_date || n.publishDate || "",
        icon: Megaphone,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-500",
      }))
    : [{ id: "1", title: "No notices", description: "", meta: "", iconBg: "bg-slate-50", iconColor: "text-slate-400" }];

  const studentHostelStats = dashboardStats
    ? [
        {
          id: "hostel",
          label: "Hostel",
          value: allocation?.block_name || allocation?.block || "N/A",
          change: allocation?.block_type || "",
          icon: BedDouble,
          iconBg: "bg-blue-50",
          iconColor: "text-blue-500",
        },
        {
          id: "room",
          label: "Room",
          value: String(allocation?.room_no || allocation?.roomNo || "N/A"),
          change: `Bed ${allocation?.bed_no || allocation?.bedNo || "N/A"}`,
          icon: Home,
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-500",
        },
        {
          id: "fees",
          label: "Fee Status",
          value: fees.length > 0 ? `₹${fees.reduce((sum: number, f: any) => sum + (f.amount || 0), 0).toLocaleString()}` : "₹0",
          change: `${fees.filter((f: any) => f.status === "PENDING").length} pending`,
          icon: Wallet,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-500",
        },
        {
          id: "leave",
          label: "Leave Status",
          value: `${leaveRequests.filter((lr: any) => lr.status === "PENDING").length} pending`,
          change: `${leaveRequests.filter((lr: any) => lr.status === "APPROVED").length} approved`,
          icon: CheckCircle2,
          iconBg: "bg-green-50",
          iconColor: "text-green-500",
        },
      ]
    : [
        { id: "hostel", label: "Hostel", value: "Loading...", change: "", icon: BedDouble, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
        { id: "room", label: "Room", value: "Loading...", change: "", icon: Home, iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
        { id: "fees", label: "Fee Status", value: "Loading...", change: "", icon: Wallet, iconBg: "bg-amber-50", iconColor: "text-amber-500" },
        { id: "leave", label: "Leave Status", value: "Loading...", change: "", icon: CheckCircle2, iconBg: "bg-green-50", iconColor: "text-green-500" },
      ];

  const studentHostelQuickActions = [
    { id: "room", label: "My Room", icon: Home, href: "/dashboard/student/hostel" },
    { id: "fees", label: "Hostel Fees", icon: Wallet, href: "/dashboard/student/fees" },
    { id: "leave", label: "Apply Leave", icon: FileText, href: "/dashboard/student/hostel/leave" },
    { id: "complaint", label: "Submit Complaint", icon: AlertTriangle, href: "/dashboard/student/hostel/complaints" },
  ];

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.student}>
      <WelcomeBanner
        title={`Welcome back, ${studentName} 👋`}
        subtitle="Here's your hostel information for today."
      />

      <StatGrid stats={studentHostelStats} columns={4} />

      <div className="mb-8">
        <QuickActions actions={studentHostelQuickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard title="My Room">
          <InfoList items={myRoomDetails} showIcon={false} />
        </DashboardCard>

        <DashboardCard title="Leave Requests">
          <InfoList items={myLeaveRequests} showIcon={false} />
        </DashboardCard>

        <DashboardCard title="My Complaints">
          <InfoList items={myComplaints} showIcon={false} />
        </DashboardCard>
      </div>

      <div className="mb-8">
        <DashboardCard title="Hostel Notices">
          <InfoList items={hostelNotices} />
        </DashboardCard>
      </div>

      <div className="mb-8">
        <DashboardCard title="Fee Summary">
          {fees.length === 0 ? (
            <p className="text-sm text-slate-500">No fee records found.</p>
          ) : (
            <InfoList
              items={fees.map((f: any) => ({
                id: f.id,
                title: f.fee_type || f.feeType || "Hostel Fee",
                description: `Amount: ₹${f.amount || 0}`,
                meta: f.status || "Pending",
                badge: {
                  label: f.status || "Pending",
                  variant: f.status === "PAID" ? "success" : f.status === "OVERDUE" ? "error" : "warning",
                },
              }))}
            />
          )}
        </DashboardCard>
      </div>

      <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200">
        <span>{COMPANY_INFO.copyright}</span>
        <span>Version {COMPANY_INFO.version}</span>
      </footer>
    </RoleDashboardLayout>
  );
}