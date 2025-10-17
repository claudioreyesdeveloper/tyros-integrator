"use client"

import { Home, Music, Sliders, ScrollText, Wrench, Music2, BookMarked } from "lucide-react"
import { cn } from "@/lib/utils"

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "home", label: "Home", icon: Home, color: "text-blue-400" },
  { id: "voices", label: "Voices", icon: Music, color: "text-purple-400" },
  { id: "mixer", label: "Mixer", icon: Sliders, color: "text-green-400" },
  { id: "registration", label: "Registration", icon: BookMarked, color: "text-orange-400" },
  { id: "assembly", label: "Assembly", icon: Wrench, color: "text-red-400" },
  { id: "chords", label: "Chords", icon: Music2, color: "text-pink-400" },
  { id: "config", label: "Configuration", icon: ScrollText, color: "text-cyan-400" },
]

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="flex items-center gap-2 md:gap-4 lg:gap-3 border-b-2 md:border-b-3 lg:border-b-2 border-primary/40 px-4 md:px-8 lg:px-6 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center justify-start gap-2 md:gap-4 lg:gap-3 px-4 md:px-8 lg:px-6 py-2 md:py-5 lg:py-3 text-sm md:text-xl lg:text-base font-bold transition-all relative rounded-t-xl whitespace-nowrap min-w-fit",
              "hover:text-white drop-shadow-lg",
              isActive ? "glossy-button text-black shadow-xl" : "text-gray-300 hover:bg-white/10 backdrop-blur-sm",
            )}
          >
            <Icon
              className={cn("w-4 h-4 md:w-7 md:h-7 lg:w-5 lg:h-5 flex-shrink-0", isActive ? "text-black" : tab.color)}
            />
            <span className="premium-text text-left text-sm md:text-xl lg:text-base">{tab.label}</span>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 md:h-2 lg:h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-lg shadow-primary/60" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
