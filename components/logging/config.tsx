"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Download } from "lucide-react"

export function Config() {
  const handleExportLogs = () => {
    console.log("[v0] Export logs functionality removed")
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="glossy-panel p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">MIDI Activity Log</h2>
            <p className="text-sm text-gray-300">Real-time MIDI message monitoring (disabled)</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportLogs}
              variant="outline"
              size="sm"
              className="glossy-button text-xs md:text-sm bg-transparent"
              disabled
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="glossy-button text-xs md:text-sm bg-transparent" disabled>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        <div className="text-center py-8 text-gray-400">
          MIDI functionality has been removed. This is now a UI-only demonstration.
        </div>
      </div>
    </div>
  )
}
