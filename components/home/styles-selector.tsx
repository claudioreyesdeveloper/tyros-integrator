"use client"

import { useEffect, useState } from "react"
import { Music2, Play, Square, PlayCircle } from "lucide-react"
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
    <div className="premium-card p-6 flex gap-6 h-full">
      {/* Icon section - left side */}
      <div className="flex flex-col items-center justify-center gap-3 min-w-[140px]">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center border-4 border-primary/40 transition-all shadow-lg shadow-primary/20">
          <Music2 className="w-12 h-12 text-primary" />
        </div>
        <h3 className="premium-text text-xl">Styles</h3>
      </div>

      {/* Controls section - right side */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Left column - Style selection */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs premium-label block">Category</label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full bg-black/20 backdrop-blur-sm border-2 border-primary/30 hover:border-primary/50 focus:border-primary text-white font-semibold h-10 rounded-xl transition-all text-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 backdrop-blur-md border-2 border-primary/30 text-white">
                {categories.map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="text-white font-semibold hover:bg-primary/20 focus:bg-primary focus:text-black text-sm"
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs premium-label block">Style Name</label>
            <Select value={selectedStyle?.styleName || ""} onValueChange={handleStyleChange}>
              <SelectTrigger className="w-full bg-black/20 backdrop-blur-sm border-2 border-primary/30 hover:border-primary/50 focus:border-primary text-white font-semibold h-10 rounded-xl transition-all text-sm">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 backdrop-blur-md border-2 border-primary/30 text-white">
                {availableStyles.map((style) => (
                  <SelectItem
                    key={style.styleName}
                    value={style.styleName}
                    className="text-white font-semibold hover:bg-primary/20 focus:bg-primary focus:text-black text-sm"
                  >
                    {style.styleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs premium-label block">Variation</label>
            <Select value={variation} onValueChange={handleVariationChange}>
              <SelectTrigger className="w-full bg-black/20 backdrop-blur-sm border-2 border-primary/30 hover:border-primary/50 focus:border-primary text-white font-semibold h-10 rounded-xl transition-all text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 backdrop-blur-md border-2 border-primary/30 text-white">
                {VARIATION_OPTIONS.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="text-white font-semibold hover:bg-primary/20 focus:bg-primary focus:text-black text-sm"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right column - Transport and tempo */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs premium-label block">Transport</label>
            <div className="flex gap-2">
              <Button onClick={handleStart} disabled={isPlaying} size="sm" className="flex-1 h-10">
                <Play className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleStop}
                disabled={!isPlaying}
                variant="destructive"
                size="sm"
                className="flex-1 h-10"
              >
                <Square className="w-4 h-4" />
              </Button>
              <Button onClick={handleSyncStart} size="sm" className="flex-1 h-10">
                <PlayCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs premium-label">Tempo</label>
              <span className="text-xs font-semibold text-white">{tempo} BPM</span>
            </div>
            <Slider value={[tempo]} onValueChange={handleTempoChange} min={30} max={400} step={1} className="w-full" />
          </div>

          {selectedStyle && (
            <div className="pt-2">
              <p className="text-xs premium-label mb-1">Current Style</p>
              <p className="text-sm font-semibold text-white truncate">{selectedStyle.styleName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
