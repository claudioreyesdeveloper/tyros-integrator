// CHORDONOMICON-inspired Chord Progression Database
// Curated subset of popular chord progressions from various genres and decades
// Based on the CHORDONOMICON dataset: https://github.com/spyroskantarelis/chordonomicon

export interface ChordProgression {
  id: string
  name: string
  chords: string[]
  genre: string
  decade: string
  length: number
  description?: string
}

export const CHORDONOMICON_DATABASE: ChordProgression[] = [
  // Pop Progressions
  {
    id: "pop-001",
    name: "I-V-vi-IV (Axis of Awesome)",
    chords: ["C", "G", "Am", "F"],
    genre: "Pop",
    decade: "2000s",
    length: 4,
    description: "The most popular pop progression of all time",
  },
  {
    id: "pop-002",
    name: "vi-IV-I-V (Sensitive)",
    chords: ["Am", "F", "C", "G"],
    genre: "Pop",
    decade: "2010s",
    length: 4,
    description: "Emotional pop ballad progression",
  },
  {
    id: "pop-003",
    name: "I-vi-IV-V (50s Progression)",
    chords: ["C", "Am", "F", "G"],
    genre: "Pop",
    decade: "1950s",
    length: 4,
    description: "Classic doo-wop progression",
  },
  {
    id: "pop-004",
    name: "I-IV-vi-V",
    chords: ["C", "F", "Am", "G"],
    genre: "Pop",
    decade: "2000s",
    length: 4,
    description: "Uplifting pop progression",
  },
  {
    id: "pop-005",
    name: "vi-V-IV-V",
    chords: ["Am", "G", "F", "G"],
    genre: "Pop",
    decade: "1990s",
    length: 4,
    description: "Melancholic pop progression",
  },

  // Rock Progressions
  {
    id: "rock-001",
    name: "I-bVII-IV (Rock Anthem)",
    chords: ["C", "Bb", "F"],
    genre: "Rock",
    decade: "1970s",
    length: 3,
    description: "Classic rock power chord progression",
  },
  {
    id: "rock-002",
    name: "I-IV-V (Three Chord Rock)",
    chords: ["C", "F", "G"],
    genre: "Rock",
    decade: "1960s",
    length: 3,
    description: "The foundation of rock and roll",
  },
  {
    id: "rock-003",
    name: "i-bVII-bVI-bVII (Aeolian Rock)",
    chords: ["Am", "G", "F", "G"],
    genre: "Rock",
    decade: "1980s",
    length: 4,
    description: "Minor key rock progression",
  },
  {
    id: "rock-004",
    name: "I-bVII-IV-I",
    chords: ["C", "Bb", "F", "C"],
    genre: "Rock",
    decade: "1970s",
    length: 4,
    description: "Arena rock progression",
  },
  {
    id: "rock-005",
    name: "i-bVI-bIII-bVII",
    chords: ["Am", "F", "C", "G"],
    genre: "Rock",
    decade: "1990s",
    length: 4,
    description: "Alternative rock progression",
  },

  // Jazz Progressions
  {
    id: "jazz-001",
    name: "ii-V-I (Jazz Standard)",
    chords: ["Dm7", "G7", "Cmaj7"],
    genre: "Jazz",
    decade: "1940s",
    length: 3,
    description: "The most important jazz progression",
  },
  {
    id: "jazz-002",
    name: "I-vi-ii-V (Rhythm Changes)",
    chords: ["Cmaj7", "Am7", "Dm7", "G7"],
    genre: "Jazz",
    decade: "1930s",
    length: 4,
    description: "Based on 'I Got Rhythm'",
  },
  {
    id: "jazz-003",
    name: "iii-vi-ii-V-I",
    chords: ["Em7", "Am7", "Dm7", "G7", "Cmaj7"],
    genre: "Jazz",
    decade: "1950s",
    length: 5,
    description: "Extended jazz turnaround",
  },
  {
    id: "jazz-004",
    name: "I-IV-iii-vi-ii-V-I",
    chords: ["Cmaj7", "Fmaj7", "Em7", "Am7", "Dm7", "G7", "Cmaj7"],
    genre: "Jazz",
    decade: "1940s",
    length: 7,
    description: "Full jazz progression",
  },
  {
    id: "jazz-005",
    name: "i-iv-i-V7 (Minor Jazz)",
    chords: ["Cm7", "Fm7", "Cm7", "G7"],
    genre: "Jazz",
    decade: "1950s",
    length: 4,
    description: "Minor key jazz progression",
  },

  // Blues Progressions
  {
    id: "blues-001",
    name: "12-Bar Blues",
    chords: ["C7", "C7", "C7", "C7", "F7", "F7", "C7", "C7", "G7", "F7", "C7", "G7"],
    genre: "Blues",
    decade: "1920s",
    length: 12,
    description: "Classic 12-bar blues progression",
  },
  {
    id: "blues-002",
    name: "Quick Change Blues",
    chords: ["C7", "F7", "C7", "C7", "F7", "F7", "C7", "C7", "G7", "F7", "C7", "G7"],
    genre: "Blues",
    decade: "1940s",
    length: 12,
    description: "Blues with quick IV change",
  },
  {
    id: "blues-003",
    name: "8-Bar Blues",
    chords: ["C7", "F7", "C7", "C7", "F7", "F7", "C7", "G7"],
    genre: "Blues",
    decade: "1930s",
    length: 8,
    description: "Shorter blues form",
  },

  // R&B/Soul Progressions
  {
    id: "rnb-001",
    name: "I-iii-IV-V (Soul Progression)",
    chords: ["C", "Em", "F", "G"],
    genre: "R&B",
    decade: "1960s",
    length: 4,
    description: "Classic soul progression",
  },
  {
    id: "rnb-002",
    name: "I-IV-I-V (Gospel)",
    chords: ["C", "F", "C", "G"],
    genre: "R&B",
    decade: "1950s",
    length: 4,
    description: "Gospel-influenced R&B",
  },
  {
    id: "rnb-003",
    name: "vi-ii-V-I (Neo-Soul)",
    chords: ["Am7", "Dm7", "G7", "Cmaj7"],
    genre: "R&B",
    decade: "2000s",
    length: 4,
    description: "Modern neo-soul progression",
  },

  // Electronic/Dance Progressions
  {
    id: "edm-001",
    name: "i-bVI-bIII-bVII (EDM Drop)",
    chords: ["Am", "F", "C", "G"],
    genre: "Electronic",
    decade: "2010s",
    length: 4,
    description: "Popular EDM drop progression",
  },
  {
    id: "edm-002",
    name: "I-V-vi-iii-IV-I-IV-V",
    chords: ["C", "G", "Am", "Em", "F", "C", "F", "G"],
    genre: "Electronic",
    decade: "2010s",
    length: 8,
    description: "Extended dance progression",
  },

  // Country Progressions
  {
    id: "country-001",
    name: "I-IV-I-V-I (Country Standard)",
    chords: ["C", "F", "C", "G", "C"],
    genre: "Country",
    decade: "1950s",
    length: 5,
    description: "Traditional country progression",
  },
  {
    id: "country-002",
    name: "I-V-vi-IV (Modern Country)",
    chords: ["C", "G", "Am", "F"],
    genre: "Country",
    decade: "2000s",
    length: 4,
    description: "Contemporary country pop",
  },

  // Latin Progressions
  {
    id: "latin-001",
    name: "i-iv-V (Latin Minor)",
    chords: ["Am", "Dm", "E7"],
    genre: "Latin",
    decade: "1960s",
    length: 3,
    description: "Classic Latin progression",
  },
  {
    id: "latin-002",
    name: "I-IV-V-IV (Bossa Nova)",
    chords: ["Cmaj7", "Fmaj7", "G7", "Fmaj7"],
    genre: "Latin",
    decade: "1960s",
    length: 4,
    description: "Bossa nova progression",
  },

  // Funk Progressions
  {
    id: "funk-001",
    name: "i7-iv7 (Funk Vamp)",
    chords: ["Cm7", "Fm7"],
    genre: "Funk",
    decade: "1970s",
    length: 2,
    description: "Classic funk two-chord vamp",
  },
  {
    id: "funk-002",
    name: "i7-IV7-i7 (Funk Groove)",
    chords: ["Cm7", "F7", "Cm7"],
    genre: "Funk",
    decade: "1970s",
    length: 3,
    description: "Funky groove progression",
  },

  // Hip-Hop Progressions
  {
    id: "hiphop-001",
    name: "i-bVII-bVI-V (Hip-Hop)",
    chords: ["Am", "G", "F", "E"],
    genre: "Hip-Hop",
    decade: "1990s",
    length: 4,
    description: "Classic hip-hop sample progression",
  },
  {
    id: "hiphop-002",
    name: "i-bVI-bIII-bVII (Trap)",
    chords: ["Am", "F", "C", "G"],
    genre: "Hip-Hop",
    decade: "2010s",
    length: 4,
    description: "Modern trap progression",
  },

  // Reggae Progressions
  {
    id: "reggae-001",
    name: "I-V-vi-IV (Reggae)",
    chords: ["C", "G", "Am", "F"],
    genre: "Reggae",
    decade: "1970s",
    length: 4,
    description: "Classic reggae progression",
  },
  {
    id: "reggae-002",
    name: "i-bVII-bVI-bVII (Roots Reggae)",
    chords: ["Am", "G", "F", "G"],
    genre: "Reggae",
    decade: "1970s",
    length: 4,
    description: "Roots reggae progression",
  },

  // Metal Progressions
  {
    id: "metal-001",
    name: "i-bVI-bVII (Metal)",
    chords: ["Am", "F", "G"],
    genre: "Metal",
    decade: "1980s",
    length: 3,
    description: "Heavy metal progression",
  },
  {
    id: "metal-002",
    name: "i-bVI-bIII-bVII (Power Metal)",
    chords: ["Am", "F", "C", "G"],
    genre: "Metal",
    decade: "1990s",
    length: 4,
    description: "Power metal progression",
  },

  // Classical-Inspired Progressions
  {
    id: "classical-001",
    name: "I-IV-V-I (Authentic Cadence)",
    chords: ["C", "F", "G", "C"],
    genre: "Classical",
    decade: "1700s",
    length: 4,
    description: "Classical authentic cadence",
  },
  {
    id: "classical-002",
    name: "I-vi-IV-V (Pachelbel Canon)",
    chords: ["C", "Am", "F", "G"],
    genre: "Classical",
    decade: "1600s",
    length: 4,
    description: "Based on Pachelbel's Canon",
  },

  // Indie/Alternative Progressions
  {
    id: "indie-001",
    name: "I-V-vi-IV (Indie Anthem)",
    chords: ["C", "G", "Am", "F"],
    genre: "Indie",
    decade: "2000s",
    length: 4,
    description: "Indie rock anthem progression",
  },
  {
    id: "indie-002",
    name: "vi-IV-I-V (Indie Ballad)",
    chords: ["Am", "F", "C", "G"],
    genre: "Indie",
    decade: "2010s",
    length: 4,
    description: "Emotional indie ballad",
  },

  // Extended Jazz Progressions
  {
    id: "jazz-006",
    name: "Coltrane Changes",
    chords: ["Cmaj7", "Eb7", "Abmaj7", "B7", "Emaj7", "G7", "Cmaj7"],
    genre: "Jazz",
    decade: "1960s",
    length: 7,
    description: "John Coltrane's Giant Steps progression",
  },
  {
    id: "jazz-007",
    name: "Autumn Leaves",
    chords: ["Cm7", "F7", "Bbmaj7", "Ebmaj7", "Am7b5", "D7", "Gm"],
    genre: "Jazz",
    decade: "1940s",
    length: 7,
    description: "Classic jazz standard progression",
  },

  // More Pop Variations
  {
    id: "pop-006",
    name: "I-iii-vi-IV (Pop Variation)",
    chords: ["C", "Em", "Am", "F"],
    genre: "Pop",
    decade: "2010s",
    length: 4,
    description: "Modern pop variation",
  },
  {
    id: "pop-007",
    name: "vi-V-IV-iii (Descending Pop)",
    chords: ["Am", "G", "F", "Em"],
    genre: "Pop",
    decade: "2000s",
    length: 4,
    description: "Descending pop progression",
  },
  {
    id: "pop-008",
    name: "I-V-IV-V (Pop Rock)",
    chords: ["C", "G", "F", "G"],
    genre: "Pop",
    decade: "1980s",
    length: 4,
    description: "Upbeat pop rock progression",
  },

  // More Rock Progressions
  {
    id: "rock-006",
    name: "I-bVII-bVI-bVII (Hard Rock)",
    chords: ["C", "Bb", "Ab", "Bb"],
    genre: "Rock",
    decade: "1980s",
    length: 4,
    description: "Hard rock progression",
  },
  {
    id: "rock-007",
    name: "i-bVI-bVII-i (Minor Rock)",
    chords: ["Am", "F", "G", "Am"],
    genre: "Rock",
    decade: "1990s",
    length: 4,
    description: "Minor key rock progression",
  },

  // Gospel Progressions
  {
    id: "gospel-001",
    name: "I-IV-I-V-IV-I (Gospel)",
    chords: ["C", "F", "C", "G", "F", "C"],
    genre: "Gospel",
    decade: "1950s",
    length: 6,
    description: "Traditional gospel progression",
  },
  {
    id: "gospel-002",
    name: "I-iii-IV-V (Gospel Hymn)",
    chords: ["C", "Em", "F", "G"],
    genre: "Gospel",
    decade: "1960s",
    length: 4,
    description: "Gospel hymn progression",
  },

  // Disco Progressions
  {
    id: "disco-001",
    name: "i-iv-bVII-i (Disco)",
    chords: ["Am", "Dm", "G", "Am"],
    genre: "Disco",
    decade: "1970s",
    length: 4,
    description: "Classic disco progression",
  },
  {
    id: "disco-002",
    name: "I-ii-iii-IV (Disco Funk)",
    chords: ["C", "Dm", "Em", "F"],
    genre: "Disco",
    decade: "1970s",
    length: 4,
    description: "Funky disco progression",
  },
]

// Helper functions for filtering
export function getProgressionsByGenre(genre: string): ChordProgression[] {
  return CHORDONOMICON_DATABASE.filter((p) => p.genre === genre)
}

export function getProgressionsByDecade(decade: string): ChordProgression[] {
  return CHORDONOMICON_DATABASE.filter((p) => p.decade === decade)
}

export function getProgressionsByLength(length: number): ChordProgression[] {
  return CHORDONOMICON_DATABASE.filter((p) => p.length === length)
}

export function searchProgressions(query: string): ChordProgression[] {
  const lowerQuery = query.toLowerCase()
  return CHORDONOMICON_DATABASE.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery) ||
      p.genre.toLowerCase().includes(lowerQuery) ||
      p.chords.some((chord) => chord.toLowerCase().includes(lowerQuery)),
  )
}

export function getAllGenres(): string[] {
  return Array.from(new Set(CHORDONOMICON_DATABASE.map((p) => p.genre))).sort()
}

export function getAllDecades(): string[] {
  return Array.from(new Set(CHORDONOMICON_DATABASE.map((p) => p.decade))).sort()
}
