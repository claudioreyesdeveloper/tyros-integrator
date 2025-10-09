"use client"

import { useMIDI } from "@/hooks/use-midi"
import { Button } from "@/components/ui/button"
import { Trash2, Download } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function MidiLogger() {
  const logs = useMIDI((state) => state.logs)
  const clearLogs = useMIDI((state) => state.clearLogs)

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

  return (
    <div className="p-4 md:p-6 lg:p-8">
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
    </div>
  )
}
