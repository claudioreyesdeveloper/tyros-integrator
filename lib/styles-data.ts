export interface Style {
  category: string
  styleName: string
  sysEx: string
}

export async function loadStyles(): Promise<Style[]> {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tyros5_styles_sysex-0ysnazCGr54yILOLOuqQhS468ZWA9Q.csv",
    )
    const text = await response.text()
    const lines = text.split("\n").filter((line) => line.trim())

    // Skip header row
    const dataLines = lines.slice(1)

    const styles: Style[] = dataLines.map((line) => {
      const [category, styleName, sysEx] = line.split(",").map((s) => s.trim())
      return {
        category,
        styleName,
        sysEx,
      }
    })

    return styles
  } catch (error) {
    console.error("Failed to load styles:", error)
    return []
  }
}

export function getUniqueCategories(styles: Style[]): string[] {
  const categories = new Set(styles.map((s) => s.category))
  return Array.from(categories).sort()
}

export function getStylesByCategory(styles: Style[], category: string): Style[] {
  return styles.filter((s) => s.category === category).sort((a, b) => a.styleName.localeCompare(b.styleName))
}
