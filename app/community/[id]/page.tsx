"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/cook-sync/navbar"
import { ScrollToTop } from "@/components/cook-sync/scroll-to-top"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Star,
  Pencil,
  CheckCircle,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"
import { cn } from "@/lib/utils"

const mockPosts: Record<
  string,
  {
    id: string
    user: { id: string; name: string; avatar: string; location: string; starLevel: number }
    title: string
    description: string
    price: string
    images: string[]
    place: string
    timeAgo: string
    likes: number
    chatCount: number
    status: "available" | "completed"
  }
> = {
  "1": {
    id: "1",
    user: {
      id: "user1",
      name: "김대전",
      avatar: "/korean-woman-avatar.jpg",
      location: "대전 서구 둔산동",
      starLevel: 3,
    },
    title: "양배추 반 통 나눠요",
    description:
      "대형마트에서 양배추 샀는데 혼자 다 못 먹을 것 같아요.\n반 통 1000원에 나눕니다!\n\n상태 좋고 신선해요. 둔산동 근처에서 직거래 가능합니다.",
    price: "1,000원",
    images: ["/half-cabbage.jpg"],
    place: "둔산동 이마트 앞",
    timeAgo: "10분 전",
    likes: 5,
    chatCount: 3,
    status: "available",
  },
  "2": {
    id: "2",
    user: {
      id: "user2",
      name: "박요리",
      avatar: "/korean-man-avatar.jpg",
      location: "대전 유성구 봉명동",
      starLevel: 5,
    },
    title: "계란 한 판 N빵 하실 분",
    description: "계란 30개 한 판 사서 10개씩 나눠요.\n신선한 당일 구매 제품입니다.\n\n봉명동 근처에서 직거래 원해요!",
    price: "2,500원/10개",
    images: ["/eggs-carton.png"],
    place: "봉명동 롯데마트 정문",
    timeAgo: "25분 전",
    likes: 12,
    chatCount: 5,
    status: "available",
  },
  "3": {
    id: "3",
    user: {
      id: "user3",
      name: "이맛집",
      avatar: "/young-korean-woman-avatar.jpg",
      location: "대전 중구 대흥동",
      starLevel: 2,
    },
    title: "고구마 3kg 같이 사요",
    description:
      "꿀고구마 박스로 사면 싼데 혼자 다 못 먹어서...\n같이 나와서 사실 분 구해요!\n\n대흥동 마트 앞에서 만나요.",
    price: "5,000원/1kg",
    images: ["/roasted-sweet-potatoes.png"],
    place: "대흥동 하나로마트",
    timeAgo: "1시간 전",
    likes: 8,
    chatCount: 2,
    status: "completed",
  },
}

export default function CommunityDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const { isLoggedIn, userPosts, user, likedPosts, toggleLikePost, updateUserPost } = useAuth()

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<"available" | "completed">("available")

  // Check if this is a user-created post
  const userPost = userPosts.find((p) => p.id === postId)
  const isMyPost = !!userPost

  const post = userPost
    ? {
        id: userPost.id,
        user: {
          id: user?.id || "current-user",
          name: user?.name || "나",
          avatar: user?.profileImage || "/placeholder.svg",
          location: user?.location || "대전",
          starLevel: 0,
        },
        title: userPost.title,
        description: userPost.description,
        price: userPost.price,
        images: [userPost.image],
        place: (userPost as any).place || "장소 미정",
        timeAgo: "방금 전",
        likes: (userPost as any).likes || 0,
        chatCount: 0,
        status: userPost.status as "available" | "completed",
      }
    : mockPosts[postId]

  const isLiked = likedPosts.some((p) => p.id === postId)

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto max-w-3xl px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">게시글을 찾을 수 없습니다.</p>
            <Button variant="link" className="text-[#800020] mt-2" onClick={() => router.push("/community")}>
              목록으로 돌아가기
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const handleLike = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    toggleLikePost(e, post)
  }

  const handleChat = () => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    router.push(`/messages/${post.user.id}`)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % post.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length)
  }

  const handleStatusChange = (newStatus: "available" | "completed") => {
    setPendingStatus(newStatus)
    setStatusDialogOpen(true)
  }

  const confirmStatusChange = () => {
    updateUserPost(postId, { status: pendingStatus })
    setStatusDialogOpen(false)
  }

  const likeCount = post.likes + (isLiked ? 1 : 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <ScrollToTop />
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push("/community")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Image */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
              <Image
                src={post.images[currentImageIndex] || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover"
              />
              {post.status === "completed" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge className="bg-gray-600 text-white text-lg px-4 py-2">거래 완료</Badge>
                </div>
              )}
              {post.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {post.images.map((_, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          idx === currentImageIndex ? "bg-white" : "bg-white/50",
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Heart and comments moved to bottom right of image */}
              <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-black/50 rounded-full px-3 py-1.5">
                <button
                  className={cn("flex items-center gap-1 text-white transition-colors", isLiked && "text-red-400")}
                  onClick={handleLike}
                >
                  <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                  <span className="text-sm font-medium">{likeCount}</span>
                </button>
                <div className="flex items-center gap-1 text-white">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">{post.chatCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{post.timeAgo}</span>
              </div>
            </div>

            <div>
              <p className="text-2xl font-bold text-[#800020]">{post.price}</p>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">거래 장소: {post.place}</span>
            </div>

            <div className="whitespace-pre-line text-muted-foreground">{post.description}</div>

            {isMyPost && (
              <div className="p-4 bg-[#800020]/5 rounded-xl border border-[#800020]/20 space-y-3">
                <p className="text-sm font-medium text-[#800020]">내 게시글 관리</p>
                <div className="flex gap-2">
                  <Button
                    variant={post.status === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange(post.status === "completed" ? "available" : "completed")}
                    className={cn("flex-1 gap-2", post.status === "completed" && "bg-gray-600 hover:bg-gray-700")}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {post.status === "completed" ? "거래완료 취소" : "거래완료로 변경"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/community/edit/${postId}`)}
                    className="flex-1 gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    내용 수정
                  </Button>
                </div>
              </div>
            )}

            {/* User Profile - removed chat button */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
                <AvatarFallback>{post.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{post.user.name}</p>
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                    <img src="/michelin-star.png" alt="미슐랭" className="h-3 w-3 mr-1" />
                    {post.user.starLevel}개
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {post.user.location}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "flex-1 gap-2",
                  isLiked && "border-red-500 text-red-500 hover:text-red-600 hover:border-red-600",
                )}
                onClick={handleLike}
              >
                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                관심 {likeCount}
              </Button>
              <Button
                size="lg"
                className="flex-1 gap-2 bg-[#800020] hover:bg-[#800020]/90"
                onClick={handleChat}
                disabled={post.status === "completed" || isMyPost}
              >
                <MessageCircle className="h-5 w-5" />
                {isMyPost ? "내 게시글" : "채팅하기"}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>거래 상태 변경</DialogTitle>
            <DialogDescription>
              {pendingStatus === "completed"
                ? "이 게시글을 거래완료로 변경하시겠습니까?"
                : "거래완료를 취소하시겠습니까?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              아니요
            </Button>
            <Button onClick={confirmStatusChange} className="bg-[#800020] hover:bg-[#800020]/90">
              예
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
