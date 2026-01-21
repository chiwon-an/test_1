"use client"

import * as React from "react"
import { Clock, ChefHat, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Recipe } from "@/lib/types"

interface RecipePickListProps {
  title: string
  recipes: Recipe[]
  onSelect: (recipe: Recipe) => void
}

export function RecipePickList({ title, recipes, onSelect }: RecipePickListProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)

  const [isDragging, setIsDragging] = React.useState(false)
  const [startX, setStartX] = React.useState(0)
  const [scrollLeftStart, setScrollLeftStart] = React.useState(0)

  const checkScrollButtons = React.useCallback(() => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  React.useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollButtons)
      return () => container.removeEventListener("scroll", checkScrollButtons)
    }
  }, [checkScrollButtons])

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return
    const scrollAmount = 360
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeftStart(scrollContainerRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 1.5 // 드래그 속도 조절
    scrollContainerRef.current.scrollLeft = scrollLeftStart - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className={`flex gap-5 overflow-x-auto scrollbar-hide pb-2 select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{ scrollSnapType: isDragging ? "none" : "x mandatory" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {recipes.map((recipe) => (
            <Card
              key={recipe.id}
              onClick={() => {
                if (!isDragging) {
                  onSelect(recipe)
                }
              }}
              className="flex-shrink-0 w-[320px] cursor-pointer group overflow-hidden transition-all hover:shadow-lg hover:ring-2 hover:ring-primary/30"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="flex h-full">
                {/* Thumbnail */}
                <div className="relative w-28 h-full shrink-0 overflow-hidden">
                  <img
                    src={recipe.thumbnail || "/placeholder.svg"}
                    alt={recipe.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    draggable={false}
                  />
                </div>

                {/* Content */}
                <CardContent className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-sm leading-tight line-clamp-1 mb-1">{recipe.name}</h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {recipe.hashtags?.map((tag) => (
                        <span key={tag} className="text-xs text-primary font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {recipe.duration}분
                      </span>
                      <span className="flex items-center gap-0.5">
                        <ChefHat className="h-3 w-3" />
                        {recipe.difficulty}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Users className="h-3 w-3" />
                        {recipe.servings}인분
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {recipe.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
