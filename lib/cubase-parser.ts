export interface CubaseVoice {
  msb: number
  lsb: number
  program: number
  voiceName: string
  mainGroup: string
  subGroup: string
}

export async function parseCubasePatchFile(filePath: string): Promise<CubaseVoice[]> {
  console.log("[v0] Loading Cubase Patch file:", filePath)

  const response = await fetch(filePath)
  const text = await response.text()
  const lines = text.split("\n")

  console.log("[v0] Cubase file loaded, lines:", lines.length)

  const voices: CubaseVoice[] = []
  let currentMainGroup = ""
  let currentSubGroup = ""
  let categoriesFound = 0
  let voicesSkipped = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines and comments
    if (
      !line ||
      line.startsWith("[comment]") ||
      line.startsWith("[device") ||
      line.startsWith("[parser") ||
      line.startsWith("[script") ||
      line.startsWith("[define") ||
      line.startsWith("[mode]") ||
      line.startsWith("[cubase]") ||
      line.startsWith("[end]")
    ) {
      continue
    }

    // Parse category lines [g1]
    if (line.startsWith("[g1]")) {
      const categoryText = line.substring(4).trim()

      // Skip separator lines
      if (categoryText.includes("---") || !categoryText) {
        continue
      }

      // This automatically filters out GM, GM2, XG, Legacy, MegaVoice, etc.
      if (!categoryText.startsWith("Tyros5")) {
        console.log("[v0] Skipping non-Tyros5 category:", categoryText)
        // Don't reset currentMainGroup - just skip this category line
        continue
      }

      categoriesFound++

      // Remove "Tyros5 " prefix
      const categoryWithoutPrefix = categoryText.substring(7).trim()

      // Parse category format: "<MainGroup>/<SubGroup>" or "<MainGroup>"
      if (categoryWithoutPrefix.includes("/")) {
        const parts = categoryWithoutPrefix.split("/")
        currentMainGroup = parts[1].trim() // After slash is now main group
        currentSubGroup = parts[0].trim() // Before slash is now sub group
      } else {
        currentMainGroup = categoryWithoutPrefix.trim()
        currentSubGroup = "Tyros5" // Give it a default subcategory
      }

      console.log("[v0] Found category:", currentMainGroup, "/", currentSubGroup)
      continue
    }

    // Parse voice entries [p2,MSB,LSB,Program]VoiceName
    if (line.startsWith("[p2,")) {
      // Skip if we don't have a current category
      if (!currentMainGroup) {
        voicesSkipped++
        continue
      }

      const match = line.match(/\[p2,(\d+),(\d+),(\d+)\](.+)/)
      if (match) {
        const [, msb, lsb, program, voiceName] = match

        voices.push({
          msb: Number.parseInt(msb),
          lsb: Number.parseInt(lsb),
          program: Number.parseInt(program),
          voiceName: voiceName.trim(),
          mainGroup: currentMainGroup,
          subGroup: currentSubGroup,
        })
      }
    }
  }

  console.log("[v0] Parsed Cubase file:")
  console.log("[v0]   Categories found:", categoriesFound)
  console.log("[v0]   Voices found:", voices.length)
  console.log("[v0]   Voices skipped:", voicesSkipped)
  console.log("[v0] Sample voices:", voices.slice(0, 3))

  return voices
}
