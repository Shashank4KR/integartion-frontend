"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Navbar } from "@/components/navbar"

import { Hero } from "@/components/hero"
import { Sections } from "@/components/sections"

const SECTION_IDS = ["home", "features", "solutions", "resources", "pricing", "contact"]
const AUTOPLAY_INTERVAL = 6500

export default function Page() {
  const [autoplay, setAutoplay] = useState(true)
  const indexRef = useRef(0)

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const handleNavigate = useCallback(
    (id: string) => {
      setAutoplay(false)
      const idx = SECTION_IDS.indexOf(id)
      if (idx >= 0) indexRef.current = idx
      scrollTo(id)
    },
    [scrollTo],
  )

  // Presentation-style autoplay through sections
  useEffect(() => {
    if (!autoplay) return
    const timer = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % SECTION_IDS.length
      scrollTo(SECTION_IDS[indexRef.current])
    }, AUTOPLAY_INTERVAL)
    return () => clearInterval(timer)
  }, [autoplay, scrollTo])

  // Pause autoplay on any manual interaction
  useEffect(() => {
    const pause = () => setAutoplay(false)
    window.addEventListener("wheel", pause, { passive: true })
    window.addEventListener("touchstart", pause, { passive: true })
    window.addEventListener("keydown", pause)
    return () => {
      window.removeEventListener("wheel", pause)
      window.removeEventListener("touchstart", pause)
      window.removeEventListener("keydown", pause)
    }
  }, [])

  return (
    <main className="relative w-full bg-background text-foreground">
      <Navbar onNavigate={handleNavigate} />
      <Hero onNavigate={handleNavigate} />
      <Sections onNavigate={handleNavigate} />
    </main>
  )
}
