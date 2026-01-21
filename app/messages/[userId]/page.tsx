"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/cook-sync/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, Send, ImageIcon, X, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ParsedMessage {
  id: string
  content: string
  isSentByMe: boolean
  imageUrl?: string
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { isLoggedIn, conversations, getMessages, sendMessage, deleteConversation } = useAuth()
  const [messageText, setMessageText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [messageCounter, setMessageCounter] = useState(0)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)

  const userId = params.userId as string
  const conversation = conversations.find((c) => c.recipientId === userId)
  const rawMessages = getMessages(userId)

  const localMessages = useMemo<ParsedMessage[]>(() => {
    return rawMessages.map((msg) => {
      // Check if message contains [이미지] prefix with base64 data
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawMessages.length, messageCounter])

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [localMessages])

  if (!isLoggedIn) return null

  const recipientName = conversation?.recipientName || decodeURIComponent(userId)
  const recipientAvatar = conversation?.recipientAvatar || "/placeholder.svg"

  const handleSend = () => {
    if (!messageText.trim() && !imagePreview) return
    const content = imagePreview ? `[이미지:${imagePreview}]${messageText}` : messageText
    sendMessage(userId, recipientName, recipientAvatar, content)
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

  const handleLeaveConversation = () => {
    if (deleteConversation) {
      deleteConversation(userId)
    }
    setLeaveDialogOpen(false)
    router.push("/messages")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-5xl px-0 py-0 flex flex-col h-[calc(100vh-64px)]">
        {/* Header with user info */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div className="flex items-center gap-3 flex-1">
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Avatar className="h-12 w-12">
              <AvatarImage src={recipientAvatar || "/placeholder.svg"} />
              <AvatarFallback>{recipientName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg">{recipientName}</h2>
              <p className="text-xs text-muted-foreground">온라인</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-destructive"
              onClick={() => setLeaveDialogOpen(true)}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
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
                      <AvatarImage src={recipientAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{recipientName[0]}</AvatarFallback>
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
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
            <div className="flex-1 relative">
              <Input
                placeholder="Write Something..."
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
      </main>

      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>대화방 나가기</DialogTitle>
            <DialogDescription>
              &apos;{recipientName}&apos;님과의 대화방에서 나가시겠습니까? 대화 내용이 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
              아니요
            </Button>
            <Button variant="destructive" onClick={handleLeaveConversation}>
              예
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
