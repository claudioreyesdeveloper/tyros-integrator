"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useLayout } from "@/lib/layout-context"
import { Monitor, Tablet, Smartphone, Save, RotateCcw, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { MidiLogger } from "@/components/logging/midi-logger"

export function ConfigPanel() {
  const { layoutMode, setLayoutMode, effectiveMode } = useLayout()

  const layoutOptions = [
    { id: "auto" as const, label: "Auto", icon: Smartphone, description: "Detect automatically" },
    { id: "desktop" as const, label: "Desktop", icon: Monitor, description: "Desktop layout" },
    { id: "ipad" as const, label: "iPad", icon: Tablet, description: "iPad optimized" },
  ]

  const handleSaveConfig = () => {
    console.log("[v0] Save configuration")
    // TODO: Implement save configuration logic
  }

  const handleResetConfig = () => {
    console.log("[v0] Reset configuration")
    setLayoutMode("auto")
    // TODO: Implement reset configuration logic
  }

  const handleExportConfig = () => {
    console.log("[v0] Export configuration")
    // TODO: Implement export configuration logic
  }

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-6 space-y-6 md:space-y-8 lg:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-4xl lg:text-3xl font-bold text-white premium-text">Configuration</h1>
        <p className="text-sm md:text-lg lg:text-base text-gray-300">Customize your Tyros5 Integrator experience</p>
      </div>

      <Card className="glossy-panel p-6 md:p-10 lg:p-8 space-y-6 md:space-y-8 lg:space-y-6">
        <div className="space-y-4 md:space-y-6 lg:space-y-4">
          <div className="space-y-2">
            <Label className="text-base md:text-2xl lg:text-lg font-semibold text-white premium-text">
              Layout Mode
            </Label>
            <p className="text-xs md:text-base lg:text-sm text-gray-400">
              Choose how the interface should be displayed. Currently using:{" "}
              <span className="font-semibold text-primary">{effectiveMode}</span> layout
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 lg:gap-4">
            {layoutOptions.map((option) => {
              const Icon = option.icon
              const isActive = layoutMode === option.id

              return (
                <button
                  key={option.id}
                  onClick={() => setLayoutMode(option.id)}
                  className={cn(
                    "flex flex-col items-center gap-3 md:gap-5 lg:gap-4 p-6 md:p-10 lg:p-8 rounded-xl transition-all",
                    "border-2 hover:scale-105 active:scale-95",
                    isActive
                      ? "glossy-button border-primary shadow-lg shadow-primary/50"
                      : "bg-black/30 border-white/20 hover:border-white/40",
                  )}
                >
                  <Icon
                    className={cn("w-8 h-8 md:w-14 md:h-14 lg:w-10 lg:h-10", isActive ? "text-black" : "text-primary")}
                  />
                  <div className="text-center space-y-1">
                    <div
                      className={cn(
                        "text-base md:text-2xl lg:text-lg font-bold premium-text",
                        isActive ? "text-black" : "text-white",
                      )}
                    >
                      {option.label}
                    </div>
                    <div
                      className={cn("text-xs md:text-base lg:text-sm", isActive ? "text-black/70" : "text-gray-400")}
                    >
                      {option.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-4 md:pt-6 lg:pt-4 border-t border-white/10">
          <div className="space-y-3 md:space-y-5 lg:space-y-4">
            <h3 className="text-sm md:text-xl lg:text-base font-semibold text-white premium-text">
              Layout Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 lg:gap-4 text-xs md:text-base lg:text-sm">
              <div className="bg-black/30 rounded-lg p-4 md:p-6 lg:p-4 space-y-2">
                <div className="font-semibold text-primary">Desktop Mode</div>
                <div className="text-gray-300">
                  Optimized for mouse and keyboard with standard control sizes following VST plugin standards.
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 md:p-6 lg:p-4 space-y-2">
                <div className="font-semibold text-primary">iPad Mode</div>
                <div className="text-gray-300">
                  Larger touch targets and spacing optimized for touch interaction following iOS Human Interface
                  Guidelines.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="glossy-panel p-6 md:p-10 lg:p-8 space-y-6 md:space-y-8 lg:space-y-6">
        <div className="space-y-4 md:space-y-6 lg:space-y-4">
          <div className="space-y-2">
            <Label className="text-base md:text-2xl lg:text-lg font-semibold text-white premium-text">
              Configuration Actions
            </Label>
            <p className="text-xs md:text-base lg:text-sm text-gray-400">Manage your configuration settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 lg:gap-4">
            <button
              onClick={handleSaveConfig}
              className="glossy-button flex flex-col items-center gap-3 md:gap-5 lg:gap-4 p-6 md:p-10 lg:p-8 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <Save className="w-8 h-8 md:w-14 md:h-14 lg:w-10 lg:h-10 text-black" />
              <div className="text-center space-y-1">
                <div className="text-base md:text-2xl lg:text-lg font-bold premium-text text-black">Save</div>
                <div className="text-xs md:text-base lg:text-sm text-black/70">Save current settings</div>
              </div>
            </button>

            <button
              onClick={handleResetConfig}
              className="glossy-button flex flex-col items-center gap-3 md:gap-5 lg:gap-4 p-6 md:p-10 lg:p-8 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-8 h-8 md:w-14 md:h-14 lg:w-10 lg:h-10 text-black" />
              <div className="text-center space-y-1">
                <div className="text-base md:text-2xl lg:text-lg font-bold premium-text text-black">Reset</div>
                <div className="text-xs md:text-base lg:text-sm text-black/70">Reset to defaults</div>
              </div>
            </button>

            <button
              onClick={handleExportConfig}
              className="glossy-button flex flex-col items-center gap-3 md:gap-5 lg:gap-4 p-6 md:p-10 lg:p-8 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-8 h-8 md:w-14 md:h-14 lg:w-10 lg:h-10 text-black" />
              <div className="text-center space-y-1">
                <div className="text-base md:text-2xl lg:text-lg font-bold premium-text text-black">Export</div>
                <div className="text-xs md:text-base lg:text-sm text-black/70">Export configuration</div>
              </div>
            </button>
          </div>
        </div>
      </Card>

      <MidiLogger />
    </div>
  )
}
