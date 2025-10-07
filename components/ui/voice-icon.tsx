"use client"

import Image from "next/image"
import { Music } from "lucide-react"
import { useState } from "react"

interface VoiceIconProps {
  subcategory: string
  className?: string
  size?: number
}

function getIconPath(subcategory: string): string {
  if (!subcategory) return ""
  // Convert subcategory to filename format (e.g., "Piano" -> "Piano.svg")
  const filename = subcategory.trim().replace(/\s+/g, "") + ".svg"
  return `/icons/${filename}`
}

export function VoiceIcon({ subcategory, className = "", size = 48 }: VoiceIconProps) {
  const [hasError, setHasError] = useState(false)

  // If icon fails to load or no subcategory, show fallback
  if (!subcategory || hasError) {
    return <Music className={className} style={{ width: size, height: size }} />
  }

  return (
    <Image
      src={getIconPath(subcategory) || "/placeholder.svg"}
      alt={`${subcategory} icon`}
      width={size}
      height={size}
      className={className}
      onError={() => setHasError(true)}
    />
  )
}
