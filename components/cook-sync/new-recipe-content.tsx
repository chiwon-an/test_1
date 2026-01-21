"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/cook-sync/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Upload, ChevronLeft, X, Plus, Trash2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface RecipeStep {
  id: number
  action: string
  description: string
  duration: number
  image: File | null
  imagePreview: string | null
  ingredients: string[]
  tips: string
}

export function NewRecipeContent() {
  const router = useRouter()
  const { isLoggedIn, user, addUserRecipe } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [servings, setServings] = useState("")
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [steps, setSteps] = useState<RecipeStep[]>([
    { id: 1, action: "", description: "", duration: 60, image: null, imagePreview: null, ingredients: [], tips: "" },
  ])
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [createdRecipeId, setCreatedRecipeId] = useState<string | null>(null)

  if (!isLoggedIn) {
    router.push("/login")
    return null
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnail(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const handleStepImageChange = (stepId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSteps(
        steps.map((step) =>
          step.id === stepId ? { ...step, image: file, imagePreview: URL.createObjectURL(file) } : step,
        ),
      )
    }
  }

  const addStep = () => {
    const newId = Math.max(...steps.map((s) => s.id)) + 1
    setSteps([
      ...steps,
      {
        id: newId,
        action: "",
        description: "",
        duration: 60,
        image: null,
        imagePreview: null,
        ingredients: [],
        tips: "",
      },
    ])
  }

  const removeStep = (stepId: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((s) => s.id !== stepId))
    }
  }

  const updateStep = (stepId: number, field: keyof RecipeStep, value: string | number | string[] | File | null) => {
    setSteps(steps.map((step) => (step.id === stepId ? { ...step, [field]: value } : step)))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSubmit = () => {
    if (!title || !thumbnailPreview || steps.some((s) => !s.action || !s.description)) {
      alert("제목, 대표 이미지, 그리고 모든 단계의 제목, 설명은 필수입니다.")
      return
    }

    const newRecipeId = addUserRecipe({
      title,
      description,
      category,
      servings: Number(servings) || 1,
      thumbnail: thumbnailPreview,
      tags,
      steps: steps.map((step) => ({
        id: step.id,
        action: step.action,
        description: step.description,
        duration: step.duration,
        imagePreview: step.imagePreview,
        ingredients: step.ingredients,
        tips: step.tips,
      })),
    })

    setCreatedRecipeId(newRecipeId)
    setSuccessDialogOpen(true)
  }

  const handleViewRecipe = () => {
    setSuccessDialogOpen(false)
    router.push("/recipes?type=user")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">레시피 등록</h1>
            <p className="text-muted-foreground">나만의 레시피를 공유해보세요</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Thumbnail */}
              <div className="space-y-2">
                <Label>대표 이미지 *</Label>
                <div
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => document.getElementById("thumbnail-input")?.click()}
                >
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview || "/placeholder.svg"}
                      alt="Thumbnail"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">클릭하여 대표 이미지를 업로드하세요</p>
                    </>
                  )}
                </div>
                <input
                  id="thumbnail-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">레시피 제목 *</Label>
                <Input
                  id="title"
                  placeholder="예: 엄마표 김치찌개"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">레시피 소개</Label>
                <Textarea
                  id="description"
                  placeholder="이 레시피에 대해 간단히 소개해주세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Input
                    id="category"
                    placeholder="예: 한식, 중식, 양식"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servings">인분</Label>
                  <Input
                    id="servings"
                    placeholder="예: 2"
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>태그</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="태그 입력 후 추가"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    추가
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#800020]/10 text-[#800020] text-sm"
                      >
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle>조리 단계</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="p-4 border rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[#800020]">STEP {index + 1}</h4>
                    {steps.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeStep(step.id)} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>단계 제목 *</Label>
                    <Input
                      placeholder="예: 재료 손질하기"
                      value={step.action}
                      onChange={(e) => updateStep(step.id, "action", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>상세 설명 *</Label>
                    <Textarea
                      placeholder="이 단계에서 해야 할 일을 자세히 설명해주세요"
                      value={step.description}
                      onChange={(e) => updateStep(step.id, "description", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>소요 시간 (초)</Label>
                      <Input
                        type="number"
                        value={step.duration}
                        onChange={(e) => updateStep(step.id, "duration", Number.parseInt(e.target.value) || 60)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>팁 (선택)</Label>
                      <Input
                        placeholder="요리 팁을 입력하세요"
                        value={step.tips}
                        onChange={(e) => updateStep(step.id, "tips", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>단계 이미지 (선택)</Label>
                    <div
                      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => document.getElementById(`step-image-${step.id}`)?.click()}
                    >
                      {step.imagePreview ? (
                        <img
                          src={step.imagePreview || "/placeholder.svg"}
                          alt={`Step ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">클릭하여 이미지 업로드</p>
                        </>
                      )}
                    </div>
                    <input
                      id={`step-image-${step.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleStepImageChange(step.id, e)}
                    />
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addStep} className="w-full gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                단계 추가
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              취소
            </Button>
            <Button onClick={handleSubmit} className="bg-[#800020] hover:bg-[#800020]/90">
              레시피 등록하기
            </Button>
          </div>
        </div>
      </main>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-[#800020]/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-[#800020]" />
              </div>
            </div>
            <DialogTitle className="text-center">레시피가 등록되었습니다!</DialogTitle>
            <DialogDescription className="text-center">
              나만의 레시피가 성공적으로 등록되었어요. 다른 사용자들과 공유해보세요.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSuccessDialogOpen(false)}>
              계속 등록하기
            </Button>
            <Button className="flex-1 bg-[#800020] hover:bg-[#800020]/90" onClick={handleViewRecipe}>
              내 레시피 보기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
