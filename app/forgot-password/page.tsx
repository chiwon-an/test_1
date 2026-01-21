"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Star, ArrowLeft, Mail, KeyRound, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DotPatternBackground } from "@/components/ui/dot-pattern-background"

type Step = "email" | "verify" | "reset" | "complete"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>("email")
  const [email, setEmail] = React.useState("")
  const [name, setName] = React.useState("")
  const [verificationCode, setVerificationCode] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [sentCode, setSentCode] = React.useState("")

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate sending code
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const code = Math.random().toString().slice(2, 8)
    setSentCode(code)
    alert(`인증 코드가 발송되었습니다: ${code}`)
    setStep("verify")
    setIsLoading(false)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (verificationCode === sentCode) {
      setStep("reset")
    } else {
      alert("인증 코드가 일치하지 않습니다.")
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.")
      return
    }
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setStep("complete")
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <KeyRound className="h-20 w-20 mx-auto text-[#800020] mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">비밀번호 찾기</h1>
          <p className="text-muted-foreground max-w-sm">
            가입하신 이메일로 인증 코드를 보내드립니다.
            <br />
            인증 후 새 비밀번호를 설정하세요.
          </p>
        </motion.div>
      </DotPatternBackground>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#800020]">
              <Star className="h-6 w-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">미슐랭 0스타</span>
          </div>

          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              로그인으로 돌아가기
            </Link>
          </Button>

          {/* Step 1: Email */}
          {step === "email" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">이메일 확인</h2>
                <p className="text-muted-foreground">가입하신 이메일과 이름을 입력해주세요</p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <Button type="submit" className="w-full h-12 bg-[#800020] hover:bg-[#800020]/90" disabled={isLoading}>
                  <Mail className="h-4 w-4 mr-2" />
                  {isLoading ? "발송 중..." : "인증 코드 발송"}
                </Button>
              </form>
            </motion.div>
          )}

          {/* Step 2: Verify Code */}
          {step === "verify" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">인증 코드 확인</h2>
                <p className="text-muted-foreground">이메일로 전송된 6자리 코드를 입력해주세요</p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">인증 코드</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="6자리 코드 입력"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    maxLength={6}
                    className="h-12 text-center text-2xl tracking-widest"
                  />
                </div>
                <Button type="submit" className="w-full h-12 bg-[#800020] hover:bg-[#800020]/90">
                  인증 확인
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("email")}>
                  이메일 다시 입력
                </Button>
              </form>
            </motion.div>
          )}

          {/* Step 3: Reset Password */}
          {step === "reset" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">새 비밀번호 설정</h2>
                <p className="text-muted-foreground">새로운 비밀번호를 입력해주세요</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">새 비밀번호</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="새 비밀번호 입력"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="비밀번호 다시 입력"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive">비밀번호가 일치하지 않습니다</p>
                  )}
                </div>
                <Button type="submit" className="w-full h-12 bg-[#800020] hover:bg-[#800020]/90" disabled={isLoading}>
                  {isLoading ? "변경 중..." : "비밀번호 변경"}
                </Button>
              </form>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {step === "complete" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-[#800020]/10 flex items-center justify-center mx-auto">
                <Check className="h-10 w-10 text-[#800020]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">비밀번호 변경 완료</h2>
                <p className="text-muted-foreground">새 비밀번호로 로그인해주세요</p>
              </div>
              <Button asChild className="w-full h-12 bg-[#800020] hover:bg-[#800020]/90">
                <Link href="/login">로그인하러 가기</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
