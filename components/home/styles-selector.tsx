"use client"

import { useEffect, useState } from "react"
import { Music2, Play, Square, PlayCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { loadStyles, getUniqueCategories, getStylesByCategory, type Style } from "@/lib/styles-data"
import { tyrosAPI } from "@/lib/tyros-api"

const VARIATION_OPTIONS = [
  "Intro 1",
  "Intro 2",
  "Intro 3",
  "Main 1",
  "Main 2",
  "Main 3",
  "Main 4",
  "Fillin",
  "Outro 1",
  "Outro 2",
  "Outro 3",
]

export function StylesSelector() {
  const [styles, setStyles] = useState<Style[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null)
  const [availableStyles, setAvailableStyles] = useState<Style[]>([])

  const [isExpanded, setIsExpanded] = useState(false)

  const [tempo, setTempo] = useState(120)
  const [variation, setVariation] = useState("Main 1")
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    loadStyles().then((loadedStyles) => {
      setStyles(loadedStyles)
      const cats = getUniqueCategories(loadedStyles)
      setCategories(cats)
      if (cats.length > 0) {
        setSelectedCategory(cats[0])
      }
    })
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      const stylesInCategory = getStylesByCategory(styles, selectedCategory)
      setAvailableStyles(stylesInCategory)
      if (stylesInCategory.length > 0) {
        setSelectedStyle(stylesInCategory[0])
      }
    }
  }, [selectedCategory, styles])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleStyleChange = (styleName: string) => {
    const style = availableStyles.find((s) => s.styleName === styleName)
    if (style) {
      setSelectedStyle(style)
      console.log("[v0] Selected style:", style)
    }
  }

  const handleStart = () => {
    tyrosAPI.sendCommand({ type: "style", action: "start" })
    setIsPlaying(true)
  }

  const handleStop = () => {
    tyrosAPI.sendCommand({ type: "style", action: "stop" })
    setIsPlaying(false)
  }

  const handleSyncStart = () => {
    tyrosAPI.sendCommand({ type: "style", action: "sync-start", enabled: true })
  }

  const handleTempoChange = (value: number[]) => {
    const newTempo = value[0]
    setTempo(newTempo)
    tyrosAPI.sendCommand({ type: "style", action: "tempo", value: newTempo })
  }

  const handleVariationChange = (value: string) => {
    setVariation(value)
    console.log("[v0] Variation changed to:", value)
  }

  return (
    <div className="premium-card p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-4 hover:bg-white/5 rounded-lg transition-colors p-2 -m-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center border-2 border-primary/40 shadow-lg shadow-primary/20">
            <Music2 className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="premium-text text-base font-bold">{selectedStyle?.styleName || "Select a Style"}</h3>
            {selectedCategory && <p className="text-xs text-gray-400">{selectedCategory}</p>}
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-primary" />}
      </button>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-primary/20 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {/* Category dropdown */}
            <div>
              <label className="text-xs premium-label block mb-2">Category</label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full bg-black/20 backdrop-blur-sm border border-primary/30 hover:border-primary/50 text-white font-semibold h-11 rounded-lg">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-md border-2 border-primary/30 text-white">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="text-white font-semibold hover:bg-primary/20 focus:bg-primary focus:text-black"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Style dropdown */}
            <div>
              <label className="text-xs premium-label block mb-2">Style Name</label>
              <Select value={selectedStyle?.styleName || ""} onValueChange={handleStyleChange}>
                <SelectTrigger className="w-full bg-black/20 backdrop-blur-sm border border-primary/30 hover:border-primary/50 text-white font-semibold h-11 rounded-lg">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-md border-2 border-primary/30 text-white">
                  {availableStyles.map((style) => (
                    <SelectItem
                      key={style.styleName}
                      value={style.styleName}
                      className="text-white font-semibold hover:bg-primary/20 focus:bg-primary focus:text-black"
                    >
                      {style.styleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Variation dropdown */}
            <div>
              <label className="text-xs premium-label block mb-2">Variation</label>
              <Select value={variation} onValueChange={handleVariationChange}>
                <SelectTrigger className="w-full bg-black/20 backdrop-blur-sm border border-primary/30 hover:border-primary/50 text-white font-semibold h-11 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-md border-2 border-primary/30 text-white">
                  {VARIATION_OPTIONS.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="text-white font-semibold hover:bg-primary/20 focus:bg-primary focus:text-black"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tempo slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs premium-label">Tempo</label>
                <span className="text-sm font-bold text-primary">{tempo} BPM</span>
              </div>
              <Slider
                value={[tempo]}
                onValueChange={handleTempoChange}
                min={30}
                max={400}
                step={1}
                className="w-full"
              />
            </div>

            {/* Transport controls */}
            <div>
              <label className="text-xs premium-label block mb-2">Transport</label>
              <div className="flex gap-2">
                <Button onClick={handleStart} disabled={isPlaying} size="lg" className="flex-1 h-11">
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
                <Button
                  onClick={handleStop}
                  disabled={!isPlaying}
                  variant="destructive"
                  size="lg"
                  className="flex-1 h-11"
                >
                  <Square className="w-4 h-4 mr-1" />
                  Stop
                </Button>
                <Button onClick={handleSyncStart} size="lg" className="flex-1 h-11">
                  <PlayCircle className="w-4 h-4 mr-1" />
                  Sync
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
