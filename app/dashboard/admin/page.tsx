import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import MainLayout from "@/components/shared/layout/MainLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import StatsCards from "@/components/dashboard/StatsCards";
import FeesCollectionOverview from "@/components/dashboard/FeesCollectionOverview";
import RecentActivities from "@/components/dashboard/RecentActivities";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import StudentsByClass from "@/components/dashboard/StudentsByClass";
import { COMPANY_INFO } from "@/lib/constants";

export default function DashboardPage() {
  return (
    <MainLayout
      sidebar={<Sidebar />}
      header={<DashboardHeader />}
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Overview */}
          <DashboardOverview />

          {/* Stats Cards */}
          <StatsCards />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <FeesCollectionOverview />
            <StudentsByClass />
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RecentActivities />
            <UpcomingEvents />
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200">
            <span>{COMPANY_INFO.copyright}</span>
            <span>Version {COMPANY_INFO.version}</span>
          </footer>
        </div>
      </div>
    </MainLayout>
  );
}
