import {
  BarChart3,
  Bell,
  Headphones,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import Statistics from "./Statistics";

const features = [
  {
    icon: Sparkles,
    title: "Unified Management",
    text: "All school operations in one unified platform.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    text: "Enterprise-grade security with advanced access control.",
  },
  {
    icon: BarChart3,
    title: "Smart Insights",
    text: "Real-time reports and intelligent analytics.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    text: "Always available support for your institution.",
  },
  {
    icon: MonitorSmartphone,
    title: "Accessible Anywhere",
    text: "Web and mobile access anytime, anywhere.",
  },
  {
    icon: Bell,
    title: "Stay Updated",
    text: "Instant alerts, notices, and notifications.",
  },
];

export default function LeftPanel() {
  return (
    <div className="flex w-full flex-col justify-between bg-[linear-gradient(135deg,#f8f4ff_0%,#f3ebff_45%,#eef6ff_100%)] lg:w-[54%]">
      <div className="px-8 py-8 xl:px-10 xl:py-9">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-[#5b2ee6] to-[#7c3aed] text-white shadow-lg shadow-purple-200">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-[1.35rem] font-semibold tracking-tight text-[#5b2ee6]">
              Nomera
            </h2>
            <p className="-mt-1 text-[11px] font-medium text-slate-600">
              Smart Campus ERP
            </p>
          </div>
        </div>

        <div className="mt-8 max-w-xl">
          <h1 className="text-[2rem] font-semibold leading-tight tracking-tight text-slate-900 xl:text-[2.2rem]">
            Empowering <span className="text-[#5b2ee6]">Education.</span>
            <br />
            Transforming <span className="text-[#6d28d9]">Futures.</span>
          </h1>

          <p className="mt-3 max-w-lg text-[0.95rem] leading-7 text-slate-600">
            A complete School ERP solution to manage academics, administration,
            finance, communication and more — all in one place.
          </p>
        </div>

        <div className="mt-7 grid max-w-2xl grid-cols-3 gap-3 xl:gap-4">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-purple-100 bg-white/80 p-3 shadow-sm backdrop-blur"
              >
                <Icon className="mb-2.5 h-4 w-4 text-[#6d28d9]" />
                <h3 className="text-[0.78rem] font-semibold text-[#21143d]">
                  {item.title}
                </h3>
                <p className="mt-1 text-[0.68rem] leading-4 text-slate-500">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-7 overflow-hidden rounded-[24px] border border-purple-100 shadow-[0_20px_45px_-20px_rgba(109,40,217,0.35)]">
          <img
            src="/nomera-campus.jpg"
            alt="Nomera School Campus"
            className="h-[11.875rem] w-full object-cover"
          />
        </div>
      </div>

      <Statistics />
    </div>
  );
}