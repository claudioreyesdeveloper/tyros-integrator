"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RotaryKnob } from "@/components/ui/rotary-knob"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"

interface EffectsPopupProps {
  channel: number
  partName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DSP_BLOCKS = ["DSP1", "DSP2", "DSP3", "DSP4", "DSP5", "DSP6", "DSP7", "DSP8", "DSP9"]

const PART_NAMES = [
  "Left",
  "Right 1",
  "Right 2",
  "Right 3",
  "Multi Pad 1",
  "Multi Pad 2",
  "Multi Pad 3",
  "Multi Pad 4",
  "Rhythm 1",
  "Rhythm 2",
  "Bass",
  "Chord 1",
  "Chord 2",
  "Pad",
  "Phrase 1",
  "Phrase 2",
  "Song 1",
  "Song 2",
  "Song 3",
  "Song 4",
  "Song 5",
  "Song 6",
  "Song 7",
  "Song 8",
  "Song 9",
  "Song 10",
  "Song 11",
  "Song 12",
  "Song 13",
  "Song 14",
  "Song 15",
  "Song 16",
]

const ASSIGN_PARTS = ["OFF", "ALL", ...PART_NAMES]

const EFFECT_CATEGORIES = [
  "Reverb",
  "Delay",
  "Chorus",
  "Flanger",
  "Phaser",
  "Tremolo",
  "Rotary",
  "Distortion",
  "Compressor",
  "Wah",
]

const EFFECT_TYPES: Record<string, string[]> = {
  Reverb: ["Hall 1", "Hall 2", "Room 1", "Room 2", "Stage 1", "Stage 2", "Plate"],
  Delay: ["Delay LCR 1", "Delay LCR 2", "Delay LR", "Echo", "Cross Delay"],
  Chorus: ["Chorus 1", "Chorus 2", "Chorus 3", "Celeste 1", "Celeste 2"],
  Flanger: ["Flanger 1", "Flanger 2", "Flanger 3"],
  Phaser: ["Phaser 1", "Phaser 2"],
  Tremolo: ["Tremolo 1", "Tremolo 2", "Auto Pan"],
  Rotary: ["Rotary SP 1", "Rotary SP 2"],
  Distortion: ["Distortion", "Overdrive", "Amp Simulator"],
  Compressor: ["Compressor", "Multi-band Comp"],
  Wah: ["Auto Wah", "Touch Wah"],
}

export function EffectsPopup({ channel, partName, open, onOpenChange }: EffectsPopupProps) {
  const [selectedBlock, setSelectedBlock] = useState("DSP2")
  const [assignPart, setAssignPart] = useState("OFF")
  const [category, setCategory] = useState("Delay")
  const [effectType, setEffectType] = useState("Delay LCR 1")

  // Effect parameters
  const [lchDelay, setLchDelay] = useState(64)
  const [rchDelay, setRchDelay] = useState(64)
  const [cchDelay, setCchDelay] = useState(64)
  const [feedbackDelay, setFeedbackDelay] = useState(64)
  const [feedbackLevel, setFeedbackLevel] = useState(64)
  const [cchLevel, setCchLevel] = useState(64)
  const [highDamp, setHighDamp] = useState(64)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 glossy-panel border-2 border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white text-center py-3 border-b-2 border-border">
          <h2 className="text-xl font-bold tracking-wider text-amber-500">MIXING CONSOLE</h2>
          <p className="text-xs text-gray-400 mt-1">
            Channel {channel} - {partName}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Block Selection */}
          <div className="glossy-panel p-4 border border-border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Block</div>
                <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                  <SelectTrigger className="w-full bg-zinc-900 text-amber-500 border-border font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DSP_BLOCKS.map((block) => (
                      <SelectItem key={block} value={block}>
                        {block}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Assign Part</div>
                <Select value={assignPart} onValueChange={setAssignPart}>
                  <SelectTrigger className="w-full bg-zinc-900 text-amber-500 border-border font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {ASSIGN_PARTS.map((part) => (
                      <SelectItem key={part} value={part}>
                        {part}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Category and Type Selection */}
          <div className="glossy-panel p-4 border border-border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Category</div>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value)
                    setEffectType(EFFECT_TYPES[value][0])
                  }}
                >
                  <SelectTrigger className="w-full bg-zinc-900 text-amber-500 border-border font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EFFECT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Type</div>
                <Select value={effectType} onValueChange={setEffectType}>
                  <SelectTrigger className="w-full bg-zinc-900 text-amber-500 border-border font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EFFECT_TYPES[category].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Effect Parameters */}
          <div className="glossy-panel p-6 border border-border bg-gradient-to-br from-zinc-900 to-zinc-800">
            <div className="grid grid-cols-4 gap-6 mb-6">
              <RotaryKnob
                value={lchDelay}
                onChange={setLchDelay}
                label="L CH DELAY"
                displayValue={`${lchDelay}`}
                size="lg"
              />
              <RotaryKnob
                value={rchDelay}
                onChange={setRchDelay}
                label="R CH DELAY"
                displayValue={`${rchDelay}`}
                size="lg"
              />
              <RotaryKnob
                value={cchDelay}
                onChange={setCchDelay}
                label="C CH DELAY"
                displayValue={`${cchDelay}`}
                size="lg"
              />
              <RotaryKnob
                value={feedbackDelay}
                onChange={setFeedbackDelay}
                label="FEEDBACK DELAY"
                displayValue={`${feedbackDelay}`}
                size="lg"
              />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <RotaryKnob
                value={feedbackLevel}
                onChange={setFeedbackLevel}
                label="FEEDBACK LEVEL"
                displayValue={`${feedbackLevel}`}
                size="lg"
              />
              <RotaryKnob
                value={cchLevel}
                onChange={setCchLevel}
                label="C CH LEVEL"
                displayValue={`${cchLevel}`}
                size="lg"
              />
              <RotaryKnob
                value={highDamp}
                onChange={setHighDamp}
                label="HIGH DAMP"
                displayValue={`${highDamp}`}
                size="lg"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => console.log("[v0] Effect settings saved")}
              className="bg-amber-500 hover:bg-amber-600 text-black px-6 py-3 font-bold"
            >
              <Save className="w-4 h-4 mr-2" />
              SAVE
            </Button>
            <Button
              onClick={() => console.log("[v0] Effect details opened")}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 font-bold"
            >
              DETAIL
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
