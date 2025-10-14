"use client"

import { create } from "zustand"
import { useEffect } from "react"
import type { MIDIMessageEvent } from "webmidi"

export interface MIDILogEntry {
  id: string
  timestamp: Date
  type: string
  description: string
  data: number[]
  status: "success" | "failed"
  direction: "incoming" | "outgoing"
}

interface MIDIState {
  // Connection state
  access: MIDIAccess | null
  inputs: MIDIInput[]
  outputs: MIDIOutput[]
  selectedInput: MIDIInput | null
  selectedOutput: MIDIOutput | null
  isSupported: boolean
  isConnected: boolean
  error: string | null

  // Message tracking
  lastMessage: { type: string; data: number[] } | null
  logs: MIDILogEntry[]

  // Core actions
  initialize: () => Promise<void>
  requestMIDIAccess: () => Promise<void>
  selectInput: (input: MIDIInput | null) => void
  selectOutput: (output: MIDIOutput | null) => void

  // Simplified message sending
  send: (data: number[]) => void
  sendControlChange: (channel: number, cc: number, value: number) => void
  sendProgramChange: (channel: number, program: number, msb?: number, lsb?: number) => void
  sendNoteOn: (channel: number, note: number, velocity: number) => void
  sendNoteOff: (channel: number, note: number) => void
  sendSysEx: (data: number[]) => void

  // Utility
  clearLogs: () => void
}

const createLog = (
  type: string,
  description: string,
  data: number[],
  direction: "incoming" | "outgoing",
  status: "success" | "failed" = "success",
): MIDILogEntry => ({
  id: `${Date.now()}-${Math.random()}`,
  timestamp: new Date(),
  type,
  description,
  data,
  status,
  direction,
})

const formatMessage = (data: number[]): string => {
  const [status, data1, data2] = data
  const messageType = status & 0xf0
  const channel = (status & 0x0f) + 1

  switch (messageType) {
    case 0x90:
      return `Note On (Ch ${channel}, Note ${data1}, Vel ${data2})`
    case 0x80:
      return `Note Off (Ch ${channel}, Note ${data1})`
    case 0xb0:
      return `Control Change (Ch ${channel}, CC ${data1}, Val ${data2})`
    case 0xc0:
      return `Program Change (Ch ${channel}, Prg ${data1})`
    case 0xf0:
      return `SysEx (${data.length} bytes)`
    default:
      return `MIDI Message (${data.map((d) => d.toString(16)).join(" ")})`
  }
}

const getMessageType = (status: number): string => {
  const messageType = status & 0xf0
  switch (messageType) {
    case 0x90:
      return "noteOn"
    case 0x80:
      return "noteOff"
    case 0xb0:
      return "controlChange"
    case 0xc0:
      return "programChange"
    case 0xf0:
      return "sysex"
    default:
      return "unknown"
  }
}

export const useMIDI = create<MIDIState>((set, get) => ({
  // Initial state
  access: null,
  inputs: [],
  outputs: [],
  selectedInput: null,
  selectedOutput: null,
  isSupported: typeof navigator !== "undefined" && "requestMIDIAccess" in navigator,
  isConnected: false,
  error: null,
  lastMessage: null,
  logs: [],

  initialize: async () => {
    const state = get()

    if (!state.isSupported) {
      set({
        error: "Web MIDI API is not supported in this browser. Please use Chrome, Edge, or Opera.",
        logs: [...state.logs, createLog("error", "MIDI API not supported", [], "incoming", "failed")],
      })
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
        error: outputs.length === 0 ? "No MIDI devices found. Please connect a MIDI device." : null,
        logs: [
          ...state.logs,
          createLog("init", `MIDI initialized (${inputs.length} inputs, ${outputs.length} outputs)`, [], "incoming"),
        ],
      })

      inputs.forEach((input) => {
        input.onmidimessage = (event: MIDIMessageEvent) => {
          const data = Array.from(event.data)
          const type = getMessageType(data[0])

          set((state) => ({
            lastMessage: { type, data },
            logs: [...state.logs, createLog(type, formatMessage(data), data, "incoming")],
          }))
        }
      })

      access.onstatechange = () => {
        const newInputs = Array.from(access.inputs.values())
        const newOutputs = Array.from(access.outputs.values())

        set((state) => ({
          inputs: newInputs,
          outputs: newOutputs,
          isConnected: newOutputs.length > 0,
          logs: [
            ...state.logs,
            createLog(
              "deviceChange",
              `Devices: ${newInputs.length} inputs, ${newOutputs.length} outputs`,
              [],
              "incoming",
            ),
          ],
        }))
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      set((state) => ({
        error: `MIDI access denied: ${errorMsg}`,
        logs: [...state.logs, createLog("error", `Failed to initialize: ${errorMsg}`, [], "incoming", "failed")],
      }))
    }
  },

  // Alias for backward compatibility
  requestMIDIAccess: async () => {
    await get().initialize()
  },

  selectInput: (input) => set({ selectedInput: input }),
  selectOutput: (output) => set({ selectedOutput: output }),

  send: (data) => {
    const { selectedOutput } = get()

    if (!selectedOutput || data.length === 0) return

    try {
      selectedOutput.send(data)
      const type = getMessageType(data[0])

      set((state) => ({
        logs: [...state.logs, createLog(type, formatMessage(data), data, "outgoing")],
      }))
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Send failed"
      set((state) => ({
        logs: [...state.logs, createLog("error", errorMsg, data, "outgoing", "failed")],
      }))
    }
  },

  sendControlChange: (channel, cc, value) => {
    const status = 0xb0 | ((channel - 1) & 0x0f)
    get().send([status, cc & 0x7f, value & 0x7f])
  },

  sendProgramChange: (channel, program, msb, lsb) => {
    // If MSB and LSB provided, send bank select first
    if (msb !== undefined && lsb !== undefined) {
      get().sendControlChange(channel, 0, msb)
      get().sendControlChange(channel, 32, lsb)
    }

    const status = 0xc0 | ((channel - 1) & 0x0f)
    get().send([status, program & 0x7f])
  },

  sendNoteOn: (channel, note, velocity) => {
    const status = 0x90 | ((channel - 1) & 0x0f)
    get().send([status, note & 0x7f, velocity & 0x7f])
  },

  sendNoteOff: (channel, note) => {
    const status = 0x80 | ((channel - 1) & 0x0f)
    get().send([status, note & 0x7f, 0])
  },

  sendSysEx: (data) => {
    const sysexMessage = [0xf0, ...data, 0xf7]
    get().send(sysexMessage)
  },

  clearLogs: () => set({ logs: [] }),
}))

export function useMIDIInitialize() {
  const initialize = useMIDI((state) => state.initialize)
  const isSupported = useMIDI((state) => state.isSupported)

  useEffect(() => {
    if (isSupported) {
      initialize()
    }
  }, [initialize, isSupported])
}
