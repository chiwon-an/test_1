"use client"

import React from "react"

import { Input } from "@/components/ui/input"
import { LogOut } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Navbar } from "@/components/cook-sync/navbar"
import { useAuth } from "@/lib/auth-context"
import { Send, MessageCircle, ChevronLeft, ChevronRight, Trash2, Bell, BellOff, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const ITEMS_PER_PAGE = 5

interface ParsedMessage {
  id: string
  content: string
  isSentByMe: boolean
  imageUrl?: string
}

export default function MessagesPage() {
  const { isLoggedIn, conversations, deleteConversation, getMessages, sendMessage } = useAuth()
  const router = useRouter()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversations.length > 0 ? conversations[0].recipientId : null
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [notificationsDisabled, setNotificationsDisabled] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [messageText, setMessageText] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [messageCounter, setMessageCounter] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedConversation = conversations.find((conv) => conv.recipientId === selectedConversationId)
  const rawMessages = selectedConversationId ? getMessages(selectedConversationId) : []

  const totalPages = Math.ceil(conversations.length / ITEMS_PER_PAGE)
  const paginatedConversations = conversations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const localMessages = rawMessages.map((msg) => {
    if (msg.content.startsWith("[이미지:")) {
      const match = msg.content.match(/\[이미지:(data:image[^\]]+)\](.*)/)
      if (match) {
        return {
          id: msg.id,
          isSentByMe: msg.isSentByMe,
          imageUrl: match[1],
          content: match[2].trim(),
        }
      }
    }
    return {
      id: msg.id,
      content: msg.content,
      isSentByMe: msg.isSentByMe,
    }
  })

  const getPageNumbers = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messageCounter])

  if (!isLoggedIn) return null

  const handleDeleteConversation = () => {
    if (selectedConversationId && deleteConversation) {
      deleteConversation(selectedConversationId)
      setDeleteDialogOpen(false)
      setSelectedConversationId(null)
    }
  }

  const handleSend = () => {
    if (!selectedConversationId || (!messageText.trim() && !imagePreview)) return
    const recipientName = selectedConversation?.recipientName || selectedConversationId
    const recipientAvatar = selectedConversation?.recipientAvatar || "/placeholder.svg"
    const content = imagePreview ? `[이미지:${imagePreview}]${messageText}` : messageText
    sendMessage(selectedConversationId, recipientName, recipientAvatar, content)
    setMessageText("")
    setImagePreview(null)
    setMessageCounter((c) => c + 1)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-7xl px-0 py-0 flex overflow-hidden">
        {/* 좌측 패널 - 채팅방 목록 */}
        <div className="w-80 border-r bg-white flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Send className="h-5 w-5 text-[#800020]" />
              채팅함
            </h2>
          </div>

          {conversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">아직 쪽지가 없습니다</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {paginatedConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.recipientId)}
                  className={cn(
                    "w-full px-4 py-3 border-b flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group",
                    selectedConversationId === conv.recipientId && "bg-[#800020]/5 border-l-4 border-l-[#800020]"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={conv.recipientAvatar || "/placeholder.svg"} />
                    <AvatarFallback>{conv.recipientName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{conv.recipientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        setNotificationsDisabled((prev) => {
                          const updated = new Set(prev)
                          if (updated.has(conv.recipientId)) {
                            updated.delete(conv.recipientId)
                          } else {
                            updated.add(conv.recipientId)
                          }
                          return updated
                        })
                      }}
                    >
                      {notificationsDisabled.has(conv.recipientId) ? (
                        <BellOff className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedConversationId(conv.recipientId)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="h-5 w-5 rounded-full bg-[#800020] text-xs text-white flex items-center justify-center font-medium shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 우측 패널 - 메시지 */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedConversation.recipientAvatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedConversation.recipientName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-lg">{selectedConversation.recipientName}</h2>
                  <p className="text-xs text-muted-foreground">온라인</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
              {localMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <p>대화를 시작해보세요!</p>
                </div>
              ) : (
                localMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isSentByMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs lg:max-w-md flex items-end gap-2 ${msg.isSentByMe ? "flex-row-reverse" : "flex-row"}`}>
                      {!msg.isSentByMe && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={selectedConversation.recipientAvatar || "/placeholder.svg"} />
                          <AvatarFallback>{selectedConversation.recipientName[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          msg.isSentByMe
                            ? "bg-[#800020] text-white rounded-br-none"
                            : "bg-gray-200 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        {msg.imageUrl && (
                          <Image
                            src={msg.imageUrl || "/placeholder.svg"}
                            alt="Sent image"
                            width={240}
                            height={240}
                            className="rounded-lg mb-2 max-w-full h-auto"
                          />
                        )}
                        {msg.content && <p className="text-sm leading-relaxed">{msg.content}</p>}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-6 py-4 border-t bg-white">
              {imagePreview && (
                <div className="relative mb-3 inline-block">
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    width={120}
                    height={120}
                    className="rounded-lg object-cover"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => setImagePreview(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-3 items-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 h-10 w-10 text-[#800020] hover:bg-red-50"
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                <div className="flex-1 relative">
                  <Input
                    placeholder="동네 이웃과 채팅을 나눠보세요!"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="rounded-full pl-4 pr-4 py-2 bg-gray-100 border-0 focus:ring-0 focus:bg-gray-200"
                  />
                </div>
                <Button
                  onClick={handleSend}
                  className="bg-[#800020] hover:bg-[#800020]/90 text-white shrink-0 rounded-full h-10 w-10 p-0 flex items-center justify-center"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4380088 C3.03521743,10.5951061 3.19218622,10.7522035 3.50612381,10.7522035 L16.6915026,11.5376905 C16.6915026,11.5376905 17.1624089,11.5376905 17.1624089,12.0089827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
            <p>채팅방을 선택해주세요</p>
          </div>
        )}
      </main>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center gap-2 px-6 py-4 border-t">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={cn(
            "p-2 text-gray-400 transition-colors",
            currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:text-gray-600"
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
              currentPage === page ? "border-2 border-[#800020] text-[#800020] bg-white" : "text-gray-500 hover:bg-gray-100"
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
            currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:text-gray-600"
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>대화방 나가기</DialogTitle>
            <DialogDescription>이 대화방에서 나가시겠습니까? 대화 내용이 삭제됩니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              아니요
            </Button>
            <Button variant="destructive" onClick={handleDeleteConversation}>
              예
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
