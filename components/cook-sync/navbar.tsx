"use client"
import { MichelinIcon } from "@/components/common/MichelinIcon"
import type React from "react"
import { useState } from "react"
import {
  Bell,
  User,
  Users,
  LogOut,
  Settings,
  Send,
  Trash2,
  BookOpen,
  FlaskConical,
  Star,
  Heart,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface NavbarProps {
  onLogoClick?: () => void
}

const initialNotifications = [
  {
    id: 1,
    type: "rating",
    title: "미슐랭 평가단이 왔다갔어요",
    message: "김대전님이 회원님의 레시피에 평점을 남겼습니다.",
    time: "5분 전",
    read: false,
    link: "/recipes/japchae",
  },
  {
    id: 2,
    type: "like",
    title: "좋아요 알림",
    message: "박요리님이 회원님의 레시피를 좋아합니다.",
    time: "1시간 전",
    read: false,
    link: "/recipes/japchae",
  },
  {
    id: 3,
    type: "comment",
    title: "미슐랭 평가단이 왔다갔어요",
    message: "이맛집님이 회원님의 레시피에 댓글을 남겼습니다.",
    time: "3시간 전",
    read: true,
    link: "/recipes/japchae",
  },
  {
    id: 4,
    type: "message",
    title: "쪽지 알림",
    message: "최요리님이 쪽지를 보냈습니다.",
    time: "어제",
    read: true,
    link: "/messages/user4",
  },
]

function DynamicStars({ starCount = 0 }: { starCount?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: Math.max(1, starCount || 1) }).map((_, i) => (
        <img
          key={i}
          src="/michelin-star.png"
          alt="미슐랭"
          className={cn("h-3 w-3 transition-all", starCount > 0 ? "opacity-100" : "opacity-50")}
        />
      ))}
    </div>
  )
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "rating":
    case "comment":
      return <img src="/michelin-star.png" alt="미슐랭" className="h-4 w-4" />
    case "like":
      return <Heart className="h-4 w-4 text-red-500" />
    case "message":
      return <MessageCircle className="h-4 w-4 text-[#800020]" />
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />
  }
}

export function Navbar({ onLogoClick }: NavbarProps) {
  const { user, isLoggedIn, logout, conversations } = useAuth()
  const router = useRouter()
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [dmOpen, setDmOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [userStarLevel] = useState(0)

  const userLocation = user?.location ? user.location.split(" ").slice(-1)[0] : "우리 동네"

  const handleLogoClick = (e: React.MouseEvent) => {
    if (onLogoClick) {
      e.preventDefault()
      onLogoClick()
      router.push("/")
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const unreadDmCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0)

  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)))
    setNotificationOpen(false)
    router.push(notif.link)
  }

  const handleDeleteAllNotifications = () => {
    setNotifications([])
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 leading-5 tracking-normal" onClick={handleLogoClick}>
          <MichelinIcon size={36} />
          <div className="flex gap-0.5 items-baseline">
            {["미", "슐", "랭", " ", "0", "스", "타"].map((char, index) => (
              <span
                key={index}
                className="text-xl font-bold tracking-tight text-foreground inline-block"
                style={{
                  animation: `slideUpLetters 0.6s ease-out ${index * 0.08}s both`,
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </Link>

        {/* Navigation Menu */}
        {/* Navigation Menu */}
        <nav className="hidden lg:flex" aria-label="Primary">
          <div className="flex items-center gap-1">
            <Link
              href="/recipes?type=cook"
              className="group inline-flex flex-row items-center justify-center rounded-md bg-transparent text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 h-10 px-4 gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>레시피 도서관</span>
            </Link>

            <Link
              href="/recipes?type=user"
              className="group inline-flex flex-row items-center justify-center rounded-md bg-transparent text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 h-10 px-4 gap-2"
            >
              <FlaskConical className="h-4 w-4" />
              <span>레시피 연구소</span>
            </Link>

            <Link
              href="/community"
              className="group inline-flex flex-row items-center justify-center rounded-md bg-transparent text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground focus:outline-none h-10 px-4 gap-2"
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>{userLocation} N빵</span>
            </Link>
          </div>
        </nav>


        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <>
              <Popover open={dmOpen} onOpenChange={setDmOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:flex text-muted-foreground hover:text-foreground hover:bg-accent relative h-9 w-9"
                  >
                    <Send className="h-5 w-5" />
                    {unreadDmCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-medium">
                        {unreadDmCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="p-3 border-b flex items-center justify-between">
                    <h4 className="font-semibold">채팅</h4>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {conversations.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground text-sm">
                        <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>아직 쪽지가 없습니다</p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <Link
                          key={conv.id}
                          href={`/messages/${conv.recipientId}`}
                          className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => setDmOpen(false)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conv.recipientAvatar || "/placeholder.svg"} />
                            <AvatarFallback>{conv.recipientName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{conv.recipientName}</span>
                              <span className="text-xs text-muted-foreground">{conv.lastMessageTime}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="h-5 w-5 rounded-full bg-[#800020] text-[10px] text-white flex items-center justify-center font-medium">
                              {conv.unreadCount}
                            </span>
                          )}
                        </Link>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full text-[#800020]" asChild>
                      <Link href="/messages">모든 채팅 보기</Link>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:flex text-muted-foreground hover:text-foreground hover:bg-accent relative h-9 w-9"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-medium">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="p-3 border-b flex items-center justify-between">
                    <h4 className="font-semibold">알림</h4>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleDeleteAllNotifications}
                        className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        모두 삭제
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">알림이 없습니다</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={cn(
                            "p-3 border-b last:border-b-0 hover:bg-accent cursor-pointer transition-colors",
                            !notif.read && "bg-[#800020]/5",
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">{getNotificationIcon(notif.type)}</div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-[#800020] mb-0.5">{notif.title}</p>
                              <p className="text-sm">{notif.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full text-[#800020]" asChild>
                      <Link href="/notifications">모든 알림 보기</Link>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImage || "/placeholder.svg"} />
                    <AvatarFallback>{user?.name?.charAt(0) || <User className="h-4 w-4" />}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/mypage" className="flex w-full items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    마이페이지
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex w-full items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    프로필 설정
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild className="bg-[#800020] hover:bg-[#800020]/90">
                <Link href="/signup">시작하기</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
