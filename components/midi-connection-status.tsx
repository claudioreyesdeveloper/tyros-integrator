"use client"

import { useMIDI } from "@/hooks/use-midi"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Cable, CircleOff as CableOff } from "lucide-react"

export function MIDIConnectionStatus() {
  const { isSupported, isConnected, inputs, outputs, selectedInput, selectedOutput, selectInput, selectOutput } =
    useMIDI()

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2">
        <CableOff className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive">Web MIDI API not supported in this browser</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Cable className="h-4 w-4 text-accent" />
          ) : (
            <CableOff className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">MIDI Connection</span>
        </div>
        <Badge variant={isConnected ? "default" : "secondary"}>{isConnected ? "Connected" : "Disconnected"}</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">MIDI Output (To Tyros5)</label>
          <Select
            value={selectedOutput?.id || "none"}
            onValueChange={(value) => {
              const output = outputs.find((o) => o.id === value)
              selectOutput(output || null)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select output device" />
            </SelectTrigger>
            <SelectContent>
              {outputs.length === 0 ? (
                <SelectItem value="none" disabled>
                  No MIDI devices found
                </SelectItem>
              ) : (
                outputs.map((output) => (
                  <SelectItem key={output.id} value={output.id}>
                    {output.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">MIDI Input (From Tyros5)</label>
          <Select
            value={selectedInput?.id || "none"}
            onValueChange={(value) => {
              const input = inputs.find((i) => i.id === value)
              selectInput(input || null)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select input device" />
            </SelectTrigger>
            <SelectContent>
              {inputs.length === 0 ? (
                <SelectItem value="none" disabled>
                  No MIDI devices found
                </SelectItem>
              ) : (
                inputs.map((input) => (
                  <SelectItem key={input.id} value={input.id}>
                    {input.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
