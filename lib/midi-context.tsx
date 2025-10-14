"use client"

// This file now acts as a compatibility layer for components using the old Context API
import type React from "react"
import { useMIDI as useZustandMIDI, useMIDIInitialize } from "@/hooks/use-midi"
import { useEffect, useState } from "react"

export function useMIDI() {
  const store = useZustandMIDI()

  // Return interface matching the old Context API
  return {
    // State
    access: store.access,
    outputs: store.outputs,
    selectedOutput: store.selectedOutput,
    isConnected: store.isConnected,
    error: store.error,
    isSupported: store.isSupported,
    midiAccess: store.access, // Alias for compatibility

    // Actions
    requestMIDIAccess: store.requestMIDIAccess,
    selectOutput: store.selectOutput,
    sendControlChange: store.sendControlChange,
    sendProgramChange: store.sendProgramChange,
    sendSysEx: store.sendSysEx,
    sendNoteOn: store.sendNoteOn,
    sendNoteOff: store.sendNoteOff,
  }
}

export function MIDIProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useMIDIInitialize()

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading SmartBridge...</div>
    )
  }

  return <>{children}</>
}
