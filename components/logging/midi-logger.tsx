"use client"

import { useState, useRef } from "react"
import { useMIDI } from "@/hooks/use-midi"
import { Button } from "@/components/ui/button"
import { Trash2, Download, FileMusic, Zap } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PatchFileImportDialog } from "@/components/registration/patch-file-import-dialog"

export function MidiLogger() {
  const logs = useMIDI((state) => state.logs)
  const clearLogs = useMIDI((state) => state.clearLogs)
  const { midiAccess, requestMIDIAccess } = useMIDI()

  const [port1, setPort1] = useState<string>("Digitalworkstation Port 1")
  const [port2, setPort2] = useState<string>("Digitalworkstation Port 2")
  const [patchImportDialogOpen, setPatchImportDialogOpen] = useState(false)
  const patchFileInputRef = useRef<HTMLInputElement>(null)

  const detectedPorts = midiAccess ? Array.from(midiAccess.outputs.values()).map((port) => port.name) : []
  const defaultPorts = ["Digitalworkstation Port 1", "Digitalworkstation Port 2"]
  const availablePorts = [...new Set([...defaultPorts, ...detectedPorts])]

  const handleExportLogs = () => {
    const logData = logs.map((log) => ({
      timestamp: log.timestamp.toISOString(),
      type: log.type,
      description: log.description,
      data: log.data,
      status: log.status,
      direction: log.direction,
    }))

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `midi-logs-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleOpenPatchFile = () => {
    setPatchImportDialogOpen(true)
  }

  const handleAutoconnect = async () => {
    await requestMIDIAccess()

    // Auto-select first two available ports
    if (availablePorts.length > 0) {
      setPort1(availablePorts[0])
    }
    if (availablePorts.length > 1) {
      setPort2(availablePorts[1])
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="glossy-panel p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">MIDI Port Configuration</h2>
            <p className="text-sm text-gray-300">Configure MIDI input and output ports</p>
          </div>
          <Button
            onClick={handleAutoconnect}
            className="glossy-button h-9 md:h-10 px-4 md:px-5 text-xs md:text-sm gap-2"
            size="sm"
          >
            <Zap className="w-3 h-3 md:w-4 md:h-4" />
            Autoconnect
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="port1">Port 1</Label>
            <Select value={port1} onValueChange={setPort1}>
              <SelectTrigger
                id="port1"
                className="w-full bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-11 md:h-12 rounded-xl transition-all text-sm md:text-base"
              >
                <SelectValue placeholder="Select MIDI Port 1" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                {availablePorts.length > 0 ? (
                  availablePorts.map((port, index) => (
                    <SelectItem
                      key={index}
                      value={port}
                      className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black text-sm md:text-base"
                    >
                      {port}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No MIDI ports available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {port1 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Connected</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="port2">Port 2</Label>
            <Select value={port2} onValueChange={setPort2}>
              <SelectTrigger
                id="port2"
                className="w-full bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-11 md:h-12 rounded-xl transition-all text-sm md:text-base"
              >
                <SelectValue placeholder="Select MIDI Port 2" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                {availablePorts.length > 0 ? (
                  availablePorts.map((port, index) => (
                    <SelectItem
                      key={index}
                      value={port}
                      className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black text-sm md:text-base"
                    >
                      {port}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No MIDI ports available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {port2 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Connected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glossy-panel p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Patch File Management</h2>
            <p className="text-sm text-gray-300">Import patch files for voice configuration</p>
          </div>
          <Button
            onClick={handleOpenPatchFile}
            className="glossy-button h-11 md:h-12 px-6 md:px-7 text-sm md:text-base gap-2"
            size="lg"
          >
            <FileMusic className="w-4 h-4 md:w-5 md:h-5" />
            Open Patch File
          </Button>
        </div>
      </div>

      {/* Existing MIDI Activity Log section */}
      <div className="glossy-panel p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">MIDI Activity Log</h2>
            <p className="text-sm text-gray-300">Real-time MIDI message monitoring</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportLogs}
              variant="outline"
              size="sm"
              className="glossy-button text-xs md:text-sm bg-transparent"
              disabled={logs.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={clearLogs}
              variant="outline"
              size="sm"
              className="glossy-button text-xs md:text-sm bg-transparent"
              disabled={logs.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/30">
                <th className="text-left py-3 px-4 text-sm font-bold text-white">Direction</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-white">Message Type</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-white">Status</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-white">Details</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-white">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No MIDI activity yet. Connect a MIDI device and start playing!
                  </td>
                </tr>
              ) : (
                logs
                  .slice()
                  .reverse()
                  .map((log) => (
                    <tr key={log.id} className="border-b border-primary/10 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            log.direction === "incoming"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-purple-500/20 text-purple-300"
                          }`}
                        >
                          {log.direction === "incoming" ? "← IN" : "OUT →"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-white font-medium">{log.type}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            log.status === "success" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {log.status === "success" ? "Success" : "Failed"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-300">{log.description}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                        </span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {logs.length > 0 && (
          <div className="mt-4 text-sm text-gray-400 text-center">
            Showing {logs.length} message{logs.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      <PatchFileImportDialog open={patchImportDialogOpen} onOpenChange={setPatchImportDialogOpen} />
    </div>
  )
}
