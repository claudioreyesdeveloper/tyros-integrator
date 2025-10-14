import type { Voice } from "./voice-data"
import type { MixerSettings, DSPSettings } from "@/app/page"

export interface ChannelPartConfig {
  ChannelID: number
  PartName: string
  Voice: {
    Name: string
    CategoryIcon: string
    MSB: number
    LSB: number
    PRG: number
  } | null
  Mixer: {
    Volume: number
    Pan: number
    EQ: {
      Bass: number
      Mid: number
      High: number
    }
  }
  DSP: DSPSettings
}

export interface GlobalSettingsConfig {
  AppVersion: string
  LastSaved: string
  MasterTranspose: number
  TempoLock: boolean
  AutoPowerOffOverride: boolean
}

export interface GlobalEffectsConfig {
  MasterVolume: number
  ReverbSendGlobal: number
  ChorusSendGlobal: number
}

export interface RegistrationData {
  SlotNumber: number
  Name: string
  Timestamp: string
  Data: {
    voices: Voice[]
    mixer: MixerSettings[]
    effects: string[]
  } | null
}

export interface Tyros5Configuration {
  GlobalSettings: GlobalSettingsConfig
  GlobalEffects: GlobalEffectsConfig
  ChannelParts: ChannelPartConfig[]
  Registrations: RegistrationData[]
}
