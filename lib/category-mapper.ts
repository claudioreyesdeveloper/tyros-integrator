export interface CategoryMapping {
  category: string
  subcategory: string
  pattern: string // The pattern to match against voice names
}

export async function loadCategoryMappings(): Promise<CategoryMapping[]> {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/categories-e47huc9dBjzEW9RDQ7hwmzgNf3IhdW.csv",
    )
    const text = await response.text()

    const mappings: CategoryMapping[] = []
    const lines = text.split("\n")

    console.log("[v0] CSV first few lines:", lines.slice(0, 5))

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Split by semicolon to get category and subcategory
      const parts = line.split(";")

      if (parts.length >= 2) {
        const category = parts[0].trim()
        const subcategory = parts[1].trim()

        if (subcategory) {
          // Use subcategory as the pattern to match
          mappings.push({
            category: category || "Other",
            subcategory,
            pattern: subcategory.toLowerCase(),
          })
        }
      }
    }

    console.log("[v0] Loaded category mappings:", mappings.length)
    console.log("[v0] Sample mappings:", mappings.slice(0, 10))
    return mappings
  } catch (error) {
    console.error("[v0] Error loading category mappings:", error)
    return []
  }
}

export function matchVoiceToCategory(
  voiceName: string,
  tags: string[],
  mappings: CategoryMapping[],
): { category: string; subcategory: string } {
  const searchText = `${voiceName} ${tags.join(" ")}`.toLowerCase()

  console.log("[v0] Matching voice:", voiceName, "tags:", tags)

  // Try to find the best matching pattern
  let bestMatch: CategoryMapping | null = null
  let bestMatchLength = 0

  for (const mapping of mappings) {
    // Check if the pattern appears in the voice name or tags
    if (searchText.includes(mapping.pattern)) {
      // Prefer longer matches (more specific)
      if (mapping.pattern.length > bestMatchLength) {
        bestMatch = mapping
        bestMatchLength = mapping.pattern.length
      }
    }
  }

  if (bestMatch) {
    console.log("[v0] Matched to:", bestMatch.category, "->", bestMatch.subcategory)
    return {
      category: bestMatch.category,
      subcategory: bestMatch.subcategory,
    }
  }

  const fallbackSubcategory = tags[0] || "Uncategorized"
  console.log("[v0] No match found, using fallback:", fallbackSubcategory)

  return {
    category: "Other",
    subcategory: fallbackSubcategory,
  }
}
