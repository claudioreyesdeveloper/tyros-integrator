# SmartBridge - PSR, Genos & Tyros5 Integrator Features

## Overview

SmartBridge is a comprehensive web-based MIDI control interface for the Yamaha PSR, Genos & Tyros5 keyboard. Built with Next.js 15, React 19, and TypeScript, it provides professional-grade control over all aspects of the PSR, Genos & Tyros5 through an intuitive, modern interface optimized for both desktop and touch devices.

---

## Core Features

### 1. Home Screen - Performance Dashboard

**Quick Performance Control**
- **4 Performance Parts Display**: Left 1, Left 2, Right 1, Right 2
- **Real-time Voice Assignment**: Click any part to instantly browse and assign voices
- **Visual Voice Indicators**: Each part displays the currently assigned voice name in white text
- **Style Selection**: Quick access to accompaniment styles with category browser
- **Transport Controls**: Start/Stop accompaniment with visual feedback
- **Sync Start Toggle**: Enable/disable synchronized style start

---

### 2. Voice Browser - Comprehensive Voice Management

**Voice Library**
- **1,000+ Voices**: Complete PSR, PSR, Genos & Tyros and PSR voice library organized by category
- **16 Main Categories**: Piano, Organ, Guitar, Bass, Strings, Brass, Woodwind, Synth, and more
- **Subcategory Organization**: Each category contains multiple subcategories for precise voice selection
- **MSB/LSB/PRG Data**: Full MIDI program change data for each voice

**Search & Navigation**
- **Command Palette Search**: Press Cmd/Ctrl+K for instant voice search
- **Fuzzy Search**: Find voices by partial name matching
- **Smart Navigation**: Search results automatically update category/subcategory navigation
- **Category Breadcrumbs**: Always know your location in the voice hierarchy
- **Quick Category Switching**: Jump between categories without losing your place

**Voice Assignment**
- **Direct Part Assignment**: Assign voices to any of the 4 performance parts
- **Visual Confirmation**: Selected voice highlights in the browser
- **MIDI Program Change**: Sends proper MSB/LSB/PRG messages to PSR, Genos & Tyros5
- **Persistent Selection**: Voice assignments persist across tab switches

---

### 3. Mixer Interface - Professional Mixing Console

**32-Channel Mixer**
- **Channel Banks**: Switch between banks 1-16 and 17-32
- **Per-Channel Controls**:
  - **Volume Fader**: 0-127 range with visual feedback
  - **Pan Knob**: L63 to Center to R63 positioning
  - **Reverb Send**: Adjustable reverb amount per channel
  - **Chorus Send**: Adjustable chorus amount per channel
  - **Brightness Control**: Tone adjustment per channel
  - **Solo Button**: Isolate individual channels
  - **Mute Button**: Silence individual channels

**Global Controls**
- **Master Volume**: Overall output level control
- **Global Reverb**: Master reverb send level
- **Global Chorus**: Master chorus send level

**Visual Feedback**
- **Rotary Knobs**: Realistic knob controls with value display
- **Color-Coded Channels**: Easy visual identification
- **Real-time Updates**: Immediate visual response to changes
- **Touch-Optimized**: Works perfectly on tablets and touch screens

---

### 4. Registration Manager - Performance Memory

**8 Registration Slots**
- **Save Complete Setups**: Store entire performance configurations
- **Slot Management**: Save, load, and delete registrations
- **Custom Naming**: Give each registration a descriptive name
- **Timestamp Tracking**: Automatic save time recording

**Saved Data Includes**
- **All Voice Assignments**: All 4 performance parts
- **Mixer Settings**: Volume, pan, reverb, chorus for all channels
- **DSP Effects**: Effect assignments and parameters
- **Global Settings**: Master transpose, tempo lock, auto power-off
- **Global Effects**: Master volume, global reverb/chorus

**Import/Export**
- **JSON Configuration Files**: Save entire setups to disk
- **Cross-Session Persistence**: Load configurations between sessions
- **Backup & Restore**: Create backups of your performance setups
- **Configuration Sharing**: Share setups with other users

---

### 5. Assembly Workbench - Style Creation & Editing

**Hybrid Style Assembly**
- **Drag & Drop Interface**: Visually copy style parts between sections
- **11 Style Sections**: Intro 1-3, Main A-D, Fill, Outro 1-3
- **8 Style Tracks**: Rhythm 1-2, Bass, Chord 1-3, Phrase 1-2
- **Source Style Preview**: Load and preview any PSR, Genos & Tyros5 style
- **Target Style Building**: Create custom hybrid styles

**Style Part Controls**
- **Solo/Mute Per Track**: Isolate or silence individual tracks
- **Real-time Playback**: Preview styles while editing
- **Visual Feedback**: Color-coded source and target areas
- **Touch Support**: Full touch screen support for mobile devices

**SFF Rules Editor**
- **NTR (Note Transposition Rule)**: Control how notes transpose with chords
  - Root, Bass, Melodic, Harmonic Minor, Melodic Minor, Natural Minor
- **NTT (Note Transposition Table)**: Define transposition behavior
  - Bypass, Melody, Chord, Bass, Melodic Minor, Harmonic Minor
- **RTR (Re-Trigger Rule)**: Enable/disable note re-triggering
- **Note Limits**: Set low and high note boundaries per track

**Assembly History**
- **Undo Functionality**: Revert last pattern copy operation
- **Operation Tracking**: View history of all assembly operations
- **Commit & Save**: Bulk save hybrid style to PSR, Genos & Tyros memory
- **Status Indicators**: Visual feedback for save operations

---

### 6. Style Editor - Advanced Style Control

**Three Integrated Tabs**

#### Tab 1: Assembly Workbench
- Complete style assembly interface (same as standalone Assembly Workbench)
- Drag & drop pattern copying
- SFF rules editing
- Assembly history and undo

#### Tab 2: Mix & Voice Console
**Style Mix Console**
- **8 Style Track Channels**: Individual control for each style track
- **Per-Track Controls**:
  - Vertical volume faders (0-127)
  - Pan rotary knobs (L63-C-R63)
  - Reverb send knobs (0-127)
  - Chorus send knobs (0-127)
- **Visual Layout**: Professional mixer-style vertical channel strips

**Keyboard Part Controls**
- **4 Keyboard Parts**: Right 1, Right 2, Right 3, Left
- **Per-Part Controls**:
  - Volume faders
  - Pan knobs
- **Color-Coded**: Blue highlighting for keyboard parts

**Voice Parameter Controls**
- **Touch Sense Depth**: Adjust velocity sensitivity (0-127)
- **Vibrato Speed**: Control vibrato rate (0-127)
- **Vibrato Delay**: Set vibrato onset delay (0-127)
- **Large Rotary Knobs**: Easy adjustment with visual feedback

#### Tab 3: Chord Sequencer
**Timeline-Based Chord Programming**
- **Visual Timeline Grid**: 8-bar timeline with 4 beats per bar
- **Click-to-Add Chords**: Click any beat to add a chord
- **Chord Event Display**: Visual representation of chord progression
- **Drag & Resize**: Adjust chord duration and position

**Chord Selector**
- **Circle of Fifths Layout**: 12 root notes (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
- **10 Chord Types**: Major, Minor, 7th, maj7, m7, dim, aug, sus4, sus2, add9
- **3 Inversions**: Root, 1st, 2nd
- **Visual Selection**: Color-coded buttons for easy selection

**MIDI Routing**
- **Hardware Port Selection**: Choose MIDI output port
- **Style Channel Output**: Select MIDI channel (1-16)
- **Style Section Selection**: Choose style section for playback
- **Real-time MIDI Output**: Chords sent directly to PSR, Genos & Tyros

**Export Functionality**
- **Export to DAW**: Save chord progression as MIDI file
- **Standard MIDI Format**: Compatible with all DAWs
- **Automatic Download**: One-click export to disk

---

### 7. Chord Sequencer - Standalone Chord Programming

**Advanced Chord Progression Editor**
- **Multi-Section Support**: Create chord progressions for different song sections
- **Section Management**: Intro, Verse, Chorus, Bridge, Outro
- **Bar/Beat Grid**: Precise chord placement on timeline
- **Chord Duration Control**: Set chord length in beats
- **Visual Chord Display**: See entire progression at a glance

**Chord Library**
- **Comprehensive Chord Types**: All common chord qualities
- **Slash Chords**: Support for alternate bass notes
- **Chord Extensions**: 9th, 11th, 13th extensions
- **Custom Voicings**: Control chord inversions

**Playback & Control**
- **Real-time Playback**: Hear your progression with style accompaniment
- **Tempo Control**: Adjust playback speed
- **Loop Sections**: Repeat sections for practice
- **Sync with Style**: Coordinate with PSR, Genos & Tyros style playback

---

### 8. MIDI Logger - Debug & Monitor

**Real-time MIDI Monitoring**
- **Message Display**: View all incoming and outgoing MIDI messages
- **Message Filtering**: Filter by message type (Note On/Off, CC, Program Change, etc.)
- **Timestamp Display**: Precise timing information for each message
- **Hex/Decimal Display**: View MIDI data in multiple formats

**Logging Features**
- **Auto-Scroll**: Automatically scroll to latest messages
- **Message Count**: Track total messages sent/received
- **Clear Log**: Reset log display
- **Export Log**: Save log to file for analysis

**Debug Tools**
- **Connection Status**: Monitor MIDI connection state
- **Port Information**: View active input/output ports
- **Error Display**: See connection errors and warnings
- **Performance Metrics**: Monitor message throughput

---

## Technical Features

### Unified API Architecture

**Type-Safe Command System**
- **PSR, Genos & TyrosCommand Union Type**: All commands strictly typed
- **Command Categories**:
  - Voice Commands (assign)
  - Mixer Commands (volume, pan, reverb, chorus, brightness, solo, mute)
  - Effect Commands (assign)
  - Style Commands (select, start, stop, tempo, variation, fill-in, sync-start)
  - Multipad Commands (trigger, stop, volume)
  - Chord Commands (play, stop, sequence)
  - Registration Commands (save, load)
  - PSR, Genos & Tyros Control Commands (local-control, clock-source, accompaniment)

**API Methods**
- `sendCommand(command)`: Send single command
- `sendCommands(commands)`: Send multiple commands in sequence
- `isConnected()`: Check connection status
- `getConnectionStatus()`: Get detailed connection info
- `connect()`: Establish MIDI connection
- `disconnect()`: Close MIDI connection
- `onEvent(callback)`: Subscribe to MIDI events

### State Management

**Persistent State**
- **Voice Assignments**: Maintained across tab switches
- **Mixer Settings**: All channel settings preserved
- **Chord Progressions**: Saved in session
- **Registration Memory**: Stored locally
- **Global Settings**: Persistent configuration

**State Synchronization**
- **Real-time Updates**: UI reflects all changes immediately
- **Cross-Component Communication**: State shared between components
- **Undo/Redo Support**: History tracking for reversible operations

### User Interface

**Design System**
- **Dark Mode Optimized**: Designed for stage use
- **Premium Gradients**: Amber/yellow accent colors
- **Glass-Morphism Effects**: Modern translucent panels
- **High Contrast**: Excellent readability in all lighting
- **Consistent Typography**: Clear, professional fonts

**Responsive Design**
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Optimized**: Large touch targets, gesture support
- **Tablet-Friendly**: Perfect for iPad/Android tablets
- **Desktop Power**: Full feature set on large screens

**Accessibility**
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Compatible**: Semantic HTML
- **High Contrast Mode**: Excellent visibility
- **Focus Indicators**: Clear focus states

### Performance

**Optimizations**
- **React 19**: Latest React features and performance
- **Next.js 15**: App Router for optimal loading
- **Code Splitting**: Lazy loading of components
- **Memoization**: Optimized re-renders
- **Virtual Scrolling**: Smooth performance with large lists

**Real-time Responsiveness**
- **Immediate Feedback**: UI updates instantly
- **Smooth Animations**: 60fps transitions
- **Debounced Updates**: Optimized MIDI message sending
- **Efficient Rendering**: Minimal DOM updates

---

## Integration Features

### MIDI Communication

**WebMIDI API**
- **Browser-Based MIDI**: No drivers required
- **Multiple Port Support**: Connect to multiple devices
- **Bidirectional Communication**: Send and receive MIDI
- **SysEx Support**: Full system exclusive message support

**Mock Implementation**
- **Testing Without Hardware**: Full UI testing without PSR, Genos & Tyros
- **Console Logging**: All commands logged for debugging
- **Event Simulation**: Simulate MIDI events
- **Development Mode**: Safe testing environment

### Data Management

**Configuration Files**
- **JSON Format**: Human-readable configuration
- **Complete State Export**: All settings in one file
- **Version Tracking**: Configuration version management
- **Backward Compatibility**: Support for older formats

**Voice Database**
- **1,000+ Voices**: Complete PSR, Genos & Tyros voice library
- **Categorized Organization**: 16 main categories
- **Searchable**: Fast text search
- **Extensible**: Easy to add new voices

**Effect Database**
- **DSP Effects Library**: All PSR, Genos & Tyros effects
- **Effect Parameters**: Detailed parameter definitions
- **Category Organization**: Effects grouped by type
- **Preset Management**: Save and recall effect presets

**Style Database**
- **Complete Style Library**: All PSR, Genos & Tyros styles
- **Category Organization**: Styles grouped by genre
- **Style Metadata**: Tempo, time signature, description
- **Custom Styles**: Support for user-created styles

---

## Workflow Features

### Quick Performance Setup

1. **Select Voices**: Browse and assign voices to 4 parts
2. **Adjust Mix**: Set volume, pan, effects for each channel
3. **Choose Style**: Select accompaniment style
4. **Save Registration**: Store complete setup to memory slot
5. **Recall Anytime**: Load saved setup with one click

### Style Creation Workflow

1. **Load Source Style**: Choose a PSR, Genos & Tyros style as source
2. **Preview Sections**: Listen to different style sections
3. **Drag & Drop Parts**: Copy desired parts to target style
4. **Edit SFF Rules**: Adjust transposition and trigger rules
5. **Mix Tracks**: Balance volume and pan for each track
6. **Commit & Save**: Save hybrid style to PSR, Genos & Tyros memory

### Chord Progression Workflow

1. **Select Section**: Choose song section (Intro, Verse, etc.)
2. **Add Chords**: Click timeline to add chords
3. **Choose Voicings**: Select root, type, and inversion
4. **Adjust Duration**: Set chord length in beats
5. **Preview Playback**: Hear progression with style
6. **Export MIDI**: Save to DAW for further editing

---

## Advanced Features

### Touch Screen Support

**Gesture Recognition**
- **Drag & Drop**: Touch-based drag and drop for style assembly
- **Pinch to Zoom**: Zoom timeline and grids
- **Swipe Navigation**: Swipe between tabs and sections
- **Long Press**: Context menus and additional options

**Touch Optimizations**
- **Large Touch Targets**: Minimum 44x44px touch areas
- **Visual Feedback**: Immediate touch response
- **Prevent Scrolling**: Controlled scroll behavior during drag
- **Floating Indicators**: Visual feedback during touch drag

### Keyboard Shortcuts

**Global Shortcuts**
- `Cmd/Ctrl + K`: Open voice command palette
- `Cmd/Ctrl + S`: Save current configuration
- `Cmd/Ctrl + O`: Open configuration file
- `Space`: Play/Stop style
- `Esc`: Close dialogs and cancel operations

**Navigation Shortcuts**
- `Tab`: Navigate between controls
- `Arrow Keys`: Navigate lists and grids
- `Enter`: Confirm selections
- `Backspace/Delete`: Delete selected items

### Undo/Redo System

**Supported Operations**
- **Style Assembly**: Undo pattern copies
- **Chord Editing**: Undo chord additions/deletions
- **Mixer Changes**: Undo mixer adjustments
- **Voice Assignments**: Undo voice changes

**History Management**
- **Operation Stack**: Track all reversible operations
- **Redo Support**: Redo undone operations
- **History Limits**: Configurable history depth
- **Memory Efficient**: Optimized history storage

---

## Future-Ready Architecture

### Backend Integration Points

**Ready for Real MIDI Backend**
- **Pluggable API**: Easy to replace mock implementation
- **Type-Safe Interface**: All commands strictly typed
- **Event System**: Subscribe to hardware events
- **Error Handling**: Comprehensive error management

**Supported Backend Options**
- **WebMIDI Direct**: Browser-to-hardware communication
- **WebSocket Server**: Real-time bidirectional communication
- **HTTP API**: RESTful command interface
- **Electron App**: Native desktop application

### Extensibility

**Component Architecture**
- **Modular Design**: Independent, reusable components
- **Props-Based Configuration**: Flexible component behavior
- **Custom Hooks**: Reusable logic patterns
- **Context Providers**: Shared state management

**Data Layer**
- **Pluggable Data Sources**: Easy to add new voice/style databases
- **Custom Parsers**: Support for different file formats
- **API Abstraction**: Backend-agnostic command interface
- **Type Safety**: Full TypeScript coverage

---

## Summary

SmartBridge provides a complete, professional-grade control interface for the Yamaha PSR, Genos & Tyros keyboard. With features ranging from basic voice selection to advanced style assembly and chord sequencing, it offers everything needed for live performance, studio work, and creative sound design. The modern, responsive interface works seamlessly on desktop, tablet, and mobile devices, while the type-safe API architecture ensures reliable MIDI communication and easy backend integration.

**Key Strengths:**
- Comprehensive feature set covering all PSR, Genos & Tyros functions
- Intuitive, touch-optimized user interface
- Professional mixing and effects control
- Advanced style creation and editing tools
- Robust state management and persistence
- Type-safe, extensible architecture
- Ready for production MIDI backend integration

**Perfect For:**
- Live performers needing quick setup and recall
- Studio musicians creating custom styles
- Music educators demonstrating PSR, Genos & Tyros features
- Developers building MIDI control applications
- Anyone wanting modern control of their PSR, Genos & Tyros keyboard
