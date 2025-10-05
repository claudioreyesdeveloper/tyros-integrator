export interface Effect {
  category: string
  type: string
  purpose: string
  msb: number
  lsb: number
}

let effectCache: Effect[] | null = null

export async function loadEffectData(): Promise<Effect[]> {
  if (effectCache) return effectCache

  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/effect_table_converted-14ZGDGkrbJo28sTOYOPqwaJXr5xyRm.csv",
    )
    const csvText = await response.text()

    const lines = csvText.split("\n").slice(1) // Skip header
    const effects: Effect[] = []

    for (const line of lines) {
      if (!line.trim()) continue

      const parts = line.split(",")
      if (parts.length >= 5) {
        const category = parts[0]?.trim() || ""
        const type = parts[1]?.trim() || ""
        const purpose = parts[2]?.trim() || ""
        const msb = Number.parseInt(parts[3]?.trim() || "0")
        const lsb = Number.parseInt(parts[4]?.trim() || "0")

        if (category && type) {
          effects.push({ category, type, purpose, msb, lsb })
        }
      }
    }

    effectCache = effects
    return effects
  } catch (error) {
    console.error("[v0] Failed to load effect data:", error)
    return []
  }
}

export function getEffectCategories(effects: Effect[]): string[] {
  const categories = new Set(effects.map((e) => e.category))
  return Array.from(categories).sort()
}

export function getEffectTypes(effects: Effect[], category: string): Effect[] {
  return effects.filter((e) => e.category === category).sort((a, b) => a.type.localeCompare(b.type))
}
