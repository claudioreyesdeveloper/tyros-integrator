"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type * as WebMidi from "webmidi"

interface MIDIContextType {
  midiInputs: WebMidi.MIDIInput[]
  midiOutputs: WebMidi.MIDIOutput[]
  selectedInput: WebMidi.MIDIInput | null
  selectedOutput: WebMidi.MIDIOutput | null
  setSelectedInput: (input: WebMidi.MIDIInput | null) => void
  setSelectedOutput: (output: WebMidi.MIDIOutput | null) => void
  sendSysEx: (data: number[]) => void
  sendMIDI: (data: number[]) => void
}

const MIDIContext = createContext<MIDIContextType | undefined>(undefined)

export function MIDIProvider({ children }: { children: ReactNode }) {
  const [midiInputs, setMidiInputs] = useState<WebMidi.MIDIInput[]>([])
  const [midiOutputs, setMidiOutputs] = useState<WebMidi.MIDIOutput[]>([])
  const [selectedInput, setSelectedInput] = useState<WebMidi.MIDIInput | null>(null)
  const [selectedOutput, setSelectedOutput] = useState<WebMidi.MIDIOutput | null>(null)

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.requestMIDIAccess) {
      navigator
        .requestMIDIAccess({ sysex: true })
        .then((midiAccess) => {
          const inputs = Array.from(midiAccess.inputs.values())
          const outputs = Array.from(midiAccess.outputs.values())

          setMidiInputs(inputs)
          setMidiOutputs(outputs)

          // Auto-select first available devices
          if (inputs.length > 0 && !selectedInput) {
            setSelectedInput(inputs[0])
          }
          if (outputs.length > 0 && !selectedOutput) {
            setSelectedOutput(outputs[0])
          }
        })
        .catch((err) => {
          console.error("Failed to get MIDI access:", err)
        })
    }
  }, [selectedInput, selectedOutput])

  const sendSysEx = useCallback(
    (data: number[]) => {
      if (selectedOutput) {
        try {
          selectedOutput.send(data)
        } catch (err) {
          console.error("Failed to send SysEx:", err)
        }
      }
    },
    [selectedOutput],
  )

  const sendMIDI = useCallback(
    (data: number[]) => {
      if (selectedOutput) {
        try {
          selectedOutput.send(data)
        } catch (err) {
          console.error("Failed to send MIDI:", err)
        }
      }
    },
    [selectedOutput],
  )

  return (
    <MIDIContext.Provider
      value={{
        midiInputs,
        midiOutputs,
        selectedInput,
        selectedOutput,
        setSelectedInput,
        setSelectedOutput,
        sendSysEx,
        sendMIDI,
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
