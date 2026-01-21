"use client"

import React from "react"

import { Heart, MoreVertical } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Recipe } from "@/lib/types"

interface RecipeCardProps {
  recipe: Recipe & { isUserRecipe?: boolean }
  isLiked?: boolean
  onHeartClick?: (e: React.MouseEvent<HTMLButtonElement>, recipe: Recipe) => void
  onEdit?: (recipeId: string) => void
  onDelete?: (recipeId: string) => void
  onClick?: () => void
  hideImage?: boolean
}

export function RecipeCard({ recipe, isLiked, onHeartClick, onEdit, onDelete, onClick, hideImage }: RecipeCardProps) {
  // const handleRatingDisplay = (rating: number | string | undefined) => {
  //   if (!rating) return "0"
  //   const numRating = typeof rating === "string" ? parseFloat(rating) : rating
  //   if (isNaN(numRating)) return "0"
  //   if (numRating % 1 === 0.5) return numRating.toFixed(1)
  //   return Math.round(numRating).toString()
  // }

  // const renderMichelinStars = (rating: number | string | undefined) => {
  //   if (!rating) return null
    
  //   const numRating = typeof rating === "string" ? parseFloat(rating) : rating
  //   if (isNaN(numRating)) return null
    
  //   const fullStars = Math.floor(numRating)
  //   const hasHalfStar = numRating % 1 !== 0
  //   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
  //   return (
  //     <div className="flex items-center gap-0.5">
  //       {/* Full stars */}
  //       {Array.from({ length: fullStars }).map((_, i) => (
  //         <img key={`full-${i}`} src="/michelin-star.png" alt="미슐랭" className="h-4 w-4" />
  //       ))}
        
  //       {/* Half star */}
  //       {hasHalfStar && (
  //         <img
  //           key="half"
  //           src="/michelin-star-half.png"
  //           alt="미슐랭"
  //           className="h-4 w-4"
  //         />
  //       )}

  //       {/* Empty stars */}
  //       {Array.from({ length: emptyStars }).map((_, i) => (
  //         <img
  //           key={`empty-${i}`}
  //           src="/michelin-star-empty.svg"
  //           alt="미슐랭"
  //           className="h-4 w-4 opacity-40"
  //         />
  //       ))}
  //     </div>
  //   )
  // }

  return (
    <div className="overflow-hidden group cursor-pointer" onClick={onClick}>
      <div className={`relative ${hideImage ? "aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center" : "aspect-[4/3]"} overflow-hidden`}>
        {hideImage ? (
          <img
            src="/michelin-full-star.png"
            alt="미슐랭"
            className="h-16 w-16"
          />
        ) : (
          <Image
            src={recipe.image || "/placeholder.svg"}
            alt={recipe.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute top-2 right-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 rounded-full bg-white/80 backdrop-blur hover:bg-white"
            onClick={(e) => {
              e.stopPropagation()
              onHeartClick?.(e, recipe)
            }}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>
        {recipe.isUserRecipe && (
          <Badge className="absolute bottom-2 left-2 bg-[#800020] text-white border-0 text-xs">
            내 레시피
          </Badge>
        )}
        {onEdit || onDelete ? (
          <div className="absolute top-2 left-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 rounded-full bg-white/80 backdrop-blur hover:bg-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(recipe.id)
                    }}
                  >
                    수정
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(recipe.id)
                    }}
                    className="text-destructive"
                  >
                    삭제
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base leading-tight line-clamp-2 flex-1">{recipe.name}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <img
              src="/michelin-full-star.png"
              alt="미슐랭"
              className="h-4 w-4"
            />
            <span className="text-sm font-semibold text-[#800020]">
              {typeof recipe.rating === "number"
                ? recipe.rating.toFixed(1)
                : Number(recipe.rating ?? 0).toFixed(1)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {recipe.author && (
            <span className="text-xs text-primary font-medium">#{recipe.author}</span>
          )}
          {recipe.hashtags?.slice(0, 1).map((tag) => (
            <span key={tag} className="text-xs text-primary font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
