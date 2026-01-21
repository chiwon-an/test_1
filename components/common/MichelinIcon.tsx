"use client"

import React from "react"
import { cn } from "@/lib/utils"

type MichelinIconProps = {
  size?: number
  className?: string
  imgClassName?: string
}

export function MichelinIcon({ size = 36, className, imgClassName }: MichelinIconProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-[#FEF2F2] shadow-sm",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        src="/michelin-star.png"
        alt="미슐랭"
        className={cn("h-4 w-4", imgClassName)}
        draggable={false}
      />
    </div>
  )
}
