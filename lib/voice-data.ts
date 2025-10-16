export interface Voice {
  voice: string
  category: string
  sub: string
  msb: number
  lsb: number
  prg: number
}

const VOICE_DATABASE: Voice[] = [
  // Piano
  { voice: "Grand Piano", category: "Piano", sub: "Grand Piano", msb: 0, lsb: 112, prg: 0 },
  { voice: "Bright Piano", category: "Piano", sub: "Grand Piano", msb: 0, lsb: 112, prg: 1 },
  { voice: "Mellow Piano", category: "Piano", sub: "Grand Piano", msb: 0, lsb: 112, prg: 2 },
  { voice: "Pop Grand", category: "Piano", sub: "Grand Piano", msb: 0, lsb: 112, prg: 3 },
  { voice: "Stage Piano", category: "Piano", sub: "Electric Piano", msb: 0, lsb: 113, prg: 0 },
  { voice: "DX Electric Piano", category: "Piano", sub: "Electric Piano", msb: 0, lsb: 113, prg: 1 },
  { voice: "Vintage EP", category: "Piano", sub: "Electric Piano", msb: 0, lsb: 113, prg: 2 },
  { voice: "Honky-tonk", category: "Piano", sub: "Honky-tonk", msb: 0, lsb: 114, prg: 0 },
  { voice: "Harpsichord", category: "Piano", sub: "Harpsichord", msb: 0, lsb: 115, prg: 0 },
  { voice: "Clavi", category: "Piano", sub: "Clavinet", msb: 0, lsb: 116, prg: 0 },

  // Organ
  { voice: "Full Organ", category: "Organ", sub: "Drawbar Organ", msb: 0, lsb: 117, prg: 0 },
  { voice: "Jazz Organ 1", category: "Organ", sub: "Drawbar Organ", msb: 0, lsb: 117, prg: 1 },
  { voice: "Jazz Organ 2", category: "Organ", sub: "Drawbar Organ", msb: 0, lsb: 117, prg: 2 },
  { voice: "Rock Organ", category: "Organ", sub: "Drawbar Organ", msb: 0, lsb: 117, prg: 3 },
  { voice: "Church Organ", category: "Organ", sub: "Pipe Organ", msb: 0, lsb: 118, prg: 0 },
  { voice: "Cathedral Organ", category: "Organ", sub: "Pipe Organ", msb: 0, lsb: 118, prg: 1 },
  { voice: "Reed Organ", category: "Organ", sub: "Reed Organ", msb: 0, lsb: 119, prg: 0 },
  { voice: "Accordion", category: "Organ", sub: "Accordion", msb: 0, lsb: 120, prg: 0 },
  { voice: "Bandoneon", category: "Organ", sub: "Accordion", msb: 0, lsb: 120, prg: 1 },
  { voice: "Harmonica", category: "Organ", sub: "Harmonica", msb: 0, lsb: 121, prg: 0 },

  // Guitar
  { voice: "Nylon Guitar", category: "Guitar", sub: "Acoustic Guitar", msb: 0, lsb: 96, prg: 0 },
  { voice: "Steel Guitar", category: "Guitar", sub: "Acoustic Guitar", msb: 0, lsb: 96, prg: 1 },
  { voice: "12 String Guitar", category: "Guitar", sub: "Acoustic Guitar", msb: 0, lsb: 96, prg: 2 },
  { voice: "Jazz Guitar", category: "Guitar", sub: "Electric Guitar", msb: 0, lsb: 97, prg: 0 },
  { voice: "Clean Guitar", category: "Guitar", sub: "Electric Guitar", msb: 0, lsb: 97, prg: 1 },
  { voice: "Muted Guitar", category: "Guitar", sub: "Electric Guitar", msb: 0, lsb: 97, prg: 2 },
  { voice: "Overdrive Guitar", category: "Guitar", sub: "Distortion Guitar", msb: 0, lsb: 98, prg: 0 },
  { voice: "Distortion Guitar", category: "Guitar", sub: "Distortion Guitar", msb: 0, lsb: 98, prg: 1 },
  { voice: "Guitar Harmonics", category: "Guitar", sub: "Guitar Harmonics", msb: 0, lsb: 99, prg: 0 },

  // Bass
  { voice: "Acoustic Bass", category: "Bass", sub: "Acoustic Bass", msb: 0, lsb: 100, prg: 0 },
  { voice: "Fingered Bass", category: "Bass", sub: "Electric Bass", msb: 0, lsb: 101, prg: 0 },
  { voice: "Picked Bass", category: "Bass", sub: "Electric Bass", msb: 0, lsb: 101, prg: 1 },
  { voice: "Fretless Bass", category: "Bass", sub: "Electric Bass", msb: 0, lsb: 101, prg: 2 },
  { voice: "Slap Bass 1", category: "Bass", sub: "Slap Bass", msb: 0, lsb: 102, prg: 0 },
  { voice: "Slap Bass 2", category: "Bass", sub: "Slap Bass", msb: 0, lsb: 102, prg: 1 },
  { voice: "Synth Bass 1", category: "Bass", sub: "Synth Bass", msb: 0, lsb: 103, prg: 0 },
  { voice: "Synth Bass 2", category: "Bass", sub: "Synth Bass", msb: 0, lsb: 103, prg: 1 },
  { voice: "Synth Bass 3", category: "Bass", sub: "Synth Bass", msb: 0, lsb: 103, prg: 2 },

  // Strings
  { voice: "Violin", category: "Strings", sub: "Violin", msb: 0, lsb: 104, prg: 0 },
  { voice: "Viola", category: "Strings", sub: "Viola", msb: 0, lsb: 105, prg: 0 },
  { voice: "Cello", category: "Strings", sub: "Cello", msb: 0, lsb: 106, prg: 0 },
  { voice: "Contrabass", category: "Strings", sub: "Contrabass", msb: 0, lsb: 107, prg: 0 },
  { voice: "Tremolo Strings", category: "Strings", sub: "Ensemble Strings", msb: 0, lsb: 108, prg: 0 },
  { voice: "Pizzicato Strings", category: "Strings", sub: "Ensemble Strings", msb: 0, lsb: 108, prg: 1 },
  { voice: "Orchestral Harp", category: "Strings", sub: "Harp", msb: 0, lsb: 109, prg: 0 },
  { voice: "String Ensemble 1", category: "Strings", sub: "Ensemble Strings", msb: 0, lsb: 108, prg: 2 },
  { voice: "String Ensemble 2", category: "Strings", sub: "Ensemble Strings", msb: 0, lsb: 108, prg: 3 },
  { voice: "Synth Strings 1", category: "Strings", sub: "Synth Strings", msb: 0, lsb: 110, prg: 0 },
  { voice: "Synth Strings 2", category: "Strings", sub: "Synth Strings", msb: 0, lsb: 110, prg: 1 },

  // Brass
  { voice: "Trumpet", category: "Brass", sub: "Trumpet", msb: 0, lsb: 64, prg: 0 },
  { voice: "Trombone", category: "Brass", sub: "Trombone", msb: 0, lsb: 65, prg: 0 },
  { voice: "Tuba", category: "Brass", sub: "Tuba", msb: 0, lsb: 66, prg: 0 },
  { voice: "Muted Trumpet", category: "Brass", sub: "Trumpet", msb: 0, lsb: 64, prg: 1 },
  { voice: "French Horn", category: "Brass", sub: "French Horn", msb: 0, lsb: 67, prg: 0 },
  { voice: "Brass Section", category: "Brass", sub: "Brass Section", msb: 0, lsb: 68, prg: 0 },
  { voice: "Synth Brass 1", category: "Brass", sub: "Synth Brass", msb: 0, lsb: 69, prg: 0 },
  { voice: "Synth Brass 2", category: "Brass", sub: "Synth Brass", msb: 0, lsb: 69, prg: 1 },

  // Sax & Woodwind
  { voice: "Soprano Sax", category: "Sax & Woodwind", sub: "Saxophone", msb: 0, lsb: 70, prg: 0 },
  { voice: "Alto Sax", category: "Sax & Woodwind", sub: "Saxophone", msb: 0, lsb: 70, prg: 1 },
  { voice: "Tenor Sax", category: "Sax & Woodwind", sub: "Saxophone", msb: 0, lsb: 70, prg: 2 },
  { voice: "Baritone Sax", category: "Sax & Woodwind", sub: "Saxophone", msb: 0, lsb: 70, prg: 3 },
  { voice: "Oboe", category: "Sax & Woodwind", sub: "Woodwind", msb: 0, lsb: 71, prg: 0 },
  { voice: "English Horn", category: "Sax & Woodwind", sub: "Woodwind", msb: 0, lsb: 71, prg: 1 },
  { voice: "Bassoon", category: "Sax & Woodwind", sub: "Woodwind", msb: 0, lsb: 72, prg: 0 },
  { voice: "Clarinet", category: "Sax & Woodwind", sub: "Woodwind", msb: 0, lsb: 73, prg: 0 },
  { voice: "Piccolo", category: "Sax & Woodwind", sub: "Flute", msb: 0, lsb: 74, prg: 0 },
  { voice: "Flute", category: "Sax & Woodwind", sub: "Flute", msb: 0, lsb: 74, prg: 1 },
  { voice: "Recorder", category: "Sax & Woodwind", sub: "Flute", msb: 0, lsb: 74, prg: 2 },
  { voice: "Pan Flute", category: "Sax & Woodwind", sub: "Flute", msb: 0, lsb: 74, prg: 3 },

  // Synth Lead
  { voice: "Square Lead", category: "Synth Lead", sub: "Lead", msb: 0, lsb: 80, prg: 0 },
  { voice: "Sawtooth Lead", category: "Synth Lead", sub: "Lead", msb: 0, lsb: 80, prg: 1 },
  { voice: "Calliope Lead", category: "Synth Lead", sub: "Lead", msb: 0, lsb: 80, prg: 2 },
  { voice: "Chiff Lead", category: "Synth Lead", sub: "Lead", msb: 0, lsb: 80, prg: 3 },
  { voice: "Charang Lead", category: "Synth Lead", sub: "Lead", msb: 0, lsb: 80, prg: 4 },
  { voice: "Voice Lead", category: "Synth Lead", sub: "Lead", msb: 0, lsb: 80, prg: 5 },
  { voice: "Fifths Lead", category: "Synth Lead", sub: "Lead", msb: 0, lsb: 80, prg: 6 },
  { voice: "Bass & Lead", category: "Synth Lead", sub: "Lead", msb: 0, lsb: 80, prg: 7 },

  // Synth Pad
  { voice: "New Age Pad", category: "Synth Pad", sub: "Pad", msb: 0, lsb: 81, prg: 0 },
  { voice: "Warm Pad", category: "Synth Pad", sub: "Pad", msb: 0, lsb: 81, prg: 1 },
  { voice: "Polysynth Pad", category: "Synth Pad", sub: "Pad", msb: 0, lsb: 81, prg: 2 },
  { voice: "Choir Pad", category: "Synth Pad", sub: "Pad", msb: 0, lsb: 81, prg: 3 },
  { voice: "Bowed Pad", category: "Synth Pad", sub: "Pad", msb: 0, lsb: 81, prg: 4 },
  { voice: "Metallic Pad", category: "Synth Pad", sub: "Pad", msb: 0, lsb: 81, prg: 5 },
  { voice: "Halo Pad", category: "Synth Pad", sub: "Pad", msb: 0, lsb: 81, prg: 6 },
  { voice: "Sweep Pad", category: "Synth Pad", sub: "Pad", msb: 0, lsb: 81, prg: 7 },

  // Choir & Vocal
  { voice: "Choir Aahs", category: "Choir & Vocal", sub: "Choir", msb: 0, lsb: 82, prg: 0 },
  { voice: "Voice Oohs", category: "Choir & Vocal", sub: "Choir", msb: 0, lsb: 82, prg: 1 },
  { voice: "Synth Voice", category: "Choir & Vocal", sub: "Synth Voice", msb: 0, lsb: 83, prg: 0 },

  // Percussion
  { voice: "Timpani", category: "Percussion", sub: "Timpani", msb: 0, lsb: 84, prg: 0 },
  { voice: "Taiko Drum", category: "Percussion", sub: "Ethnic Percussion", msb: 0, lsb: 85, prg: 0 },
  { voice: "Melodic Tom", category: "Percussion", sub: "Melodic Percussion", msb: 0, lsb: 86, prg: 0 },
  { voice: "Synth Drum", category: "Percussion", sub: "Synth Percussion", msb: 0, lsb: 87, prg: 0 },
  { voice: "Reverse Cymbal", category: "Percussion", sub: "Sound Effects", msb: 0, lsb: 88, prg: 0 },
  { voice: "Castanets", category: "Percussion", sub: "Ethnic Percussion", msb: 0, lsb: 85, prg: 1 },
  { voice: "Triangle", category: "Percussion", sub: "Melodic Percussion", msb: 0, lsb: 86, prg: 1 },
  { voice: "Agogo", category: "Percussion", sub: "Ethnic Percussion", msb: 0, lsb: 85, prg: 2 },
  { voice: "Steel Drums", category: "Percussion", sub: "Melodic Percussion", msb: 0, lsb: 86, prg: 2 },
  { voice: "Woodblock", category: "Percussion", sub: "Ethnic Percussion", msb: 0, lsb: 85, prg: 3 },
]

export async function loadVoiceData(): Promise<Voice[]> {
  // Simulate async loading
  return new Promise((resolve) => {
    setTimeout(() => resolve(VOICE_DATABASE), 100)
  })
}

export function getCategories(voices: Voice[]): string[] {
  const categories = new Set(voices.map((v) => v.category))
  return Array.from(categories).sort()
}

export function getSubCategories(voices: Voice[], category: string): string[] {
  const subs = new Set(voices.filter((v) => v.category === category).map((v) => v.sub))
  return Array.from(subs).sort()
}

export function getVoices(voices: Voice[], category: string, subCategory: string): Voice[] {
  return voices
    .filter((v) => v.category === category && v.sub === subCategory)
    .sort((a, b) => a.voice.localeCompare(b.voice))
}
