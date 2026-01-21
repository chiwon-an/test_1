"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/cook-sync/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, MessageCircle, Heart, Users, Trash2, Check } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const initialNotifications = [
  {
    id: 1,
    type: "comment",
    message: "김대전님이 회원님의 레시피에 댓글을 남겼습니다.",
    time: "5분 전",
    read: false,
    link: "/recipes/japchae",
  },
  {
    id: 2,
    type: "like",
    message: "박요리님이 회원님의 레시피를 좋아합니다.",
    time: "1시간 전",
    read: false,
    link: "/recipes/japchae",
  },
  {
    id: 3,
    type: "message",
    message: "이맛집님이 쪽지를 보냈습니다.",
    time: "3시간 전",
    read: true,
    link: "/messages/user3",
  },
  { id: 4, type: "share", message: "재료 나눔 요청이 수락되었습니다.", time: "어제", read: true, link: "/community" },
  {
    id: 5,
    type: "comment",
    message: "최요리사님이 회원님의 댓글에 답글을 남겼습니다.",
    time: "2일 전",
    read: true,
    link: "/recipes/japchae",
  },
  {
    id: 6,
    type: "like",
    message: "5명이 회원님의 레시피를 좋아합니다.",
    time: "3일 전",
    read: true,
    link: "/recipes/japchae",
  },
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "comment":
      return <MessageCircle className="h-5 w-5 text-blue-500" />
    case "like":
      return <Heart className="h-5 w-5 text-red-500" />
    case "message":
      return <MessageCircle className="h-5 w-5 text-[#576618]" />
    case "share":
      return <Users className="h-5 w-5 text-purple-500" />
    default:
      return <Bell className="h-5 w-5 text-gray-500" />
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const [notifications, setNotifications] = useState(initialNotifications)

  if (!isLoggedIn) {
    router.push("/login")
    return null
  }

  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)))
    router.push(notif.link)
  }

  const handleDeleteNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleDeleteAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">알림</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : "모든 알림을 확인했습니다"}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="gap-1 bg-transparent">
                <Check className="h-4 w-4" />
                모두 읽음
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAll}
                className="gap-1 text-red-500 hover:text-red-600 bg-transparent"
              >
                <Trash2 className="h-4 w-4" />
                모두 삭제
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">알림이 없습니다</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notif) => (
              <Card
                key={notif.id}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all",
                  !notif.read && "border-[#576618]/30 bg-[#576618]/5",
                )}
                onClick={() => handleNotificationClick(notif)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-full">{getNotificationIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", !notif.read && "font-medium")}>{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      onClick={(e) => handleDeleteNotification(notif.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
