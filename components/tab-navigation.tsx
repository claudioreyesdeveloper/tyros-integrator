"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Mic2, Sliders, BookOpen, Wrench, Music, Settings } from "lucide-react"

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "voices", label: "Voices", icon: Mic2 },
    { id: "mixer", label: "Mixer", icon: Sliders },
    { id: "registration", label: "Registration", icon: BookOpen },
    { id: "assembly", label: "Assembly", icon: Wrench },
    { id: "chords", label: "Chords", icon: Music },
    { id: "logging", label: "Configuration", icon: Settings },
  ]

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-auto p-0 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm whitespace-nowrap"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
