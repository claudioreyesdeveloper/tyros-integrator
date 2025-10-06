// Parser for Cakewalk .ins instrument definition files
export interface InsVoice {
  bankName: string // e.g., "GM1 & XG Bank 0"
  bankNumber: number // The numeric bank value from Instrument Definitions
  program: number // 0-127 program number
  voiceName: string // Clean voice name without tags
  curlyTags: string[] // Tags from {}, e.g., ["XG"]
  parenTags: string[] // Tags from (), e.g., ["Piano", "Woodwind"]
  msb: number // Calculated from bankNumber
  lsb: number // Calculated from bankNumber
}

interface BankMapping {
  bankNumber: number
  patchNameSection: string
}

export async function parseInsFile(url: string): Promise<InsVoice[]> {
  try {
    console.log("[v0] Fetching INS file from:", url)
    const response = await fetch(url)
    const text = await response.text()
    const lines = text.split("\n")

    console.log("[v0] INS file loaded, total lines:", lines.length)

    // Step 1: Parse [Instrument Definitions] section to build bank mappings
    const bankMappings = parseInstrumentDefinitions(lines)
    console.log("[v0] Found bank mappings:", bankMappings.length)
    console.log("[v0] Sample mappings:", bankMappings.slice(0, 10))

    // Step 2: Parse [Patch Names ...] sections to extract voices
    const patchNamesSections = parsePatchNamesSections(lines)
    console.log("[v0] Found patch names sections:", Object.keys(patchNamesSections).length)

    // Step 3: Match voices to bank numbers and calculate MSB/LSB
    const allVoices: InsVoice[] = []

    for (const mapping of bankMappings) {
      const sectionName = mapping.patchNameSection
      const voices = patchNamesSections[sectionName]

      if (voices) {
        for (const voice of voices) {
          const msb = Math.floor(mapping.bankNumber / 128)
          const lsb = mapping.bankNumber % 128

          allVoices.push({
            ...voice,
            bankName: sectionName,
            bankNumber: mapping.bankNumber,
            msb,
            lsb,
          })
        }
      }
    }

    console.log("[v0] Total voices parsed:", allVoices.length)
    console.log("[v0] Sample voices:", allVoices.slice(0, 5))

    return allVoices
  } catch (error) {
    console.error("[v0] Failed to parse INS file:", error)
    return []
  }
}

function parseInstrumentDefinitions(lines: string[]): BankMapping[] {
  const mappings: BankMapping[] = []
  let inInstrumentDefinitions = false
  let inTyros5Section = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip comments and empty lines
    if (trimmed.startsWith(";") || trimmed === "") continue

    if (trimmed === ".Instrument Definitions") {
      inInstrumentDefinitions = true
      console.log("[v0] Found .Instrument Definitions section")
      continue
    }

    if (trimmed.startsWith(".") && trimmed !== ".Instrument Definitions") {
      inInstrumentDefinitions = false
      inTyros5Section = false
      console.log("[v0] Exiting .Instrument Definitions section")
      continue
    }

    if (!inInstrumentDefinitions) continue

    if (trimmed === "[ Tyros5]" || trimmed === "[Tyros5]") {
      inTyros5Section = true
      console.log("[v0] Found [ Tyros5] subsection")
      continue
    }

    if (trimmed.startsWith("[") && trimmed.endsWith("]") && !trimmed.includes("Tyros5")) {
      inTyros5Section = false
      continue
    }

    if (!inTyros5Section) continue

    // Parse Patch[number]=Section Name
    const patchMatch = trimmed.match(/^Patch\[(\d+|\*)\]\s*=\s*(.+)$/)
    if (patchMatch) {
      const bankNumberStr = patchMatch[1]
      const patchNameSection = patchMatch[2].trim()

      // Skip wildcard entries
      if (bankNumberStr === "*") continue

      const bankNumber = Number.parseInt(bankNumberStr)

      mappings.push({
        bankNumber,
        patchNameSection,
      })
    }
  }

  console.log("[v0] Finished parsing Instrument Definitions, found", mappings.length, "bank mappings")
  return mappings
}

function parsePatchNamesSections(
  lines: string[],
): Record<string, Omit<InsVoice, "bankName" | "bankNumber" | "msb" | "lsb">[]> {
  const sections: Record<string, Omit<InsVoice, "bankName" | "bankNumber" | "msb" | "lsb">[]> = {}
  let inPatchNamesSection = false
  let currentSectionName: string | null = null

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip comments and empty lines
    if (trimmed.startsWith(";") || trimmed === "") continue

    // Check for .Patch Names section
    if (trimmed === ".Patch Names") {
      inPatchNamesSection = true
      continue
    }

    // Check for other sections (end of Patch Names)
    if (trimmed.startsWith(".") && trimmed !== ".Patch Names") {
      inPatchNamesSection = false
      currentSectionName = null
      continue
    }

    if (!inPatchNamesSection) continue

    // Check for section header [Section Name]
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      currentSectionName = trimmed.slice(1, -1)
      if (!sections[currentSectionName]) {
        sections[currentSectionName] = []
      }
      continue
    }

    // Parse voice definition: program=VoiceName {tag} (tag)
    if (currentSectionName && trimmed.includes("=")) {
      const equalIndex = trimmed.indexOf("=")
      const programStr = trimmed.substring(0, equalIndex).trim()
      const rest = trimmed.substring(equalIndex + 1).trim()

      const program = Number.parseInt(programStr)
      if (isNaN(program) || !rest) continue

      // Extract voice name and tags
      let voiceName = rest

      // Extract curly brace tags {}
      const curlyTags: string[] = []
      const curlyMatches = voiceName.matchAll(/\{([^}]+)\}/g)
      for (const match of curlyMatches) {
        curlyTags.push(match[1].trim())
      }

      // Extract parentheses tags ()
      const parenTags: string[] = []
      const parenMatches = voiceName.matchAll(/$$([^)]+)$$/g)
      for (const match of parenMatches) {
        parenTags.push(match[1].trim())
      }

      // Remove all tags from voice name
      voiceName = voiceName
        .replace(/\s*\{[^}]+\}/g, "")
        .replace(/\s*$$[^)]+$$/g, "")
        .trim()

      sections[currentSectionName].push({
        program,
        voiceName,
        curlyTags,
        parenTags,
      })
    }
  }

  return sections
}
