"use client"

// This file now acts as a compatibility layer for components using the old Context API
import type React from "react"
import { useMIDI as useZustandMIDI, useMIDIInitialize } from "@/hooks/use-midi"

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
  useMIDIInitialize()
  return <>{children}</>
}
