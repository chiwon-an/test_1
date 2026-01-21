"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/cook-sync/navbar"
import { ScrollToTop } from "@/components/cook-sync/scroll-to-top"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Upload, X, MapPin, Receipt } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const { isLoggedIn, userPosts, updateUserPost } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    place: "",
  })
  const [images, setImages] = useState<string[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    const post = userPosts.find((p) => p.id === postId)
    if (post) {
      setFormData({
        title: post.title,
        description: post.description,
        price: post.price,
        place: (post as any).place || "",
      })
      if (post.image) {
        setImages([post.image])
      }
    } else {
      router.push("/mypage")
    }
  }, [isLoggedIn, postId, userPosts, router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const remainingSlots = 5 - images.length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    filesToProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      alert("제목과 내용을 입력해주세요.")
      return
    }
    setShowConfirmDialog(true)
  }

  const confirmSubmit = () => {
    updateUserPost(postId, {
      title: formData.title,
      description: formData.description,
      price: formData.price || "가격 협의",
      image: images[0] || "/placeholder.svg",
      place: formData.place || "장소 미정",
    } as any)
    setShowConfirmDialog(false)
    router.push("/mypage")
  }

  const handleCancel = () => {
    setShowExitDialog(true)
  }

  if (!isLoggedIn) return null

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <ScrollToTop />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">게시물 수정</h1>
            <p className="text-muted-foreground">N빵 게시물 정보를 수정하세요</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>
                이미지 <span className="text-muted-foreground text-sm">(최대 5장)</span>
              </Label>
              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`Image ${idx + 1}`}
                      fill
                      className="object-cover cursor-pointer"
                      onClick={() => setPreviewImage(img)}
                    />
                    {idx === 0 && (
                      <Badge className="absolute top-1 left-1 bg-[#800020] text-white text-[10px] px-1.5 py-0.5">
                        대표
                      </Badge>
                    )}
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground hover:border-[#800020] hover:text-[#800020] transition-colors"
                  >
                    <Upload className="h-6 w-6 mb-1" />
                    <span className="text-xs">추가</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                <Receipt className="h-4 w-4 shrink-0" />
                <span>신뢰를 위해 영수증을 함께 첨부해보세요</span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                제목 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="예: 양배추 반 통 같이 나눠요"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                내용 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="구매한 재료, 상태, 나눔 방법 등을 자세히 적어주세요."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">가격</Label>
              <Input
                id="price"
                placeholder="예: 1,000원, 무료나눔"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="place">거래 장소</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="place"
                  placeholder="예: 둔산동 롯데마트 앞"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={handleCancel}>
            취소
          </Button>
          <Button className="flex-1 bg-[#800020] hover:bg-[#800020]/90" onClick={handleSubmit}>
            저장하기
          </Button>
        </div>
      </main>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-0">
          {previewImage && (
            <Image
              src={previewImage || "/placeholder.svg"}
              alt="Preview"
              width={800}
              height={600}
              className="w-full h-auto object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>게시물 수정</AlertDialogTitle>
            <AlertDialogDescription>변경사항을 저장하시겠습니까?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>아니오</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} className="bg-[#800020] hover:bg-[#800020]/90">
              예
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>수정을 취소하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>변경사항이 저장되지 않습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>계속 수정</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push("/mypage")}
              className="bg-destructive hover:bg-destructive/90"
            >
              나가기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
