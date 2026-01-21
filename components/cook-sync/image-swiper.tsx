"use client"

import * as React from "react"
import { motion, useMotionValue } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ImageSwiperProps extends React.HTMLAttributes<HTMLDivElement> {
  images: { url: string; caption?: string }[]
  currentIndex?: number
  onIndexChange?: (index: number) => void
}

export function ImageSwiper({
  images,
  className,
  currentIndex: controlledIndex,
  onIndexChange,
  ...props
}: ImageSwiperProps) {
  const [internalIndex, setInternalIndex] = React.useState(0)
  const imgIndex = controlledIndex ?? internalIndex
  const dragX = useMotionValue(0)

  const setIndex = (index: number) => {
    if (onIndexChange) {
      onIndexChange(index)
    } else {
      setInternalIndex(index)
    }
  }

  const onDragEnd = () => {
    const x = dragX.get()
    if (x <= -10 && imgIndex < images.length - 1) {
      setIndex(imgIndex + 1)
    } else if (x >= 10 && imgIndex > 0) {
      setIndex(imgIndex - 1)
    }
  }

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && imgIndex > 0) {
        setIndex(imgIndex - 1)
      } else if (e.key === "ArrowRight" && imgIndex < images.length - 1) {
        setIndex(imgIndex + 1)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [imgIndex, images.length])

  return (
    <div
      className={cn("group relative aspect-video w-full overflow-hidden rounded-2xl bg-muted", className)}
      {...props}
    >
      {/* Navigation Buttons */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {imgIndex > 0 && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Button
              variant="secondary"
              size="icon"
              className="pointer-events-auto h-10 w-10 rounded-full bg-background/90 shadow-lg opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setIndex(imgIndex - 1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        )}

        {imgIndex < images.length - 1 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Button
              variant="secondary"
              size="icon"
              className="pointer-events-auto h-10 w-10 rounded-full bg-background/90 shadow-lg opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setIndex(imgIndex + 1)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-sm font-medium shadow-lg">
            <span className="text-primary">{imgIndex + 1}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{images.length}</span>
          </div>
        </div>
      </div>

      {/* Images Container */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragMomentum={false}
        style={{ x: dragX }}
        animate={{ translateX: `-${imgIndex * 100}%` }}
        onDragEnd={onDragEnd}
        transition={{ damping: 18, stiffness: 90, type: "spring", duration: 0.2 }}
        className="flex h-full cursor-grab active:cursor-grabbing"
      >
        {images.map((image, i) => (
          <div key={i} className="h-full w-full shrink-0 overflow-hidden">
            <img
              src={image.url || "/placeholder.svg"}
              alt={image.caption || `Step ${i + 1}`}
              className="pointer-events-none h-full w-full object-cover"
            />
          </div>
        ))}
      </motion.div>

      {/* Caption */}
      {images[imgIndex]?.caption && (
        <div className="absolute bottom-16 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-center text-sm font-medium text-white">{images[imgIndex].caption}</p>
        </div>
      )}

      {/* Thumbnail Strip */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2">
        <div className="flex justify-center gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === imgIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
