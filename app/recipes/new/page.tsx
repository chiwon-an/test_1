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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Upload, ChevronLeft, ChevronRight, X, Plus, Trash2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface RecipeStep {
  id: number
  action: string
  description: string
  duration: number
  image: File | null
  imagePreview: string | null
  tips: string
}

interface Ingredient {
  id: number
  name: string
  amount: string
}

const categoryOptions = [
  { value: "korean", label: "한식" },
  { value: "chinese", label: "중식" },
  { value: "japanese", label: "일식" },
  { value: "western", label: "양식" },
  { value: "dessert", label: "디저트" },
  { value: "snack", label: "분식" },
  { value: "salad", label: "샐러드" },
  { value: "drink", label: "음료" },
  { value: "nightsnack", label: "야식&술안주" },
  { value: "etc", label: "기타" },
]

export default function NewRecipePage() {
  const router = useRouter()
  const { isLoggedIn, addUserRecipe } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [servings, setServings] = useState("")
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [ingredientName, setIngredientName] = useState("")
  const [ingredientAmount, setIngredientAmount] = useState("")
  const [steps, setSteps] = useState<RecipeStep[]>([
    { id: 1, action: "", description: "", duration: 60, image: null, imagePreview: null, tips: "" },
  ])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [exitDialogOpen, setExitDialogOpen] = useState(false)
  const [savedDialogOpen, setSavedDialogOpen] = useState(false)

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

  const removeThumbnail = () => {
    setThumbnail(null)
    setThumbnailPreview(null)
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

  const removeStepImage = (stepId: number) => {
    setSteps(steps.map((step) => (step.id === stepId ? { ...step, image: null, imagePreview: null } : step)))
  }

  const addStep = () => {
    const newId = Math.max(...steps.map((s) => s.id)) + 1
    const newStep = {
      id: newId,
      action: "",
      description: "",
      duration: 60,
      image: null,
      imagePreview: null,
      tips: "",
    }
    setSteps([...steps, newStep])
    setCurrentStepIndex(steps.length)
  }

  const removeStep = (stepId: number) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((s) => s.id !== stepId)
      setSteps(newSteps)
      if (currentStepIndex >= newSteps.length) {
        setCurrentStepIndex(newSteps.length - 1)
      }
    }
  }

  const updateStep = (stepId: number, field: keyof RecipeStep, value: string | number | File | null) => {
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

  const addIngredient = () => {
    if (ingredientName.trim()) {
      const newIngredient: Ingredient = {
        id: Date.now(),
        name: ingredientName.trim(),
        amount: ingredientAmount.trim(),
      }
      setIngredients([...ingredients, newIngredient])
      setIngredientName("")
      setIngredientAmount("")
    }
  }

  const removeIngredient = (id: number) => {
    setIngredients(ingredients.filter((i) => i.id !== id))
  }

  const totalCookingTime = steps.reduce((acc, step) => acc + step.duration, 0)

  const formatCookingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes === 0) {
      return `${remainingSeconds}초`
    } else if (remainingSeconds === 0) {
      return `${minutes}분`
    } else {
      return `${minutes}분 ${remainingSeconds}초`
    }
  }

  const handleSubmitClick = () => {
    if (
      !title ||
      !thumbnailPreview ||
      steps.some((s) => !s.action || !s.description || !s.duration || !s.imagePreview)
    ) {
      alert("제목, 대표 이미지, 그리고 모든 단계의 제목, 설명, 소요 시간(초), 단계 이미지는 필수입니다.")
      return
    }
    setConfirmDialogOpen(true)
  }

  const handleConfirmSubmit = () => {
    setConfirmDialogOpen(false)
    addUserRecipe({
      title,
      description,
      category,
      servings: Number(servings) || 1,
      thumbnail: thumbnailPreview!,
      tags,
      ingredients: ingredients.map((i) => ({ name: i.name, amount: i.amount })),
      steps: steps.map((step) => ({
        id: step.id,
        action: step.action,
        description: step.description,
        duration: step.duration,
        imagePreview: step.imagePreview,
        tips: step.tips,
      })),
    })
    setSuccessDialogOpen(true)
  }

  const handleViewRecipe = () => {
    setSuccessDialogOpen(false)
    router.push("/recipes?type=user")
  }

  const handleCancel = () => {
    if (title || description || thumbnailPreview || steps.some((s) => s.action || s.description)) {
      setExitDialogOpen(true)
    } else {
      router.back()
    }
  }

  const handleTempSave = () => {
    setExitDialogOpen(false)
    const tempData = {
      title,
      description,
      category,
      servings,
      thumbnailPreview,
      tags,
      ingredients,
      steps: steps.map((step) => ({
        id: step.id,
        action: step.action,
        description: step.description,
        duration: step.duration,
        imagePreview: step.imagePreview,
        tips: step.tips,
      })),
    }
    localStorage.setItem("tempRecipe", JSON.stringify(tempData))
    setSavedDialogOpen(true)
  }

  const handleSavedDialogClose = () => {
    setSavedDialogOpen(false)
    router.push("/")
  }

  const handleExitWithoutSave = () => {
    setExitDialogOpen(false)
    router.push("/")
  }

  const currentStep = steps[currentStepIndex]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
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
              <div className="flex flex-col md:flex-row gap-6">
                <div className="space-y-2 md:w-1/2">
                  <Label>대표 이미지 *</Label>
                  <div className="relative">
                    <div
                      className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors aspect-[4/3] flex items-center justify-center"
                      onClick={() => document.getElementById("thumbnail-input")?.click()}
                    >
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview || "/placeholder.svg"}
                          alt="Thumbnail"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">클릭하여 대표 이미지를 업로드하세요</p>
                        </div>
                      )}
                    </div>
                    {thumbnailPreview && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeThumbnail()
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
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

                <div className="space-y-4 md:w-1/2">
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
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">카테고리 *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                </div>
              </div>

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

              <div className="space-y-2">
                <Label>재료</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="재료명 (예: 김치)"
                    value={ingredientName}
                    onChange={(e) => setIngredientName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="용량 (예: 200g)"
                    value={ingredientAmount}
                    onChange={(e) => setIngredientAmount(e.target.value)}
                    className="w-32"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
                  />
                  <Button type="button" onClick={addIngredient} variant="outline">
                    추가
                  </Button>
                </div>
                {ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ingredients.map((ingredient) => (
                      <span
                        key={ingredient.id}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-foreground text-sm"
                      >
                        {ingredient.name} {ingredient.amount && `(${ingredient.amount})`}
                        <button onClick={() => removeIngredient(ingredient.id)} className="hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  총 조리시간:{" "}
                  <span className="font-semibold text-foreground">{formatCookingTime(totalCookingTime)}</span> (
                  {steps.length}단계)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Steps - Carousel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">조리 단계</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {currentStepIndex + 1} / {steps.length}
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={addStep} className="gap-1 bg-transparent">
                    <Plus className="h-4 w-4" />
                    단계 추가
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Carousel Navigation */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentStepIndex === 0}
                  className="shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex-1 p-5 border rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg text-[#800020]">STEP {currentStepIndex + 1}</h4>
                    {steps.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(currentStep.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="space-y-2 md:w-1/2">
                      <Label className="text-base">단계 이미지 *</Label>
                      <div className="relative">
                        <div
                          className="border-2 border-dashed rounded-lg p-2 text-center cursor-pointer hover:bg-muted/50 transition-colors aspect-[4/3] flex items-center justify-center"
                          onClick={() => document.getElementById(`step-image-${currentStep.id}`)?.click()}
                        >
                          {currentStep.imagePreview ? (
                            <img
                              src={currentStep.imagePreview || "/placeholder.svg"}
                              alt={`Step ${currentStepIndex + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div>
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">클릭하여 이미지 업로드 (필수)</p>
                            </div>
                          )}
                        </div>
                        {currentStep.imagePreview && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeStepImage(currentStep.id)
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <input
                        id={`step-image-${currentStep.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleStepImageChange(currentStep.id, e)}
                      />
                    </div>

                    <div className="space-y-4 md:w-1/2 flex flex-col">
                      <div className="space-y-2">
                        <Label className="text-base">소요 시간 (초) *</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={currentStep.duration}
                            onChange={(e) =>
                              updateStep(currentStep.id, "duration", e.target.value ? Number.parseInt(e.target.value) : "")
                            }
                            placeholder="예: 120"
                            className="text-base flex-1"
                          />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">초</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base">단계 제목 *</Label>
                        <Input
                          placeholder="예: 재료 손질하기"
                          value={currentStep.action}
                          onChange={(e) => updateStep(currentStep.id, "action", e.target.value)}
                          className="text-base"
                        />
                      </div>

                      <div className="space-y-2 flex-1 flex flex-col">
                        <Label className="text-base">상세 설명 *</Label>
                        <Textarea
                          placeholder="이 단계에서 해야 할 일을 자세히 설명해주세요"
                          value={currentStep.description}
                          onChange={(e) => updateStep(currentStep.id, "description", e.target.value)}
                          className="min-h-[100px] flex-1 overflow-y-auto text-base resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base">팁 (선택)</Label>
                        <Input
                          placeholder="요리 팁을 입력하세요"
                          value={currentStep.tips}
                          onChange={(e) => updateStep(currentStep.id, "tips", e.target.value)}
                          className="text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
                  disabled={currentStepIndex === steps.length - 1}
                  className="shrink-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Step Indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStepIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentStepIndex
                        ? "bg-[#800020] w-6"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit - Cancel | Register buttons */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCancel} className="bg-transparent">
              취소
            </Button>
            <Button onClick={handleSubmitClick} className="bg-[#800020] hover:bg-[#800020]/90">
              등록
            </Button>
          </div>
        </div>
      </main>

      {/* Confirm Submit Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>레시피 등록</AlertDialogTitle>
            <AlertDialogDescription>레시피를 등록하시겠습니까?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>아니오</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} className="bg-[#800020] hover:bg-[#800020]/90">
              예
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>임시저장 하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              작성 중인 내용이 있습니다. 페이지를 떠나면 작성 중인 내용이 사라집니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleExitWithoutSave}>아니오</AlertDialogCancel>
            <AlertDialogAction onClick={handleTempSave} className="bg-[#800020] hover:bg-[#800020]/90">
              임시저장
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={savedDialogOpen} onOpenChange={setSavedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-[#800020]/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-[#800020]" />
              </div>
            </div>
            <DialogTitle className="text-center">임시저장 완료</DialogTitle>
            <DialogDescription className="text-center">작성 중인 레시피가 임시저장되었습니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button className="w-full bg-[#800020] hover:bg-[#800020]/90" onClick={handleSavedDialogClose}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          <DialogFooter className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSuccessDialogOpen(false)}>
              계속 등록하기
            </Button>
            <Button className="flex-1 bg-[#800020] hover:bg-[#800020]/90" onClick={handleViewRecipe}>
              내 레시피 보기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
