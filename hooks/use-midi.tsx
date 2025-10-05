"use client"

import { create } from "zustand"
import { useEffect } from "react"

interface MIDIState {
  access: MIDIAccess | null
  inputs: MIDIInput[]
  outputs: MIDIOutput[]
  selectedInput: MIDIInput | null
  selectedOutput: MIDIOutput | null
  isSupported: boolean
  isConnected: boolean
  lastMessage: { type: string; data: number[] } | null

  // Actions
  initialize: () => Promise<void>
  selectInput: (input: MIDIInput | null) => void
  selectOutput: (output: MIDIOutput | null) => void
  sendMessage: (data: number[]) => void
  sendProgramChange: (channel: number, program: number) => void
  sendControlChange: (channel: number, controller: number, value: number) => void
  sendNoteOn: (channel: number, note: number, velocity: number) => void
  sendNoteOff: (channel: number, note: number) => void
}

export const useMIDI = create<MIDIState>((set, get) => ({
  access: null,
  inputs: [],
  outputs: [],
  selectedInput: null,
  selectedOutput: null,
  isSupported: typeof navigator !== "undefined" && "requestMIDIAccess" in navigator,
  isConnected: false,
  lastMessage: null,

  initialize: async () => {
    if (!get().isSupported) {
      console.error("Web MIDI API is not supported in this browser")
      return
    }

    try {
      const access = await navigator.requestMIDIAccess({ sysex: true })

      const inputs = Array.from(access.inputs.values())
      const outputs = Array.from(access.outputs.values())

      set({
        access,
        inputs,
        outputs,
        isConnected: outputs.length > 0,
        selectedOutput: outputs[0] || null,
        selectedInput: inputs[0] || null,
      })

      // Setup input listeners
      inputs.forEach((input) => {
        input.onmidimessage = (event) => {
          const [status, data1, data2] = event.data
          const messageType = status & 0xf0

          let type = "unknown"
          if (messageType === 0x90) type = "noteOn"
          else if (messageType === 0x80) type = "noteOff"
          else if (messageType === 0xb0) type = "controlChange"
          else if (messageType === 0xc0) type = "programChange"

          set({ lastMessage: { type, data: Array.from(event.data) } })
        }
      })

      // Listen for device changes
      access.onstatechange = () => {
        const newInputs = Array.from(access.inputs.values())
        const newOutputs = Array.from(access.outputs.values())
        set({
          inputs: newInputs,
          outputs: newOutputs,
          isConnected: newOutputs.length > 0,
        })
      }

      console.log("MIDI initialized successfully")
    } catch (error) {
      console.error("Failed to initialize MIDI:", error)
    }
  },

  selectInput: (input) => set({ selectedInput: input }),

  selectOutput: (output) => set({ selectedOutput: output }),

  sendMessage: (data) => {
    const { selectedOutput } = get()
    if (selectedOutput && data.length > 0) {
      selectedOutput.send(data)
    }
  },

  sendProgramChange: (channel, program) => {
    const status = 0xc0 | (channel & 0x0f)
    get().sendMessage([status, program & 0x7f])
  },

  sendControlChange: (channel, controller, value) => {
    const status = 0xb0 | (channel & 0x0f)
    get().sendMessage([status, controller & 0x7f, value & 0x7f])
  },

  sendNoteOn: (channel, note, velocity) => {
    const status = 0x90 | (channel & 0x0f)
    get().sendMessage([status, note & 0x7f, velocity & 0x7f])
  },

  sendNoteOff: (channel, note) => {
    const status = 0x80 | (channel & 0x0f)
    get().sendMessage([status, note & 0x7f, 0])
  },
}))

// Hook to auto-initialize MIDI on mount
export function useMIDIInitialize() {
  const initialize = useMIDI((state) => state.initialize)
  const isSupported = useMIDI((state) => state.isSupported)

  useEffect(() => {
    if (isSupported) {
      initialize()
    }
  }, [initialize, isSupported])
}
