"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLayout } from "@/lib/layout-context"
import { Config } from "@/components/logging/config"

export function ConfigPanel() {
  const { mode, effectiveMode, setMode } = useLayout()

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Layout Mode Selection */}
      <Card className="premium-card p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 premium-text">Layout Mode</h2>
        <p className="text-xs md:text-sm text-gray-300 mb-3 md:mb-4">
          Choose how the interface should be displayed. Auto mode detects your device automatically.
        </p>
        <div className="flex gap-2 md:gap-3">
          <Button
            variant={mode === "auto" ? "default" : "outline"}
            onClick={() => setMode("auto")}
            className={
              mode === "auto"
                ? "flex-1 glossy-button h-12 md:h-10 text-sm md:text-base"
                : "flex-1 glossy-panel bg-transparent text-white h-12 md:h-10 text-sm md:text-base"
            }
          >
            Auto {mode === "auto" && `(${effectiveMode === "ipad" ? "iPad" : "Desktop"})`}
          </Button>
          <Button
            variant={mode === "desktop" ? "default" : "outline"}
            onClick={() => setMode("desktop")}
            className={
              mode === "desktop"
                ? "flex-1 glossy-button h-12 md:h-10 text-sm md:text-base"
                : "flex-1 glossy-panel bg-transparent text-white h-12 md:h-10 text-sm md:text-base"
            }
          >
            Desktop
          </Button>
          <Button
            variant={mode === "ipad" ? "default" : "outline"}
            onClick={() => setMode("ipad")}
            className={
              mode === "ipad"
                ? "flex-1 glossy-button h-12 md:h-10 text-sm md:text-base"
                : "flex-1 glossy-panel bg-transparent text-white h-12 md:h-10 text-sm md:text-base"
            }
          >
            iPad
          </Button>
        </div>
        <div className="mt-3 md:mt-4 text-xs md:text-sm text-gray-400">
          Current mode:{" "}
          <span className="font-semibold text-white">{effectiveMode === "ipad" ? "iPad" : "Desktop"}</span>
        </div>
      </Card>

      {/* Configuration Actions */}
      <Card className="premium-card p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 premium-text">Configuration Actions</h2>
        <div className="flex gap-2 md:gap-3">
          <Button variant="default" className="flex-1 glossy-button h-12 md:h-10 text-sm md:text-base">
            Save Settings
          </Button>
          <Button variant="outline" className="flex-1 glossy-panel bg-transparent h-12 md:h-10 text-sm md:text-base">
            Reset to Default
          </Button>
          <Button variant="outline" className="flex-1 glossy-panel bg-transparent h-12 md:h-10 text-sm md:text-base">
            Export Config
          </Button>
        </div>
      </Card>

      {/* Config */}
      <Config />
    </div>
  )
}
