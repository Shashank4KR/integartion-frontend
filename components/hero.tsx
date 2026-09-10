"use client"

import { motion, type Variants } from "framer-motion"
import { Star, ArrowRight, Sparkles } from "lucide-react"

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
} satisfies Variants

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
} satisfies Variants

export function Hero({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <section
      id="home"
      className="relative flex min-h-screen w-full items-center overflow-hidden px-4 py-28"
    >
      {/* Background image covering the hero section */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/background-image.png')",
          backgroundSize: "cover",
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />

      {/* Subtle overlay to ensure text readability on the left while keeping the background vivid */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent pointer-events-none" />

      {/* Left side content with gap from edge */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-3xl md:ml-12 lg:ml-24 xl:ml-32 md:text-left"
      >
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-foreground/90 backdrop-blur"
        >
          <Star className="h-4 w-4 fill-chart-4 text-chart-4" />
          Made for Schools &amp; Happy Students
        </motion.div>

        {/* Headline */}
        <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
          <motion.span variants={fadeUp} className="block">
            Upgrade Your School.
          </motion.span>
          <motion.span
            variants={fadeUp}
            className="block bg-gradient-to-r from-brand via-accent-purple to-chart-3 bg-clip-text text-transparent"
          >
            Inspire Every Student.
          </motion.span>
        </h1>

        {/* Paragraph */}
        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          A digital ecosystem that streamlines school administration, enhances academic
          excellence, and empowers educators, students, and parents through seamless
          collaboration and innovation.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={fadeUp}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start"
        >
          <button
            onClick={() => onNavigate("contact")}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-accent-purple px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/40 active:scale-95 sm:w-auto"
          >
            Book a Demo
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => onNavigate("features")}
            className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 active:scale-95 sm:w-auto"
          >
            <Sparkles className="h-4 w-4 text-accent-purple" />
            Explore Features
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}
