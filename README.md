# Tyros5 Integrator - Backend API Documentation

This application provides a comprehensive TypeScript API for controlling the Yamaha Tyros5 keyboard. All UI actions have been consolidated into a unified API interface that your backend can implement.

## API Overview

The entire API is defined in `lib/tyros-api.ts`. It provides a type-safe interface for all Tyros5 commands.

### Core Interface

\`\`\`typescript
import { tyrosAPI, type TyrosCommand } from '@/lib/tyros-api'

// Send a single command
await tyrosAPI.sendCommand(command)

// Send multiple commands
await tyrosAPI.sendCommands([command1, command2, command3])

// Check connection status
const isConnected = tyrosAPI.isConnected()
const status = tyrosAPI.getConnectionStatus()

// Subscribe to events
const unsubscribe = tyrosAPI.onEvent((event) => {
  console.log('Event:', event)
})
\`\`\`

## Command Categories

### 1. Voice Commands

Assign voices to performance parts (Left, Right 1-3):

\`\`\`typescript
{
  type: "voice",
  action: "assign",
  part: 1, // 1-4
  voice: {
    voice: "Grand Piano",
    msb: "0",
    lsb: "0",
    prg: "0",
    category: "Piano",
    sub: "Grand Piano"
  }
}
\`\`\`

### 2. Mixer Commands

Control volume, pan, reverb, chorus, and brightness for each channel:

\`\`\`typescript
// Volume
{ type: "mixer", action: "volume", channel: 1, value: 100 }

// Pan
{ type: "mixer", action: "pan", channel: 1, value: 64 }

// Reverb send
{ type: "mixer", action: "reverb", channel: 1, value: 40 }

// Chorus send
{ type: "mixer", action: "chorus", channel: 1, value: 30 }

// Brightness
{ type: "mixer", action: "brightness", channel: 1, value: 64 }

// Master volume
{ type: "mixer", action: "master-volume", value: 100 }

// Global reverb
{ type: "mixer", action: "global-reverb", value: 40 }

// Global chorus
{ type: "mixer", action: "global-chorus", value: 30 }
\`\`\`

### 3. Effects Commands

Assign DSP effects to channels:

\`\`\`typescript
{
  type: "effect",
  action: "assign",
  channel: 1,
  effect: {
    type: "Hall Reverb",
    msb: 1,
    lsb: 0,
    category: "Reverb"
  }
}
\`\`\`

### 4. Style Commands

Control accompaniment styles:

\`\`\`typescript
// Start/stop
{ type: "style", action: "start" }
{ type: "style", action: "stop" }

// Tempo
{ type: "style", action: "tempo", value: 120 }

// Variation
{ type: "style", action: "variation", variation: 1 }

// Fill-ins
{ type: "style", action: "fill-in", fillType: "intro" }
{ type: "style", action: "fill-in", fillType: "ending" }
{ type: "style", action: "fill-in", fillType: "auto" }
{ type: "style", action: "fill-in", fillType: "break" }

// Sync start
{ type: "style", action: "sync-start", enabled: true }
\`\`\`

### 5. Multipad Commands

Trigger and control multipads:

\`\`\`typescript
// Trigger pad
{
  type: "multipad",
  action: "trigger",
  padId: 1,
  note: 54,
  velocity: 100,
  channel: 5
}

// Stop pad
{ type: "multipad", action: "stop", padId: 1, channel: 5 }

// Stop all pads
{ type: "multipad", action: "stop-all" }

// Volume
{ type: "multipad", action: "volume", padId: 1, channel: 5, value: 100 }
\`\`\`

### 6. Chord Commands

Play chords and sequences:

\`\`\`typescript
// Play single chord
{
  type: "chord",
  action: "play",
  chord: {
    root: "C",
    quality: "maj",
    extension: "7",
    bass: "E" // Optional slash chord
  },
  duration: 4, // beats
  velocity: 100
}

// Stop chord
{ type: "chord", action: "stop" }

// Play chord sequence
{
  type: "chord",
  action: "sequence",
  chords: [
    { chord: { root: "C", quality: "maj" }, bar: 1, beat: 1, duration: 4 },
    { chord: { root: "F", quality: "maj" }, bar: 2, beat: 1, duration: 4 },
    { chord: { root: "G", quality: "7" }, bar: 3, beat: 1, duration: 4 }
  ],
  tempo: 120
}
\`\`\`

### 7. Registration Commands

Save and load complete performance setups:

\`\`\`typescript
// Save registration
{
  type: "registration",
  action: "save",
  slot: 1, // 1-8
  name: "My Setup",
  data: {
    voices: [...],
    mixer: [...],
    effects: [...]
  }
}

// Load registration
{
  type: "registration",
  action: "load",
  slot: 1,
  data: { ... }
}
\`\`\`

### 8. Tyros Control Commands

System-level controls:

\`\`\`typescript
// Local control on/off
{ type: "tyros-control", action: "local-control", enabled: true }

// Clock source
{ type: "tyros-control", action: "clock-source", source: "internal" }

// Accompaniment on/off
{ type: "tyros-control", action: "accompaniment", enabled: true }
\`\`\`

## Implementing Your Backend

### Option 1: Replace the Mock Implementation

Replace the `MockTyrosAPI` in `lib/tyros-api.ts` with your real implementation:

\`\`\`typescript
export class RealTyrosAPI implements TyrosAPI {
  async sendCommand(command: TyrosCommand): Promise<void> {
    // Send to your backend via HTTP, WebSocket, etc.
    await fetch('/api/tyros/command', {
      method: 'POST',
      body: JSON.stringify(command)
    })
  }
  
  // Implement other methods...
}

export const tyrosAPI: TyrosAPI = new RealTyrosAPI()
\`\`\`

### Option 2: Backend Proxy

Create a backend service that receives commands and translates them to MIDI:

\`\`\`typescript
// Backend endpoint
app.post('/api/tyros/command', async (req, res) => {
  const command: TyrosCommand = req.body
  
  switch (command.type) {
    case 'voice':
      await sendMIDIProgramChange(command.part, command.voice)
      break
    case 'mixer':
      await sendMIDIControlChange(command.channel, getCC(command.action), command.value)
      break
    // Handle other command types...
  }
  
  res.json({ success: true })
})
\`\`\`

## Event Handling

Subscribe to events from the hardware:

\`\`\`typescript
const unsubscribe = tyrosAPI.onEvent((event) => {
  switch (event.type) {
    case 'connection':
      console.log('Connection status:', event.status)
      break
    case 'error':
      console.error('Error:', event.message)
      break
    case 'midi-message':
      console.log('MIDI message:', event.channel, event.data)
      break
  }
})

// Cleanup
unsubscribe()
\`\`\`

## Testing

The current implementation uses `MockTyrosAPI` which logs all commands to the console. This allows you to:

1. Test the UI without hardware
2. See exactly what commands are being sent
3. Verify command structure before implementing the backend

## Next Steps

1. Review the command types in `lib/tyros-api.ts`
2. Implement your backend MIDI communication layer
3. Replace `MockTyrosAPI` with your implementation
4. Test with real hardware
5. Add error handling and connection management

All UI components are already integrated with the API - no changes needed to the UI code!
