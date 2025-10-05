"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"

interface MIDIState {
  access: MIDIAccess | null
  outputs: MIDIOutput[]
  selectedOutput: MIDIOutput | null
  isConnected: boolean
  error: string | null
  isSupported: boolean
}

interface MIDIContextType extends MIDIState {
  requestMIDIAccess: () => Promise<void>
  selectOutput: (output: MIDIOutput) => void
  sendControlChange: (channel: number, cc: number, value: number) => void
  sendProgramChange: (channel: number, program: number, msb: number, lsb: number) => void
  sendSysEx: (data: number[]) => void
}

const MIDIContext = createContext<MIDIContextType | undefined>(undefined)

export function MIDIProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MIDIState>({
    access: null,
    outputs: [],
    selectedOutput: null,
    isConnected: false,
    error: null,
    isSupported: false,
  })

  const requestMIDIAccess = useCallback(async () => {
    if (!navigator.requestMIDIAccess) {
      setState((prev) => ({
        ...prev,
        error: "Web MIDI API is not supported in this browser. Please use Chrome, Edge, or Opera.",
        isSupported: false,
      }))
      return
    }

    try {
      const access = await navigator.requestMIDIAccess({ sysex: true })
      const outputs = Array.from(access.outputs.values())

      setState((prev) => ({
        ...prev,
        access,
        outputs,
        selectedOutput: outputs[0] || null,
        isConnected: outputs.length > 0,
        error: outputs.length === 0 ? "No MIDI devices found. Please connect a MIDI device." : null,
        isSupported: true,
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `MIDI access denied: ${error instanceof Error ? error.message : "Unknown error"}`,
        isSupported: true,
      }))
    }
  }, [])

  const selectOutput = useCallback((output: MIDIOutput) => {
    setState((prev) => ({ ...prev, selectedOutput: output }))
  }, [])

  const sendControlChange = useCallback(
    (channel: number, cc: number, value: number) => {
      if (!state.selectedOutput) return

      const status = 0xb0 + (channel - 1)
      state.selectedOutput.send([status, cc, value])
    },
    [state.selectedOutput],
  )

  const sendProgramChange = useCallback(
    (channel: number, program: number, msb: number, lsb: number) => {
      if (!state.selectedOutput) return

      // Send Bank Select MSB (CC 0)
      sendControlChange(channel, 0, msb)
      // Send Bank Select LSB (CC 32)
      sendControlChange(channel, 32, lsb)
      // Send Program Change
      const status = 0xc0 + (channel - 1)
      state.selectedOutput.send([status, program])
    },
    [state.selectedOutput, sendControlChange],
  )

  const sendSysEx = useCallback(
    (data: number[]) => {
      if (!state.selectedOutput) return

      const sysexMessage = [0xf0, ...data, 0xf7]
      state.selectedOutput.send(sysexMessage)
    },
    [state.selectedOutput],
  )

  useEffect(() => {
    requestMIDIAccess()
  }, [requestMIDIAccess])

  return (
    <MIDIContext.Provider
      value={{
        ...state,
        requestMIDIAccess,
        selectOutput,
        sendControlChange,
        sendProgramChange,
        sendSysEx,
      }}
    >
      {children}
    </MIDIContext.Provider>
  )
}

export function useMIDI() {
  const context = useContext(MIDIContext)
  if (context === undefined) {
    throw new Error("useMIDI must be used within a MIDIProvider")
  }
  return context
}
