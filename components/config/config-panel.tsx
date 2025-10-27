"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Config } from "@/components/logging/config"

export function ConfigPanel() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
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
