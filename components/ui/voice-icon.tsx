import { Music, Piano, Drum, Guitar, Mic, Waves, Zap, Sparkles, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceIconProps {
  category: string
  subcategory: string
  size?: number
  className?: string
}

export function VoiceIcon({ category, subcategory, size = 20, className }: VoiceIconProps) {
  const getIcon = () => {
    // Category-based icons
    switch (category.toLowerCase()) {
      case "piano":
        return <Piano className={cn("text-amber-500", className)} style={{ width: size, height: size }} />
      case "organ":
        return <Music className={cn("text-purple-500", className)} style={{ width: size, height: size }} />
      case "guitar":
        return <Guitar className={cn("text-orange-500", className)} style={{ width: size, height: size }} />
      case "bass":
        return <Waves className={cn("text-blue-500", className)} style={{ width: size, height: size }} />
      case "strings":
        return <Music className={cn("text-emerald-500", className)} style={{ width: size, height: size }} />
      case "brass":
        return <Volume2 className={cn("text-yellow-500", className)} style={{ width: size, height: size }} />
      case "sax & woodwind":
      case "sax":
      case "woodwind":
        return <Music className={cn("text-cyan-500", className)} style={{ width: size, height: size }} />
      case "synth lead":
      case "synth pad":
        return <Zap className={cn("text-pink-500", className)} style={{ width: size, height: size }} />
      case "choir & vocal":
      case "choir":
      case "vocal":
        return <Mic className={cn("text-rose-500", className)} style={{ width: size, height: size }} />
      case "percussion":
        return <Drum className={cn("text-red-500", className)} style={{ width: size, height: size }} />
      default:
        return <Sparkles className={cn("text-gray-500", className)} style={{ width: size, height: size }} />
    }
  }

  return getIcon()
}
