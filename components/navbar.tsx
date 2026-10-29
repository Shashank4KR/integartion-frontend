"use client"

import { motion } from "framer-motion"
import { GraduationCap, ArrowRight } from "lucide-react"
import Link from "next/link"

const links = [
  { label: "Home", id: "home" },
  { label: "Features", id: "features" },
  { label: "Solutions", id: "solutions" },
  { label: "Resources", id: "resources" },
  { label: "Pricing", id: "pricing" },
  { label: "Contact", id: "contact" },
]

export function Navbar({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
      className="fixed inset-x-0 top-4 z-50 mx-auto w-[95%] max-w-6xl"
    >
      <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg backdrop-blur-xl md:px-6">
        {/* Logo */}
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2.5"
          aria-label="Nomera home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-accent-purple shadow-md">
            <GraduationCap className="h-5 w-5 text-white" strokeWidth={2} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">Nomera</span>
        </button>

        {/* Center links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => onNavigate(link.id)}
                className="group relative rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-brand to-accent-purple transition-transform duration-300 group-hover:scale-x-100" />
              </button>
            </li>
          ))}
        </ul>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-white/10"
          >
            Login
          </Link>
          <button
            onClick={() => onNavigate("contact")}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-accent-purple px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-all duration-300 hover:shadow-xl hover:shadow-brand/30 active:scale-95"
          >
            Request Demo
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>
      </nav>
    </motion.header>
  )
}
