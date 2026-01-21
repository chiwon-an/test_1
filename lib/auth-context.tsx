"use client"

import * as React from "react"

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}


function storageKey(base: string, userId?: string | null): string {
  return userId ? `${base}:${userId}` : base
}


interface User {
  id: string
  name: string
  nickname: string
  email: string
  profileImage?: string
  level: string
  bio: string
  location?: string
  stars: number
  todayStars: number
  lastStarDate: string
}

interface LikedRecipe {
  id: string
  title: string
  image: string
  author: string
  savedAt: string
}

interface Message {
  id: string
  recipientId: string
  recipientName: string
  recipientAvatar?: string
  content: string
  timestamp: string
  isRead: boolean
  isSentByMe: boolean
}

interface Conversation {
  id: string
  recipientId: string
  recipientName: string
  recipientAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

interface UserRecipe {
  id: string
  title: string
  description: string
  category: string
  servings: number
  thumbnail: string
  tags: string[]
  ingredients: {
    name: string
    amount: string
  }[]
  steps: {
    id: number
    action: string
    description: string
    duration: number
    imagePreview: string | null
    tips: string
  }[]
  createdAt: string
}

interface UserPost {
  id: string
  title: string
  description: string
  price: string
  image: string
  place: string
  likes: number
  createdAt: string
  status: "available" | "completed"
}


type LikedPost = UserPost & { savedAt: string }

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: { name: string; nickname: string; email: string; password: string }) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
  likedRecipes: LikedRecipe[]
  toggleLikeRecipe: (recipe: LikedRecipe) => void
  isRecipeLiked: (recipeId: string) => boolean
  conversations: Conversation[]
  sendMessage: (recipientId: string, recipientName: string, recipientAvatar: string, content: string) => void
  getMessages: (recipientId: string) => Message[]
  deleteConversation: (recipientId: string) => void
  userRecipes: UserRecipe[]
  addUserRecipe: (recipe: Omit<UserRecipe, "id" | "createdAt">) => string
  updateUserRecipe: (id: string, recipe: Partial<Omit<UserRecipe, "id" | "createdAt">>) => void
  deleteUserRecipe: (id: string) => void
  userPosts: UserPost[]
  addUserPost: (post: Omit<UserPost, "id" | "createdAt" | "status" | "likes">) => void
  updateUserPost: (id: string, post: Partial<Omit<UserPost, "id" | "createdAt">>) => void
  deleteUserPost: (id: string) => void
  likedPosts: LikedPost[]
  toggleLikePost: (postOrEvent: React.MouseEvent | UserPost, maybePost?: UserPost) => void
  isPostLiked: (postId: string) => boolean
  earnStars: (amount: number, reason: "cook" | "recipe") => boolean
  getStarLevel: () => number
  completedRecipes: Set<string>
  markRecipeAsCompleted: (recipeId: string) => void
  reviewedRecipes: Set<string>
  markRecipeAsReviewed: (recipeId: string) => void
  hasUserReviewedRecipe: (recipeId: string) => boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [likedRecipes, setLikedRecipes] = React.useState<LikedRecipe[]>([])
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [messages, setMessages] = React.useState<Message[]>([])
  const [userRecipes, setUserRecipes] = React.useState<UserRecipe[]>([])
  const [userPosts, setUserPosts] = React.useState<UserPost[]>([])
  const [likedPosts, setLikedPosts] = React.useState<LikedPost[]>([])
  const [completedRecipes, setCompletedRecipes] = React.useState<Set<string>>(new Set())
  const [reviewedRecipes, setReviewedRecipes] = React.useState<Set<string>>(new Set())

  
React.useEffect(() => {
  // Restore persisted state (defensive parsing + light migration)
  const savedUser = safeJsonParse<User | null>(localStorage.getItem("cooksync_user"), null)
  if (savedUser) setUser(savedUser)

  const savedLikedRecipes = safeJsonParse<LikedRecipe[]>(localStorage.getItem("cooksync_liked_recipes"), [])
  if (savedLikedRecipes.length) setLikedRecipes(savedLikedRecipes)

  const savedConversations = safeJsonParse<Conversation[]>(localStorage.getItem("cooksync_conversations"), [])
  if (savedConversations.length) setConversations(savedConversations)

  const savedMessages = safeJsonParse<Message[]>(localStorage.getItem("cooksync_messages"), [])
  if (savedMessages.length) setMessages(savedMessages)

  const savedUserRecipes = safeJsonParse<UserRecipe[]>(localStorage.getItem("cooksync_user_recipes"), [])
  if (savedUserRecipes.length) setUserRecipes(savedUserRecipes)

  const savedUserPosts = safeJsonParse<UserPost[]>(localStorage.getItem("cooksync_user_posts"), [])
  if (savedUserPosts.length) setUserPosts(savedUserPosts)

  // Liked posts: supports legacy formats (string[] ids) and current format (objects)
  const rawLikedPosts = safeJsonParse<unknown>(localStorage.getItem("cooksync_liked_posts"), [])
  const nowIso = new Date().toISOString()
  let normalizedLikedPosts: LikedPost[] = []

  if (Array.isArray(rawLikedPosts)) {
    if (rawLikedPosts.every((x) => typeof x === "string")) {
      // legacy: postId[]
      const ids = rawLikedPosts as string[]
      normalizedLikedPosts = ids
        .map((id) => savedUserPosts.find((p) => p.id === id))
        .filter(Boolean)
        .map((p) => ({ ...(p as UserPost), savedAt: nowIso }))
    } else if (rawLikedPosts.every((x) => typeof x === "object" && x !== null)) {
      // objects: ensure savedAt exists
      normalizedLikedPosts = (rawLikedPosts as any[])
        .filter((p) => typeof p.id === "string")
        .map((p) => ({ ...(p as UserPost), savedAt: typeof p.savedAt === "string" ? p.savedAt : nowIso }))
    }
  }

  if (normalizedLikedPosts.length) setLikedPosts(normalizedLikedPosts)

  // Completed/Reviewed recipes: prefer per-user keys, fall back to legacy keys
  const userId = savedUser?.id ?? null

  const completedKey = storageKey("cooksync_completed_recipes", userId)
  const reviewedKey = storageKey("cooksync_reviewed_recipes", userId)

  const legacyCompleted = safeJsonParse<string[]>(localStorage.getItem("cooksync_completed_recipes"), [])
  const legacyReviewed = safeJsonParse<string[]>(localStorage.getItem("cooksync_reviewed_recipes"), [])

  const savedCompletedRecipes = safeJsonParse<string[]>(localStorage.getItem(completedKey), legacyCompleted)
  const savedReviewedRecipes = safeJsonParse<string[]>(localStorage.getItem(reviewedKey), legacyReviewed)

  if (savedCompletedRecipes.length) setCompletedRecipes(new Set(savedCompletedRecipes))
  if (savedReviewedRecipes.length) setReviewedRecipes(new Set(savedReviewedRecipes))
}, [])

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      id: "1",
      name: "김민지",
      nickname: "민지",
      email,
      level: "미슐랭 3스타",
      bio: "매일 조금씩 요리 실력을 키워가고 있어요!",
      location: "대전 서구 둔산동",
      stars: 15,
      todayStars: 0,
      lastStarDate: new Date().toISOString().split("T")[0],
    }
    setUser(newUser)
    localStorage.setItem("cooksync_user", JSON.stringify(newUser))
  }

  const signup = async (data: { name: string; nickname: string; email: string; password: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      nickname: data.nickname,
      email: data.email,
      level: "미슐랭 0스타",
      bio: "CookSync와 함께 요리를 시작해요!",
      location: "",
      stars: 0,
      todayStars: 0,
      lastStarDate: new Date().toISOString().split("T")[0],
    }
    setUser(newUser)
    localStorage.setItem("cooksync_user", JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("cooksync_user")
  }

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem("cooksync_user", JSON.stringify(updatedUser))
    }
  }

  const toggleLikeRecipe = (recipe: LikedRecipe) => {
    setLikedRecipes((prev) => {
      const isAlreadyLiked = prev.some((r) => r.id === recipe.id)
      let updated: LikedRecipe[]
      if (isAlreadyLiked) {
        updated = prev.filter((r) => r.id !== recipe.id)
      } else {
        updated = [...prev, { ...recipe, savedAt: new Date().toISOString().split("T")[0].replace(/-/g, ".") }]
      }
      localStorage.setItem("cooksync_liked_recipes", JSON.stringify(updated))
      return updated
    })
  }

  const isRecipeLiked = (recipeId: string) => {
    return likedRecipes.some((r) => r.id === recipeId)
  }

  const sendMessage = (recipientId: string, recipientName: string, recipientAvatar: string, content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      recipientId,
      recipientName,
      recipientAvatar,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      isSentByMe: true,
    }

    setMessages((prev) => {
      const updated = [...prev, newMessage]
      localStorage.setItem("cooksync_messages", JSON.stringify(updated))
      return updated
    })

    setConversations((prev) => {
      const existingIndex = prev.findIndex((c) => c.recipientId === recipientId)
      let updated: Conversation[]

      if (existingIndex >= 0) {
        updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: content,
          lastMessageTime: new Date().toISOString(),
        }
      } else {
        updated = [
          ...prev,
          {
            id: Date.now().toString(),
            recipientId,
            recipientName,
            recipientAvatar,
            lastMessage: content,
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
          },
        ]
      }
      localStorage.setItem("cooksync_conversations", JSON.stringify(updated))
      return updated
    })
  }

  const getMessages = (recipientId: string) => {
    return messages.filter((m) => m.recipientId === recipientId)
  }

  const deleteConversation = (recipientId: string) => {
    setMessages((prev) => {
      const updated = prev.filter((m) => m.recipientId !== recipientId)
      localStorage.setItem("cooksync_messages", JSON.stringify(updated))
      return updated
    })
    setConversations((prev) => {
      const updated = prev.filter((c) => c.recipientId !== recipientId)
      localStorage.setItem("cooksync_conversations", JSON.stringify(updated))
      return updated
    })
  }

  const addUserRecipe = (recipe: Omit<UserRecipe, "id" | "createdAt">) => {
    const newRecipeId = `user-recipe-${Date.now()}`
    const newRecipe: UserRecipe = {
      ...recipe,
      id: newRecipeId,
      createdAt: new Date().toISOString(),
    }
    setUserRecipes((prev) => {
      const updated = [newRecipe, ...prev]
      localStorage.setItem("cooksync_user_recipes", JSON.stringify(updated))
      return updated
    })
    earnStars(1, "recipe")
    return newRecipeId
  }

  const updateUserRecipe = (id: string, recipe: Partial<Omit<UserRecipe, "id" | "createdAt">>) => {
    setUserRecipes((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...recipe } : r))
      localStorage.setItem("cooksync_user_recipes", JSON.stringify(updated))
      return updated
    })
  }

  const deleteUserRecipe = (id: string) => {
    setUserRecipes((prev) => {
      const updated = prev.filter((r) => r.id !== id)
      localStorage.setItem("cooksync_user_recipes", JSON.stringify(updated))
      return updated
    })
  }

  const addUserPost = (post: Omit<UserPost, "id" | "createdAt" | "status" | "likes">) => {
    const newPost: UserPost = {
      ...post,
      id: `user-post-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "available",
      likes: 0,
    }
    setUserPosts((prev) => {
      const updated = [newPost, ...prev]
      localStorage.setItem("cooksync_user_posts", JSON.stringify(updated))
      return updated
    })
  }

  const updateUserPost = (id: string, post: Partial<Omit<UserPost, "id" | "createdAt">>) => {
    setUserPosts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...post } : p))
      localStorage.setItem("cooksync_user_posts", JSON.stringify(updated))
      return updated
    })
  }

  const deleteUserPost = (id: string) => {
    setUserPosts((prev) => {
      const updated = prev.filter((p) => p.id !== id)
      localStorage.setItem("cooksync_user_posts", JSON.stringify(updated))
      return updated
    })
  }

  const toggleLikePost = (
    postOrEvent: React.MouseEvent | UserPost,
    maybePost?: UserPost,
  ) => {
    const event = (postOrEvent as React.MouseEvent)
    if (event && typeof (event as any).stopPropagation === "function") {
      ;(event as React.MouseEvent).stopPropagation()
    }
    const post = (maybePost ?? postOrEvent) as UserPost
    setLikedPosts((prev) => {
      const isAlreadyLiked = prev.some((p) => p.id === post.id)
      let updated: LikedPost[]
      if (isAlreadyLiked) {
        updated = prev.filter((p) => p.id !== post.id)
      } else {
        updated = [...prev, { ...post, savedAt: new Date().toISOString() }]
      }
      localStorage.setItem("cooksync_liked_posts", JSON.stringify(updated))
      return updated
    })
  }

  const isPostLiked = (postId: string) => {
    return likedPosts.some((p) => p.id === postId)
  }

  const earnStars = (amount: number, reason: "cook" | "recipe"): boolean => {
    if (!user) return false

    const today = new Date().toISOString().split("T")[0]
    let currentTodayStars = user.todayStars

    if (user.lastStarDate !== today) {
      currentTodayStars = 0
    }

    if (currentTodayStars >= 3) return false

    const actualAmount = Math.min(amount, 3 - currentTodayStars)
    if (actualAmount <= 0) return false

    const newStars = Math.min(user.stars + actualAmount, 100)

    const updatedUser = {
      ...user,
      stars: newStars,
      todayStars: currentTodayStars + actualAmount,
      lastStarDate: today,
    }
    setUser(updatedUser)
    localStorage.setItem("cooksync_user", JSON.stringify(updatedUser))
    return true
  }

  const getStarLevel = (): number => {
    if (!user) return 0
    return Math.floor(user.stars / 10)
  }

  const markRecipeAsCompleted = React.useCallback((recipeId: string) => {
    if (!user?.id) return

    const key = storageKey("cooksync_completed_recipes", user.id)

    setCompletedRecipes((prev) => {
      // 이미 있으면 그대로 반환 (불필요한 setState 방지)
      if (prev.has(recipeId)) return prev

      const updated = new Set(prev)
      updated.add(recipeId)
      localStorage.setItem(key, JSON.stringify(Array.from(updated)))
      return updated
    })
  }, [user?.id])


  const markRecipeAsReviewed = (recipeId: string) => {
    if (!user) return
    const key = storageKey("cooksync_reviewed_recipes", user.id)

    setReviewedRecipes((prev) => {
      const updated = new Set(prev)
      updated.add(recipeId)
      localStorage.setItem(key, JSON.stringify(Array.from(updated)))
      return updated
    })
  }

  const hasUserReviewedRecipe = (recipeId: string) => {
    return reviewedRecipes.has(recipeId)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        signup,
        logout,
        updateProfile,
        likedRecipes,
        toggleLikeRecipe,
        isRecipeLiked,
        conversations,
        sendMessage,
        getMessages,
        deleteConversation,
        userRecipes,
        addUserRecipe,
        updateUserRecipe,
        deleteUserRecipe,
        userPosts,
        addUserPost,
        updateUserPost,
        deleteUserPost,
        likedPosts,
        toggleLikePost,
        isPostLiked,
        earnStars,
        getStarLevel,
        completedRecipes,
        markRecipeAsCompleted,
        reviewedRecipes,
        markRecipeAsReviewed,
        hasUserReviewedRecipe,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
