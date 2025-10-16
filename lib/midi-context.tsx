"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

interface MIDIContextType {
  sendSysEx: (data: number[]) => void
  midiAccess: MIDIAccess | null
  midiInputs: MIDIInput[]
  midiOutputs: MIDIOutput[]
  selectedInput: MIDIInput | null
  selectedOutput: MIDIOutput | null
  setSelectedInput: (input: MIDIInput | null) => void
  setSelectedOutput: (output: MIDIOutput | null) => void
}

const MIDIContext = createContext<MIDIContextType | undefined>(undefined)

export function MIDIProvider({ children }: { children: ReactNode }) {
  const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null)
  const [midiInputs, setMidiInputs] = useState<MIDIInput[]>([])
  const [midiOutputs, setMidiOutputs] = useState<MIDIOutput[]>([])
  const [selectedInput, setSelectedInput] = useState<MIDIInput | null>(null)
  const [selectedOutput, setSelectedOutput] = useState<MIDIOutput | null>(null)

  // Initialize Web MIDI API
  useEffect(() => {
    if (typeof navigator !== "undefined" && "requestMIDIAccess" in navigator) {
      ;(navigator as any)
        .requestMIDIAccess({ sysex: true })
        .then((access: MIDIAccess) => {
          setMidiAccess(access)

          // Get initial inputs and outputs
          const inputs = Array.from(access.inputs.values())
          const outputs = Array.from(access.outputs.values())
          setMidiInputs(inputs)
          setMidiOutputs(outputs)

          // Auto-select first available devices
          if (inputs.length > 0 && !selectedInput) {
            setSelectedInput(inputs[0])
          }
          if (outputs.length > 0 && !selectedOutput) {
            setSelectedOutput(outputs[0])
          }

          // Listen for device changes
          access.onstatechange = () => {
            const newInputs = Array.from(access.inputs.values())
            const newOutputs = Array.from(access.outputs.values())
            setMidiInputs(newInputs)
            setMidiOutputs(newOutputs)
          }
        })
        .catch((error: Error) => {
          console.error("[v0] Failed to get MIDI access:", error)
        })
    }
  }, [])

  // Send SysEx message
  const sendSysEx = useCallback(
    (data: number[]) => {
      if (!selectedOutput) {
        console.warn("[v0] No MIDI output selected")
        return
      }

      try {
        // Ensure data is a valid SysEx message (starts with 0xF0, ends with 0xF7)
        const sysexData = data[0] === 0xf0 ? data : [0xf0, ...data]
        const completeData = sysexData[sysexData.length - 1] === 0xf7 ? sysexData : [...sysexData, 0xf7]

        selectedOutput.send(new Uint8Array(completeData))
        console.log("[v0] SysEx sent:", completeData)
      } catch (error) {
        console.error("[v0] Failed to send SysEx:", error)
      }
    },
    [selectedOutput],
  )

  return (
    <MIDIContext.Provider
      value={{
        sendSysEx,
        midiAccess,
        midiInputs,
        midiOutputs,
        selectedInput,
        selectedOutput,
        setSelectedInput,
        setSelectedOutput,
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
