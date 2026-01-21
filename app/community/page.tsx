"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/cook-sync/navbar"
import { ScrollToTop } from "@/components/cook-sync/scroll-to-top"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Search, ChevronLeft, ChevronRight, Heart } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"
import { cn } from "@/lib/utils"

const initialShares = [
  {
    id: "1",
    user: { id: "user1", name: "김대전", avatar: "/korean-woman-avatar.jpg", location: "대전 서구 둔산동" },
    title: "삼성 2in1 스탠드 에어컨 AF16J75...",
    description: "대형마트에서 양배추 샀는데 혼자 다 못 먹을 것 같아요. 반 통 1000원에 나눕니다!",
    price: "250,000원",
    images: ["/half-cabbage.jpg"],
    place: "둔산동",
    timeAgo: "4일 전",
    likes: 5,
    chatCount: 3,
    status: "available" as "available" | "completed",
  },
  {
    id: "2",
    user: { id: "user2", name: "박요리", avatar: "/korean-man-avatar.jpg", location: "대전 유성구 봉명동" },
    title: "LG 휘센 스탠드 에어컨 LP-206CQ",
    description: "계란 30개 한 판 사서 10개씩 나눠요. 신선한 당일 구매 제품입니다.",
    price: "100,000원",
    images: ["/eggs-carton.png"],
    place: "둔산동",
    timeAgo: "1일 전",
    likes: 12,
    chatCount: 5,
    status: "available" as "available" | "completed",
  },
  {
    id: "3",
    user: { id: "user3", name: "이맛집", avatar: "/young-korean-woman-avatar.jpg", location: "대전 중구 대흥동" },
    title: "휘센 에어컨두개세트",
    description: "꿀고구마 박스로 사면 싼데 혼자 다 못 먹어서... 같이 나와서 사실 분 구해요!",
    price: "220,000원",
    images: ["/roasted-sweet-potatoes.png"],
    place: "둔산동",
    timeAgo: "11일 전",
    likes: 8,
    chatCount: 2,
    status: "completed" as "available" | "completed",
  },
  {
    id: "4",
    user: { id: "user4", name: "최요리", avatar: "/korean-man-avatar.jpg", location: "대전 서구 둔산동" },
    title: "(예약금5만)(백화점구매) 삼성 인버...",
    description: "삼성 인버터 에어컨입니다.",
    price: "180,000원",
    images: ["/half-cabbage.jpg"],
    place: "둔산동",
    timeAgo: "23시간 전",
    likes: 3,
    chatCount: 1,
    status: "available" as "available" | "completed",
  },
]

const ITEMS_PER_PAGE = 10

export default function CommunityPage() {
  const router = useRouter()
  const { isLoggedIn, user, userPosts, likedPosts, toggleLikePost } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [hideCompleted, setHideCompleted] = useState(false)

  const userLocation = user?.location ? user.location.split(" ").slice(-1)[0] : "우리 동네"

  const userPostsForDisplay = userPosts.map((post) => ({
    id: post.id,
    user: {
      id: user?.id || "current-user",
      name: user?.name || "나",
      avatar: user?.profileImage || "/placeholder.svg",
      location: user?.location || "대전",
    },
    title: post.title,
    description: post.description,
    price: post.price,
    images: [post.image],
    place: (post as any).place || "장소 미정",
    timeAgo: "방금 전",
    likes: (post as any).likes || 0,
    chatCount: 0,
    status: post.status as "available" | "completed",
    isMyPost: true,
  }))

  const allShares = [...userPostsForDisplay, ...initialShares]

  const filteredShares = allShares.filter((share) => {
    const matchesSearch =
      share.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      share.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCompletedFilter = !hideCompleted || share.status !== "completed"
    return matchesSearch && matchesCompletedFilter
  })

  const totalPages = Math.max(1, Math.ceil(filteredShares.length / ITEMS_PER_PAGE))
  const paginatedShares = filteredShares.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

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

  const handleShareClick = (shareId: string) => {
    router.push(`/community/${shareId}`)
  }

  const handleLikeClick = (e: React.MouseEvent, share: (typeof allShares)[0]) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    toggleLikePost(e, share)
  }

  const isPostLiked = (postId: string) => {
    return likedPosts.some((p) => p.id === postId)
  }

  const handleCreatePost = () => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    router.push("/community/new")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <ScrollToTop />
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{userLocation} N빵</h1>
            <p className="text-sm text-muted-foreground mt-1">이웃과 재료를 나눠보세요</p>
          </div>
        </div>

        {/* Search row + Create button (center-fixed, 700px) */}
        <div className="grid grid-cols-[1fr_minmax(0,700px)_1fr] items-center mb-6">
          {/* 왼쪽: 빈 공간(중앙 고정용) */}
          <div />

          {/* 가운데: 검색창 (항상 중앙, 폭 700px) */}
          <div className="relative w-full justify-self-center">
            <div className="flex items-center rounded-full border-2 border-[#800020] bg-background overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <Input
                placeholder="재료 검색..."
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

          {/* 오른쪽: N빵 팟 구함 버튼 */}
          <div className="justify-self-end">
            <Button className="gap-2 bg-[#800020] hover:bg-[#800020]/90" onClick={handleCreatePost}>
              <Plus className="h-4 w-4" />
              N빵 팟 구함
            </Button>
          </div>
        </div>


        <div className="flex items-center justify-end gap-2 mb-6">
          <Switch
            id="hide-completed"
            checked={hideCompleted}
            onCheckedChange={(checked) => {
              setHideCompleted(checked)
              setCurrentPage(1)
            }}
          />
          <Label htmlFor="hide-completed" className="text-sm text-muted-foreground cursor-pointer">
            거래완료 제외
          </Label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedShares.map((share) => (
            <div key={share.id} className="cursor-pointer group" onClick={() => handleShareClick(share.id)}>
              {/* 이미지 - 정사각형 비율 */}
              <div className="relative aspect-[4/3] overflow-hidden bg-muted mb-2">
                <Image
                  src={share.images[0] || "/placeholder.svg"}
                  alt={share.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                {share.status === "completed" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">거래 완료</span>
                  </div>
                )}
              </div>

              {/* 상품명 */}
              <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1 text-foreground">{share.title}</h3>

              {/* 가격 */}
              <p className="font-bold text-base text-foreground mb-1">{share.price}</p>

              {/* 위치 · 시간 */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{share.place}</span>
                <span>·</span>
                <span>끌올 {share.timeAgo}</span>
              </div>
            </div>
          ))}
        </div>

        {paginatedShares.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">검색 결과가 없습니다.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
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
