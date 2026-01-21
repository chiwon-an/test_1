export interface RecipeStep {
  id: number
  stepNumber: number
  action: string
  description: string
  ingredients: string[]
  tools: string[]
  duration: number // seconds
  imageUrl: string
  tips?: string
}

export interface NutritionInfo {
  protein?: number // grams
  carbs?: number // grams
  fat?: number // grams
  fiber?: number // grams
  sodium?: number // mg
  sugar?: number // grams
}

export interface Recipe {
  id: string
  name: string
  thumbnail: string
  tags: string[]
  hashtags?: string[] // Added hashtags field for creator/channel info
  author?: string // Added author field for creator name
  rating?: number // Added rating field for michelin stars
  duration: number // minutes
  difficulty: "초보" | "중급" | "상급"
  servings: number
  calories?: number
  nutrition?: NutritionInfo // Added nutrition field
  description?: string // Added description field for recipe intro
  steps: RecipeStep[]
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  recipes?: Recipe[]
  selectedRecipe?: Recipe
}
