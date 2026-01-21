"use client"

import { Clock, ChefHat, Users, Flame, CheckCircle2, BookmarkPlus } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Recipe } from "@/lib/types"

interface RecipeDetailCardProps {
  recipe: Recipe
  onStartCooking: () => void
}

export function RecipeDetailCard({ recipe, onStartCooking }: RecipeDetailCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video">
        <img src={recipe.thumbnail || "/placeholder.svg"} alt={recipe.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-2xl font-bold text-white">{recipe.name}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {recipe.duration}분
          </span>
          <span className="flex items-center gap-1.5">
            <ChefHat className="h-4 w-4" />
            {recipe.difficulty}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {recipe.servings}인분
          </span>
          {recipe.calories && (
            <span className="flex items-center gap-1.5">
              <Flame className="h-4 w-4" />
              {recipe.calories}kcal
            </span>
          )}
        </div>

        {/* Feature Badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1 border-green-500/50 text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            단위 통일
          </Badge>
          <Badge variant="outline" className="gap-1 border-blue-500/50 text-blue-600">
            <CheckCircle2 className="h-3 w-3" />
            중복 제거 (RAG)
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          총 {recipe.steps.length}단계로 구성된 레시피입니다. 쿠킹 모드를 시작하면 단계별로 안내해드립니다.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onStartCooking} className="flex-1 sm:flex-none">
            쿠킹 모드 시작
          </Button>
          <Button variant="outline" size="icon">
            <BookmarkPlus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
