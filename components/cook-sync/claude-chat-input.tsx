"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Plus, ArrowUp, Loader2, Search, X, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ClaudeChatInputProps {
  onSendMessage: (message: string, image?: string) => void
  isLoading?: boolean
  suggestedPrompts?: string[]
  placeholder?: string
  enableImageUpload?: boolean
}

export function ClaudeChatInput({
  onSendMessage,
  isLoading = false,
  suggestedPrompts = [],
  placeholder = "레시피를 검색하거나 질문을 입력하세요...",
  enableImageUpload = true,
}: ClaudeChatInputProps) {
  const [message, setMessage] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [attachedFile, setAttachedFile] = useState<{ name: string; data: string; type: string } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px"
    }
  }, [message])

  const handleSend = useCallback(() => {
    if ((!message.trim() && !attachedFile) || isLoading) return
    onSendMessage(message.trim(), attachedFile?.data || undefined)
    setMessage("")
    setAttachedFile(null)
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }, [message, attachedFile, isLoading, onSendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!enableImageUpload) return
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAttachedFile({
          name: file.name,
          data: reader.result as string,
          type: file.type,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (!enableImageUpload) return
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAttachedFile({
          name: file.name,
          data: reader.result as string,
          type: file.type,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const hasContent = message.trim().length > 0 || attachedFile

  const isImageFile = attachedFile?.type.startsWith("image/")

  return (
    <div className="w-full space-y-3">
      {suggestedPrompts.length > 0 && !message && !attachedFile && (
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(prompt)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Search className="h-3 w-3" />
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div
        className={cn(
          "relative mx-auto w-full max-w-3xl transition-all duration-200",
          enableImageUpload && isDragging && "ring-2 ring-[#800020] ring-offset-2",
        )}
        onDragOver={(e) => {
          e.preventDefault()
          if (enableImageUpload) setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={handleDrop}
      >
        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-lg transition-shadow hover:shadow-xl focus-within:shadow-xl">
          {attachedFile && enableImageUpload && (
            <div className="px-4 pt-4">
              <div className="relative inline-block">
                {isImageFile ? (
                  <Image
                    src={attachedFile.data || "/placeholder.svg"}
                    alt="Attached"
                    width={120}
                    height={80}
                    className="rounded-lg object-cover h-20 w-auto"
                  />
                ) : (
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">{attachedFile.name}</span>
                  </div>
                )}
                <button
                  onClick={() => setAttachedFile(null)}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Text Input */}
          <div className="relative px-4 pt-4 pb-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full resize-none border-0 bg-transparent text-base placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
              rows={1}
              autoFocus
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between border-t border-border/50 px-3 py-2">
            {/* Left Tools */}
            <div className="flex items-center gap-1">
              {enableImageUpload && (
                <>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-lg transition-colors",
                      attachedFile ? "text-[#800020]" : "text-muted-foreground hover:text-foreground",
                    )}
                    disabled={isLoading}
                    onClick={() => fileInputRef.current?.click()}
                    title="파일 첨부"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!hasContent || isLoading}
              size="icon"
              className={cn(
                "h-8 w-8 rounded-xl transition-all",
                hasContent && !isLoading
                  ? "bg-[#800020] text-white hover:bg-[#800020]/90"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-center text-xs text-muted-foreground">
        AI가 요리 레시피를 추천해드립니다. 궁금한 것을 물어보세요!
      </p>
    </div>
  )
}
