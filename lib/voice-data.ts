export interface Voice {
  category: string
  sub: string
  voice: string
  msb: string
  lsb: string
  prg: string
}

let voiceCache: Voice[] | null = null

export async function loadVoiceData(): Promise<Voice[]> {
  if (voiceCache) return voiceCache

  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tyros_voice_2_fully_cleaned%20%281%29-ORwlsBv5E2q8Ql6MwefrfwDMRkW8oC.csv",
    )
    const csvText = await response.text()

    const lines = csvText.split("\n").slice(1) // Skip header
    const voices: Voice[] = []

    for (const line of lines) {
      if (!line.trim()) continue

      const [category, sub, voice, msb, lsb, prg] = line.split(";").map((s) => s.trim())
      if (category && sub && voice) {
        voices.push({ category, sub, voice, msb, lsb, prg })
      }
    }

    voiceCache = voices
    return voices
  } catch (error) {
    console.error("[v0] Failed to load voice data:", error)
    return []
  }
}

export function getCategories(voices: Voice[]): string[] {
  const categories = new Set(voices.map((v) => v.category))
  return Array.from(categories)
}

export function getSubCategories(voices: Voice[], category: string): string[] {
  const subs = new Set(voices.filter((v) => v.category === category).map((v) => v.sub))
  return Array.from(subs)
}

export function getVoices(voices: Voice[], category: string, subCategory: string): Voice[] {
  return voices.filter((v) => v.category === category && v.sub === subCategory)
}

export function getAllSubCategories(voices: Voice[]): string[] {
  const subs = new Set(voices.map((v) => v.sub))
  return Array.from(subs).sort()
}

export function getVoicesBySubCategory(voices: Voice[], subCategory: string): Voice[] {
  return voices.filter((v) => v.sub === subCategory)
}

export function getSubCategoryCategoryCount(voices: Voice[], subCategory: string): number {
  const categories = new Set(voices.filter((v) => v.sub === subCategory).map((v) => v.category))
  return categories.size
}

export function getPremiumPackSubCategories(voices: Voice[]): string[] {
  const subs = new Set(voices.filter((v) => v.category === "Premium Pack").map((v) => v.sub))
  return Array.from(subs).sort()
}
