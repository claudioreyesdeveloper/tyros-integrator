"use client"

import { useMIDI } from "@/lib/midi-context"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff } from "lucide-react"

export function MIDIStatus() {
  const { isConnected, outputs, selectedOutput, selectOutput, requestMIDIAccess, error, isSupported } = useMIDI()

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-primary" />
        ) : (
          <WifiOff className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{isConnected ? "MIDI Connected" : "MIDI Disconnected"}</span>
      </div>

      {isConnected && outputs.length > 0 && (
        <select
          value={selectedOutput?.id || ""}
          onChange={(e) => {
            const output = outputs.find((o) => o.id === e.target.value)
            if (output) selectOutput(output)
          }}
          className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded border border-border"
        >
          {outputs.map((output) => (
            <option key={output.id} value={output.id}>
              {output.name}
            </option>
          ))}
        </select>
      )}

      {!isConnected && isSupported && !error && (
        <Button size="sm" variant="outline" onClick={requestMIDIAccess}>
          Connect MIDI
        </Button>
      )}
    </div>
  )
}
