// Script to analyze voice categories and subcategories from CSV
const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tyros_voice_2_fully_cleaned-7PpIxwUpyzQXbuD82uUvzUIWPg2uUd.csv"

async function analyzeVoices() {
  const response = await fetch(csvUrl)
  const csvText = await response.text()

  const lines = csvText.split("\n")
  const headers = lines[0].split(",")

  const categories = new Set<string>()
  const subcategories = new Set<string>()
  const categorySubMap = new Map<string, Set<string>>()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(",")
    const category = values[0]
    const sub = values[1]

    if (category && sub) {
      categories.add(category)
      subcategories.add(sub)

      if (!categorySubMap.has(category)) {
        categorySubMap.set(category, new Set())
      }
      categorySubMap.get(category)!.add(sub)
    }
  }

  console.log("[v0] Categories:", Array.from(categories).sort())
  console.log("[v0] Subcategories:", Array.from(subcategories).sort())
  console.log("[v0] Category-Subcategory mapping:")
  categorySubMap.forEach((subs, cat) => {
    console.log(`[v0]   ${cat}:`, Array.from(subs).sort())
  })
}

analyzeVoices()
