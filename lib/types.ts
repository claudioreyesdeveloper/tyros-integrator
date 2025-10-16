// Tyros5 Configuration Types

export interface Tyros5Configuration {
  GlobalSettings?: {
    MasterTranspose?: number
    TempoLock?: boolean
    AutoPowerOffOverride?: boolean
  }
  GlobalEffects?: {
    MasterVolume?: number
    ReverbSendGlobal?: number
    ChorusSendGlobal?: number
  }
  ChannelParts?: ChannelPartConfig[]
}

export interface ChannelPartConfig {
  ChannelID: number
  PartName: string
  Voice?: {
    Name: string
    MSB: number
    LSB: number
    PRG: number
  }
  Mixer?: {
    Volume: number
    Pan: number
    EQ: {
      Bass: number
      Mid: number
      High: number
    }
  }
  DSP?: {
    status: "ON" | "OFF"
    unitID_Hex: string
    effectType: {
      name: string
      msb_Dec: number
      lsb_Dec: number
    }
    parameters: Record<string, number>
  }
}
