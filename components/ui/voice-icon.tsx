"use client"

import { getVoiceIcon } from "@/lib/voice-icons"

interface VoiceIconProps {
  subcategory: string
  category?: string
  className?: string
  size?: number
}

export function VoiceIcon({ subcategory, category, className = "", size = 20 }: VoiceIconProps) {
  const Icon = getVoiceIcon(subcategory, category)

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Icon className="text-amber-500" size={size} strokeWidth={2} />
    </div>
  )
}
