import LeftPanel from "@/components/login/LeftPanel";
import LoginCard from "@/components/login/LoginCard";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(237,233,254,0.95),rgba(245,243,255,0.95))] p-3 sm:p-4 lg:p-6">
      <section className="mx-auto flex min-h-[calc(100vh-24px)] max-w-7xl flex-col overflow-hidden rounded-[32px] border border-purple-100 bg-white shadow-[0_30px_80px_-25px_rgba(109,40,217,0.3)] lg:min-h-[calc(100vh-48px)] lg:flex-row">
        <LeftPanel />

        <div className="flex w-full flex-1 items-center justify-center bg-[#fcfbff] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <LoginCard />
        </div>
      </section>
    </main>
  );
}
