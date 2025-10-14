"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { tyrosAPI, type TyrosAPI } from "./tyros-api"

interface MIDIContextValue {
  api: TyrosAPI
  isConnected: boolean
  connectionStatus: ReturnType<TyrosAPI["getConnectionStatus"]>
}

const MIDIContext = createContext<MIDIContextValue | null>(null)

export function useMIDI() {
  const context = useContext(MIDIContext)
  if (!context) {
    throw new Error("useMIDI must be used within MIDIProvider")
  }
  return context
}

export function MIDIProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(tyrosAPI.getConnectionStatus())

  useEffect(() => {
    setIsMounted(true)

    // Subscribe to connection events
    const unsubscribe = tyrosAPI.onEvent((event) => {
      if (event.type === "connection") {
        setIsConnected(event.status === "connected")
        setConnectionStatus(tyrosAPI.getConnectionStatus())
      }
    })

    // Auto-connect on mount
    tyrosAPI.connect().catch(console.error)

    return () => {
      unsubscribe()
    }
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading SmartBridge...</div>
    )
  }

  return (
    <MIDIContext.Provider value={{ api: tyrosAPI, isConnected, connectionStatus }}>{children}</MIDIContext.Provider>
  )
}
