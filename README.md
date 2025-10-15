# Tyros5 Integrator

A comprehensive web-based control interface for the Yamaha Tyros5 keyboard, built with Next.js 15, React 19, and TypeScript. This application provides a modern, intuitive UI for controlling all aspects of the Tyros5, with a unified backend API ready for MIDI integration.

## Features

### 🎹 Complete Tyros5 Control
- **Voice Browser**: Browse and assign 1,000+ voices across 16 categories
- **Mixer Interface**: 16-channel mixer with volume, pan, reverb, chorus, and brightness controls
- **Effects Panel**: DSP effects assignment and control
- **Style Controls**: Accompaniment style selection and playback control
- **Chord Sequencer**: Visual chord progression editor with drag-and-drop
- **Multipad Interface**: Trigger and control multipads
- **Registration Manager**: Save and load complete performance setups
- **Assembly Workbench**: Create custom style assemblies from SFF files

### 🎨 Modern UI/UX
- Dark mode interface optimized for stage use
- Responsive design with touch-friendly controls
- Real-time visual feedback
- Persistent state across tab switches
- Rotary knobs and sliders matching hardware controls

### 🔌 Backend-Ready API
- Unified TypeScript API for all Tyros5 commands
- Type-safe command structure
- Mock implementation for UI testing
- Ready for WebSocket, HTTP, or direct MIDI integration

## Project Structure

\`\`\`
tyros5-integrator/
├── app/
│   ├── layout.tsx          # Root layout with MIDI provider
│   ├── page.tsx            # Main application with tab navigation
│   └── globals.css         # Global styles and design tokens
├── components/
│   ├── assembly/           # Style assembly workbench
│   ├── chords/             # Chord sequencer
│   ├── effects/            # DSP effects panel
│   ├── home/               # Home screen with performance parts
│   ├── logging/            # MIDI logger
│   ├── mixer/              # Mixer interface and channels
│   ├── multipads/          # Multipad controls
│   ├── registration/       # Registration memory manager
│   ├── styles/             # Style controls and editor
│   ├── voices/             # Voice browser and command palette
│   ├── ui/                 # Reusable UI components (shadcn/ui)
│   └── tab-navigation.tsx  # Main navigation tabs
├── lib/
│   ├── tyros-api.ts        # Unified Tyros5 API (⭐ MAIN API)
│   ├── midi-context.tsx    # MIDI context provider
│   ├── voice-data.ts       # Voice database (1000+ voices)
│   ├── effect-data.ts      # Effects database
│   ├── styles-data.ts      # Styles database
│   ├── types.ts            # TypeScript type definitions
│   └── utils.ts            # Utility functions
└── hooks/
    └── use-toast.ts        # Toast notifications
\`\`\`

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/claudioreyesdeveloper/tyros-integrator.git
cd tyros-integrator

# Install dependencies
pnpm install

# Run development server
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

\`\`\`bash
pnpm build
pnpm start
\`\`\`

## API Documentation

### Overview

All UI actions are consolidated into a unified API defined in `lib/tyros-api.ts`. The API uses a command-based pattern for type safety and extensibility.

### Basic Usage

\`\`\`typescript
import { tyrosAPI } from '@/lib/tyros-api'

// Send a single command
await tyrosAPI.sendCommand({
  type: "voice",
  action: "assign",
  part: 1,
  voice: { /* voice data */ }
})

// Send multiple commands
await tyrosAPI.sendCommands([command1, command2, command3])

// Check connection
const isConnected = tyrosAPI.isConnected()
const status = tyrosAPI.getConnectionStatus()

// Subscribe to events
const unsubscribe = tyrosAPI.onEvent((event) => {
  console.log('Event:', event)
})
\`\`\`

### Command Types

#### 1. Voice Commands
\`\`\`typescript
{
  type: "voice",
  action: "assign",
  part: 1, // 1-4 (Left, Right1, Right2, Right3)
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

#### 2. Mixer Commands
\`\`\`typescript
// Volume control
{ type: "mixer", action: "volume", channel: 1, value: 100 }

// Pan control
{ type: "mixer", action: "pan", channel: 1, value: 64 }

// EQ controls
{ type: "mixer", action: "eq-bass", channel: 1, value: 64 }
{ type: "mixer", action: "eq-mid", channel: 1, value: 64 }
{ type: "mixer", action: "eq-high", channel: 1, value: 64 }

// Reverb send
{ type: "mixer", action: "reverb", channel: 1, value: 40 }

// Chorus send
{ type: "mixer", action: "chorus", channel: 1, value: 30 }

// Brightness
{ type: "mixer", action: "brightness", channel: 1, value: 64 }

// Solo/Mute
{ type: "mixer", action: "solo", channel: 1 }
{ type: "mixer", action: "mute", channel: 1, muted: true }
\`\`\`

#### 3. Effects Commands
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

#### 4. Style Commands
\`\`\`typescript
// Start/Stop
{ type: "style", action: "start" }
{ type: "style", action: "stop" }

// Sync Start
{ type: "style", action: "sync-start", enabled: true }

// Select style
{ type: "style", action: "select", category: "Pop & Rock", style: "8BeatModern" }

// Tempo (30-400 BPM)
{ type: "style", action: "tempo", value: 120 }

// Variation (11 options)
{ 
  type: "style", 
  action: "variation", 
  variation: "main-1" // Options: intro-1, intro-2, intro-3, main-1, main-2, main-3, main-4, fill-in, outro-1, outro-2, outro-3
}

// Fill-ins
{ type: "style", action: "fill-in", fillType: "intro" }
\`\`\`

#### 5. Multipad Commands
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
\`\`\`

#### 6. Chord Commands
\`\`\`typescript
// Play chord
{
  type: "chord",
  action: "play",
  chord: {
    root: "C",
    quality: "maj",
    extension: "7",
    bass: "E" // Optional slash chord
  },
  duration: 4,
  velocity: 100
}

// Play sequence
{
  type: "chord",
  action: "sequence",
  chords: [
    { chord: { root: "C", quality: "maj" }, bar: 1, beat: 1, duration: 4 },
    { chord: { root: "F", quality: "maj" }, bar: 2, beat: 1, duration: 4 }
  ],
  tempo: 120
}
\`\`\`

#### 7. Registration Commands
\`\`\`typescript
// Save registration
{
  type: "registration",
  action: "save",
  bank: 1, // 1-8
  slot: 1, // 1-8
  name: "My Setup",
  data: { voices: [...], mixer: [...], effects: [...] }
}

// Load registration (with optional freeze support)
{ 
  type: "registration", 
  action: "load", 
  bank: 1,
  slot: 1, 
  data: { 
    voices: [...], // Optional - omit if frozen
    mixer: [...],  // Optional - omit if frozen
    effects: [...] // Optional - omit if frozen
  } 
}

// Bank management
{ type: "registration", action: "load-bank", bank: 1 }
{ type: "registration", action: "save-bank", bank: 1, name: "Bank 1" }
{ type: "registration", action: "delete-bank", bank: 1 }

// Freeze parameters (prevent loading specific parameters)
{
  type: "registration",
  action: "freeze",
  parameters: {
    voices: true,  // Freeze voice assignments
    style: false,
    tempo: false,
    effects: false,
    mixer: false
  }
}

// Registration sequence (program slot recall order)
{
  type: "registration",
  action: "sequence",
  sequence: [1, 3, 2, 4] // Slot numbers in desired order
}
\`\`\`

#### 8. Assembly/Hybridizer Commands
\`\`\`typescript
// Load target style for editing
{
  type: "assembly",
  action: "load-target",
  category: "Pop & Rock",
  style: "8BeatModern"
}

// Load source style to copy from
{
  type: "assembly",
  action: "load-source",
  category: "Jazz",
  style: "SwingJazz"
}

// Copy pattern from source to target
{
  type: "assembly",
  action: "copy-pattern",
  sourceSection: "Main A",
  sourceChannel: 1, // 0-7 (Rhythm 1, Rhythm 2, Bass, Chord 1, Chord 2, Pad, Phrase 1, Phrase 2)
  targetSection: "Main A",
  targetChannel: 1
}

// Execute pending copy operations
{ type: "assembly", action: "execute" }

// Undo last operation
{ type: "assembly", action: "undo" }

// Save assembled style
{ type: "assembly", action: "save", name: "My Hybrid Style" }
\`\`\`

#### 9. Tyros Control Commands
\`\`\`typescript
// Local control
{ type: "tyros-control", action: "local-control", enabled: true }

// Clock source
{ type: "tyros-control", action: "clock-source", source: "internal" }

// Accompaniment
{ type: "tyros-control", action: "accompaniment", enabled: true }
\`\`\`

## Implementing Your Backend

### Option 1: Replace Mock Implementation

Replace the `MockTyrosAPI` class in `lib/tyros-api.ts`:

\`\`\`typescript
export class RealTyrosAPI implements TyrosAPI {
  async sendCommand(command: TyrosCommand): Promise<void> {
    // Send to your backend
    await fetch('/api/tyros/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command)
    })
  }

  async sendCommands(commands: TyrosCommand[]): Promise<void> {
    await fetch('/api/tyros/commands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commands)
    })
  }

  isConnected(): boolean {
    // Check connection status
    return this.connected
  }

  getConnectionStatus() {
    return {
      connected: this.connected,
      inputPort: this.inputPort,
      outputPort: this.outputPort,
      lastError: this.lastError
    }
  }

  async connect(): Promise<void> {
    // Establish connection
  }

  async disconnect(): Promise<void> {
    // Close connection
  }

  onEvent(callback: (event: TyrosEvent) => void): () => void {
    // Subscribe to events
    this.eventCallbacks.push(callback)
    return () => {
      const index = this.eventCallbacks.indexOf(callback)
      if (index > -1) this.eventCallbacks.splice(index, 1)
    }
  }
}

export const tyrosAPI: TyrosAPI = new RealTyrosAPI()
\`\`\`

### Option 2: Backend Service

Create a backend service that translates commands to MIDI:

\`\`\`typescript
// Backend API endpoint
app.post('/api/tyros/command', async (req, res) => {
  const command: TyrosCommand = req.body

  switch (command.type) {
    case 'voice':
      await midiService.sendProgramChange(command.part, command.voice)
      break
    case 'mixer':
      await midiService.sendControlChange(
        command.channel,
        getMidiCC(command.action),
        command.value
      )
      break
    case 'style':
      await midiService.handleStyleCommand(command)
      break
    // ... handle other command types
  }

  res.json({ success: true })
})
\`\`\`

## Key Features

### Persistent State
- Chord progressions persist across tab switches
- Mixer settings maintained during navigation
- Voice selections preserved
- Registration memory stored locally

### Type Safety
- Full TypeScript coverage
- Strict type checking for all commands
- IntelliSense support for API usage
- Compile-time error detection

### Extensibility
- Easy to add new command types
- Modular component architecture
- Reusable UI components
- Clean separation of concerns

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: React hooks + Context API
- **Icons**: Lucide React
- **Deployment**: Vercel

## Development

### Code Structure

The application follows a clean architecture:

1. **Presentation Layer** (`components/`): UI components
2. **Business Logic** (`lib/`): API, data, and utilities
3. **Application Layer** (`app/`): Routing and layout
4. **Hooks** (`hooks/`): Reusable React hooks

### Adding New Features

1. Define command types in `lib/tyros-api.ts`
2. Create UI components in `components/`
3. Use `useMIDI()` hook to access API
4. Call `api.sendCommand()` with typed commands

### Testing

The mock implementation logs all commands to the console, allowing you to:
- Test UI without hardware
- Verify command structure
- Debug command flow
- Validate before backend integration

## Troubleshooting

### ResizeObserver Errors
These are harmless browser warnings from the resizable panels library. They're automatically suppressed in the application.

### State Not Persisting
Ensure you're using the state management in `app/page.tsx` and passing state as props to child components.

### TypeScript Errors
Run `pnpm build` to check for type errors. All commands are strictly typed for safety.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own Tyros5 integration.

## Acknowledgments

- Yamaha for the Tyros5 keyboard
- shadcn for the excellent UI component library
- The Next.js team for the amazing framework

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for musicians and developers**
