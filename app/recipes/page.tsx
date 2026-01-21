"use client"

import type React from "react"
import { RecipeCard } from "@/components/cook-sync/recipe-card"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/cook-sync/navbar"
import { ScrollToTop } from "@/components/cook-sync/scroll-to-top"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Clock, Users, Heart, Star, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Image from "next/image"
import { allRecipesForBrowse } from "@/lib/dummy-data"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const foodCategories = [
  { id: "rice", name: "밥", icon: "🍚" },
  { id: "side", name: "반찬", icon: "🥗" },
  { id: "soup", name: "국물", icon: "🍲" },
  { id: "noodle", name: "면", icon: "🍜" },
  { id: "dessert", name: "디저트", icon: "🍰" },
  { id: "snack", name: "분식", icon: "🍢" },
  { id: "salad", name: "샐러드", icon: "🥬" },
  { id: "drink", name: "음료", icon: "🥤" },
  { id: "nightsnack", name: "야식&술안주", icon: "🍻" },
  { id: "etc", name: "기타", icon: "🍽️" },
]

const recipes = allRecipesForBrowse.map((recipe, index) => ({
  ...recipe,
  author: recipe.hashtags?.[0] || "미슐랭 0스타",
  image: recipe.thumbnail,
  time: `${recipe.duration}분`,
  likes: Math.floor(Math.random() * 3000) + 1000,
  saves: Math.floor(Math.random() * 2000) + 500,
  rating: (4.5 + Math.random() * 0.5).toFixed(1),
  category: index % 2 === 0 ? "korean" : "western",
  foodCategory: foodCategories[index % foodCategories.length].id,
}))

const ITEMS_PER_PAGE = 20

export default function RecipesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get("type")

  const isUserRecipePage = typeParam === "user"

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { isRecipeLiked, toggleLikeRecipe, isLoggedIn, userRecipes, user } = useAuth()

  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<"latest" | "rating" | "time">("latest")

  const userRecipesForDisplay = userRecipes.map((recipe) => ({
    id: recipe.id,
    name: recipe.title,
    thumbnail: recipe.thumbnail,
    tags: recipe.tags,
    hashtags: [user?.name || "나"],
    duration: recipe.steps.reduce((acc, step) => acc + step.duration, 0) / 60,
    difficulty: "초보" as const,
    servings: recipe.servings,
    calories: 0,
    steps: recipe.steps.map((step, index) => ({
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
    author: user?.name || "나",
    image: recipe.thumbnail,
    time: `${Math.ceil(recipe.steps.reduce((acc, step) => acc + step.duration, 0) / 60)}분`,
    likes: 0,
    saves: 0,
    rating: "5.0",
    category: recipe.category || "korean",
    foodCategory: "etc",
    isUserRecipe: true,
  }))

  const baseRecipes = isUserRecipePage ? userRecipesForDisplay : recipes

  const filteredRecipes = baseRecipes.filter((recipe) => {
    const matchesCategory = !selectedCategory || recipe.foodCategory === selectedCategory
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === "rating") {
      return Number.parseFloat(b.rating) - Number.parseFloat(a.rating)
    } else if (sortBy === "time") {
      return a.duration - b.duration
    }
    return 0
  })

  const totalPages = Math.max(1, Math.ceil(sortedRecipes.length / ITEMS_PER_PAGE))
  const paginatedRecipes = sortedRecipes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  const handleRecipeClick = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`)
  }

  const handleHeartClick = (e: React.MouseEvent, recipe: (typeof recipes)[0]) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    toggleLikeRecipe({
      id: recipe.id,
      title: recipe.name,
      image: recipe.image || "/placeholder.svg",
      author: recipe.author,
      savedAt: "",
    })
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory((prev) => (prev === categoryId ? null : categoryId))
    setCurrentPage(1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <ScrollToTop />
      <main className="flex-1 container mx-auto max-w-[1400px] px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {isUserRecipePage ? "레시피 연구소" : "레시피 도서관"}
          </h1>
        </div>


        {/* Search row + Register button (center-fixed) */}
        <div className="grid grid-cols-[1fr_minmax(0,700px)_1fr] items-center mb-4">
          {/* 왼쪽: 빈 공간(중앙 정렬 보정용) */}
          <div />

          {/* 가운데: 검색창 (항상 화면 중앙) */}
          <div className="relative w-full justify-self-center">
            <div className="flex items-center rounded-full border-2 border-[#800020] bg-background overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <Input
                placeholder="레시피 검색"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="flex-1 border-0 h-12 px-5 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button size="icon" className="h-10 w-10 rounded-full bg-[#800020] hover:bg-[#800020]/90 mr-1">
                <Search className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>

          {/* 오른쪽: 레시피 등록 버튼 */}
          <div className="justify-self-end">
            {isUserRecipePage && (
              <Button className="gap-2 bg-[#800020] hover:bg-[#800020]/90" onClick={() => router.push("/recipes/new")}>
                <Plus className="h-4 w-4" />
                레시피 등록
              </Button>
            )}
          </div>
        </div>


        <div className="mb-4">
          <div className="flex items-center justify-center gap-4 overflow-x-auto overflow-y-visible pb-2 scrollbar-hide">
            {foodCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "flex flex-col items-center gap-2 min-w-[72px] p-3 rounded-xl transition-all",
                  selectedCategory === category.id ? "bg-[#800020]/10 ring-inset ring-2 ring-[#800020]" : "hover:bg-muted",
                )}
              >
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all",
                    selectedCategory === category.id ? "bg-[#800020] shadow-lg scale-105" : "bg-muted",
                  )}
                >
                  {category.icon}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    selectedCategory === category.id ? "text-[#800020]" : "text-muted-foreground",
                  )}
                >
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sort Dropdown - Top Right */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">
            총 {sortedRecipes.length}개의 레시피
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="ml-2 text-xs text-[#800020]"
              >
                필터 초기화
              </Button>
            )}
          </p>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="rating">스타순</SelectItem>
              <SelectItem value="time">조리시간순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Recipe Grid - 4 columns, 5 rows */}
        {paginatedRecipes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-3">
            {paginatedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isLiked={isRecipeLiked(recipe.id)}
                onHeartClick={handleHeartClick}
                onClick={() => router.push(`/recipes/${recipe.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {isUserRecipePage ? (
              <>
                <p className="text-muted-foreground">아직 등록한 레시피가 없어요</p>
                <Button className="mt-4 bg-[#800020] hover:bg-[#800020]/90" onClick={() => router.push("/recipes/new")}>
                  첫 레시피 등록하기
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                <Button variant="link" className="text-[#800020] mt-2" onClick={() => setSelectedCategory(null)}>
                  필터 초기화
                </Button>
              </>
            )}
          </div>
        )}

        {/* Pagination */}
        {paginatedRecipes.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={cn(
                "p-2 text-gray-400 transition-colors",
                currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:text-gray-600",
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "min-w-[40px] h-10 rounded-lg text-base font-medium transition-all",
                  currentPage === page
                    ? "border-2 border-[#800020] text-[#800020] bg-white"
                    : "text-gray-500 hover:bg-gray-100",
                )}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={cn(
                "p-2 text-gray-400 transition-colors",
                currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:text-gray-600",
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
