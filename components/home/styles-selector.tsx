"use client"

import { useEffect, useState } from "react"
import { Music2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { loadStyles, getUniqueCategories, getStylesByCategory, type Style } from "@/lib/styles-data"

export function StylesSelector() {
  const [styles, setStyles] = useState<Style[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null)
  const [availableStyles, setAvailableStyles] = useState<Style[]>([])

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
      // TODO: Send MIDI SysEx message
      console.log("[v0] Selected style:", style)
    }
  }

  return (
    <div className="premium-card p-8 flex flex-col items-center gap-6">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center border-4 border-primary/40 transition-all shadow-lg shadow-primary/20">
        <Music2 className="w-12 h-12 text-primary" />
      </div>

      <div className="text-center w-full space-y-4">
        <h3 className="premium-text text-2xl mb-2">Styles</h3>

        {selectedStyle && (
          <div className="mb-4">
            <p className="text-base font-semibold text-foreground">{selectedStyle.styleName}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm premium-label block text-left">Category</label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-12 rounded-xl transition-all">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                {categories.map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black"
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm premium-label block text-left">Style Name</label>
            <Select value={selectedStyle?.styleName || ""} onValueChange={handleStyleChange}>
              <SelectTrigger className="w-full bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-12 rounded-xl transition-all">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                {availableStyles.map((style) => (
                  <SelectItem
                    key={style.styleName}
                    value={style.styleName}
                    className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black"
                  >
                    {style.styleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
