"use client"

import { cn } from "@/lib/utils"
import { Home, Music, Sliders, BookOpen, Layers, Music2, Settings } from "lucide-react"

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "voices", label: "Voices", icon: Music },
  { id: "mixer", label: "Mixer", icon: Sliders },
  { id: "registration", label: "Registration", icon: BookOpen },
  { id: "assembly", label: "Assembly", icon: Layers },
  { id: "chords", label: "Composer", icon: Music2 },
  { id: "config", label: "Configuration", icon: Settings },
]

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="flex items-center gap-1 md:gap-2 bg-[oklch(0.16_0.01_270)] border-b border-[oklch(0.28_0.02_270)] px-3 md:px-4 lg:px-6 overflow-x-auto backdrop-blur-xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center justify-start gap-2 md:gap-3 px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 text-xs md:text-sm font-semibold transition-all relative rounded-t-xl whitespace-nowrap min-w-fit",
              "hover:text-white",
              isActive
                ? "bg-gradient-to-b from-[oklch(0.65_0.18_250)] to-[oklch(0.55_0.18_250)] text-white shadow-lg shadow-[oklch(0.55_0.18_250)]/30"
                : "text-gray-300 hover:bg-[oklch(0.20_0.01_270)] backdrop-blur-sm",
            )}
          >
            <Icon className="flex-shrink-0" size={20} strokeWidth={2.5} />
            <span className="font-medium text-left">{tab.label}</span>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[oklch(0.65_0.18_250)] shadow-lg shadow-[oklch(0.55_0.18_250)]/50" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
