"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/cook-sync/navbar"
import { RecipeDetailView } from "@/components/cook-sync/recipe-detail-view"
import { StepCookMode } from "@/components/cook-sync/step-cook-mode"
import { CompleteCookDialog } from "@/components/cook-sync/complete-cook-dialog"
import { Button } from "@/components/ui/button"
import { getRecipeById, allRecipesForBrowse, leftoverRecipes } from "@/lib/dummy-data"
import { ArrowLeft } from "lucide-react"
import type { Recipe } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { NewRecipeContent } from "@/components/cook-sync/new-recipe-content"

type ViewState = "detail" | "cooking"

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string
  const { userRecipes, user, completedRecipes } = useAuth()

  const [viewState, setViewState] = React.useState<ViewState>("detail")
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0)
  const [showCompleteDialog, setShowCompleteDialog] = React.useState(false)

  // Find recipe from all sources including user recipes
  const recipe = React.useMemo(() => {
    // First try the main getRecipeById function
    let found = getRecipeById(recipeId)
    if (found) return found

    // Then try allRecipesForBrowse
    found = allRecipesForBrowse.find((r) => r.id === recipeId)
    if (found) return found

    const userRecipe = userRecipes.find((r) => r.id === recipeId)
    if (userRecipe) {
      // Convert user recipe format to Recipe type
      const convertedRecipe: Recipe = {
        id: userRecipe.id,
        name: userRecipe.title,
        thumbnail: userRecipe.thumbnail,
        tags: userRecipe.tags,
        hashtags: [user?.name || "나"],
        duration: Math.ceil(userRecipe.steps.reduce((acc, step) => acc + step.duration, 0) / 60),
        difficulty: "초보",
        servings: userRecipe.servings,
        calories: 0,
        description: userRecipe.description, // 레시피 소개 텍스트
        steps: userRecipe.steps.map((step, index) => ({
          id: step.id,
          stepNumber: index + 1,
          action: step.action,
          description: step.description,
          ingredients: step.ingredients,
          tools: [],
          duration: step.duration,
          imageUrl: step.imagePreview || "/placeholder.svg",
          tips: step.tips,
        })),
      }
      return convertedRecipe
    }

    return null
  }, [recipeId, userRecipes, user])

  if (recipeId === "new") {
    return <NewRecipeContent />
  }

  const handleStartCooking = () => {
    setViewState("cooking")
  }

  const handleCompleteCooking = () => {
    setShowCompleteDialog(true)
  }

  const handleBack = () => {
    if (viewState === "cooking") {
      setViewState("detail")
    } else {
      router.back()
    }
  }

  const handleSelectLeftover = (selectedRecipe: Recipe) => {
    router.push(`/recipes/${selectedRecipe.id}`)
  }

  if (!recipe) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">레시피를 찾을 수 없습니다</h1>
            <p className="text-muted-foreground">요청하신 레시피가 존재하지 않습니다.</p>
            <Button onClick={() => router.push("/recipes")} className="bg-[#800020] hover:bg-[#800020]/90">
              레시피 목록으로
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Back Button */}
          

          {/* Recipe Detail View */}
          {viewState === "detail" && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
            >
              <RecipeDetailView
                recipe={recipe}
                onStartCooking={handleStartCooking}
                hasCompletedCooking={completedRecipes.has(recipe.id)}
              />
            </motion.div>
          )}

          {/* Cooking Mode View */}
          {viewState === "cooking" && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
              className="space-y-6"
            >
              <StepCookMode
                steps={recipe.steps}
                currentStepIndex={currentStepIndex}
                onStepChange={setCurrentStepIndex}
                onComplete={handleCompleteCooking}
                recipeName={recipe.name}
              />
            </motion.div>
          )}
        </div>
      </main>

      {/* Complete Dialog */}
      <CompleteCookDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        completedRecipe={recipe}
        leftoverRecipes={leftoverRecipes}
        onSelectLeftover={handleSelectLeftover}
      />
    </div>
  )
}
