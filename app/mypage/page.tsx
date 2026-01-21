"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/cook-sync/navbar"
import { RecipeCard } from "@/components/cook-sync/recipe-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Heart,
  Edit,
  Camera,
  BookOpen,
  FileText,
  Info,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle,
  Bookmark,
  ChefHat,
  Users,
  ThumbsUp,
  ChevronDown,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import Image from "next/image"

export default function MyPage() {
  const router = useRouter()
  const {
    user,
    isLoggedIn,
    likedRecipes,
    toggleLikeRecipe,
    userRecipes,
    userPosts,
    deleteUserRecipe,
    deleteUserPost,
    updateUserPost,
    likedPosts,
  } = useAuth()
  const [activeTab, setActiveTab] = React.useState("saved")
  const [starInfoOpen, setStarInfoOpen] = React.useState(false)
  const [deleteRecipeDialogOpen, setDeleteRecipeDialogOpen] = React.useState(false)
  const [deletePostDialogOpen, setDeletePostDialogOpen] = React.useState(false)
  const [selectedRecipeId, setSelectedRecipeId] = React.useState<string | null>(null)
  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(null)

  const [animatedStars, setAnimatedStars] = React.useState(0)
  const [barAnimationComplete, setBarAnimationComplete] = React.useState(false)

  React.useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  // bar 먼저 애니메이션 후 완료되면 숫자 마커 표시
  React.useEffect(() => {
    if (isLoggedIn && user?.stars !== undefined) {
      const targetStars = user.stars
      const duration = 1500
      const steps = 60
      const increment = targetStars / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= targetStars) {
          setAnimatedStars(targetStars)
          clearInterval(timer)
          // bar 애니메이션 완료 후 숫자 마커 표시
          setTimeout(() => {
            setBarAnimationComplete(true)
          }, 100)
        } else {
          setAnimatedStars(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [isLoggedIn, user?.stars])

  if (!isLoggedIn) {
    return null
  }

  const totalStars = user?.stars || 0
  const todayRemaining = 3 - (user?.todayStars || 0)

  const handleDeleteRecipe = () => {
    if (selectedRecipeId) {
      deleteUserRecipe(selectedRecipeId)
      setDeleteRecipeDialogOpen(false)
      setSelectedRecipeId(null)
    }
  }

  const handleDeletePost = () => {
    if (selectedPostId) {
      deleteUserPost(selectedPostId)
      setDeletePostDialogOpen(false)
      setSelectedPostId(null)
    }
  }

  const handleTogglePostStatus = (postId: string, currentStatus: string) => {
    updateUserPost(postId, { status: currentStatus === "available" ? "completed" : "available" })
  }

  const tabInfo = {
    saved: {
      icon: Bookmark,
      title: "저장한 레시피",
      description: "하트를 눌러 저장한 레시피 목록",
      emptyIcon: Heart,
      emptyTitle: "아직 저장한 레시피가 없어요",
      emptyDescription: "레시피에서 하트를 눌러 저장해보세요!",
      emptyAction: "레시피 둘러보기",
      emptyPath: "/recipes",
    },
    myRecipes: {
      icon: ChefHat,
      title: "내가 등록한 레시피",
      description: "직접 만들어 공유한 나만의 레시피",
      emptyIcon: BookOpen,
      emptyTitle: "아직 등록한 레시피가 없어요",
      emptyDescription: "나만의 레시피를 공유해보세요!",
      emptyAction: "레시피 등록하기",
      emptyPath: "/recipes/new",
    },
    myPosts: {
      icon: Users,
      title: "내가 작성한 N빵",
      description: "재료 나눔을 위해 작성한 게시물",
      emptyIcon: FileText,
      emptyTitle: "아직 작성한 글이 없어요",
      emptyDescription: "커뮤니티에서 재료를 나눠보세요!",
      emptyAction: "글 작성하기",
      emptyPath: "/community/new",
    },
    likedPosts: {
      icon: ThumbsUp,
      title: "관심있는 N빵",
      description: "하트를 눌러 관심 표시한 게시물",
      emptyIcon: Heart,
      emptyTitle: "아직 좋아요한 게시물이 없어요",
      emptyDescription: "N빵 커뮤니티에서 좋아요를 눌러보세요!",
      emptyAction: "N빵 둘러보기",
      emptyPath: "/community",
    },
  }

  const currentTabInfo = tabInfo[activeTab as keyof typeof tabInfo]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profileImage || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {user?.nickname?.charAt(0) || user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{user?.nickname || user?.name || "사용자"}</h1>
                  <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700">
                    <Image src="/michelin-star.png" alt="미슐랭 별" width={14} height={14} />
                    미슐랭 {totalStars}스타
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{user?.bio || "자기소개를 작성해보세요!"}</p>
              </div>
              <Button variant="outline" className="gap-2 bg-transparent" asChild>
                <Link href="/profile">
                  <Edit className="h-4 w-4" />
                  프로필 설정
                </Link>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">내 별</span>
                  <Collapsible open={starInfoOpen} onOpenChange={setStarInfoOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="absolute z-50 mt-2 w-72 bg-background border rounded-lg shadow-lg p-4">
                      <div className="space-y-3 text-sm">
                        <div className="p-2 bg-muted rounded-lg">
                          <p className="font-medium mb-1">별 획득 방법</p>
                          <ul className="space-y-0.5 text-muted-foreground text-xs">
                            <li>• 요리 완료: 1개</li>
                            <li>• 레시피 등록: 2개</li>
                            <li>• N빵 거래 완료: 1개</li>
                          </ul>
                        </div>
                        <div className="p-2 bg-muted rounded-lg">
                          <p className="font-medium mb-1">일일 제한</p>
                          <p className="text-muted-foreground text-xs">하루 최대 3개까지 획득 가능</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                <span className="text-sm text-muted-foreground">
                  총 {totalStars}개 (오늘 {todayRemaining}개 획득 가능)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Image src="/michelin-star.png" alt="미슐랭 별" width={24} height={24} className="opacity-30" />
                <div className="flex-1 relative pt-12">
                  {barAnimationComplete && (
                    <div
                      className="absolute -top-0 transition-all duration-300 z-10"
                      style={{
                        left: `calc(${Math.min((totalStars / 100) * 100, 100)}% - 16px)`,
                        animation: "bounceUpDown 1.5s ease-in-out infinite",
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="bg-[#800020] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                          {totalStars}
                        </div>
                        <ChevronDown className="h-5 w-5 text-[#800020] -mt-1" />
                      </div>
                    </div>
                  )}
                  {/* 프로그레스 바 */}
                  <div className="h-4 bg-gradient-to-r from-amber-100 to-amber-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-[1500ms] ease-out"
                      style={{ width: `${Math.min((animatedStars / 100) * 100, 100)}%` }}
                    />
                  </div>
                  {/* 눈금 표시 */}
                  <div className="flex justify-between mt-2 relative">
                    <span className="text-xs text-muted-foreground">0</span>
                    <span className="text-xs text-muted-foreground absolute left-1/4 -translate-x-1/2">25</span>
                    <span className="text-xs text-muted-foreground absolute left-1/2 -translate-x-1/2">50</span>
                    <span className="text-xs text-muted-foreground absolute left-3/4 -translate-x-1/2">75</span>
                    <span className="text-xs text-muted-foreground">100</span>
                  </div>
                </div>
                <Image src="/michelin-star.png" alt="미슐랭 별" width={24} height={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 h-auto p-1">
              <TabsTrigger
                value="saved"
                className="flex flex-col gap-1 py-3 px-2 data-[state=active]:bg-[#800020]/10 data-[state=active]:text-[#800020]"
              >
                <Bookmark className="h-5 w-5" />
                <span className="text-xs font-medium">저장함</span>
              </TabsTrigger>
              <TabsTrigger
                value="myRecipes"
                className="flex flex-col gap-1 py-3 px-2 data-[state=active]:bg-[#800020]/10 data-[state=active]:text-[#800020]"
              >
                <ChefHat className="h-5 w-5" />
                <span className="text-xs font-medium">내 레시피</span>
              </TabsTrigger>
              <TabsTrigger
                value="myPosts"
                className="flex flex-col gap-1 py-3 px-2 data-[state=active]:bg-[#800020]/10 data-[state=active]:text-[#800020]"
              >
                <Users className="h-5 w-5" />
                <span className="text-xs font-medium">내 N빵</span>
              </TabsTrigger>
              <TabsTrigger
                value="likedPosts"
                className="flex flex-col gap-1 py-3 px-2 data-[state=active]:bg-[#800020]/10 data-[state=active]:text-[#800020]"
              >
                <ThumbsUp className="h-5 w-5" />
                <span className="text-xs font-medium">좋아요</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex justify-center">
            <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-3 w-full max-w-2xl">
              <div className="w-10 h-10 rounded-full bg-[#800020]/10 flex items-center justify-center">
                <currentTabInfo.icon className="h-5 w-5 text-[#800020]" />
              </div>
              <div>
                <h2 className="font-semibold">{currentTabInfo.title}</h2>
                <p className="text-sm text-muted-foreground">{currentTabInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Saved Recipes */}
          <TabsContent value="saved" className="space-y-4">
            {likedRecipes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <currentTabInfo.emptyIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">{currentTabInfo.emptyTitle}</p>
                  <p className="text-sm text-muted-foreground mt-1">{currentTabInfo.emptyDescription}</p>
                  <Button
                    className="mt-4 bg-[#800020] hover:bg-[#800020]/90"
                    onClick={() => router.push(currentTabInfo.emptyPath)}
                  >
                    {currentTabInfo.emptyAction}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {likedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={{ ...recipe, name: recipe.title || recipe.name }}
                    isLiked={true}
                    onHeartClick={() => toggleLikeRecipe(recipe)}
                    onClick={() => router.push(`/recipes/${recipe.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="myRecipes" className="space-y-4">
            <div className="flex items-center justify-end">
              <Button variant="link" className="text-[#800020]" onClick={() => router.push("/recipes/new")}>
                새 레시피 등록
              </Button>
            </div>
            {userRecipes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">아직 등록한 레시피가 없어요</p>
                  <p className="text-sm text-muted-foreground mt-1">나만의 레시피를 공유해보세요!</p>
                  <Button
                    className="mt-4 bg-[#800020] hover:bg-[#800020]/90"
                    onClick={() => router.push("/recipes/new")}
                  >
                    레시피 등록하기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {userRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={{ ...recipe, isUserRecipe: true, name: recipe.title, image: recipe.thumbnail, hashtags: recipe.tags }}
                    onEdit={() => router.push(`/recipes/edit/${recipe.id}`)}
                    onDelete={() => {
                      setSelectedRecipeId(recipe.id)
                      setDeleteRecipeDialogOpen(true)
                    }}
                    onClick={() => router.push(`/recipes/${recipe.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="myPosts" className="space-y-4">
            <div className="flex items-center justify-end">
              <Button variant="link" className="text-[#800020]" onClick={() => router.push("/community/new")}>
                새 글 작성
              </Button>
            </div>
            {userPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">아직 작성한 글이 없어요</p>
                  <p className="text-sm text-muted-foreground mt-1">커뮤니티에서 재료를 나눠보세요!</p>
                  <Button
                    className="mt-4 bg-[#800020] hover:bg-[#800020]/90"
                    onClick={() => router.push("/community/new")}
                  >
                    글 작성하기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {userPosts.map((post) => (
                  <div key={post.id} className="cursor-pointer group" onClick={() => router.push(`/community/${post.id}`)}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <Image
                        src={post.image || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      {post.status === "completed" && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">거래 완료</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-7 w-7 rounded-full bg-white/80 backdrop-blur hover:bg-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTogglePostStatus(post.id, post.status || "available")
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {post.status === "completed" ? "거래중으로 변경" : "거래완료로 변경"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/community/edit/${post.id}`)}>
                              <Image src="/pencil.svg" alt="수정" width={14} height={14} className="h-4 w-4 mr-2" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPostId(post.id)
                                setDeletePostDialogOpen(true)
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1 text-foreground">{post.title}</h3>
                      <p className="font-bold text-base text-foreground mb-1">{post.price}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="likedPosts" className="space-y-4">
            {likedPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">아직 좋아요한 게시물이 없어요</p>
                  <p className="text-sm text-muted-foreground mt-1">N빵 커뮤니티에서 좋아요를 눌러보세요!</p>
                  <Button className="mt-4 bg-[#800020] hover:bg-[#800020]/90" onClick={() => router.push("/community")}>
                    N빵 둘러보기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {likedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="cursor-pointer group"
                    onClick={() => router.push(`/community/${post.id}`)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted mb-2">
                      <Image
                        src={(post as any).image || "/placeholder.svg"}
                        alt={(post as any).title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1 text-foreground">
                      {(post as any).title}
                    </h3>
                    <p className="font-bold text-base text-foreground">{(post as any).price}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Recipe Dialog */}
        <Dialog open={deleteRecipeDialogOpen} onOpenChange={setDeleteRecipeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>레시피 삭제</DialogTitle>
              <DialogDescription>삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteRecipeDialogOpen(false)}>
                아니요
              </Button>
              <Button variant="destructive" onClick={handleDeleteRecipe}>
                예
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Post Dialog */}
        <Dialog open={deletePostDialogOpen} onOpenChange={setDeletePostDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>게시글 삭제</DialogTitle>
              <DialogDescription>삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeletePostDialogOpen(false)}>
                아니요
              </Button>
              <Button variant="destructive" onClick={handleDeletePost}>
                예
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <style jsx global>{`
        @keyframes bounceUpDown {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  )
}
