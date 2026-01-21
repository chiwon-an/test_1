"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Star, Eye, EyeOff, Check, Mic, Users, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DotPatternBackground } from "@/components/ui/dot-pattern-background"
import { Highlight } from "@/components/ui/text-highlight"
import { useAuth } from "@/lib/auth-context"

const features = [
  { icon: Mic, label: "핸즈프리 요리", desc: "음성으로 레시피를 따라가세요" },
  { icon: Users, label: "재료 N빵", desc: "이웃과 남은 재료를 나눠요" },
  { icon: Search, label: "다양한 레시피", desc: "AI가 맞춤 레시피를 추천해요" },
]

const mockNicknames = ["민지", "요리왕", "쉐프김", "맛집탐방"]

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const [showPassword, setShowPassword] = React.useState(false)
  const [nicknameError, setNicknameError] = React.useState("")
  const [formData, setFormData] = React.useState({
    name: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const passwordRequirements = [
    { label: "8자 이상", met: formData.password.length >= 8 },
    { label: "영문 포함", met: /[a-zA-Z]/.test(formData.password) },
    { label: "숫자 포함", met: /\d/.test(formData.password) },
    { label: "특수기호 포함", met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
  ]

  const allRequirementsMet = passwordRequirements.every((req) => req.met)

  const checkNicknameDuplicate = (nickname: string) => {
    if (!nickname.trim()) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.")
      return
    }
    if (!allRequirementsMet) {
      alert("비밀번호 조건을 모두 충족해주세요.")
      return
    }
    if (nicknameError) {
      alert("닉네임을 확인해주세요.")
      return
    }
    if (!formData.nickname.trim()) {
      alert("닉네임을 입력해주세요.")
      return
    }
    setIsLoading(true)
    try {
      await signup({
        name: formData.name,
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password,
      })
      router.push("/")
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Features */}
      <DotPatternBackground
        containerClassName="hidden lg:flex lg:w-1/2 min-h-screen bg-background"
        className="flex flex-col justify-center items-center w-full p-12"
      >
        <div className="flex items-center gap-3 mb-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#800020] shadow-lg">
            <Star className="h-8 w-8 text-white fill-white" />
          </div>
          <span className="text-3xl font-bold tracking-tight">미슐랭 0스타</span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [20, -5, 0] }}
          transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
          className="text-3xl md:text-4xl lg:text-[36px] font-bold text-foreground max-w-xl leading-relaxed lg:leading-snug text-center"
        >
          회원가입 후 다양한 요리를 즐기고
          <br />
          <Highlight className="text-foreground">알뜰하게 나누세요</Highlight>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-10 space-y-4 w-full max-w-sm"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.15 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-[#800020]/10 flex items-center justify-center shrink-0">
                <feature.icon className="w-6 h-6 text-[#800020]" />
              </div>
              <div>
                <span className="font-semibold text-foreground">{feature.label}</span>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </DotPatternBackground>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#800020]">
              <Star className="h-6 w-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">미슐랭 0스타</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">회원가입</h2>
            <p className="text-muted-foreground">새 계정을 만들고 요리를 시작하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름 (실명)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="요리초보"
                  value={formData.nickname}
                  onChange={handleNicknameChange}
                  required
                  className={`h-12 ${nicknameError ? "border-destructive" : ""}`}
                />
                {nicknameError && <p className="text-xs text-destructive">{nicknameError}</p>}
                {!nicknameError && formData.nickname && (
                  <p className="text-xs text-green-600">사용 가능한 닉네임입니다</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {passwordRequirements.map((req) => (
                  <div
                    key={req.label}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${req.met ? "bg-[#800020]/10 text-[#800020]" : "bg-muted text-muted-foreground"}`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${req.met ? "bg-[#800020]" : "bg-muted-foreground/30"}`}
                    >
                      {req.met && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    {req.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="h-12"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive">비밀번호가 일치하지 않습니다</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-[#800020] hover:bg-[#800020]/90"
              disabled={isLoading || !allRequirementsMet || !!nicknameError}
            >
              {isLoading ? "가입 중..." : "회원가입"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="h-12 bg-transparent">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </Button>
            <Button variant="outline" className="h-12 bg-[#03C75A] hover:bg-[#03C75A]/90 text-white border-[#03C75A]">
              <span className="font-bold text-lg">N</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] border-[#FEE500]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"
                />
              </svg>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-medium text-[#800020] hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
