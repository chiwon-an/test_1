"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/cook-sync/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { Camera, ArrowLeft, Eye, EyeOff, Check, X, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"

const categoryOptions = [
  { value: "korean", label: "한식" },
  { value: "chinese", label: "중식" },
  { value: "japanese", label: "일식" },
  { value: "western", label: "양식" },
  { value: "dessert", label: "디저트" },
  { value: "snack", label: "분식" },
  { value: "salad", label: "샐러드" },
  { value: "drink", label: "음료" },
]

const mockNicknames = ["민지", "요리왕", "쉐프김", "맛집탐방"]

export default function ProfileEditPage() {
  const router = useRouter()
  const { user, isLoggedIn, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGettingLocation, setIsGettingLocation] = React.useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [locationDialogOpen, setLocationDialogOpen] = React.useState(false)
  const [pendingLocation, setPendingLocation] = React.useState("")
  const [nicknameError, setNicknameError] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [profileImagePreview, setProfileImagePreview] = React.useState<string | null>(null)

  const [formData, setFormData] = React.useState({
    name: user?.name || "",
    nickname: user?.nickname || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    preferredTime: "30분 이내",
    dietary: "일반식",
    categories: [] as string[],
  })

  const [passwordData, setPasswordData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  React.useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        nickname: user.nickname || "",
        email: user.email,
        bio: user.bio || "",
        location: user.location || "",
      }))
      if (user.profileImage) {
        setProfileImagePreview(user.profileImage)
      }
    }
  }, [user])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const checkNicknameDuplicate = (nickname: string) => {
    if (!nickname.trim()) {
      setNicknameError("")
      return
    }
    if (nickname === user?.nickname) {
      setNicknameError("")
      return
    }
    if (mockNicknames.includes(nickname)) {
      setNicknameError("이미 사용 중인 닉네임입니다")
    } else {
      setNicknameError("")
    }
  }

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({ ...formData, nickname: value })
    checkNicknameDuplicate(value)
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.")
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          let mockAddress = "서울 강남구"

          if (latitude >= 36.2 && latitude <= 36.5 && longitude >= 127.3 && longitude <= 127.5) {
            mockAddress = "대전 서구 둔산동"
          } else if (latitude >= 37.4 && latitude <= 37.7 && longitude >= 126.8 && longitude <= 127.2) {
            mockAddress = "서울 강남구"
          } else if (latitude >= 35.1 && latitude <= 35.3 && longitude >= 128.9 && longitude <= 129.2) {
            mockAddress = "부산 해운대구"
          }

          setPendingLocation(mockAddress)
          setLocationDialogOpen(true)
        } catch {
          setPendingLocation("위치를 가져올 수 없습니다")
          setLocationDialogOpen(true)
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        alert("위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.")
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  const handleConfirmLocation = () => {
    setFormData((prev) => ({ ...prev, location: pendingLocation }))
    setLocationDialogOpen(false)
    setPendingLocation("")
  }

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const handleSaveProfile = async () => {
    if (nicknameError) {
      alert("닉네임을 확인해주세요.")
      return
    }
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    updateProfile({
      name: formData.name,
      nickname: formData.nickname,
      bio: formData.bio,
      location: formData.location,
      profileImage: profileImagePreview || undefined,
    })
    setIsLoading(false)
    router.push("/mypage")
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.")
      return
    }
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setIsLoading(false)
    alert("비밀번호가 변경되었습니다.")
  }

  const passwordRequirements = [
    { label: "8자 이상", met: passwordData.newPassword.length >= 8 },
    { label: "영문 포함", met: /[a-zA-Z]/.test(passwordData.newPassword) },
    { label: "숫자 포함", met: /\d/.test(passwordData.newPassword) },
  ]

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <Link href="/mypage">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              마이페이지로 돌아가기
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">프로필 수정</h1>

        <div className="space-y-6">
          {/* Profile Image */}
          <Card>
            <CardHeader>
              <CardTitle>프로필 사진</CardTitle>
              <CardDescription>프로필에 표시될 사진을 설정하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileImagePreview || user?.profileImage || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">
                      {user?.nickname?.charAt(0) || user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    사진 변경
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG 파일, 최대 5MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info - 이름, 닉네임 분리 및 이메일 수정 불가 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>이름, 닉네임, 이메일 정보를 확인하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 (실명)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname">닉네임 (표시 이름)</Label>
                  <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={handleNicknameChange}
                    placeholder="닉네임을 입력하세요"
                    className={nicknameError ? "border-destructive" : ""}
                  />
                  {nicknameError && <p className="text-xs text-destructive">{nicknameError}</p>}
                  {!nicknameError && formData.nickname && formData.nickname !== user?.nickname && (
                    <p className="text-xs text-green-600">사용 가능한 닉네임입니다</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">자기소개</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="간단한 자기소개를 작성하세요"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location - 현재 위치 버튼 클릭 후 확인 다이얼로그 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#800020]" />내 위치
              </CardTitle>
              <CardDescription>재료 나눔을 위한 위치 정보를 등록하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="예: 대전 서구 둔산동"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="gap-2 bg-transparent"
                >
                  {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                  현재 위치
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                위치 정보는 주변 재료 나눔 게시글을 찾는 데 사용됩니다.
                {isGettingLocation && " GPS로 위치를 탐색 중입니다..."}
              </p>
            </CardContent>
          </Card>

          {/* Cooking Profile - 주방환경, 요리 실력 제거 / 카테고리 추가 */}
          <Card>
            <CardHeader>
              <CardTitle>요리 프로필</CardTitle>
              <CardDescription>AI가 더 정확한 레시피를 추천할 수 있도록 설정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>선호 조리시간</Label>
                  <Select
                    value={formData.preferredTime}
                    onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15분 이내">15분 이내</SelectItem>
                      <SelectItem value="30분 이내">30분 이내</SelectItem>
                      <SelectItem value="1시간 이내">1시간 이내</SelectItem>
                      <SelectItem value="상관없음">상관없음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>식단 유형</Label>
                  <Select
                    value={formData.dietary}
                    onValueChange={(value) => setFormData({ ...formData, dietary: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="일반식">일반식</SelectItem>
                      <SelectItem value="다이어트">다이어트</SelectItem>
                      <SelectItem value="채식">채식</SelectItem>
                      <SelectItem value="비건">비건</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>선호 카테고리 (복수 선택 가능)</Label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((cat) => (
                    <div key={cat.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={cat.value}
                        checked={formData.categories.includes(cat.value)}
                        onCheckedChange={() => handleCategoryToggle(cat.value)}
                      />
                      <label
                        htmlFor={cat.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {cat.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle>비밀번호 변경</CardTitle>
              <CardDescription>계정 보안을 위해 정기적으로 비밀번호를 변경하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">현재 비밀번호</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="현재 비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="새 비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordData.newPassword && (
                  <div className="flex gap-3 mt-2">
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.label}
                        className={`flex items-center gap-1 text-xs ${req.met ? "text-[#800020]" : "text-muted-foreground"}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? "bg-[#800020]/20" : "bg-muted"}`}
                        >
                          {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        </div>
                        {req.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-xs text-destructive">비밀번호가 일치하지 않습니다</p>
                )}
              </div>
              <Button
                onClick={handleChangePassword}
                variant="outline"
                disabled={
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  passwordData.newPassword !== passwordData.confirmPassword
                }
              >
                비밀번호 변경
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => router.push("/mypage")}>
              취소
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isLoading || !!nicknameError}
              className="bg-[#800020] hover:bg-[#800020]/90"
            >
              {isLoading ? "저장 중..." : "변경사항 저장"}
            </Button>
          </div>
        </div>
      </main>

      {/* 위치 확인 다이얼로그 */}
      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>위치 확인</DialogTitle>
            <DialogDescription>현재 위치가 맞는지 확인해주세요.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <MapPin className="h-5 w-5 text-[#800020]" />
              <span className="font-medium">{pendingLocation}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLocationDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleConfirmLocation} className="bg-[#800020] hover:bg-[#800020]/90">
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
