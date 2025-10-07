"use client"

import { useMIDI } from "@/lib/midi-context"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff } from "lucide-react"

export function MIDIStatus() {
  const { isConnected, outputs, selectedOutput, selectOutput, requestMIDIAccess, error, isSupported } = useMIDI()

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 bg-card border-b border-border">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
        )}
        <span className="text-xs md:text-sm font-medium">{isConnected ? "MIDI Connected" : "MIDI Disconnected"}</span>
      </div>

      {isConnected && outputs.length > 0 && (
        <select
          value={selectedOutput?.id || ""}
          onChange={(e) => {
            const output = outputs.find((o) => o.id === e.target.value)
            if (output) selectOutput(output)
          }}
          className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm bg-secondary text-secondary-foreground rounded border border-border"
        >
          {outputs.map((output) => (
            <option key={output.id} value={output.id}>
              {output.name}
            </option>
          ))}
        </select>
      )}

      {!isConnected && isSupported && !error && (
        <Button
          size="sm"
          variant="outline"
          onClick={requestMIDIAccess}
          className="text-xs md:text-sm h-7 md:h-8 bg-transparent"
        >
          Connect MIDI
        </Button>
      )}
    </div>
  )
}
