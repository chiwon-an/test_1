"use client"

import * as React from "react"
import { motion, useAnimate } from "framer-motion"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/cook-sync/navbar"
import { ScrollToTop } from "@/components/cook-sync/scroll-to-top"
import { ClaudeChatInput } from "@/components/cook-sync/claude-chat-input"
import { RecipeDetailView } from "@/components/cook-sync/recipe-detail-view"
import { StepCookMode } from "@/components/cook-sync/step-cook-mode"
import { CompleteCookDialog } from "@/components/cook-sync/complete-cook-dialog"
import { ChatMessageList } from "@/components/ui/chat-message-list"
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat-bubble"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { searchRecipes, leftoverRecipes } from "@/lib/dummy-data"
import type { Recipe, ChatMessage } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, Clock, Users, Flame } from "lucide-react"
import Image from "next/image"

const suggestedPrompts = ["잡채 레시피 알려줘", "나 오늘 우울한데 먹을만한 거 추천해줘", "매운 오징어 요리 찾아줘"]

type ViewState = "chat" | "recommendations" | "detail" | "cooking"

export default function HomePage() {
  const router = useRouter()
  const { user, isLoggedIn } = useAuth()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [viewState, setViewState] = React.useState<ViewState>("chat")
  const [selectedRecipe, setSelectedRecipe] = React.useState<Recipe | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = React.useState(false)
  const [currentRecipes, setCurrentRecipes] = React.useState<Recipe[]>([])
  const chatContainerRef = React.useRef<HTMLDivElement>(null)

  const [scope, animate] = useAnimate()
  const animationRef = React.useRef<boolean>(true)

  const userCookingProfile = {
    name: isLoggedIn && user ? (user.nickname || user.name) : "셰프",
    level: "초급",
    preferredTime: "30분 이내",
    dietary: "일반식",
    kitchen: "1인 가구",
    location: isLoggedIn && user?.location ? user.location : "위치 미등록",
  }

  React.useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        })
      }, 100)
    }
  }, [messages])

  React.useEffect(() => {
    if (viewState !== "chat") {
      animationRef.current = false
      return
    }

    animationRef.current = true

    const runAnimation = async () => {
      const tags = ["#tag-korean", "#tag-quick", "#tag-healthy", "#tag-comfort"]

      while (animationRef.current) {
        for (const tag of tags) {
          if (!animationRef.current) break

          try {
            await animate("#pointer", { x: 0, y: 0 }, { duration: 0 })

            const tagEl = scope.current?.querySelector(tag)
            if (!tagEl || !scope.current || !animationRef.current) continue

            const tagRect = tagEl.getBoundingClientRect()
            const scopeRect = scope.current.getBoundingClientRect()

            await animate(
              "#pointer",
              {
                x: tagRect.left - scopeRect.left + tagRect.width / 2 - 10,
                y: tagRect.top - scopeRect.top + tagRect.height / 2 - 10,
              },
              { duration: 0.5, ease: "easeInOut" },
            )

            if (!animationRef.current) break

            await animate(tag, { opacity: 1, scale: 1.05 }, { duration: 0.2 })

            await new Promise((resolve) => setTimeout(resolve, 800))

            if (!animationRef.current) break

            await animate(tag, { opacity: 0.5, scale: 1 }, { duration: 0.2 })
          } catch {
            break
          }
        }
      }
    }

    const timer = setTimeout(() => {
      runAnimation()
    }, 100)

    return () => {
      animationRef.current = false
      clearTimeout(timer)
    }
  }, [animate, scope, viewState])

  const handleSendMessage = (message: string, image?: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message || (image ? "[이미지 첨부]" : ""),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    setTimeout(() => {
      const matchedRecipes = searchRecipes(message)
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `"${message || "이미지"}"에 대한 추천 레시피 ${matchedRecipes.length}가지를 찾았어요!`,
        timestamp: new Date(),
        recipes: matchedRecipes,
      }
      setMessages((prev) => [...prev, aiMessage])
      setCurrentRecipes(matchedRecipes)
      setViewState("recommendations")
      setIsLoading(false)
    }, 1000)
  }

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setCurrentStepIndex(0)
    setViewState("detail")
  }

  const handleStartCooking = () => {
    setViewState("cooking")
  }

  const handleCompleteCooking = () => {
    setShowCompleteDialog(true)
  }

  const handleBack = () => {
    if (viewState === "cooking") {
      setViewState("detail")
    } else if (viewState === "detail") {
      setViewState("recommendations")
    } else if (viewState === "recommendations") {
      setViewState("chat")
      setMessages([])
      setCurrentRecipes([])
    }
  }

  const handleSelectLeftover = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setCurrentStepIndex(0)
    setViewState("detail")
  }

  const handleResetToHome = () => {
    setViewState("chat")
    setMessages([])
    setCurrentRecipes([])
    setSelectedRecipe(null)
    setCurrentStepIndex(0)
    setIsLoading(false)
    setShowCompleteDialog(false)
  }

  const handleGoHome = () => {
    setShowCompleteDialog(false)
    handleResetToHome()
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar onLogoClick={handleResetToHome} />
      <ScrollToTop />

      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-8 min-h-[calc(100vh-200px)]">
          {/* Back Button */}
          {viewState !== "chat" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mb-4 text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                뒤로가기
              </Button>
            </motion.div>
          )}

          {/* Status Badge */}
          <div className="mb-6 flex justify-center"></div>

          {/* Chat View */}
          {viewState === "chat" && (
            <div className="space-y-8">
              <div className="relative min-h-[400px] flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 p-8 lg:p-10">
                <motion.div
                  initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative h-[240px] w-[280px] shrink-0"
                  ref={scope}
                >
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                    <motion.div
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center shadow-lg"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      <Image src="/michelin-star.png" alt="미슐랭 별" width={32} height={32} />
                    </motion.div>
                  </div>

                  <div
                    id="tag-korean"
                    className="absolute bottom-12 left-6 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 opacity-50"
                  >
                    한식
                  </div>
                  <div
                    id="tag-quick"
                    className="absolute left-0 top-12 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600 opacity-50"
                  >
                    간편요리
                  </div>
                  <div
                    id="tag-healthy"
                    className="absolute bottom-20 right-0 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-600 opacity-50"
                  >
                    건강식
                  </div>
                  <div
                    id="tag-comfort"
                    className="absolute right-4 top-4 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-600 opacity-50"
                  >
                    30분컷요리
                  </div>

                  <div id="pointer" className="absolute flex items-start">
                    <svg
                      width="18"
                      height="20"
                      viewBox="0 0 12 13"
                      className="fill-[#800020]"
                      stroke="white"
                      strokeWidth="1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 5.50676L0 0L2.83818 13L6.30623 7.86537L12 5.50676V5.50676Z"
                      />
                    </svg>
                    <Image
                      src="/chef_cursor.png"
                      alt="AI Chef"
                      width={20}
                      height={20}
                      className="relative top-0.5 left-0.5"
                    />
                  </div>
                </motion.div>

                {/* Right: Content */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex items-center gap-2 mb-4"
                  >
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#800020]/10 text-[#800020] text-sm font-semibold border border-[#800020]/20">
                      <Image src="/michelin-star.png" alt="미슐랭 별" width={16} height={16} />
                      미슐랭 {isLoggedIn && user ? user.stars : 0}스타
                    </div>
                  </motion.div>

                  <motion.h1
                    initial={{ filter: "blur(10px)", opacity: 0, y: 30 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="font-bold mb-4"
                  >
                    <span className="text-2xl lg:text-[36px] text-foreground leading-tight block">
                      <span className="text-[#800020]">{userCookingProfile.name}</span>님,
                    </span>
                    <span className="text-2xl lg:text-[36px] text-foreground leading-tight block mt-1">
                      오늘은 어떤 요리에 도전하시겠어요?
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-muted-foreground mb-6 text-sm lg:text-base leading-relaxed"
                  >
                    AI가 당신의 취향과 재료에 맞는 레시피를 찾아드려요.
                    <br />
                    핸즈프리로 요리하고, 남은 재료는 이웃과 나눠보세요!
                  </motion.p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
              >
                <ClaudeChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  suggestedPrompts={suggestedPrompts}
                  enableImageUpload={false}
                />
              </motion.div>
            </div>
          )}

          {viewState === "recommendations" && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
              className="h-[calc(100vh-180px)] flex gap-6"
            >
              <div className="w-1/2 flex flex-col border-r pr-6">
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
                  <ChatMessageList smooth>
                    {messages.map((msg) => (
                      <div key={msg.id}>
                        {msg.role === "user" && (
                          <ChatBubble variant="sent">
                            <ChatBubbleAvatar
                              className="h-8 w-8 shrink-0"
                              src={user?.profileImage || "/placeholder.svg?height=32&width=32&query=user avatar"}
                              fallback={user?.name?.charAt(0) || userCookingProfile.name.charAt(0)}
                            />
                            <ChatBubbleMessage variant="sent">{msg.content}</ChatBubbleMessage>
                          </ChatBubble>
                        )}
                        {msg.role === "assistant" && (
                          <ChatBubble variant="received">
                            <ChatBubbleAvatar className="h-8 w-8 shrink-0" src="/chef_bot.jpg" fallback="AI" />
                            <ChatBubbleMessage variant="received">{msg.content}</ChatBubbleMessage>
                          </ChatBubble>
                        )}
                      </div>
                    ))}

                    {isLoading && (
                      <ChatBubble variant="received">
                        <ChatBubbleAvatar className="h-8 w-8 shrink-0" src="/chef_bot.jpg" fallback="AI" />
                        <ChatBubbleMessage isLoading />
                      </ChatBubble>
                    )}
                  </ChatMessageList>
                </div>

                <div className="pt-4 border-t bg-background">
                  <ClaudeChatInput
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    placeholder="추가로 궁금한 게 있으면 물어보세요..."
                    enableImageUpload={false}
                  />
                </div>
              </div>

              <div className="w-1/2 overflow-y-auto px-2 py-2">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">추천 레시피</h3>
                  <p className="text-sm text-muted-foreground">클릭하여 상세 정보를 확인하세요</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {currentRecipes.map((recipe) => (
                    <Card
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe)}
                      className="cursor-pointer group overflow-hidden transition-all hover:shadow-lg hover:ring-2 hover:ring-[#800020]/30
                      p-0"
                    >
                      <div className="flex items-center gap-5 px-4 py-3">
                        {/* 이미지 영역 - 크기 더 증가 */}
                        <div className="relative w-44 aspect-[4/3] shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={recipe.thumbnail || "/placeholder.svg"}
                            alt={recipe.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>

                        {/* Content - 균일한 세로 간격 */}
                        <div className="flex flex-col justify-center gap-2">
                          {/* 레시피명 크기 더 증가 */}
                          <h4 className="font-bold text-xl leading-snug line-clamp-2">{recipe.name}</h4>

                          {/* 태그 표시 */}
                          <div className="flex flex-wrap gap-1.5">
                            {recipe.tags?.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs text-[#800020] font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* 조리시간, 인분 수, 칼로리 정보 */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {recipe.duration}분
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {recipe.servings}인분
                            </span>
                            {recipe.calories && (
                              <span className="flex items-center gap-1">
                                <Flame className="h-4 w-4" />
                                {recipe.calories}kcal
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Recipe Detail View */}
          {viewState === "detail" && selectedRecipe && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
            >
              <RecipeDetailView recipe={selectedRecipe} onStartCooking={handleStartCooking} />
            </motion.div>
          )}

          {/* Cooking Mode View */}
          {viewState === "cooking" && selectedRecipe && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
              className="space-y-6"
            >
              <StepCookMode
                steps={selectedRecipe.steps}
                currentStepIndex={currentStepIndex}
                onStepChange={setCurrentStepIndex}
                onComplete={handleCompleteCooking}
                recipeName={selectedRecipe.name}
              />
            </motion.div>
          )}
        </div>
      </main>

      {/* Complete Dialog */}
      <CompleteCookDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        completedRecipe={selectedRecipe}
        leftoverRecipes={leftoverRecipes}
        onSelectLeftover={handleSelectLeftover}
        onGoHome={handleGoHome}
      />
    </div>
  )
}
