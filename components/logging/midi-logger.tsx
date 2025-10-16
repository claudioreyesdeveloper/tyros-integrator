"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Save } from "lucide-react"

export function MidiLogger() {
  const [port1, setPort1] = useState<string>("")
  const [port2, setPort2] = useState<string>("")

  const handleAutoconnect = () => {
    // Auto-detect MIDI ports
    console.log("[v0] Auto-connecting MIDI ports...")
  }

  const handleSave = () => {
    // Save port configuration
    console.log("[v0] Saving port configuration:", { port1, port2 })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuration</h1>
        <p className="text-muted-foreground">MIDI Port Configuration</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Port 1</Label>
            <Select value={port1} onValueChange={setPort1}>
              <SelectTrigger>
                <SelectValue placeholder="Select MIDI Port 1" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No device connected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Port 2</Label>
            <Select value={port2} onValueChange={setPort2}>
              <SelectTrigger>
                <SelectValue placeholder="Select MIDI Port 2" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No device connected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAutoconnect} className="flex-1">
              <Zap className="h-4 w-4 mr-2" />
              Autoconnect
            </Button>
            <Button onClick={handleSave} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
