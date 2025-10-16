"use client"

import { Home, Music, Sliders, ScrollText, Wrench, Music2, BookMarked } from "lucide-react"
import { cn } from "@/lib/utils"

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "voices", label: "Voices", icon: Music },
  { id: "mixer", label: "Mixer", icon: Sliders },
  { id: "registration", label: "Registration", icon: BookMarked },
  { id: "assembly", label: "Assembly", icon: Wrench },
  { id: "chords", label: "Chords", icon: Music2 },
  { id: "logging", label: "Configuration", icon: ScrollText },
]

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="flex items-center gap-1 md:gap-2 border-b-2 border-primary/30 px-3 md:px-4 lg:px-6 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 md:gap-3 px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 text-xs md:text-sm font-bold transition-all relative rounded-t-lg whitespace-nowrap",
              "hover:text-white drop-shadow-lg",
              isActive ? "glossy-button text-black shadow-lg" : "text-gray-300 hover:bg-white/10 backdrop-blur-sm",
            )}
          >
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
            <span className="premium-text">{tab.label}</span>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-lg shadow-primary/50" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
