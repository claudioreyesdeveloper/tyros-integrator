// Tyros5 MIDI API Type Definitions and Utilities

export interface Voice {
  msb: number
  lsb: number
  pc: number
  name: string
  category: string
  sub: string
}

export interface MixerSettings {
  volume: number
  pan: number
  reverb: number
  chorus: number
  octave: number
}

export interface DSPSettings {
  type: string
  depth: number
  speed: number
  feedback: number
}

export interface ChannelPartConfig {
  channel: number
  part: string
  voice?: Voice
  mixer?: MixerSettings
  dsp?: DSPSettings
}

export interface RegistrationData {
  name: string
  bank?: number
  voices?: Record<number, Voice>
  mixer?: Record<number, MixerSettings>
  dsp?: Record<number, DSPSettings>
  style?: string
  tempo?: number
}

export interface ChordState {
  sections: Array<{
    name: string
    bars: number
    chords: Array<{ chord: string; duration: number }>
  }>
}

// MIDI Command Types
export type MIDICommand =
  | VoiceChangeCommand
  | MixerCommand
  | DSPCommand
  | RegistrationSaveCommand
  | RegistrationLoadCommand
  | StyleCommand
  | ChordCommand

export interface VoiceChangeCommand {
  type: "voice_change"
  channel: number
  voice: Voice
}

export interface MixerCommand {
  type: "mixer"
  channel: number
  settings: Partial<MixerSettings>
}

export interface DSPCommand {
  type: "dsp"
  channel: number
  settings: Partial<DSPSettings>
}

export interface RegistrationSaveCommand {
  type: "registration_save"
  bank?: number
  number: number
  data: RegistrationData
}

export interface RegistrationLoadCommand {
  type: "registration_load"
  bank?: number
  number: number
  data?: Partial<RegistrationData>
}

export interface StyleCommand {
  type: "style"
  action: "start" | "stop" | "load"
  style?: string
  tempo?: number
}

export interface ChordCommand {
  type: "chord"
  action: "play" | "stop"
  chord?: string
  duration?: number
}

// Tyros5 Configuration
export const TYROS5_CONFIG = {
  ChannelParts: [
    { channel: 1, part: "Right 1" },
    { channel: 2, part: "Right 2" },
    { channel: 3, part: "Right 3" },
    { channel: 4, part: "Left" },
    { channel: 5, part: "Pad 1" },
    { channel: 6, part: "Pad 2" },
    { channel: 7, part: "Pad 3" },
    { channel: 8, part: "Pad 4" },
    { channel: 9, part: "Pad 5" },
    { channel: 10, part: "Pad 6" },
    { channel: 11, part: "Pad 7" },
    { channel: 12, part: "Pad 8" },
    { channel: 13, part: "Pad 9" },
    { channel: 14, part: "Pad 10" },
    { channel: 15, part: "Pad 11" },
    { channel: 16, part: "Pad 12" },
  ] as ChannelPartConfig[],
}

// MIDI Utilities
export function createVoiceChangeSysEx(channel: number, voice: Voice): number[] {
  return [
    0xf0, // SysEx start
    0x43, // Yamaha ID
    0x10, // Device number
    0x4c, // Model ID (Tyros5)
    0x08, // Voice change
    channel - 1, // Channel (0-indexed)
    voice.msb,
    voice.lsb,
    voice.pc,
    0xf7, // SysEx end
  ]
}

export function createMixerSysEx(channel: number, settings: Partial<MixerSettings>): number[] {
  const messages: number[] = []

  if (settings.volume !== undefined) {
    messages.push(0xf0, 0x43, 0x10, 0x4c, 0x02, channel - 1, 0x07, settings.volume, 0xf7)
  }

  if (settings.pan !== undefined) {
    messages.push(0xf0, 0x43, 0x10, 0x4c, 0x02, channel - 1, 0x0a, settings.pan, 0xf7)
  }

  return messages
}
