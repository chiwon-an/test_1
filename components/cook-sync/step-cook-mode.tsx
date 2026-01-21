"use client"

import * as React from "react"
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Timer,
  ChefHat,
  Lightbulb,
  CheckCircle2,
  SkipForward,
  Mic,
  MicOff,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { RecipeStep } from "@/lib/types"

type SkillLevel = "beginner" | "intermediate" | "expert"

interface StepCookModeProps {
  steps: RecipeStep[]
  currentStepIndex: number
  onStepChange: (index: number) => void
  onComplete: () => void
  recipeName?: string
}

function WaveText({ text }: { text: string }) {
  return (
    <span className="inline-flex">
      {text.split("").map((char, i) => (
        <span key={i} className="animate-wave-char" style={{ animationDelay: `${i * 0.1}s` }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  )
}

const getAdjustedDuration = (baseDuration: number, level: SkillLevel) => {
  switch (level) {
    case "expert":
      return Math.round(baseDuration * 0.75)
    case "beginner":
      return Math.round(baseDuration * 1.25)
    default:
      return baseDuration
  }
}

export function StepCookMode({ steps, currentStepIndex, onStepChange, onComplete, recipeName }: StepCookModeProps) {
  const [skillLevel, setSkillLevel] = React.useState<SkillLevel>("intermediate")
  const [timerSeconds, setTimerSeconds] = React.useState(0)
  const [isTimerRunning, setIsTimerRunning] = React.useState(false)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())
  const [autoAdvance, setAutoAdvance] = React.useState(true)
  const [isListening, setIsListening] = React.useState(false)
  const pendingAdvanceRef = React.useRef(false)
  const prevStepRef = React.useRef(currentStepIndex)
  const prevSkillLevelRef = React.useRef(skillLevel)

  const currentStep = steps[currentStepIndex]
  const totalProgress = ((currentStepIndex + (completedSteps.has(currentStepIndex) ? 1 : 0)) / steps.length) * 100
  const adjustedDuration = getAdjustedDuration(currentStep.duration, skillLevel)

  React.useEffect(() => {
    if (prevStepRef.current !== currentStepIndex) {
      setTimerSeconds(getAdjustedDuration(currentStep.duration, skillLevel))
      if (currentStepIndex > 0) {
        setIsTimerRunning(true)
        setIsListening(true)
      }
    }
    prevStepRef.current = currentStepIndex
  }, [currentStepIndex, currentStep.duration, skillLevel])

  React.useEffect(() => {
    if (prevSkillLevelRef.current !== skillLevel) {
      const prevAdjusted = getAdjustedDuration(currentStep.duration, prevSkillLevelRef.current)
      const newAdjusted = getAdjustedDuration(currentStep.duration, skillLevel)

      if (prevAdjusted > 0) {
        const proportionRemaining = timerSeconds / prevAdjusted
        const newRemainingTime = Math.round(newAdjusted * proportionRemaining)
        setTimerSeconds(newRemainingTime)
      } else {
        setTimerSeconds(newAdjusted)
      }

      prevSkillLevelRef.current = skillLevel
    }
  }, [skillLevel, currentStep.duration, timerSeconds])

  React.useEffect(() => {
    if (pendingAdvanceRef.current) {
      pendingAdvanceRef.current = false
      setCompletedSteps((prev) => new Set([...prev, currentStepIndex]))
      if (currentStepIndex < steps.length - 1) {
        onStepChange(currentStepIndex + 1)
      } else {
        onComplete()
      }
    }
  }, [timerSeconds, currentStepIndex, steps.length, onStepChange, onComplete])

  React.useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          const newValue = prev - 1
          if (newValue <= 0) {
            setIsTimerRunning(false)
            setIsListening(false)
            if (autoAdvance) {
              pendingAdvanceRef.current = true
            }
            return 0
          }
          return newValue
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timerSeconds, autoAdvance])

  const handleStartTimer = () => {
    if (timerSeconds === 0) {
      setTimerSeconds(adjustedDuration)
    }
    setIsTimerRunning(true)
    setIsListening(true)
  }

  const handlePauseTimer = () => {
    setIsTimerRunning(false)
    setIsListening(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1)
    }
  }

  const handleNextStep = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStepIndex]))
    if (currentStepIndex < steps.length - 1) {
      onStepChange(currentStepIndex + 1)
    } else {
      onComplete()
    }
  }

  const handleStepClick = (index: number) => {
    if (index < currentStepIndex) {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev)
        for (let i = index; i < currentStepIndex; i++) {
          newSet.delete(i)
        }
        return newSet
      })
    }
    onStepChange(index)
  }

  const handleVoiceToggle = () => {
    setIsListening(!isListening)
  }

  const handleAddTime = () => {
    setTimerSeconds((prev) => prev + 120)
  }

  const handleSkillLevelChange = (newLevel: SkillLevel) => {
    setSkillLevel(newLevel)
  }

  const timerProgress = adjustedDuration > 0 ? ((adjustedDuration - timerSeconds) / adjustedDuration) * 100 : 0

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Header with Progress - Compact */}
      <div className="flex-shrink-0 bg-background border-b px-4 py-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#800020]/10 flex items-center justify-center">
              <ChefHat className="h-4 w-4 text-[#800020]" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">{recipeName || "요리 중"}</h2>
              <p className="text-xs text-muted-foreground">
                {currentStepIndex + 1} / {steps.length} 단계
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            {Math.round(totalProgress)}% 완료
          </Badge>
        </div>
        <Progress value={totalProgress} className="h-1.5" />
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* 상단: 이미지와 설명 */}
        <div className="flex gap-4 h-[360px]">
          {/* Step Image */}
          <div className="relative rounded-xl overflow-hidden bg-muted shadow-lg w-1/2 h-full">
            <img
              src={currentStep.imageUrl || "/placeholder.svg"}
              alt={currentStep.action}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <Badge className="bg-[#800020] text-white text-sm px-3 py-1 shadow-lg">
                STEP {currentStep.stepNumber}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div className="flex-1 h-full flex flex-col gap-3 overflow-hidden p-2 min-h-0">
            <div className="flex-shrink-0">
              <h3 className="text-xl font-bold text-foreground">{currentStep.action}</h3>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
              <p className="text-base text-muted-foreground leading-relaxed">{currentStep.description}</p>

              {currentStep.tips && (
                <div className="flex items-start gap-2 p-3 bg-[#800020]/5 rounded-lg border border-[#800020]/10">
                  <Lightbulb className="h-5 w-5 text-[#800020] mt-0.5 flex-shrink-0" />
                  <p className="text-base text-foreground">{currentStep.tips}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단: 타이머와 숙련도/음성제어 (높이 반으로, 밑면 일직선) */}
        <div className="flex gap-4 h-[260px] items-end">
          {/* Timer */}
          <div className="w-1/2 h-full p-4 bg-gradient-to-br from-[#800020] to-[#800020]/80 rounded-xl text-white shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                <span className="font-semibold text-base">타이머</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold tabular-nums tracking-tight">{formatTime(timerSeconds)}</div>
              <Progress value={timerProgress} className="h-2 mt-2 w-full bg-white/30 [&>div]:bg-white" />
            </div>

            <div className="flex justify-center gap-2 mt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={isTimerRunning ? handlePauseTimer : handleStartTimer}
                className="bg-white text-[#800020] hover:bg-white/90 gap-1.5 px-4 h-8 text-sm font-semibold"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="h-4 w-4" />
                    정지
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    시작
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTimerSeconds(adjustedDuration)}
                className="bg-white/20 text-white hover:bg-white/30 h-8 px-3 text-sm font-semibold"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                리셋
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddTime}
                className="bg-white/20 text-white hover:bg-white/30 text-sm h-8 px-3 font-semibold"
              >
                +2분
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-white/20 text-sm">
              <SkipForward className="h-4 w-4" />
              <span className="font-medium">자동 다음 단계</span>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={autoAdvance}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setAutoAdvance((prev) => (prev === checked ? prev : checked))
                  }}
                />
                <span className="relative inline-flex h-[1.15rem] w-8 items-center rounded-full bg-white/80 peer-checked:bg-blue-500 transition-all scale-90">
                  <span className="pointer-events-none block size-4 rounded-full bg-background transition-transform translate-x-0 peer-checked:translate-x-[calc(100%-2px)]" />
                </span>
              </label>
            </div>
          </div>

          {/* 숙련도 + 음성제어 (가로 배치, 높이 절반으로 줄이고 타이머 밑면과 정렬) */}
          <div className="flex-1 flex gap-3 h-[50%]">
            {/* Skill Level Card */}
            <div className="flex-1 p-4 bg-card rounded-lg border shadow-sm flex flex-col min-h-[140px]">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-[#800020]" />
                숙련도
              </h4>
              <div className="flex-1 flex flex-row gap-2 items-center justify-center">
                <Button
                  variant={skillLevel === "expert" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSkillLevelChange("expert")}
                  className={cn(
                    "h-14 text-xs flex-col justify-center px-3 flex-1",
                    skillLevel === "expert" && "bg-[#800020] hover:bg-[#800020]/90",
                  )}
                >
                  <span className="font-semibold">고수</span>
                  <span className="opacity-70 text-[10px]">75%</span>
                </Button>
                <Button
                  variant={skillLevel === "intermediate" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSkillLevelChange("intermediate")}
                  className={cn(
                    "h-14 text-xs flex-col justify-center px-3 flex-1",
                    skillLevel === "intermediate" && "bg-[#800020] hover:bg-[#800020]/90",
                  )}
                >
                  <span className="font-semibold">중수</span>
                  <span className="opacity-70 text-[10px]">100%</span>
                </Button>
                <Button
                  variant={skillLevel === "beginner" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSkillLevelChange("beginner")}
                  className={cn(
                    "h-14 text-xs flex-col justify-center px-3 flex-1",
                    skillLevel === "beginner" && "bg-[#800020] hover:bg-[#800020]/90",
                  )}
                >
                  <span className="font-semibold">초보</span>
                  <span className="opacity-70 text-[10px]">125%</span>
                </Button>
              </div>
            </div>

            {/* Voice Control Card */}
            <div className="flex-1 p-4 bg-card rounded-lg border shadow-sm flex flex-col min-h-[140px]">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Mic className="h-4 w-4 text-[#800020]" />
                음성 제어
              </h4>

              <div className="flex-1 flex flex-col gap-2 justify-center">
                <Button
                  variant={isListening ? "default" : "outline"}
                  size="sm"
                  onClick={handleVoiceToggle}
                  className={cn(
                    "gap-2 w-full h-8 text-xs font-semibold",
                    isListening && "bg-[#800020] hover:bg-[#800020]/90",
                  )}
                >
                  {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  {isListening ? "듣는 중" : "음성 명령"}
                </Button>

                {isListening ? (
                  <div className="flex-1 flex items-center justify-center p-2 bg-[#800020]/10 rounded-md min-h-[44px]">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🎤</span>
                      <span className="text-[#800020] font-bold text-sm">
                        <WaveText text="말씀하세요..." />
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center text-xs text-muted-foreground px-1 min-h-[44px]">
                    <p>&apos;이전&apos; / &apos;다음&apos;</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0 bg-background border-t py-2.5 px-4">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="gap-1.5 bg-transparent h-11 px-10 text-sm font-medium flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">이전</span>
          </Button>

          <div className="flex items-center gap-1">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleStepClick(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStepIndex
                    ? "bg-[#800020] w-5"
                    : completedSteps.has(index) || index < currentStepIndex
                      ? "bg-[#800020]/60"
                      : "bg-muted-foreground/30",
                )}
              />
            ))}
          </div>

          <Button
            size="sm"
            onClick={handleNextStep}
            className="gap-1.5 bg-[#800020] hover:bg-[#800020]/90 h-11 px-10 text-sm font-medium flex-shrink-0"
          >
            {currentStepIndex === steps.length - 1 ? (
              <>
                <span>완료</span>
                <CheckCircle2 className="h-4 w-4" />
              </>
            ) : (
              <>
                <span className="hidden sm:inline">다음</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
