import { Music, Piano, Guitar, Drum, Wind, Waves } from "lucide-react"

export const VOICE_CATEGORY_ICONS: Record<string, typeof Music> = {
  Piano: Piano,
  Guitar: Guitar,
  Bass: Guitar,
  Strings: Music,
  Brass: Wind,
  Woodwind: Wind,
  Organ: Piano,
  Synth: Waves,
  Drums: Drum,
  Percussion: Drum,
}

export function getVoiceIcon(category: string) {
  return VOICE_CATEGORY_ICONS[category] || Music
}
