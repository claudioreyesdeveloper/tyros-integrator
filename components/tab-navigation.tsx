"use client"

import { Home, Music, Sliders, Save } from "lucide-react"
import { cn } from "@/lib/utils"

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "voices", label: "Voices", icon: Music },
  { id: "mixer", label: "Mixer", icon: Sliders },
  { id: "registration", label: "Registration", icon: Save },
]

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="flex items-center gap-2 border-b-2 border-primary/30 px-6">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-3 px-8 py-5 text-sm font-bold transition-all relative rounded-t-lg",
              "hover:text-white drop-shadow-lg",
              isActive ? "glossy-button text-black shadow-lg" : "text-gray-300 hover:bg-white/10 backdrop-blur-sm",
            )}
          >
            <Icon className="w-5 h-5" />
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
