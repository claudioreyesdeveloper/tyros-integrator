import type { Voice } from "./tyros-api"

// Re-export Voice type for convenience
export type { Voice }

// Comprehensive Tyros5 Voice Database
export const VOICE_DATABASE: Voice[] = [
  // Piano Voices
  { msb: 0, lsb: 112, pc: 0, name: "Concert Grand", category: "Piano", sub: "Acoustic Piano" },
  { msb: 0, lsb: 112, pc: 1, name: "Bright Piano", category: "Piano", sub: "Acoustic Piano" },
  { msb: 0, lsb: 112, pc: 2, name: "Mellow Piano", category: "Piano", sub: "Acoustic Piano" },
  { msb: 0, lsb: 113, pc: 0, name: "Stage EP", category: "Piano", sub: "Electric Piano" },
  { msb: 0, lsb: 113, pc: 1, name: "DX EP", category: "Piano", sub: "Electric Piano" },
  { msb: 0, lsb: 113, pc: 2, name: "Wurlitzer", category: "Piano", sub: "Electric Piano" },

  // Guitar Voices
  { msb: 0, lsb: 114, pc: 0, name: "Steel Guitar", category: "Guitar", sub: "Acoustic Guitar" },
  { msb: 0, lsb: 114, pc: 1, name: "Nylon Guitar", category: "Guitar", sub: "Acoustic Guitar" },
  { msb: 0, lsb: 115, pc: 0, name: "Jazz Guitar", category: "Guitar", sub: "Electric Guitar" },
  { msb: 0, lsb: 115, pc: 1, name: "Clean Guitar", category: "Guitar", sub: "Electric Guitar" },
  { msb: 0, lsb: 115, pc: 2, name: "Distortion Guitar", category: "Guitar", sub: "Electric Guitar" },

  // Bass Voices
  { msb: 0, lsb: 116, pc: 0, name: "Acoustic Bass", category: "Bass", sub: "Acoustic Bass" },
  { msb: 0, lsb: 116, pc: 1, name: "Fingered Bass", category: "Bass", sub: "Electric Bass" },
  { msb: 0, lsb: 116, pc: 2, name: "Picked Bass", category: "Bass", sub: "Electric Bass" },
  { msb: 0, lsb: 116, pc: 3, name: "Slap Bass", category: "Bass", sub: "Electric Bass" },
  { msb: 0, lsb: 116, pc: 4, name: "Synth Bass", category: "Bass", sub: "Synth Bass" },

  // Strings Voices
  { msb: 0, lsb: 117, pc: 0, name: "String Ensemble", category: "Strings", sub: "Ensemble" },
  { msb: 0, lsb: 117, pc: 1, name: "Slow Strings", category: "Strings", sub: "Ensemble" },
  { msb: 0, lsb: 117, pc: 2, name: "Violin", category: "Strings", sub: "Solo" },
  { msb: 0, lsb: 117, pc: 3, name: "Cello", category: "Strings", sub: "Solo" },

  // Brass Voices
  { msb: 0, lsb: 118, pc: 0, name: "Trumpet", category: "Brass", sub: "Solo" },
  { msb: 0, lsb: 118, pc: 1, name: "Trombone", category: "Brass", sub: "Solo" },
  { msb: 0, lsb: 118, pc: 2, name: "Brass Section", category: "Brass", sub: "Ensemble" },
  { msb: 0, lsb: 118, pc: 3, name: "French Horn", category: "Brass", sub: "Solo" },

  // Woodwind Voices
  { msb: 0, lsb: 119, pc: 0, name: "Flute", category: "Woodwind", sub: "Solo" },
  { msb: 0, lsb: 119, pc: 1, name: "Clarinet", category: "Woodwind", sub: "Solo" },
  { msb: 0, lsb: 119, pc: 2, name: "Saxophone", category: "Woodwind", sub: "Solo" },
  { msb: 0, lsb: 119, pc: 3, name: "Oboe", category: "Woodwind", sub: "Solo" },

  // Organ Voices
  { msb: 0, lsb: 120, pc: 0, name: "Jazz Organ", category: "Organ", sub: "Electric Organ" },
  { msb: 0, lsb: 120, pc: 1, name: "Rock Organ", category: "Organ", sub: "Electric Organ" },
  { msb: 0, lsb: 120, pc: 2, name: "Church Organ", category: "Organ", sub: "Pipe Organ" },
  { msb: 0, lsb: 120, pc: 3, name: "Drawbar Organ", category: "Organ", sub: "Electric Organ" },

  // Synth Voices
  { msb: 0, lsb: 121, pc: 0, name: "Synth Lead", category: "Synth", sub: "Lead" },
  { msb: 0, lsb: 121, pc: 1, name: "Synth Pad", category: "Synth", sub: "Pad" },
  { msb: 0, lsb: 121, pc: 2, name: "Synth Brass", category: "Synth", sub: "Brass" },
  { msb: 0, lsb: 121, pc: 3, name: "Synth Strings", category: "Synth", sub: "Strings" },
]

// Get unique categories
export function getVoiceCategories(): string[] {
  return Array.from(new Set(VOICE_DATABASE.map((v) => v.category)))
}

// Get sub-categories for a category
export function getVoiceSubCategories(category: string): string[] {
  return Array.from(new Set(VOICE_DATABASE.filter((v) => v.category === category).map((v) => v.sub)))
}

// Get voices for a sub-category
export function getVoicesBySubCategory(category: string, sub: string): Voice[] {
  return VOICE_DATABASE.filter((v) => v.category === category && v.sub === sub)
}

// Search voices
export function searchVoices(query: string): Voice[] {
  const lowerQuery = query.toLowerCase()
  return VOICE_DATABASE.filter(
    (v) =>
      v.name.toLowerCase().includes(lowerQuery) ||
      v.category.toLowerCase().includes(lowerQuery) ||
      v.sub.toLowerCase().includes(lowerQuery),
  )
}
