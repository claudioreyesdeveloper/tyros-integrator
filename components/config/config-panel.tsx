"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLayout } from "@/lib/layout-context"
import { MidiLogger } from "@/components/logging/midi-logger"

export function ConfigPanel() {
  const { mode, effectiveMode, setMode } = useLayout()

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Layout Mode Selection */}
      <Card className="p-6 bg-black/40 backdrop-blur-sm border-primary/30">
        <h2 className="text-xl font-semibold mb-4 text-white">Layout Mode</h2>
        <p className="text-sm text-gray-300 mb-4">
          Choose how the interface should be displayed. Auto mode detects your device automatically.
        </p>
        <div className="flex gap-3">
          <Button variant={mode === "auto" ? "default" : "outline"} onClick={() => setMode("auto")} className="flex-1">
            Auto {mode === "auto" && `(${effectiveMode === "ipad" ? "iPad" : "Desktop"})`}
          </Button>
          <Button
            variant={mode === "desktop" ? "default" : "outline"}
            onClick={() => setMode("desktop")}
            className="flex-1"
          >
            Desktop
          </Button>
          <Button variant={mode === "ipad" ? "default" : "outline"} onClick={() => setMode("ipad")} className="flex-1">
            iPad
          </Button>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          Current mode:{" "}
          <span className="font-semibold text-white">{effectiveMode === "ipad" ? "iPad" : "Desktop"}</span>
        </div>
      </Card>

      {/* Configuration Actions */}
      <Card className="p-6 bg-black/40 backdrop-blur-sm border-primary/30">
        <h2 className="text-xl font-semibold mb-4 text-white">Configuration Actions</h2>
        <div className="flex gap-3">
          <Button variant="default" className="flex-1">
            Save Settings
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            Reset to Default
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            Export Config
          </Button>
        </div>
      </Card>

      {/* MIDI Logger */}
      <MidiLogger />
    </div>
  )
}
