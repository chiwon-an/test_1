"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Recipe } from "@/lib/types"
import {
  Clock,
  Users,
  ChefHat,
  Heart,
  Share2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Lightbulb,
  Star,
  Send,
  MessageCircle,
  ThumbsUp,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  MoreVertical,
  Pencil,
  Trash2,
  Flame,
  Lock,
  CheckCircle, // Declare the CheckCircle variable here
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface RecipeDetailViewProps {
  recipe: Recipe
  onStartCooking: () => void
  hasCompletedCooking?: boolean
}

function AnimatedNumber({ value, prevValue }: { value: number; prevValue: number }) {
  const [displayValue, setDisplayValue] = React.useState(prevValue)
  const [isAnimating, setIsAnimating] = React.useState(false)

  React.useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setDisplayValue(value)
        setIsAnimating(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [value, displayValue])

  return (
    <span className="inline-flex overflow-hidden h-4 relative">
      <span
        className={cn(
          "transition-transform duration-150",
          isAnimating && value > displayValue && "-translate-y-full opacity-0",
          isAnimating && value < displayValue && "translate-y-full opacity-0",
        )}
      >
        {displayValue}
      </span>
      {isAnimating && (
        <span
          className={cn(
            "absolute transition-transform duration-150",
            value > displayValue && "translate-y-full animate-slide-up-number",
            value < displayValue && "-translate-y-full animate-slide-down-number",
          )}
        >
          {value}
        </span>
      )}
    </span>
  )
}

const mockComments = [
  {
    id: 1,
    visitorId: "user1",
    user: "김대전",
    avatar: "/korean-woman-avatar.jpg",
    text: "정말 맛있게 만들었어요! 가족들이 너무 좋아했어요.",
    rating: 5,
    time: "2일 전",
    likes: 12,
    starLevel: 3,
  },
  {
    id: 2,
    visitorId: "user2",
    user: "박요리",
    avatar: "/korean-man-avatar.jpg",
    text: "초보자도 따라하기 쉬웠습니다. 감사합니다!",
    rating: 4,
    time: "5일 전",
    likes: 8,
    starLevel: 1,
  },
  {
    id: 3,
    visitorId: "user3",
    user: "이맛집",
    avatar: "/young-korean-woman-avatar.jpg",
    text: "양념 비율이 딱 좋아요. 다음에 또 만들 예정!",
    rating: 5,
    time: "1주 전",
    likes: 5,
    starLevel: 5,
  },
]

const COMMENTS_PER_PAGE = 5

export function RecipeDetailView({ recipe, onStartCooking, hasCompletedCooking = false }: RecipeDetailViewProps) {
  const router = useRouter()
  const { user, hasUserReviewedRecipe } = useAuth()
  const [isLiked, setIsLiked] = React.useState(false)
  const [newComment, setNewComment] = React.useState("")
  const [userRating, setUserRating] = React.useState<number>(0)
  const [likedComments, setLikedComments] = React.useState<Set<number>>(new Set())
  const [showScrapFeedback, setShowScrapFeedback] = React.useState(false)
  const [prevLikeCounts, setPrevLikeCounts] = React.useState<Record<number, number>>({})
  const [comments, setComments] = React.useState(mockComments)
  const [commentSort, setCommentSort] = React.useState<"latest" | "likes">("latest")
  const [substituteDialogOpen, setSubstituteDialogOpen] = React.useState(false)
  const [substituteQuery, setSubstituteQuery] = React.useState("")
  const [isLoadingSubstitute, setIsLoadingSubstitute] = React.useState(false)
  const [chatMessages, setChatMessages] = React.useState<Array<{ role: "user" | "ai"; content: string }>>([])
  const chatEndRef = React.useRef<HTMLDivElement>(null)
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [editingCommentId, setEditingCommentId] = React.useState<number | null>(null)
  const [editingText, setEditingText] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [recipeRating, setRecipeRating] = React.useState(4.5)
  const [nutritionOpen, setNutritionOpen] = React.useState(false)
  const userAlreadyReviewed = hasUserReviewedRecipe(recipe.id)

  const allIngredients = React.useMemo(() => {
    const ingredientMap = new Map<string, string>()
    recipe.steps.forEach((step) => {
      if (step.ingredients && Array.isArray(step.ingredients)) {
        step.ingredients.forEach((ing) => {
          const match = ing.match(/^(.+?)\s*([\d.]+.*)$/)
          if (match) {
            ingredientMap.set(match[1], match[2])
          } else {
            ingredientMap.set(ing, "적당량")
          }
        })
      }
    })
    // Also check for recipe-level ingredients (from new recipe form)
    if (ingredientMap.size === 0 && (recipe as any).ingredients) {
      const recipeIngredients = (recipe as any).ingredients
      if (Array.isArray(recipeIngredients)) {
        recipeIngredients.forEach((ing: { name: string; amount: string }) => {
          ingredientMap.set(ing.name, ing.amount || "적당량")
        })
      }
    }
    return Array.from(ingredientMap.entries())
  }, [recipe])

  const sortedComments = React.useMemo(() => {
    const sorted = [...comments]
    if (commentSort === "likes") {
      sorted.sort((a, b) => {
        const aLikes = a.likes + (likedComments.has(a.id) ? 1 : 0)
        const bLikes = b.likes + (likedComments.has(b.id) ? 1 : 0)
        return bLikes - aLikes
      })
    }
    return sorted
  }, [comments, commentSort, likedComments])

  const totalPages = Math.ceil(sortedComments.length / COMMENTS_PER_PAGE)
  const paginatedComments = sortedComments.slice((currentPage - 1) * COMMENTS_PER_PAGE, currentPage * COMMENTS_PER_PAGE)

  const handleSubmitComment = () => {
    if (!hasCompletedCooking) return
    if (!newComment.trim()) return

    const newCommentObj = {
      id: Date.now(),
      visitorId: user?.id || "current-user",
      user: user?.name || "나",
      avatar: user?.profileImage || "/placeholder.svg",
      text: newComment,
      rating: userRating,
      time: "방금 전",
      likes: 0,
      starLevel: 0,
    }

    setComments((prev) => [newCommentObj, ...prev])
    setNewComment("")
    setUserRating(0)
    setCurrentPage(1)
  }

  const handleLikeComment = (commentId: number, currentLikes: number) => {
    const isCurrentlyLiked = likedComments.has(commentId)
    const newLikeCount = currentLikes + (isCurrentlyLiked ? 1 : 0)
    setPrevLikeCounts((prev) => ({ ...prev, [commentId]: newLikeCount }))

    setLikedComments((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const handleScrap = () => {
    const wasLiked = isLiked
    setIsLiked(!isLiked)
    if (!wasLiked) {
      setShowScrapFeedback(true)
      setTimeout(() => setShowScrapFeedback(false), 2000)
    }
  }

  const handleRatingClick = (star: number) => {
    if (!hasCompletedCooking) return
    if (userRating === star) {
      setUserRating(0)
    } else {
      setUserRating(star)
    }
  }

  const handleDeleteComment = (commentId: number) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const handleEditComment = (commentId: number, text: string) => {
    setEditingCommentId(commentId)
    setEditingText(text)
  }

  const handleSaveEdit = (commentId: number) => {
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, text: editingText } : c)))
    setEditingCommentId(null)
    setEditingText("")
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubstituteSearch = () => {
    if (!substituteQuery.trim()) return

    const userMessage = substituteQuery
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setSubstituteQuery("")
    setIsLoadingSubstitute(true)

    setTimeout(() => {
      const aiResponse = `"${userMessage}"의 대체 재료를 알려드릴게요!\n\n1. 비슷한 식감: 다른 채소류로 대체 가능해요\n2. 알레르기 대체: 해당 재료 없이도 요리 가능해요\n3. 저칼로리 대체: 두부나 곤약으로 대체 가능해요`
      setChatMessages((prev) => [...prev, { role: "ai", content: aiResponse }])
      setIsLoadingSubstitute(false)
    }, 1500)
  }

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const filteredTags = React.useMemo(() => {
    const excludeTags = ["명절", "전통", "파티요리", "파티", "명절요리"]
    return (recipe.hashtags || []).filter(
      (tag) => tag && tag.trim() !== "" && !excludeTags.some((ex) => tag.includes(ex)),
    )
  }, [recipe.hashtags])

  // ✅ 레시피 평점 표시 전용(부분 채움: 4.5 -> 4 full + 1 half)
// 반 아이콘 파일을 쓰지 않고 "같은 꽃 이미지"를 width로 잘라 채움
const renderRecipeRatingFlowers = (value: number) => {
  const rating = Number.isFinite(value) ? value : 0
  const fullCount = Math.floor(rating)
  const hasHalf = rating % 1 !== 0

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((idx) => {
          // ✅ full
          if (idx <= fullCount) {
            return (
              <img
                key={idx}
                src="/michelin-full-star.png"
                alt="미슐랭"
                className="h-5 w-5"
                draggable={false}
              />
            )
          }

          // ✅ half (0.x가 존재하면 무조건 1개)
          if (idx === fullCount + 1 && hasHalf) {
            return (
              <img
                key={idx}
                src="/michelin-star-half.png"
                alt="미슐랭 반"
                className="h-5 w-5"
                draggable={false}
              />
            )
          }

          // ✅ empty
          return (
            <img
              key={idx}
              src="/michelin-star.png"
              alt="미슐랭 빈"
              className="h-5 w-5 opacity-30"
              draggable={false}
            />
          )
        })}
      </div>

      <span className="text-sm text-[#800020] font-medium">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}



  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {showScrapFeedback && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-foreground text-background px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span className="text-sm font-medium">스크랩했습니다</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Image (70% size) */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted shadow-lg w-[85%]">
          <Image src={recipe.thumbnail || "/placeholder.svg"} alt={recipe.name} fill className="object-cover" />
        </div>

        {/* Right: Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{recipe.name}</h1>
            {recipe.description && <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full bg-transparent ${isLiked ? "text-red-500 border-red-500 hover:text-red-600" : ""}`}
              onClick={handleScrap}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent"
              onClick={() => setShareDialogOpen(true)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[#800020]" />
              <span>{recipe.duration}분</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[#800020]" />
              <span>{recipe.servings}인분</span>
            </div>
            {recipe.calories && (
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-[#800020]" />
                <span>{recipe.calories}kcal</span>
                <Collapsible open={nutritionOpen} onOpenChange={setNutritionOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center gap-0.5 hover:text-foreground transition-colors ml-1">
                      <ChevronDown className={cn("h-3 w-3 transition-transform", nutritionOpen && "rotate-180")} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="absolute mt-2 z-10">
                    <div className="p-3 bg-card border rounded-lg shadow-lg text-xs space-y-1 min-w-[200px]">
                      <p className="font-medium text-foreground mb-2">영양정보 (1인분 기준)</p>
                      {recipe.nutrition ? (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {recipe.nutrition.protein !== undefined && (
                            <div className="flex justify-between">
                              <span>단백질</span>
                              <span className="font-medium">{recipe.nutrition.protein}g</span>
                            </div>
                          )}
                          {recipe.nutrition.carbs !== undefined && (
                            <div className="flex justify-between">
                              <span>탄수화물</span>
                              <span className="font-medium">{recipe.nutrition.carbs}g</span>
                            </div>
                          )}
                          {recipe.nutrition.fat !== undefined && (
                            <div className="flex justify-between">
                              <span>지방</span>
                              <span className="font-medium">{recipe.nutrition.fat}g</span>
                            </div>
                          )}
                          {recipe.nutrition.fiber !== undefined && (
                            <div className="flex justify-between">
                              <span>식이섬유</span>
                              <span className="font-medium">{recipe.nutrition.fiber}g</span>
                            </div>
                          )}
                          {recipe.nutrition.sodium !== undefined && (
                            <div className="flex justify-between">
                              <span>나트륨</span>
                              <span className="font-medium">{recipe.nutrition.sodium}mg</span>
                            </div>
                          )}
                          {recipe.nutrition.sugar !== undefined && (
                            <div className="flex justify-between">
                              <span>당류</span>
                              <span className="font-medium">{recipe.nutrition.sugar}g</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">영양정보가 없습니다</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </div>

          {/* ✅ 여기: 레시피 평점 표시 (부분 채움 반영) */}
          {renderRecipeRatingFlowers(Number(recipeRating ?? 0))}

          {filteredTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filteredTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full font-normal text-xs bg-[#800020]/10 text-[#800020]"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Ingredients */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#800020]">재료</h2>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {allIngredients.map(([name, amount], idx) => (
            <div key={idx} className="flex justify-between items-center px-3 py-2 rounded-lg bg-muted">
              <span className="font-medium text-sm">{name}</span>
              <span className="text-muted-foreground text-xs">{amount}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setSubstituteDialogOpen(true)}
          className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-[#800020]/30 bg-[#800020]/5 text-left hover:bg-[#800020]/10 transition-colors"
        >
          <Lightbulb className="h-4 w-4 text-[#800020] shrink-0" />
          <span className="flex-1 text-sm text-[#800020]">대체 재료 알아보기</span>
          <ChevronRight className="h-4 w-4 text-[#800020]" />
        </button>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#800020]">레시피</h2>
        <div className="space-y-0">
          {recipe.steps.map((step, idx) => (
            <div key={step.id}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start py-4">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted shadow-sm w-full max-w-[200px]">
                  <Image src={step.imageUrl || "/placeholder.svg"} alt={`Step ${step.stepNumber}`} fill className="object-cover" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#800020]">STEP {step.stepNumber}</h3>
                  <p className="text-base text-foreground leading-relaxed">{step.description}</p>
                  {step.tips && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-[#800020]/5 border border-[#800020]/10">
                      <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-[#800020]" />
                      <span className="text-sm text-foreground">{step.tips}</span>
                    </div>
                  )}
                </div>
              </div>
              {idx < recipe.steps.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Comments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#800020] flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            댓글 {comments.length}개
          </h2>
          <Select value={commentSort} onValueChange={(v) => setCommentSort(v as "latest" | "likes")}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="likes">추천순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={cn("p-3 bg-muted/50 rounded-xl space-y-2", !hasCompletedCooking && "opacity-60", userAlreadyReviewed && "bg-amber-50/50 border border-amber-100")}>
          {!hasCompletedCooking && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
              <Lock className="h-4 w-4 text-amber-600" />
              <span className="text-amber-700">요리를 완료한 후 평점과 댓글을 남길 수 있습니다</span>
            </div>
          )}
          {userAlreadyReviewed && (
            <div className="flex items-center gap-2 text-sm text-amber-700 mb-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
              <CheckCircle className="h-4 w-4 text-amber-600" />
              <span>이미 이 레시피에 평점과 댓글을 남기셨습니다</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">별점:</span>

            <div
              className={cn(
                "flex items-center gap-1",
                (!hasCompletedCooking || userAlreadyReviewed) && "opacity-60",
              )}
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const star = i + 1
                const filled = userRating >= star

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    disabled={!hasCompletedCooking || userAlreadyReviewed}
                    className={cn(
                      "transition-transform",
                      (!hasCompletedCooking || userAlreadyReviewed) ? "cursor-not-allowed" : "hover:scale-110",
                    )}
                  >
                    <img
                      src={filled ? "/michelin-full-star.png" : "/michelin-star.png"}
                      alt="미슐랭"
                      className={cn("h-5 w-5", !filled && "opacity-30")}
                      draggable={false}
                    />
                  </button>
                )
              })}
            </div>

            {userRating > 0 && <span className="text-xs text-muted-foreground ml-1">{userRating}</span>}
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder={userAlreadyReviewed ? "이미 평점과 댓글을 남기셨습니다" : hasCompletedCooking ? "댓글을 남겨주세요..." : "요리 완료 후 댓글을 남길 수 있습니다"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              className="flex-1 text-sm"
              disabled={!hasCompletedCooking || userAlreadyReviewed}
            />
            <Button
              onClick={handleSubmitComment}
              className="self-end bg-[#800020] hover:bg-[#800020]/90 h-8 px-3"
              disabled={!hasCompletedCooking || userAlreadyReviewed}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {paginatedComments.map((comment) => {
            const isLiked = likedComments.has(comment.id)
            const currentLikes = comment.likes + (isLiked ? 1 : 0)
            const prevLikes = prevLikeCounts[comment.id] ?? comment.likes
            const isOwner = comment.visitorId === (user?.id || "current-user")
            const isEditing = editingCommentId === comment.id

            return (
              <div key={comment.id} className="flex gap-2 p-3 bg-card rounded-xl border">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{comment.user[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.user}</span>
                    <span className="text-xs text-[#800020] font-medium">미슐랭 {comment.starLevel}스타</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <img
                          key={i}
                          src={i < comment.rating ? "/michelin-full-star.png" : "/michelin-star.png"}
                          alt="미슐랭"
                          className={cn(
                            "h-2.5 w-2.5",
                            i < comment.rating ? "opacity-100" : "opacity-30"
                          )}
                        />
                      ))}

                    </div>
                    <span className="text-xs text-muted-foreground">{comment.time}</span>

                    {isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditComment(comment.id, comment.text)}>
                            <Pencil className="h-3 w-3 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)} className="text-destructive">
                            <Trash2 className="h-3 w-3 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input value={editingText} onChange={(e) => setEditingText(e.target.value)} className="flex-1 h-8 text-sm" />
                      <Button size="sm" onClick={() => handleSaveEdit(comment.id)} className="h-8 px-2">
                        저장
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)} className="h-8 px-2">
                        취소
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{comment.text}</p>
                  )}
                  <button
                    className={cn(
                      "flex items-center gap-1 text-xs mt-1 transition-colors",
                      isLiked ? "text-blue-500" : "text-muted-foreground hover:text-blue-500",
                    )}
                    onClick={() => handleLikeComment(comment.id, comment.likes)}
                  >
                    <ThumbsUp className={cn("h-3 w-3", isLiked && "fill-current")} />
                    <AnimatedNumber value={currentLikes} prevValue={prevLikes} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
              <Image src={recipe.thumbnail || "/placeholder.svg"} alt={recipe.name} width={40} height={40} className="object-cover w-full h-full" />
            </div>
            <div className="hidden sm:block">
              <p className="font-medium text-sm line-clamp-1">{recipe.name}</p>
              <p className="text-xs text-muted-foreground">{recipe.duration}분</p>
            </div>
          </div>
          <Button onClick={onStartCooking} size="lg" className="bg-[#800020] hover:bg-[#800020]/90 text-white shadow-lg shadow-[#800020]/25 px-8">
            <ChefHat className="h-5 w-5 mr-2" />
            요리 시작하기
          </Button>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <h3 className="font-semibold">공유하기</h3>
            <div className="flex items-center gap-2">
              <Input value={typeof window !== "undefined" ? window.location.href : ""} readOnly className="flex-1" />
              <Button onClick={handleCopyUrl} className="bg-[#800020] hover:bg-[#800020]/90">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {copied && <p className="text-sm text-green-600">URL이 복사되었습니다!</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Substitute Dialog */}
      <Dialog
        open={substituteDialogOpen}
        onOpenChange={(open) => {
          setSubstituteDialogOpen(open)
          if (!open) {
            setChatMessages([])
            setSubstituteQuery("")
          }
        }}
      >
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b bg-[#800020]/5">
            <div className="w-10 h-10 rounded-full bg-[#800020] flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">대체 재료 AI</h3>
              <p className="text-xs text-muted-foreground">없는 재료의 대체품을 찾아드려요</p>
            </div>
          </div>
          <div className="h-[300px] overflow-y-auto p-4 space-y-4 bg-muted/30">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Sparkles className="h-10 w-10 mb-3 text-[#800020]/50" />
                <p className="text-sm font-medium">대체 재료가 필요하신가요?</p>
                <p className="text-xs mt-1">없는 재료를 입력해보세요!</p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-[#800020] flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", msg.role === "user" ? "bg-[#800020] text-white rounded-br-md" : "bg-white border shadow-sm rounded-bl-md")}>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoadingSubstitute && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-[#800020] flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#800020]/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-[#800020]/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-[#800020]/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <Input
                placeholder="대체하고 싶은 재료를 입력하세요..."
                value={substituteQuery}
                onChange={(e) => setSubstituteQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubstituteSearch()}
                className="flex-1 rounded-full border-gray-200 focus-visible:ring-[#800020]"
              />
              <Button onClick={handleSubstituteSearch} disabled={isLoadingSubstitute || !substituteQuery.trim()} size="icon" className="rounded-full bg-[#800020] hover:bg-[#800020]/90 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
