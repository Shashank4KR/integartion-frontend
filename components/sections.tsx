"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, type Variants } from "framer-motion"
import {
  LayoutDashboard,
  CalendarCheck,
  Wallet,
  MessagesSquare,
  LineChart,
  ShieldCheck,
  Building2,
  Users,
  Bus,
  FileText,
  Video,
  BookMarked,
  Check,
  ArrowRight,
} from "lucide-react"

const reveal = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} satisfies Variants

function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="relative flex min-h-screen w-full items-center justify-center px-4 py-28"
    >
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-accent-purple backdrop-blur">
            {eyebrow}
          </span>
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>
        </motion.div>
        {children}
      </div>
    </section>
  )
}

const features = [
  { icon: LayoutDashboard, title: "Unified Dashboard", desc: "One command center for academics, admin, and operations." },
  { icon: CalendarCheck, title: "Smart Attendance", desc: "Automated attendance with real-time parent notifications." },
  { icon: Wallet, title: "Fee Management", desc: "Online payments, invoicing, and financial reporting made simple." },
  { icon: MessagesSquare, title: "Collaboration Hub", desc: "Connect teachers, students, and parents in one secure space." },
  { icon: LineChart, title: "Performance Analytics", desc: "Track academic growth with insightful, actionable reports." },
  { icon: ShieldCheck, title: "Secure & Compliant", desc: "Enterprise-grade security protecting your entire campus data." },
]

function Features() {
  return (
    <SectionShell
      id="features"
      eyebrow="Features"
      title="Everything your campus needs, beautifully unified"
      description="Powerful modules designed to reduce paperwork and give every stakeholder a delightful experience."
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.06 }}
            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
          >
            <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-accent-purple shadow-md">
              <f.icon className="h-6 w-6 text-white" strokeWidth={1.75} />
            </span>
            <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
}

const solutions = [
  { icon: Building2, title: "For Administrators", desc: "Streamline admissions, staff, timetables, and campus operations end to end." },
  { icon: Users, title: "For Educators", desc: "Plan lessons, grade assignments, and communicate with parents effortlessly." },
  { icon: BookMarked, title: "For Students", desc: "Access schedules, assignments, and results from any device, anytime." },
  { icon: Bus, title: "For Operations", desc: "Manage transport, inventory, hostel, and library from a single platform." },
]

function Solutions() {
  return (
    <SectionShell
      id="solutions"
      eyebrow="Solutions"
      title="Built for every role on campus"
      description="Tailored workflows that adapt to how administrators, teachers, students, and staff actually work."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {solutions.map((s, i) => (
          <motion.div
            key={s.title}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.08 }}
            className="flex gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-purple to-brand shadow-md">
              <s.icon className="h-6 w-6 text-white" strokeWidth={1.75} />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
}

const resources = [
  { icon: FileText, tag: "Guide", title: "The Smart Campus Playbook", desc: "A step-by-step framework for digitizing your institution." },
  { icon: Video, tag: "Webinar", title: "Modern Classroom Series", desc: "Live sessions with education leaders on the future of learning." },
  { icon: BookMarked, tag: "Case Study", title: "How Oakridge scaled to 5,000 students", desc: "Real results from schools transforming with Nomera." },
]

function Resources() {
  return (
    <SectionShell
      id="resources"
      eyebrow="Resources"
      title="Learn, grow, and lead the change"
      description="Curated guides, webinars, and stories to help your school get the most out of a connected campus."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {resources.map((r, i) => (
          <motion.article
            key={r.title}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.08 }}
            className="group flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
          >
            <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <r.icon className="h-5 w-5 text-accent-purple" strokeWidth={1.75} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">{r.tag}</span>
            <h3 className="mt-2 text-lg font-semibold text-foreground">{r.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              Read more
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </motion.article>
        ))}
      </div>
    </SectionShell>
  )
}

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    desc: "For small schools getting started.",
    features: ["Up to 200 students", "Attendance & timetable", "Parent notifications", "Email support"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$199",
    period: "/mo",
    desc: "For growing institutions that need more.",
    features: ["Up to 2,000 students", "Fee & finance suite", "Performance analytics", "Priority support", "Custom branding"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large multi-campus networks.",
    features: ["Unlimited students", "Multi-campus management", "Dedicated success manager", "SSO & advanced security", "API access"],
    highlighted: false,
  },
]

function Pricing({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <SectionShell
      id="pricing"
      eyebrow="Pricing"
      title="Simple, transparent pricing"
      description="Choose the plan that fits your campus today and scale seamlessly as you grow."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((p, i) => (
          <motion.div
            key={p.name}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.08 }}
            className={`relative flex flex-col rounded-3xl border p-8 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${
              p.highlighted
                ? "border-brand/40 bg-gradient-to-b from-brand/15 to-white/[0.04] shadow-brand/20"
                : "border-white/10 bg-white/[0.04] hover:border-white/20"
            }`}
          >
            {p.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand to-accent-purple px-3 py-1 text-xs font-semibold text-white shadow-md">
                Most Popular
              </span>
            )}
            <h3 className="text-lg font-semibold text-foreground">{p.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            <div className="mt-5 flex items-end gap-1">
              <span className="text-4xl font-semibold tracking-tight text-foreground">{p.price}</span>
              <span className="pb-1 text-sm text-muted-foreground">{p.period}</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3">
              {p.features.map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-sm text-foreground/90">
                  <Check className="h-4 w-4 shrink-0 text-brand" strokeWidth={2.5} />
                  {feat}
                </li>
              ))}
            </ul>
            <button
              onClick={() => onNavigate("contact")}
              className={`mt-8 w-full rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 active:scale-95 ${
                p.highlighted
                  ? "bg-gradient-to-r from-brand to-accent-purple text-white shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/40"
                  : "border border-white/15 bg-white/5 text-foreground hover:bg-white/10"
              }`}
            >
              Get Started
            </button>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
}

function Contact({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Please enter your work email")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSuccess(true)
    setIsLoading(false)
  }

  if (success) {
    return (
      <section
        id="contact"
        className="relative flex min-h-screen w-full items-center justify-center px-4 py-28"
      >
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mx-auto w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur-2xl md:p-14"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-accent-purple backdrop-blur">
            Contact
          </span>
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Ready to build your smart campus?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Demo request submitted successfully! Our team will contact you soon.
          </p>
        </motion.div>
      </section>
    )
  }

  return (
    <section
      id="contact"
      className="relative flex min-h-screen w-full items-center justify-center px-4 py-28"
    >
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur-2xl md:p-14"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-accent-purple backdrop-blur">
          Contact
        </span>
        <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Ready to build your smart campus?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          Book a personalized demo and see how Nomera can transform your institution in weeks, not months.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <div className="w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError("")
              }}
              placeholder="Enter your work email"
              aria-label="Work email"
              className={`w-full rounded-full border bg-white/5 px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none backdrop-blur transition-colors focus:border-brand/60 ${
                error ? "border-red-400" : "border-white/15"
              }`}
            />
            {error && <p className="mt-1.5 text-left text-xs text-red-400">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="group flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-accent-purple px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all duration-300 hover:shadow-xl hover:shadow-brand/40 active:scale-95 disabled:opacity-70"
          >
            {isLoading ? "Submitting..." : "Book a Demo"}
            {!isLoading && (
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">
          No credit card required. Get a response within 24 hours.
        </p>
      </motion.div>
    </section>
  )
}

export function Sections({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <>
      <Features />
      <Solutions />
      <Resources />
      <Pricing onNavigate={onNavigate} />
      <Contact onNavigate={onNavigate} />
    </>
  )
}
