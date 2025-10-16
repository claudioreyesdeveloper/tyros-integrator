"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Volume2, Music, Sliders, ChevronLeft, ChevronRight } from "lucide-react"
import type { Voice } from "@/lib/tyros-api"

interface MixerInterfaceProps {
  onSelectVoice: (part: number) => void
  partVoices: Record<number, Voice>
  channelEffects: Record<number, string>
  onEffectAssigned: (channel: number, effectName: string) => void
  currentBank: number
  onBankChange: (bank: number) => void
}

const CHANNELS_PER_BANK = 8
const TOTAL_CHANNELS = 16

export function MixerInterface({
  onSelectVoice,
  partVoices,
  channelEffects,
  onEffectAssigned,
  currentBank,
  onBankChange,
}: MixerInterfaceProps) {
  const [channelSettings, setChannelSettings] = useState<
    Record<
      number,
      {
        volume: number
        pan: number
        reverb: number
        chorus: number
        eq: { bass: number; mid: number; high: number }
      }
    >
  >({})

  const startChannel = currentBank * CHANNELS_PER_BANK + 1
  const endChannel = Math.min(startChannel + CHANNELS_PER_BANK - 1, TOTAL_CHANNELS)
  const channels = Array.from({ length: endChannel - startChannel + 1 }, (_, i) => startChannel + i)

  const getChannelSettings = (channel: number) => {
    return (
      channelSettings[channel] || {
        volume: 100,
        pan: 64,
        reverb: 40,
        chorus: 0,
        eq: { bass: 64, mid: 64, high: 64 },
      }
    )
  }

  const updateChannelSetting = (channel: number, key: string, value: number) => {
    setChannelSettings((prev) => ({
      ...prev,
      [channel]: {
        ...getChannelSettings(channel),
        [key]: value,
      },
    }))
  }

  const updateEQ = (channel: number, band: "bass" | "mid" | "high", value: number) => {
    setChannelSettings((prev) => ({
      ...prev,
      [channel]: {
        ...getChannelSettings(channel),
        eq: {
          ...getChannelSettings(channel).eq,
          [band]: value,
        },
      },
    }))
  }

  const getPartName = (channel: number): string => {
    if (channel <= 4) {
      const names = ["Right 1", "Right 2", "Right 3", "Left"]
      return names[channel - 1]
    }
    return `Pad ${channel - 4}`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mixer</h1>
            <p className="text-sm text-muted-foreground">
              Channels {startChannel}-{endChannel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onBankChange(Math.max(0, currentBank - 1))}
              disabled={currentBank === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge variant="secondary">
              Bank {currentBank + 1} / {Math.ceil(TOTAL_CHANNELS / CHANNELS_PER_BANK)}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                onBankChange(Math.min(Math.floor(TOTAL_CHANNELS / CHANNELS_PER_BANK) - 1, currentBank + 1))
              }
              disabled={currentBank >= Math.floor(TOTAL_CHANNELS / CHANNELS_PER_BANK) - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mixer Channels */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((channel) => {
            const settings = getChannelSettings(channel)
            const voice = partVoices[channel]
            const partName = getPartName(channel)

            return (
              <Card key={channel} className="p-4">
                <Tabs defaultValue="main" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="main">Main</TabsTrigger>
                    <TabsTrigger value="eq">EQ</TabsTrigger>
                  </TabsList>

                  <TabsContent value="main" className="space-y-4 mt-4">
                    {/* Channel Header */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{partName}</h3>
                        <Badge variant="outline">Ch {channel}</Badge>
                      </div>
                      {voice ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs bg-transparent"
                          onClick={() => onSelectVoice(channel)}
                        >
                          <Music className="h-3 w-3 mr-2" />
                          <span className="truncate">{voice.name}</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent"
                          onClick={() => onSelectVoice(channel)}
                        >
                          <Music className="h-3 w-3 mr-2" />
                          Select Voice
                        </Button>
                      )}
                    </div>

                    {/* Volume */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs flex items-center gap-1">
                          <Volume2 className="h-3 w-3" />
                          Volume
                        </Label>
                        <span className="text-xs text-muted-foreground">{settings.volume}</span>
                      </div>
                      <Slider
                        value={[settings.volume]}
                        onValueChange={([value]) => updateChannelSetting(channel, "volume", value)}
                        max={127}
                        step={1}
                      />
                    </div>

                    {/* Pan */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Pan</Label>
                        <span className="text-xs text-muted-foreground">
                          {settings.pan === 64
                            ? "C"
                            : settings.pan < 64
                              ? `L${64 - settings.pan}`
                              : `R${settings.pan - 64}`}
                        </span>
                      </div>
                      <Slider
                        value={[settings.pan]}
                        onValueChange={([value]) => updateChannelSetting(channel, "pan", value)}
                        max={127}
                        step={1}
                      />
                    </div>

                    {/* Reverb */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Reverb</Label>
                        <span className="text-xs text-muted-foreground">{settings.reverb}</span>
                      </div>
                      <Slider
                        value={[settings.reverb]}
                        onValueChange={([value]) => updateChannelSetting(channel, "reverb", value)}
                        max={127}
                        step={1}
                      />
                    </div>

                    {/* Chorus */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Chorus</Label>
                        <span className="text-xs text-muted-foreground">{settings.chorus}</span>
                      </div>
                      <Slider
                        value={[settings.chorus]}
                        onValueChange={([value]) => updateChannelSetting(channel, "chorus", value)}
                        max={127}
                        step={1}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="eq" className="space-y-4 mt-4">
                    {/* EQ Controls */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Sliders className="h-4 w-4" />
                        3-Band EQ
                      </div>

                      {/* Bass */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Bass</Label>
                          <span className="text-xs text-muted-foreground">{settings.eq.bass - 64}</span>
                        </div>
                        <Slider
                          value={[settings.eq.bass]}
                          onValueChange={([value]) => updateEQ(channel, "bass", value)}
                          max={127}
                          step={1}
                        />
                      </div>

                      {/* Mid */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Mid</Label>
                          <span className="text-xs text-muted-foreground">{settings.eq.mid - 64}</span>
                        </div>
                        <Slider
                          value={[settings.eq.mid]}
                          onValueChange={([value]) => updateEQ(channel, "mid", value)}
                          max={127}
                          step={1}
                        />
                      </div>

                      {/* High */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">High</Label>
                          <span className="text-xs text-muted-foreground">{settings.eq.high - 64}</span>
                        </div>
                        <Slider
                          value={[settings.eq.high]}
                          onValueChange={([value]) => updateEQ(channel, "high", value)}
                          max={127}
                          step={1}
                        />
                      </div>

                      {/* Reset EQ */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => {
                          updateEQ(channel, "bass", 64)
                          updateEQ(channel, "mid", 64)
                          updateEQ(channel, "high", 64)
                        }}
                      >
                        Reset EQ
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
