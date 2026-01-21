"use client"

import type * as React from "react"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { cn } from "@/lib/utils"

function dotPattern(color: string) {
  return {
    backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
    backgroundSize: "16px 16px",
  }
}

interface DotPatternBackgroundProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
}

export function DotPatternBackground({ children, className, containerClassName }: DotPatternBackgroundProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <div
      className={cn("relative flex items-center justify-center w-full group", containerClassName)}
      onMouseMove={handleMouseMove}
    >
      {/* Light mode dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-70 dark:opacity-0"
        style={dotPattern("rgb(212 212 212)")}
      />
      {/* Dark mode dots */}
      <div
        className="absolute inset-0 opacity-0 pointer-events-none dark:opacity-70"
        style={dotPattern("rgb(38 38 38)")}
      />
      {/* Hover effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          ...dotPattern("rgb(34 197 94)"),
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
        }}
      />

      <div className={cn("relative z-20", className)}>{children}</div>
    </div>
  )
}
