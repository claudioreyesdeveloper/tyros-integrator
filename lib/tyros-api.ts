/**
 * Comprehensive Tyros5 Hardware API
 *
 * This interface defines all possible commands that can be sent to the Tyros5 hardware.
 * The backend should implement this interface to handle actual MIDI communication.
 */

import type { Voice } from "./voice-data"
import type { Effect } from "./effect-data"

// ============================================================================
// VOICE COMMANDS
// ============================================================================

export interface VoiceCommand {
  type: "voice"
  action: "assign"
  part: number // 1-4 (Left, Right1, Right2, Right3)
  voice: Voice
}

// ============================================================================
// MIXER COMMANDS
// ============================================================================

export interface MixerVolumeCommand {
  type: "mixer"
  action: "volume"
  channel: number
  value: number // 0-127
}

export interface MixerPanCommand {
  type: "mixer"
  action: "pan"
  channel: number
  value: number // 0-127 (64 = center)
}

export interface MixerReverbCommand {
  type: "mixer"
  action: "reverb"
  channel: number
  value: number // 0-127
}

export interface MixerChorusCommand {
  type: "mixer"
  action: "chorus"
  channel: number
  value: number // 0-127
}

export interface MixerBrightnessCommand {
  type: "mixer"
  action: "brightness"
  channel: number
  value: number // 0-127
}

export interface MixerMasterVolumeCommand {
  type: "mixer"
  action: "master-volume"
  value: number // 0-127
}

export interface MixerGlobalReverbCommand {
  type: "mixer"
  action: "global-reverb"
  value: number // 0-127
}

export interface MixerGlobalChorusCommand {
  type: "mixer"
  action: "global-chorus"
  value: number // 0-127
}

// ============================================================================
// EFFECTS COMMANDS
// ============================================================================

export interface EffectAssignCommand {
  type: "effect"
  action: "assign"
  channel: number
  effect: Effect
}

// ============================================================================
// STYLE COMMANDS
// ============================================================================

export interface StyleStartStopCommand {
  type: "style"
  action: "start" | "stop"
}

export interface StyleTempoCommand {
  type: "style"
  action: "tempo"
  value: number // 40-300 BPM
}

export interface StyleVariationCommand {
  type: "style"
  action: "variation"
  variation: number // 1-4
}

export interface StyleFillInCommand {
  type: "style"
  action: "fill-in"
  fillType: "intro" | "ending" | "auto" | "break"
}

export interface StyleSyncStartCommand {
  type: "style"
  action: "sync-start"
  enabled: boolean
}

// ============================================================================
// MULTIPAD COMMANDS
// ============================================================================

export interface MultipadTriggerCommand {
  type: "multipad"
  action: "trigger"
  padId: number // 1-4
  note: number
  velocity: number // 0-127
  channel: number // 5-8
}

export interface MultipadStopCommand {
  type: "multipad"
  action: "stop"
  padId: number // 1-4
  channel: number
}

export interface MultipadStopAllCommand {
  type: "multipad"
  action: "stop-all"
}

export interface MultipadVolumeCommand {
  type: "multipad"
  action: "volume"
  padId: number
  channel: number
  value: number // 0-127
}

// ============================================================================
// CHORD COMMANDS
// ============================================================================

export interface ChordData {
  root: string // "C", "D", "E", etc.
  quality: string // "maj", "min", "7", etc.
  extension?: string // "9", "11", "13", etc.
  bass?: string // Slash chord bass note
}

export interface ChordPlayCommand {
  type: "chord"
  action: "play"
  chord: ChordData
  duration: number // in beats
  velocity: number // 0-127
}

export interface ChordStopCommand {
  type: "chord"
  action: "stop"
}

export interface ChordSequenceCommand {
  type: "chord"
  action: "sequence"
  chords: Array<{
    chord: ChordData
    bar: number
    beat: number
    duration: number
  }>
  tempo: number
}

// ============================================================================
// REGISTRATION COMMANDS
// ============================================================================

export interface RegistrationLoadCommand {
  type: "registration"
  action: "load"
  slot: number // 1-8
  data: {
    voices: any[]
    mixer: any[]
    effects: any[]
  }
}

export interface RegistrationSaveCommand {
  type: "registration"
  action: "save"
  slot: number // 1-8
  name: string
  data: {
    voices: any[]
    mixer: any[]
    effects: any[]
  }
}

// ============================================================================
// TYROS CONTROL COMMANDS
// ============================================================================

export interface TyrosLocalControlCommand {
  type: "tyros-control"
  action: "local-control"
  enabled: boolean
}

export interface TyrosClockSourceCommand {
  type: "tyros-control"
  action: "clock-source"
  source: "internal" | "external"
}

export interface TyrosAccompanimentCommand {
  type: "tyros-control"
  action: "accompaniment"
  enabled: boolean
}

// ============================================================================
// UNION TYPE OF ALL COMMANDS
// ============================================================================

export type TyrosCommand =
  // Voice
  | VoiceCommand
  // Mixer
  | MixerVolumeCommand
  | MixerPanCommand
  | MixerReverbCommand
  | MixerChorusCommand
  | MixerBrightnessCommand
  | MixerMasterVolumeCommand
  | MixerGlobalReverbCommand
  | MixerGlobalChorusCommand
  // Effects
  | EffectAssignCommand
  // Style
  | StyleStartStopCommand
  | StyleTempoCommand
  | StyleVariationCommand
  | StyleFillInCommand
  | StyleSyncStartCommand
  // Multipad
  | MultipadTriggerCommand
  | MultipadStopCommand
  | MultipadStopAllCommand
  | MultipadVolumeCommand
  // Chord
  | ChordPlayCommand
  | ChordStopCommand
  | ChordSequenceCommand
  // Registration
  | RegistrationLoadCommand
  | RegistrationSaveCommand
  // Tyros Control
  | TyrosLocalControlCommand
  | TyrosClockSourceCommand
  | TyrosAccompanimentCommand

// ============================================================================
// API INTERFACE
// ============================================================================

export interface TyrosAPI {
  /**
   * Send a command to the Tyros5 hardware
   */
  sendCommand(command: TyrosCommand): Promise<void>

  /**
   * Send multiple commands in sequence
   */
  sendCommands(commands: TyrosCommand[]): Promise<void>

  /**
   * Check if the hardware is connected
   */
  isConnected(): boolean

  /**
   * Get the current connection status
   */
  getConnectionStatus(): {
    connected: boolean
    inputPort?: string
    outputPort?: string
    lastError?: string
  }

  /**
   * Connect to the hardware
   */
  connect(): Promise<void>

  /**
   * Disconnect from the hardware
   */
  disconnect(): Promise<void>

  /**
   * Subscribe to hardware events (e.g., incoming MIDI messages)
   */
  onEvent(callback: (event: TyrosEvent) => void): () => void
}

// ============================================================================
// EVENTS FROM HARDWARE
// ============================================================================

export type TyrosEvent =
  | {
      type: "connection"
      status: "connected" | "disconnected"
    }
  | {
      type: "error"
      message: string
    }
  | {
      type: "midi-message"
      channel: number
      data: number[]
    }

// ============================================================================
// MOCK IMPLEMENTATION (for testing without hardware)
// ============================================================================

export class MockTyrosAPI implements TyrosAPI {
  private connected = false
  private eventCallbacks: Array<(event: TyrosEvent) => void> = []

  async sendCommand(command: TyrosCommand): Promise<void> {
    console.log("[Tyros API] Command:", JSON.stringify(command, null, 2))
  }

  async sendCommands(commands: TyrosCommand[]): Promise<void> {
    for (const command of commands) {
      await this.sendCommand(command)
    }
  }

  isConnected(): boolean {
    return this.connected
  }

  getConnectionStatus() {
    return {
      connected: this.connected,
      inputPort: this.connected ? "Mock Input" : undefined,
      outputPort: this.connected ? "Mock Output" : undefined,
    }
  }

  async connect(): Promise<void> {
    console.log("[Tyros API] Connecting...")
    this.connected = true
    this.emitEvent({ type: "connection", status: "connected" })
  }

  async disconnect(): Promise<void> {
    console.log("[Tyros API] Disconnecting...")
    this.connected = false
    this.emitEvent({ type: "connection", status: "disconnected" })
  }

  onEvent(callback: (event: TyrosEvent) => void): () => void {
    this.eventCallbacks.push(callback)
    return () => {
      const index = this.eventCallbacks.indexOf(callback)
      if (index > -1) {
        this.eventCallbacks.splice(index, 1)
      }
    }
  }

  private emitEvent(event: TyrosEvent) {
    this.eventCallbacks.forEach((callback) => callback(event))
  }
}

// ============================================================================
// GLOBAL API INSTANCE
// ============================================================================

// This can be replaced with a real implementation that connects to your backend
export const tyrosAPI: TyrosAPI = new MockTyrosAPI()
