# MIDI Architecture Documentation

## Overview

The Tyros5 Integrator MIDI system provides a unified, simplified architecture for bidirectional MIDI communication between the web application and MIDI devices (specifically the Yamaha Tyros5 keyboard).

## Architecture Design

### Single Source of Truth

The MIDI system uses a **single Zustand store** (`hooks/use-midi.tsx`) as the sole source of truth for all MIDI state and operations. This eliminates the complexity of having multiple MIDI implementations and provides:

- Centralized state management
- Unified logging
- Consistent API across all components
- Easier debugging and maintenance

### Backward Compatibility Layer

The `lib/midi-context.tsx` file serves as a **compatibility layer** that re-exports the Zustand implementation. This allows existing components to continue using the React Context API pattern without requiring changes to the UI layer.

## Core Components

### 1. MIDI Store (`hooks/use-midi.tsx`)

The central Zustand store that manages all MIDI functionality.

**State:**
\`\`\`typescript
{
  midiAccess: MIDIAccess | null,        // Web MIDI API access object
  inputPort: MIDIInput | null,          // Currently selected input port
  outputPort: MIDIOutput | null,        // Currently selected output port
  isConnected: boolean,                 // Connection status
  lastMessage: MIDIMessage | null,      // Last received MIDI message
  logs: MIDILog[],                      // Array of all MIDI activity logs
}
\`\`\`

**Key Methods:**

- `initialize()` - Requests MIDI access and sets up the system
- `setInputPort(port)` - Sets the active input port for receiving messages
- `setOutputPort(port)` - Sets the active output port for sending messages
- `sendMIDIMessage(data, type)` - Core method for sending any MIDI message
- `sendControlChange(channel, controller, value)` - Send CC messages
- `sendProgramChange(channel, program)` - Send program change messages
- `sendSysEx(data)` - Send system exclusive messages
- `sendNoteOn(channel, note, velocity)` - Send note on messages
- `sendNoteOff(channel, note)` - Send note off messages
- `clearLogs()` - Clear the message log history
- `exportLogs()` - Export logs as JSON

### 2. Compatibility Layer (`lib/midi-context.tsx`)

Provides React Context API for components that expect that pattern.

**Exports:**
- `MIDIProvider` - Context provider component (wraps Zustand)
- `useMIDI()` - Hook that returns the Zustand store

This layer simply re-exports the Zustand implementation, ensuring all components use the same underlying system regardless of how they import it.

### 3. MIDI Logger Component (`components/logging/midi-logger.tsx`)

UI component that displays MIDI activity logs in real-time.

**Features:**
- Real-time log display with timestamps
- Status indicators (Success/Failed)
- Message type and details
- Clear logs functionality
- Export logs as JSON
- Auto-scroll to latest messages

## Message Flow

### Outgoing Messages (App → Keyboard)

\`\`\`
Component
  ↓
useMIDI().sendControlChange() / sendProgramChange() / etc.
  ↓
sendMIDIMessage(data, type, direction: 'outgoing')
  ↓
Log message with timestamp and status
  ↓
outputPort.send(data)
  ↓
MIDI Device (Tyros5)
\`\`\`

### Incoming Messages (Keyboard → App)

\`\`\`
MIDI Device (Tyros5)
  ↓
inputPort.onmidimessage event
  ↓
handleMIDIMessage(event)
  ↓
Parse message type and data
  ↓
Log message with timestamp
  ↓
Update lastMessage state
  ↓
Components react to state change
\`\`\`

## MIDI Message Types

### Control Change (CC)
\`\`\`typescript
sendControlChange(channel: number, controller: number, value: number)
// Example: sendControlChange(0, 7, 100) // Set volume to 100 on channel 1
\`\`\`

**Format:** `[0xB0 + channel, controller, value]`

### Program Change (PC)
\`\`\`typescript
sendProgramChange(channel: number, program: number)
// Example: sendProgramChange(0, 0) // Change to program 1 on channel 1
\`\`\`

**Format:** `[0xC0 + channel, program]`

### System Exclusive (SysEx)
\`\`\`typescript
sendSysEx(data: number[])
// Example: sendSysEx([0xF0, 0x43, 0x10, 0x4C, 0x00, 0x00, 0x7E, 0x00, 0xF7])
\`\`\`

**Format:** `[0xF0, ...data, 0xF7]`

### Note On
\`\`\`typescript
sendNoteOn(channel: number, note: number, velocity: number)
// Example: sendNoteOn(0, 60, 100) // Play middle C at velocity 100
\`\`\`

**Format:** `[0x90 + channel, note, velocity]`

### Note Off
\`\`\`typescript
sendNoteOff(channel: number, note: number)
// Example: sendNoteOff(0, 60) // Stop middle C
\`\`\`

**Format:** `[0x80 + channel, note, 0]`

## Logging System

### Log Structure
\`\`\`typescript
interface MIDILog {
  id: string,              // Unique identifier
  timestamp: number,       // Unix timestamp
  direction: 'incoming' | 'outgoing',
  type: string,           // Message type (e.g., "Control Change", "Program Change")
  status: 'success' | 'failed',
  data: number[],         // Raw MIDI data bytes
  details: string,        // Human-readable description
}
\`\`\`

### Log Retention
- Logs are stored in memory (Zustand store)
- Maximum 1000 logs retained (oldest removed when limit reached)
- Can be cleared manually via `clearLogs()`
- Can be exported as JSON via `exportLogs()`

## Usage Examples

### Basic Setup (in layout.tsx)
\`\`\`typescript
import { MIDIProvider } from '@/lib/midi-context'

export default function RootLayout({ children }) {
  return (
    <MIDIProvider>
      {children}
    </MIDIProvider>
  )
}
\`\`\`

### Using in Components
\`\`\`typescript
import { useMIDI } from '@/lib/midi-context'

function MyComponent() {
  const { isConnected, sendControlChange, sendProgramChange } = useMIDI()
  
  const changeVolume = (value: number) => {
    sendControlChange(0, 7, value) // Channel 1, CC 7 (volume), value
  }
  
  const changeVoice = (program: number) => {
    sendProgramChange(0, program) // Channel 1, program number
  }
  
  return (
    <div>
      {isConnected ? 'Connected' : 'Disconnected'}
      <button onClick={() => changeVolume(100)}>Set Volume</button>
      <button onClick={() => changeVoice(0)}>Change Voice</button>
    </div>
  )
}
\`\`\`

### Accessing Logs
\`\`\`typescript
import { useMIDI } from '@/lib/midi-context'

function LogViewer() {
  const { logs, clearLogs, exportLogs } = useMIDI()
  
  return (
    <div>
      {logs.map(log => (
        <div key={log.id}>
          {log.type}: {log.details} ({log.status})
        </div>
      ))}
      <button onClick={clearLogs}>Clear</button>
      <button onClick={exportLogs}>Export</button>
    </div>
  )
}
\`\`\`

## Error Handling

### Connection Errors
- If MIDI access is denied, `isConnected` remains `false`
- Error is logged to console
- UI should check `isConnected` before attempting to send messages

### Send Errors
- If `outputPort` is null, message is logged as 'failed'
- Error details are included in log
- No exception is thrown (graceful degradation)

### Receive Errors
- Malformed messages are logged with 'failed' status
- Error details are captured in log
- System continues to process subsequent messages

## Performance Considerations

### Message Throttling
- No built-in throttling (assumes reasonable usage)
- For high-frequency messages (e.g., continuous controllers), consider debouncing in the component

### Log Management
- Logs are capped at 1000 entries
- Older logs are automatically removed
- Consider clearing logs periodically for long-running sessions

### Memory Usage
- Zustand store is lightweight
- MIDI messages are small (typically 3 bytes)
- Log storage is minimal (~100KB for 1000 entries)

## Future Enhancements

Potential improvements to consider:

1. **MIDI Learn** - Allow users to map controls by listening for MIDI input
2. **Message Filtering** - Filter logs by message type or direction
3. **MIDI Clock** - Support for MIDI timing and synchronization
4. **Multi-Port Support** - Handle multiple input/output ports simultaneously
5. **Preset Management** - Save and load MIDI configurations
6. **Message Templates** - Pre-defined message sequences for common operations

## Troubleshooting

### MIDI Not Connecting
1. Check browser support (Chrome, Edge, Opera support Web MIDI API)
2. Ensure MIDI device is connected before loading the app
3. Check browser permissions for MIDI access
4. Try refreshing the page

### Messages Not Sending
1. Verify `isConnected` is `true`
2. Check that `outputPort` is set
3. Verify MIDI device is receiving (check device display)
4. Check logs for error messages

### Messages Not Receiving
1. Verify `inputPort` is set
2. Check that device is sending MIDI (play a note)
3. Check logs to see if messages are being received
4. Verify message handler is properly attached

## Technical Notes

### Web MIDI API
- Uses the standard Web MIDI API (https://www.w3.org/TR/webmidi/)
- Requires HTTPS in production (or localhost for development)
- Not supported in Firefox or Safari (as of 2025)

### Channel Numbering
- MIDI channels are 0-indexed in code (0-15)
- Display as 1-indexed to users (1-16)
- Always subtract 1 when sending to match MIDI spec

### SysEx Messages
- Must start with 0xF0 and end with 0xF7
- Manufacturer ID follows start byte (Yamaha = 0x43)
- Device-specific format varies by model

## Conclusion

This simplified MIDI architecture provides a clean, maintainable foundation for MIDI communication in the Tyros5 Integrator application. By consolidating to a single implementation with comprehensive logging, the system is easier to debug, extend, and maintain while providing all necessary functionality for professional MIDI control.
