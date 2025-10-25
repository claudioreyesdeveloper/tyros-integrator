"use client"

import { useState } from "react"
import { Play, Square, RotateCcw, Send, Plus, Minus, Music2, ChevronRight, Folder, FileMusic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ChordProgression {
  id: string
  name: string // Variation name (e.g., "Variation 1", "Variation 2")
  type: "Intro" | "Verse" | "Chorus" | "Bridge" | "Outro"
  bars: number
  key: string
  chords: string[]
  category: string // Style type
  subcategory: string // Song name
}

interface YamahaStyle {
  id: string
  name: string
  tempo: number
  category: string
}

const MOCK_PROGRESSIONS: ChordProgression[] = [
  // Ballad Song 01 - Intro variations
  {
    id: "ballad_song01_intro_v1",
    name: "Variation 1",
    type: "Intro",
    bars: 4,
    key: "C",
    chords: ["C", "G", "Am", "F"],
    category: "Ballad",
    subcategory: "Ballad Song 01",
  },
  {
    id: "ballad_song01_intro_v2",
    name: "Variation 2",
    type: "Intro",
    bars: 4,
    key: "C",
    chords: ["Cmaj7", "G7", "Am7", "Fmaj7"],
    category: "Ballad",
    subcategory: "Ballad Song 01",
  },
  // Ballad Song 01 - Verse variations
  {
    id: "ballad_song01_verse_v1",
    name: "Variation 1",
    type: "Verse",
    bars: 8,
    key: "C",
    chords: ["Cmaj7", "Am7", "Dm7", "G7", "Cmaj7", "Am7", "Fmaj7", "G7"],
    category: "Ballad",
    subcategory: "Ballad Song 01",
  },
  {
    id: "ballad_song01_verse_v2",
    name: "Variation 2",
    type: "Verse",
    bars: 8,
    key: "C",
    chords: ["C", "Am", "Dm", "G", "C", "Am", "F", "G"],
    category: "Ballad",
    subcategory: "Ballad Song 01",
  },
  // Ballad Song 01 - Chorus variations
  {
    id: "ballad_song01_chorus_v1",
    name: "Variation 1",
    type: "Chorus",
    bars: 8,
    key: "C",
    chords: ["C", "G", "Am", "F", "C", "G", "F", "G"],
    category: "Ballad",
    subcategory: "Ballad Song 01",
  },
  {
    id: "ballad_song01_chorus_v2",
    name: "Variation 2",
    type: "Chorus",
    bars: 8,
    key: "C",
    chords: ["C", "G/B", "Am", "F", "C/E", "G", "F", "G"],
    category: "Ballad",
    subcategory: "Ballad Song 01",
  },
  // Ballad Song 01 - Bridge variations
  {
    id: "ballad_song01_bridge_v1",
    name: "Variation 1",
    type: "Bridge",
    bars: 4,
    key: "C",
    chords: ["Dm", "G", "Em", "Am"],
    category: "Ballad",
    subcategory: "Ballad Song 01",
  },
  // Ballad Song 01 - Outro variations
  {
    id: "ballad_song01_outro_v1",
    name: "Variation 1",
    type: "Outro",
    bars: 4,
    key: "C",
    chords: ["F", "G", "C", "C"],
    category: "Ballad",
    subcategory: "Ballad Song 01",
  },
  // Pop/Rock Song 01 - Intro variations
  {
    id: "pop_song01_intro_v1",
    name: "Variation 1",
    type: "Intro",
    bars: 4,
    key: "D",
    chords: ["D", "A", "Bm", "G"],
    category: "Pop/Rock",
    subcategory: "Pop Song 01",
  },
  {
    id: "pop_song01_intro_v2",
    name: "Variation 2",
    type: "Intro",
    bars: 4,
    key: "D",
    chords: ["D5", "A5", "Bm", "G5"],
    category: "Pop/Rock",
    subcategory: "Pop Song 01",
  },
  // Pop/Rock Song 01 - Verse variations
  {
    id: "pop_song01_verse_v1",
    name: "Variation 1",
    type: "Verse",
    bars: 8,
    key: "D",
    chords: ["D", "A", "Bm", "G", "D", "A", "Em", "A"],
    category: "Pop/Rock",
    subcategory: "Pop Song 01",
  },
  // Pop/Rock Song 01 - Chorus variations
  {
    id: "pop_song01_chorus_v1",
    name: "Variation 1",
    type: "Chorus",
    bars: 8,
    key: "D",
    chords: ["D", "A", "Bm", "G", "D", "A", "G", "A"],
    category: "Pop/Rock",
    subcategory: "Pop Song 01",
  },
  // Jazz Song 01 - Intro variations
  {
    id: "jazz_song01_intro_v1",
    name: "Variation 1",
    type: "Intro",
    bars: 4,
    key: "F",
    chords: ["Fmaj7", "Bb7", "Gm7", "C7"],
    category: "Jazz",
    subcategory: "Jazz Song 01",
  },
  // Jazz Song 01 - Verse variations
  {
    id: "jazz_song01_verse_v1",
    name: "Variation 1",
    type: "Verse",
    bars: 8,
    key: "F",
    chords: ["Fmaj7", "Dm7", "Gm7", "C7", "Am7", "D7", "Gm7", "C7"],
    category: "Jazz",
    subcategory: "Jazz Song 01",
  },
]

const YAMAHA_STYLES: YamahaStyle[] = [
  { id: "acoustic_ballad", name: "Acoustic Ballad", tempo: 96, category: "Ballad" },
  { id: "latin_pop", name: "Latin Pop", tempo: 110, category: "Latin" },
  { id: "jazz_swing", name: "Jazz Swing", tempo: 120, category: "Jazz" },
  { id: "country_rock", name: "Country Rock", tempo: 128, category: "Country" },
  { id: "blues_shuffle", name: "Blues Shuffle", tempo: 100, category: "Blues" },
]

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case "Intro":
      return "bg-blue-500/20 text-blue-400 border-blue-500/40"
    case "Verse":
      return "bg-green-500/20 text-green-400 border-green-500/40"
    case "Chorus":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40"
    case "Bridge":
      return "bg-purple-500/20 text-purple-400 border-purple-500/40"
    case "Outro":
      return "bg-red-500/20 text-red-400 border-red-500/40"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/40"
  }
}

export function ChordAssistant() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedSongs, setExpandedSongs] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedProgression, setSelectedProgression] = useState<ChordProgression | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [transpose, setTranspose] = useState(0)
  const [selectedStyle, setSelectedStyle] = useState<YamahaStyle>(YAMAHA_STYLES[0])
  const [tempo, setTempo] = useState(selectedStyle.tempo)

  const categories = Array.from(new Set(MOCK_PROGRESSIONS.map((p) => p.category)))

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleSong = (song: string) => {
    const newExpanded = new Set(expandedSongs)
    if (newExpanded.has(song)) {
      newExpanded.delete(song)
    } else {
      newExpanded.add(song)
    }
    setExpandedSongs(newExpanded)
  }

  const getSubcategoriesForCategory = (category: string) => {
    return Array.from(new Set(MOCK_PROGRESSIONS.filter((p) => p.category === category).map((p) => p.subcategory)))
  }

  const getTypesForSong = (category: string, subcategory: string) => {
    return Array.from(
      new Set(
        MOCK_PROGRESSIONS.filter((p) => p.category === category && p.subcategory === subcategory).map((p) => p.type),
      ),
    )
  }

  const progressions =
    selectedCategory && selectedSubcategory && selectedType
      ? MOCK_PROGRESSIONS.filter(
          (p) => p.category === selectedCategory && p.subcategory === selectedSubcategory && p.type === selectedType,
        )
      : []

  const handlePlay = () => {
    if (!selectedProgression) return
    setIsPlaying(!isPlaying)
  }

  const handleStop = () => {
    setIsPlaying(false)
  }

  const handleSendToLooper = () => {
    if (!selectedProgression) return
    console.log("[v0] Sending progression to Looper:", selectedProgression)
  }

  const handleStyleChange = (styleId: string) => {
    const style = YAMAHA_STYLES.find((s) => s.id === styleId)
    if (style) {
      setSelectedStyle(style)
      setTempo(style.tempo)
    }
  }

  const handleProgressionDoubleClick = (progression: ChordProgression) => {
    setSelectedProgression(progression)
    handleSendToLooper()
  }

  return (
    <div className="h-full flex flex-col bg-transparent backdrop-blur-sm">
      <div className="p-6 border-b border-border glossy-panel shadow-2xl shadow-black/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Chord Library</h2>
            <p className="text-sm text-gray-400 mt-1">Browse and preview chord progressions</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 whitespace-nowrap">Style:</span>
            <Select value={selectedStyle.id} onValueChange={handleStyleChange}>
              <SelectTrigger className="w-[200px] bg-black/30 border border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 backdrop-blur-md border-2 border-primary/30">
                {YAMAHA_STYLES.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    {style.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[400px_1fr] gap-6 p-6 overflow-hidden">
        {/* Left Panel: Tree View (3 levels) */}
        <div className="flex flex-col gap-4">
          <h3 className="premium-label text-xs uppercase tracking-widest px-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/70 rounded-full"></span>
            LIBRARY
          </h3>
          <ScrollArea className="flex-1">
            <div className="space-y-0.5 pr-3">
              {categories.map((category) => {
                const isExpanded = expandedCategories.has(category)
                const subcategories = getSubcategoriesForCategory(category)

                return (
                  <div key={category}>
                    {/* Level 1: Style Type - Windows Explorer folder style */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className={cn(
                        "w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm transition-colors",
                        "hover:bg-white/10 text-white",
                        selectedCategory === category && "bg-primary/20",
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          "w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0",
                          isExpanded && "rotate-90",
                        )}
                      />
                      {isExpanded ? (
                        <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      ) : (
                        <Folder className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="flex-1 text-left truncate">{category}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">({subcategories.length})</span>
                    </button>

                    {/* Level 2: Song Names - indented 16px */}
                    {isExpanded && (
                      <div className="ml-4">
                        {subcategories.map((subcategory) => {
                          const isSongExpanded = expandedSongs.has(`${category}-${subcategory}`)
                          const types = getTypesForSong(category, subcategory)

                          return (
                            <div key={subcategory}>
                              <button
                                onClick={() => toggleSong(`${category}-${subcategory}`)}
                                className={cn(
                                  "w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm transition-colors",
                                  "hover:bg-white/10 text-white",
                                  selectedSubcategory === subcategory && "bg-primary/20",
                                )}
                              >
                                <ChevronRight
                                  className={cn(
                                    "w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0",
                                    isSongExpanded && "rotate-90",
                                  )}
                                />
                                <FileMusic className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                <span className="flex-1 text-left truncate">{subcategory}</span>
                                <span className="text-xs text-gray-500 flex-shrink-0">({types.length})</span>
                              </button>

                              {/* Level 3: Progression Types - indented 32px total */}
                              {isSongExpanded && (
                                <div className="ml-4">
                                  {types.map((type) => (
                                    <button
                                      key={type}
                                      onClick={() => {
                                        setSelectedCategory(category)
                                        setSelectedSubcategory(subcategory)
                                        setSelectedType(type)
                                      }}
                                      className={cn(
                                        "w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm transition-colors",
                                        selectedCategory === category &&
                                          selectedSubcategory === subcategory &&
                                          selectedType === type
                                          ? "bg-primary/30 text-white font-medium"
                                          : "hover:bg-white/10 text-white",
                                      )}
                                    >
                                      <div className="w-3.5 h-3.5 flex-shrink-0" />
                                      <Music2 className="w-4 h-4 text-primary flex-shrink-0" />
                                      <span className="flex-1 text-left truncate">{type}</span>
                                      <div
                                        className={cn(
                                          "w-5 h-5 rounded flex items-center justify-center text-xs font-bold border flex-shrink-0",
                                          getTypeBadgeColor(type),
                                        )}
                                      >
                                        {type.slice(0, 1)}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel: Chord Progressions List */}
        <div className="flex flex-col gap-4">
          <h3 className="premium-label text-xs uppercase tracking-widest px-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/70 rounded-full"></span>
            CHORD PROGRESSIONS
          </h3>
          <ScrollArea className="flex-1">
            {selectedType ? (
              <div className="space-y-3 pr-3">
                {progressions.length > 0 ? (
                  progressions.map((progression) => (
                    <div
                      key={progression.id}
                      onClick={() => setSelectedProgression(progression)}
                      onDoubleClick={() => handleProgressionDoubleClick(progression)}
                      className={cn(
                        "p-5 rounded-2xl cursor-pointer transition-all duration-300 shadow-lg",
                        selectedProgression?.id === progression.id
                          ? "glossy-button text-black shadow-2xl shadow-primary/60 scale-[1.02]"
                          : "premium-card text-white border-2 border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20",
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-bold">{progression.name}</h4>
                          <p
                            className={cn(
                              "text-xs mt-1",
                              selectedProgression?.id === progression.id ? "text-black/60" : "text-gray-400",
                            )}
                          >
                            {progression.bars} bars • {progression.key} • {progression.chords.length} chords
                          </p>
                        </div>
                        <div
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold border",
                            selectedProgression?.id === progression.id
                              ? "bg-black/20 border-black/30 text-black"
                              : getTypeBadgeColor(progression.type),
                          )}
                        >
                          {progression.type}
                        </div>
                      </div>

                      {/* Chord Blocks */}
                      <div className="grid grid-cols-8 gap-2">
                        {progression.chords.map((chord, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all",
                              selectedProgression?.id === progression.id
                                ? "bg-black/20 border-black/30 text-black"
                                : "bg-black/40 border-primary/30 text-primary hover:border-primary/50",
                            )}
                          >
                            {chord}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-center text-zinc-500 py-8 font-medium">No progressions found</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-zinc-500 py-8 font-medium">
                  Select a progression type from the tree to view progressions
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      <div className="border-t border-primary/20 bg-black/40 backdrop-blur-sm p-4">
        <div className="max-w-7xl mx-auto">
          {selectedProgression ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className="bg-black/50 border border-primary/20 rounded-lg p-3 flex-1">
                  <div className="text-xs text-gray-500 mb-1">Now Playing</div>
                  <div className="text-base font-bold text-white">{selectedProgression.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedProgression.bars} bars • {selectedProgression.key} • {selectedProgression.chords.length}{" "}
                    chords
                  </div>
                </div>

                <div className="bg-black/50 border border-primary/20 rounded-lg p-3 w-44">
                  <div className="text-xs text-gray-500 mb-2">Transpose</div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setTranspose(Math.max(-12, transpose - 1))}
                      className="h-7 w-7 p-0 hover:bg-primary/20 border border-primary/20"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-base font-bold text-white w-10 text-center">
                      {transpose > 0 ? `+${transpose}` : transpose}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setTranspose(Math.min(12, transpose + 1))}
                      className="h-7 w-7 p-0 hover:bg-primary/20 border border-primary/20"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="bg-black/50 border border-primary/20 rounded-lg p-3 w-44">
                  <div className="text-xs text-gray-500 mb-2">Tempo</div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setTempo(Math.max(40, tempo - 1))}
                      className="h-7 w-7 p-0 hover:bg-primary/20 border border-primary/20"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-base font-bold text-white w-14 text-center">{tempo}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setTempo(Math.min(240, tempo + 1))}
                      className="h-7 w-7 p-0 hover:bg-primary/20 border border-primary/20"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePlay}
                  size="lg"
                  className={cn(
                    "w-28 h-11",
                    isPlaying
                      ? "glossy-button"
                      : "bg-black/50 border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/10",
                  )}
                >
                  {isPlaying ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>

                <Button
                  onClick={handleStop}
                  size="lg"
                  variant="outline"
                  className="h-11 w-11 p-0 bg-black/50 border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/10"
                >
                  <Square className="w-4 h-4" />
                </Button>

                <Button
                  onClick={() => setIsLooping(!isLooping)}
                  size="lg"
                  variant="outline"
                  className={cn(
                    "h-11 w-11 p-0",
                    isLooping
                      ? "glossy-button"
                      : "bg-black/50 border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/10",
                  )}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <div className="w-px h-10 bg-primary/20 mx-1" />

                <Button onClick={handleSendToLooper} size="lg" className="glossy-button px-6 h-11">
                  <Send className="w-4 h-4 mr-2" />
                  Send to Looper
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 font-medium text-sm">Select a progression to preview and control playback</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
