"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, Play, Save } from "lucide-react"

interface Command {
  id: string
  type: string
  description: string
  parameters: Record<string, any>
}

interface Sequence {
  id: string
  name: string
  commands: Command[]
}

export function AssemblyWorkbench() {
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [activeSequence, setActiveSequence] = useState<string | null>(null)
  const [availableCommands] = useState([
    { type: "voice_change", label: "Change Voice", icon: "🎹" },
    { type: "mixer", label: "Mixer Control", icon: "🎚️" },
    { type: "style", label: "Style Control", icon: "🎵" },
    { type: "registration", label: "Load Registration", icon: "💾" },
    { type: "delay", label: "Delay", icon: "⏱️" },
  ])

  const handleCreateSequence = () => {
    const newSequence: Sequence = {
      id: `seq-${Date.now()}`,
      name: `Sequence ${sequences.length + 1}`,
      commands: [],
    }
    setSequences((prev) => [...prev, newSequence])
    setActiveSequence(newSequence.id)
  }

  const handleDeleteSequence = (id: string) => {
    setSequences((prev) => prev.filter((s) => s.id !== id))
    if (activeSequence === id) {
      setActiveSequence(null)
    }
  }

  const handleAddCommand = (type: string) => {
    if (!activeSequence) return

    const newCommand: Command = {
      id: `cmd-${Date.now()}`,
      type,
      description: `${type} command`,
      parameters: {},
    }

    setSequences((prev) =>
      prev.map((seq) =>
        seq.id === activeSequence
          ? {
              ...seq,
              commands: [...seq.commands, newCommand],
            }
          : seq,
      ),
    )
  }

  const handleRemoveCommand = (commandId: string) => {
    if (!activeSequence) return

    setSequences((prev) =>
      prev.map((seq) =>
        seq.id === activeSequence
          ? {
              ...seq,
              commands: seq.commands.filter((cmd) => cmd.id !== commandId),
            }
          : seq,
      ),
    )
  }

  const activeSeq = sequences.find((s) => s.id === activeSequence)

  return (
    <div className="flex h-full">
      {/* Sequences List */}
      <div className="w-64 border-r flex flex-col">
        <div className="p-4 border-b">
          <Button onClick={handleCreateSequence} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Sequence
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {sequences.map((seq) => (
              <Card
                key={seq.id}
                className={`p-3 cursor-pointer transition-colors ${
                  activeSequence === seq.id ? "border-primary bg-accent" : "hover:bg-accent/50"
                }`}
                onClick={() => setActiveSequence(seq.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{seq.name}</h3>
                    <p className="text-xs text-muted-foreground">{seq.commands.length} commands</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSequence(seq.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Workbench */}
      <div className="flex-1 flex flex-col">
        {activeSeq ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{activeSeq.name}</h2>
                <p className="text-sm text-muted-foreground">{activeSeq.commands.length} commands</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Execute
                </Button>
              </div>
            </div>

            {/* Command Palette */}
            <div className="p-4 border-b">
              <div className="flex gap-2 flex-wrap">
                {availableCommands.map((cmd) => (
                  <Button key={cmd.type} variant="outline" size="sm" onClick={() => handleAddCommand(cmd.type)}>
                    <span className="mr-2">{cmd.icon}</span>
                    {cmd.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Command List */}
            <ScrollArea className="flex-1 p-4">
              {activeSeq.commands.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No commands yet. Add commands from the palette above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeSeq.commands.map((cmd, index) => (
                    <Card key={cmd.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{index + 1}</Badge>
                          <div>
                            <h3 className="font-semibold text-sm">{cmd.type}</h3>
                            <p className="text-xs text-muted-foreground">{cmd.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveCommand(cmd.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a sequence or create a new one to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
