"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/cook-sync/navbar"
import { ScrollToTop } from "@/components/cook-sync/scroll-to-top"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Clock, Users, Heart, ChefHat, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { allRecipesForBrowse } from "@/lib/dummy-data"
import { useAuth } from "@/lib/auth-context"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState("recipes")
  const { isRecipeLiked, toggleLikeRecipe, isLoggedIn } = useAuth()

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) {
      setSearchQuery(q)
    }
  }, [searchParams])

  const recipes = allRecipesForBrowse.map((recipe) => ({
    ...recipe,
    author: recipe.hashtags?.[0] || "미슐랭 0스타",
    image: recipe.thumbnail,
    time: `${recipe.duration}분`,
  }))

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.hashtags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <ScrollToTop />
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">검색</h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative w-full">
            <div className="flex items-center rounded-full border-2 border-[#800020] bg-background overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <Input
                placeholder="레시피, 재료 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 h-12 px-5 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 rounded-full bg-[#800020] hover:bg-[#800020]/90 mr-1"
              >
                <Search className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        </form>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="recipes">레시피</TabsTrigger>
            <TabsTrigger value="ingredients">재료</TabsTrigger>
          </TabsList>

          <TabsContent value="recipes">
            {searchQuery && (
              <p className="text-sm text-muted-foreground mb-4">
                &quot;{searchQuery}&quot; 검색 결과 {filteredRecipes.length}개
              </p>
            )}

            {filteredRecipes.length > 0 ? (
              <div className="space-y-4">
                {filteredRecipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    className="cursor-pointer group transition-all border-2 border-transparent hover:border-[#800020]/30 hover:shadow-lg overflow-hidden"
                    onClick={() => handleRecipeClick(recipe.id)}
                  >
                    <div className="flex h-full">
                      <div className="relative w-32 h-32 shrink-0 overflow-hidden rounded-l-lg m-2">
                        <Image
                          src={recipe.thumbnail || "/placeholder.svg"}
                          alt={recipe.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>

                      <CardContent className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-base leading-tight line-clamp-1 mb-1">{recipe.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {recipe.description || "맛있는 요리를 만들어보세요"}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {recipe.hashtags?.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-xs text-[#800020] font-medium">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {recipe.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <ChefHat className="h-3.5 w-3.5" />
                              {recipe.difficulty}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {recipe.servings}인분
                            </span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => handleHeartClick(e, recipe)}
                          >
                            <Heart
                              className={`h-4 w-4 ${isRecipeLiked(recipe.id) ? "fill-red-500 text-red-500" : ""}`}
                            />
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? "검색 결과가 없습니다." : "검색어를 입력해주세요."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ingredients">
            <div className="text-center py-12">
              <p className="text-muted-foreground">재료 검색 기능은 준비 중입니다.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
