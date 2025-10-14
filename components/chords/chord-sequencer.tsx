'use client'

import { useState, useRef, useEffect } from 'react'
import type React from 'react'
import {
  Play,
  StopCircle,
  Download,
  Trash2,
  Plus,
  Minus,
  Music,
  Settings,
  Save,
  FolderOpen,
  Copy,
  GripVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useMIDI } from '@/lib/midi-context'
import { cn } from '@/lib/utils'

const STYLE_PARTS = [
  'Intro 1',
  'Intro 2',
  'Intro 3',
  'Main A',
  'Main B',
  'Main C',
  'Main D',
  'Fill',
  'Break',
  'Ending 1',
  'Ending 2',
  'Ending 3',
]

const SECTION_COLORS = {
  Intro: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  Verse: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  Chorus: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  Bridge: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  Outro: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
}

const ROOT_NOTES = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B']
const CHORD_QUALITIES = ['Major', 'Minor', 'Dominant', 'Diminished', 'Augmented', 'Suspended']
const CHORD_EXTENSIONS: Record<string, string[]> = {
  Major: ['none', '6', 'maj7', 'add9', '9', 'maj9', '6/9', 'maj7(#11)', 'maj13'],
  Minor: ['none', 'm6', 'm7', 'm9', 'm11', 'm(maj7)', 'm7(b5)'],
  Dominant: ['7', '9', '11', '13', '7sus4', '7(b9)', '7(#9)', '7(b5)', '7(#5)', '7(b13)'],
  Diminished: ['dim', 'dim7'],
  Augmented: ['aug', 'aug7', 'maj7(#5)'],
  Suspended: ['sus2', 'sus4', '7sus2', '7sus4'],
}
const BASS_NOTES = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B']
const SECTION_TYPES = ['Intro', 'Verse', 'Chorus', 'Bridge', 'Outro']
const STYLE_CATEGORIES = ['Pop/Rock', 'Ballad', 'Jazz', 'Dance', 'Latin', 'Country', 'R&B', 'World']
const STYLES_BY_CATEGORY: Record<string, string[]> = {
  'Pop/Rock': ['8BeatModern', '16Beat', 'PopShuffle', 'RockShuffle'],
  Ballad: ['6/8ModernEP', 'PianoBallad', 'OrganBallad'],
  Jazz: ['BigBandFast', 'JazzClub', 'SwingFast'],
  Dance: ['EuroTrance', 'ClubDance', 'Ibiza'],
  Latin: ['Bossanova', 'Samba', 'Mambo'],
  Country: ['CountryPop', 'CountrySwing'],
  'R&B': ['Soul', 'Motown', '6/8Soul'],
  World: ['Reggae', 'Ska', 'Calypso'],
}

type Resolution = 'whole' | 'half' | 'quarter'

interface Chord {
  id: string
  symbol: string
  beat: number
  duration: number
}

interface Section {
  id: string
  name: string
  bars: number
  stylePart: string
  color: string
  chords: Chord[]
}

interface ChordSequencerProps {
  chordState: {
    sections: Section[]
    activeSection: string
    resolution: Resolution
    selectedCategory: string
    selectedStyle: string
    tempo: number
    localControl: boolean
    clockSource: 'internal' | 'external'
    accompaniment: boolean
  }
  setChordState: React.Dispatch<
    React.SetStateAction<{
      sections: {
        id: string
        name: string
        bars: number
        stylePart: string
        color: string
        chords: Chord[]
      }[]
      activeSection: string
      resolution: 'whole' | 'half' | 'quarter'
      selectedCategory: string
      selectedStyle: string
      tempo: number
      localControl: boolean
      clockSource: 'internal' | 'external'
      accompaniment: boolean
    }>
  >
}

export function ChordSequencer({ chordState, setChordState }: ChordSequencerProps) {
  const { sendSysEx } = useMIDI()
  const { toast } = useToast()

  const {
    sections,
    activeSection,
    resolution,
    selectedCategory,
    selectedStyle,
    tempo,
    localControl,
    clockSource,
    accompaniment,
  } = chordState

  const setSections = (updater: Section[] | ((prev: Section[]) => Section[])) => {
    setChordState((prev) => ({
      ...prev,
      sections: typeof updater === 'function' ? updater(prev.sections) : updater,
    }))
  }

  const setActiveSection = (value: string) => {
    setChordState((prev) => ({ ...prev, activeSection: value }))
  }

  const setResolution = (value: Resolution) => {
    setChordState((prev) => ({ ...prev, resolution: value }))
  }

  const setSelectedCategory = (value: string) => {
    setChordState((prev) => ({ ...prev, selectedCategory: value }))
  }

  const setSelectedStyle = (value: string) => {
    setChordState((prev) => ({ ...prev, selectedStyle: value }))
  }

  const setTempo = (value: number) => {
    setChordState((prev) => ({ ...prev, tempo: value }))
  }

  const setLocalControl = (value: boolean) => {
    setChordState((prev) => ({ ...prev, localControl: value }))
  }

  const setClockSource = (value: 'internal' | 'external') => {
    setChordState((prev) => ({ ...prev, clockSource: value }))
  }

  const setAccompaniment = (value: boolean) => {
    setChordState((prev) => ({ ...prev, accompaniment: value }))
  }

  // Keep local UI state that doesn't need to persist
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [editingCell, setEditingCell] = useState<{ sectionId: string; beat: number } | null>(null)
  const [chordInput, setChordInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [showChordWheel, setShowChordWheel] = useState(false)
  const [wheelSection, setWheelSection] = useState<string | null>(null)
  const [wheelBeat, setWheelBeat] = useState(0)
  const [selectedRoot, setSelectedRoot] = useState('C')
  const [selectedQuality, setSelectedQuality] = useState('Major')
  const [selectedExtension, setSelectedExtension] = useState('none')
  const [selectedBass, setSelectedBass] = useState<string | null>(null)
  const [selectedChordDuration, setSelectedChordDuration] = useState(4) // Default to 1 bar (4 beats)
  const [resizingSection, setResizingSection] = useState<string | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartBars, setResizeStartBars] = useState(0)
  const [showStylePartMenu, setShowStylePartMenu] = useState<string | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)

  // Removed: const [selectedCategory, setSelectedCategory] = useState('Pop/Rock')
  // Removed: const [selectedStyle, setSelectedStyle] = useState('8BeatModern')
  // Removed: const [localControl, setLocalControl] = useState(true)
  // Removed: const [clockSource, setClockSource] = useState<'internal' | 'external'>('internal')
  // Removed: const [accompaniment, setAccompaniment] = useState(true)
  // Removed: const [tempo, setTempo] = useState(120)
  const [showMobileControls, setShowMobileControls] = useState(false)
  const [clipboardChord, setClipboardChord] = useState<Chord | null>(null)
  const [activeChordControls, setActiveChordControls] = useState<string | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [chordMenuOpen, setChordMenuOpen] = useState<string | null>(null)
  const [draggingChord, setDraggingChord] = useState<{ sectionId: string; chordId: string } | null>(
    null,
  )
  const [dragOverBeat, setDragOverBeat] = useState<number | null>(null)
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingCell])

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    checkTouch()
    window.addEventListener('resize', checkTouch)
    return () => window.removeEventListener('resize', checkTouch)
  }, [])

  useEffect(() => {
    if (resizingSection) {
      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - resizeStartX
        const barWidth = 40 // 40px per bar as per spec
        const deltaBars = Math.round(deltaX / barWidth)
        const newBars = Math.max(1, resizeStartBars + deltaBars)
        handleUpdateSection(resizingSection, { bars: newBars })
      }

      const handleMouseUp = () => {
        setResizingSection(null)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [resizingSection, resizeStartX, resizeStartBars])

  const handleAddSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: 'New Section',
      bars: 4,
      stylePart: 'Main A',
      color: SECTION_COLORS.Verse,
      chords: [],
    }
    setSections([...sections, newSection])
    toast({
      title: 'Section Added',
      description: 'New section added to arrangement',
    })
  }

  const handleUpdateSection = (id: string, updates: Partial<Omit<Section, 'id' | 'chords'>>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const handleCycleStylePart = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const currentIndex = STYLE_PARTS.indexOf(section.stylePart)
    const nextIndex = (currentIndex + 1) % STYLE_PARTS.length
    const nextPart = STYLE_PARTS[nextIndex]
    handleUpdateSection(sectionId, { stylePart: nextPart })
    toast({
      title: 'Style Part Changed',
      description: `${nextPart} selected`,
    })
  }

  const handleStylePartLongPress = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowStylePartMenu(sectionId)
  }

  const handleResizeStart = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return
    setResizingSection(sectionId)
    setResizeStartX(e.clientX)
    setResizeStartBars(section.bars)
  }

  const handleCellClick = (sectionId: string, beat: number) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const existingChord = section.chords.find((c) => c.beat === beat)
    if (existingChord) {
      setChordInput(existingChord.symbol)
    } else {
      setChordInput('')
    }
    setEditingCell({ sectionId, beat })
  }

  const handleChordInputSubmit = () => {
    if (!editingCell || !chordInput.trim()) {
      setEditingCell(null)
      return
    }

    const { sectionId, beat } = editingCell
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const resolutionDuration = resolution === 'whole' ? 4 : resolution === 'half' ? 2 : 1

    const newChord: Chord = {
      id: `chord-${Date.now()}`,
      symbol: chordInput.trim(),
      beat,
      duration: resolutionDuration,
    }

    const filteredChords = section.chords.filter((c) => c.beat !== beat)

    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, chords: [...filteredChords, newChord].sort((a, b) => a.beat - b.beat) }
          : s,
      ),
    )

    setEditingCell(null)
    setChordInput('')
    toast({
      title: 'Chord Added',
      description: `${chordInput.trim()} added to section`,
    })
  }

  const handleChordInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleChordInputSubmit()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
      setChordInput('')
    } else if (e.key === 'Tab' && editingCell) {
      e.preventDefault()
      const section = sections.find((s) => s.id === editingCell.sectionId)
      if (!section) return
      const nextBeat = editingCell.beat + 1
      if (nextBeat < section.bars * 4) {
        handleChordInputSubmit()
        handleCellClick(editingCell.sectionId, nextBeat)
      }
    } else if (e.key === 'ArrowRight' && editingCell) {
      e.preventDefault()
      const section = sections.find((s) => s.id === editingCell.sectionId)
      if (!section) return
      const nextBeat = editingCell.beat + 1
      if (nextBeat < section.bars * 4) {
        handleChordInputSubmit()
        handleCellClick(editingCell.sectionId, nextBeat)
      }
    } else if (e.key === 'ArrowLeft' && editingCell) {
      e.preventDefault()
      const prevBeat = editingCell.beat - 1
      if (prevBeat >= 0) {
        handleChordInputSubmit()
        handleCellClick(editingCell.sectionId, prevBeat)
      }
    }
  }

  const handleSaveSong = () => {
    const songData = {
      sections,
      metadata: {
        category: selectedCategory,
        style: selectedStyle,
        tempo,
        savedAt: new Date().toISOString(),
      },
    }
    const dataStr = JSON.stringify(songData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tyros-song-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast({
      title: 'Song Saved',
      description: 'Song exported as JSON file',
    })
  }

  const handleOpenSong = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const songData = JSON.parse(event.target?.result as string)
          if (songData.sections) {
            setSections(songData.sections)
            if (songData.sections.length > 0) {
              setActiveSection(songData.sections[0].id)
            }
          }
          if (songData.metadata) {
            if (songData.metadata.category) setSelectedCategory(songData.metadata.category)
            if (songData.metadata.style) setSelectedStyle(songData.metadata.style)
            if (songData.metadata.tempo) setTempo(songData.metadata.tempo)
          }
          toast({
            title: 'Song Loaded',
            description: 'Song imported successfully',
          })
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load song file',
            variant: 'destructive',
          })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleOpenChordWheel = (sectionId: string, beat: number) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    // Check if there's an existing chord at this beat
    const existingChord = section.chords.find((c) => c.beat === beat)

    if (existingChord) {
      setSelectedChordDuration(existingChord.duration)
      const symbol = existingChord.symbol

      // Extract root note (first 1-2 characters)
      let root = symbol[0]
      if (symbol[1] === '#' || symbol[1] === 'b') {
        root += symbol[1]
      }

      // Convert to display format (e.g., 'C#' to 'C#/Db')
      const rootIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(
        root.replace('b', '#'),
      )
      if (rootIndex !== -1) {
        setSelectedRoot(ROOT_NOTES[rootIndex])
      }

      // Determine quality and extension
      if (symbol.includes('dim7')) {
        setSelectedQuality('Diminished')
        setSelectedExtension('dim7')
      } else if (symbol.includes('dim')) {
        setSelectedQuality('Diminished')
        setSelectedExtension('dim')
      } else if (symbol.includes('aug7')) {
        setSelectedQuality('Augmented')
        setSelectedExtension('aug7')
      } else if (symbol.includes('aug')) {
        setSelectedQuality('Augmented')
        setSelectedExtension('aug')
      } else if (symbol.includes('7sus4')) {
        setSelectedQuality('Suspended')
        setSelectedExtension('7sus4')
      } else if (symbol.includes('7sus2')) {
        setSelectedQuality('Suspended')
        setSelectedExtension('7sus2')
      } else if (symbol.includes('sus4')) {
        setSelectedQuality('Suspended')
        setSelectedExtension('sus4')
      } else if (symbol.includes('sus2')) {
        setSelectedQuality('Suspended')
        setSelectedExtension('sus2')
      } else if (symbol.match(/[^m]7/)) {
        // Dominant 7th (not m7)
        setSelectedQuality('Dominant')
        if (symbol.includes('7(b9)')) setSelectedExtension('7(b9)')
        else if (symbol.includes('7(#9)')) setSelectedExtension('7(#9)')
        else if (symbol.includes('7(b5)')) setSelectedExtension('7(b5)')
        else if (symbol.includes('7(#5)')) setSelectedExtension('7(#5)')
        else if (symbol.includes('13')) setSelectedExtension('13')
        else if (symbol.includes('11')) setSelectedExtension('11')
        else if (symbol.includes('9')) setSelectedExtension('9')
        else setSelectedExtension('7')
      } else if (symbol.includes('m(maj7)')) {
        setSelectedQuality('Minor')
        setSelectedExtension('m(maj7)')
      } else if (symbol.includes('m7(b5)')) {
        setSelectedQuality('Minor')
        setSelectedExtension('m7(b5)')
      } else if (symbol.includes('m11')) {
        setSelectedQuality('Minor')
        setSelectedExtension('m11')
      } else if (symbol.includes('m9')) {
        setSelectedQuality('Minor')
        setSelectedExtension('m9')
      } else if (symbol.includes('m7')) {
        setSelectedQuality('Minor')
        setSelectedExtension('m7')
      } else if (symbol.includes('m6')) {
        setSelectedQuality('Minor')
        setSelectedExtension('m6')
      } else if (symbol.includes('m')) {
        setSelectedQuality('Minor')
        setSelectedExtension('none')
      } else if (symbol.includes('maj7(#11)')) {
        setSelectedQuality('Major')
        setSelectedExtension('maj7(#11)')
      } else if (symbol.includes('maj13')) {
        setSelectedQuality('Major')
        setSelectedExtension('maj13')
      } else if (symbol.includes('maj9')) {
        setSelectedQuality('Major')
        setSelectedExtension('maj9')
      } else if (symbol.includes('maj7')) {
        setSelectedQuality('Major')
        setSelectedExtension('maj7')
      } else if (symbol.includes('6/9')) {
        setSelectedQuality('Major')
        setSelectedExtension('6/9')
      } else if (symbol.includes('add9')) {
        setSelectedQuality('Major')
        setSelectedExtension('add9')
      } else if (symbol.includes('6')) {
        setSelectedQuality('Major')
        setSelectedExtension('6')
      } else if (symbol.includes('9')) {
        setSelectedQuality('Major')
        setSelectedExtension('9')
      } else {
        setSelectedQuality('Major')
        setSelectedExtension('none')
      }

      // Extract bass note
      if (symbol.includes('/')) {
        const bassNote = symbol.split('/')[1]
        // Convert to display format
        const bassIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(
          bassNote.replace('b', '#'),
        )
        if (bassIndex !== -1) {
          setSelectedBass(BASS_NOTES[bassIndex])
        }
      } else {
        setSelectedBass(null)
      }
    } else {
      setSelectedChordDuration(4) // Reset to defaults for new chord
      setSelectedRoot('C')
      setSelectedQuality('Major')
      setSelectedExtension('none')
      setSelectedBass(null)
    }

    setWheelSection(sectionId)
    setWheelBeat(beat)
    setShowChordWheel(true)
  }

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality)
    // Reset extension to first valid option for this quality
    const validExtensions = CHORD_EXTENSIONS[quality] || ['none']
    setSelectedExtension(validExtensions[0])
  }

  const handleConfirmChordWheel = () => {
    if (!wheelSection) return

    let chordSymbol = selectedRoot.split('/')[0] // Use first part of root (e.g., 'C#' from 'C#/Db')

    // Build chord symbol based on quality and extension
    if (selectedQuality === 'Major') {
      if (selectedExtension === 'none') {
        // Just the root for major triad
      } else {
        chordSymbol += selectedExtension
      }
    } else if (selectedQuality === 'Minor') {
      if (selectedExtension === 'none') {
        chordSymbol += 'm'
      } else {
        chordSymbol += selectedExtension
      }
    } else if (selectedQuality === 'Dominant') {
      chordSymbol += selectedExtension
    } else if (selectedQuality === 'Diminished') {
      chordSymbol += selectedExtension
    } else if (selectedQuality === 'Augmented') {
      chordSymbol += selectedExtension
    } else if (selectedQuality === 'Suspended') {
      chordSymbol += selectedExtension
    }

    if (selectedBass) {
      chordSymbol += `/${selectedBass.split('/')[0]}`
    }

    const section = sections.find((s) => s.id === wheelSection)
    if (!section) return

    const existingChord = section.chords.find((c) => c.beat === wheelBeat)
    const chordDuration = selectedChordDuration

    const newChord: Chord = {
      id: `chord-${Date.now()}`,
      symbol: chordSymbol,
      beat: wheelBeat,
      duration: chordDuration,
    }

    const filteredChords = section.chords.filter((c) => c.beat !== wheelBeat)

    setSections(
      sections.map((s) =>
        s.id === wheelSection
          ? { ...s, chords: [...filteredChords, newChord].sort((a, b) => a.beat - b.beat) }
          : s,
      ),
    )

    setShowChordWheel(false)
    toast({
      title: 'Chord Added',
      description: `${chordSymbol} added to section`,
    })
  }

  const handleDeleteChord = (sectionId: string, chordId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, chords: s.chords.filter((c) => c.id !== chordId) } : s,
      ),
    )
    toast({ title: 'Chord Deleted', description: 'Chord removed from section' })
  }

  const handleIncreaseChordDuration = (sectionId: string, chordId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s

        const targetChord = s.chords.find((c) => c.id === chordId)
        if (!targetChord) return s

        const oldDuration = targetChord.duration
        const newDuration = Math.min(4, oldDuration + 1) // Max 4 beats (1 bar)
        const durationChange = newDuration - oldDuration

        // If no change, return as is
        if (durationChange === 0) return s

        // Update the target chord and shift all subsequent chords forward
        return {
          ...s,
          chords: s.chords
            .map((c) => {
              if (c.id === chordId) {
                // Update the target chord's duration
                return { ...c, duration: newDuration }
              } else if (c.beat > targetChord.beat) {
                // Shift subsequent chords forward
                return { ...c, beat: c.beat + durationChange }
              }
              return c
            })
            .sort((a, b) => a.beat - b.beat),
        }
      }),
    )
    toast({
      title: 'Duration Increased',
      description: 'Chord duration extended, subsequent chords adjusted',
    })
  }

  const handleDecreaseChordDuration = (sectionId: string, chordId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s

        const targetChord = s.chords.find((c) => c.id === chordId)
        if (!targetChord) return s

        const oldDuration = targetChord.duration
        const newDuration = Math.max(1, oldDuration - 1) // Min 1 beat (1/4 bar)

        // If no change, return as is
        if (newDuration === oldDuration) return s

        // Update the target chord's duration, do NOT shift subsequent chords
        // This leaves empty space that can be filled with new chords
        return {
          ...s,
          chords: s.chords
            .map((c) => {
              if (c.id === chordId) {
                // Update the target chord's duration
                return { ...c, duration: newDuration }
              }
              return c
            })
            .sort((a, b) => a.beat - b.beat),
        }
      }),
    )
    toast({ title: 'Duration Decreased', description: 'Chord duration reduced, empty space available for new chords' })
  }

  const handleCopyChord = (sectionId: string, chordId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return
    const chord = section.chords.find((c) => c.id === chordId)
    if (!chord) return
    setClipboardChord(chord)
    toast({ title: 'Chord Copied', description: `${chord.symbol} copied to clipboard` })
  }

  const handlePasteChord = (sectionId: string, beat: number) => {
    if (!clipboardChord) return

    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const newChord: Chord = {
      id: `chord-${Date.now()}`,
      symbol: clipboardChord.symbol,
      beat,
      duration: clipboardChord.duration,
    }

    const filteredChords = section.chords.filter((c) => c.beat !== beat)

    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, chords: [...filteredChords, newChord].sort((a, b) => a.beat - b.beat) }
          : s,
      ),
    )
    setClipboardChord(null)
    toast({ title: 'Chord Pasted', description: `${clipboardChord.symbol} pasted to section` })
  }

  const cycleResolution = () => {
    const resolutions: Resolution[] = ['whole', 'half', 'quarter']
    const currentIndex = resolutions.indexOf(resolution)
    const nextIndex = (currentIndex + 1) % resolutions.length
    setResolution(resolutions[nextIndex])
  }

  const handlePlay = () => {
    setIsPlaying(true)
    toast({ title: 'Playback Started', description: 'Playing arrangement' })
  }

  const handleStop = () => {
    setIsPlaying(false)
    toast({ title: 'Playback Stopped', description: 'Arrangement stopped' })
  }

  const handleRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      toast({ title: 'Recording Started', description: 'Capturing MIDI output from Tyros5' })
    } else {
      toast({ title: 'Recording Stopped', description: 'MIDI clip ready to drag to DAW' })
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    const styles = STYLES_BY_CATEGORY[category]
    if (styles && styles.length > 0) {
      setSelectedStyle(styles[0])
    }
  }

  const handleTempoChange = (delta: number) => {
    setTempo(Math.max(40, Math.min(240, tempo + delta)))
  }

  const activeS = sections.find((s) => s.id === activeSection)

  // const handleChordTap = (chordId: string, e: React.MouseEvent | React.TouchEvent) => {
  //   e.stopPropagation()
  //   if (isTouchDevice) {
  //     // Toggle controls visibility on touch devices
  //     setActiveChordControls(activeChordControls === chordId ? null : chordId)
  //   }
  // }

  // Add drag-and-drop handlers for chords
  const handleChordDragStart = (e: React.DragEvent, sectionId: string, chordId: string) => {
    e.stopPropagation()
    setDraggingChord({ sectionId, chordId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleChordDragEnd = () => {
    setDraggingChord(null)
    setDragOverBeat(null)
    setIsDragging(false)
    // setLastTapTime(0) // Reset tap timers on drag end - REMOVED
    // setLastTapChordId(null) // REMOVED
  }

  const handleCellDragOver = (e: React.DragEvent, beat: number) => {
    if (!draggingChord) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverBeat(beat)
  }

  const handleCellDrop = (e: React.DragEvent, sectionId: string, targetBeat: number) => {
    e.preventDefault()
    if (!draggingChord) return

    const { sectionId: sourceSectionId, chordId } = draggingChord

    // Find the chord being dragged
    const sourceSection = sections.find((s) => s.id === sourceSectionId)
    if (!sourceSection) return
    const chord = sourceSection.chords.find((c) => c.id === chordId)
    if (!chord) return

    // If dropping in the same position, do nothing
    if (sourceSectionId === sectionId && chord.beat === targetBeat) {
      handleChordDragEnd()
      return
    }

    // Update sections
    setSections(
      sections.map((s) => {
        if (s.id === sourceSectionId) {
          // Remove chord from source section
          const remainingChords = s.chords.filter((c) => c.id !== chordId)

          if (sourceSectionId === sectionId) {
            // Moving within same section
            const newChord = { ...chord, beat: targetBeat }
            const allChords = [...remainingChords, newChord].sort((a, b) => a.beat - b.beat)

            // Adjust positions to prevent overlaps
            const adjustedChords = allChords.reduce((acc, curr, idx) => {
              if (idx === 0) {
                acc.push(curr)
              } else {
                const prev = acc[idx - 1]
                const minBeat = prev.beat + prev.duration
                if (curr.beat < minBeat) {
                  acc.push({ ...curr, beat: minBeat })
                } else {
                  acc.push(curr)
                }
              }
              return acc
            }, [] as Chord[])

            return { ...s, chords: adjustedChords }
          } else {
            // Moving to different section - just remove from source
            return { ...s, chords: remainingChords }
          }
        } else if (s.id === sectionId && sourceSectionId !== sectionId) {
          // Add chord to target section
          const newChord = { ...chord, beat: targetBeat, id: `chord-${Date.now()}` }
          const allChords = [...s.chords, newChord].sort((a, b) => a.beat - b.beat)

          // Adjust positions to prevent overlaps
          const adjustedChords = allChords.reduce((acc, curr, idx) => {
            if (idx === 0) {
              acc.push(curr)
            } else {
              const prev = acc[idx - 1]
              const minBeat = prev.beat + prev.duration
              if (curr.beat < minBeat) {
                acc.push({ ...curr, beat: minBeat })
              } else {
                acc.push(curr)
              }
            }
            return acc
          }, [] as Chord[])

          return { ...s, chords: adjustedChords }
        }
        return s
      }),
    )

    toast({ title: 'Chord Moved', description: 'Chord repositioned and surrounding chords adjusted' })
    handleChordDragEnd()
  }

  const handleChordTouchStart = (e: React.TouchEvent, sectionId: string, chordId: string) => {
    const touch = e.touches[0]
    setTouchStartPos({ x: touch.clientX, y: touch.clientY })
    setDraggingChord({ sectionId, chordId })
    setIsDragging(true)
    // Set tap timers here too, for when touch move doesn't trigger a drag but a tap
    // setLastTapTime(Date.now()) // REMOVED
    // setLastTapChordId(chordId) // REMOVED
  }

  const handleChordTouchMove = (e: React.TouchEvent) => {
    if (!draggingChord || !touchStartPos) return

    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartPos.x)
    const deltaY = Math.abs(touch.clientY - touchStartPos.y)

    // Only start dragging if moved more than 10px
    if (deltaX > 10 || deltaY > 10) {
      setIsDragging(true)

      // Find the element under the touch point
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      const beatCell = element?.closest('[data-beat]')
      if (beatCell) {
        const beat = Number.parseInt(beatCell.getAttribute('data-beat') || '0')
        setDragOverBeat(beat)
      }
    }
  }

  const handleChordTouchEnd = (e: React.TouchEvent, sectionId: string) => {
    if (!draggingChord || !isDragging || dragOverBeat === null) {
      handleChordDragEnd()
      return
    }

    // Perform the drop
    handleCellDrop(e as any, sectionId, dragOverBeat)
  }

  const availableExtensions = CHORD_EXTENSIONS[selectedQuality] || ['none']

  return (
    <div className="h-screen flex flex-col bg-zinc-900 text-white">
      {/* Header */}
      <header className="bg-zinc-950 p-4 border-b border-amber-500/20 flex items-center justify-between z-20 shadow-lg">
        <h1 className="text-2xl font-bold">TYROS COMPOSER</h1>
        <Button onClick={() => setShowMobileControls(!showMobileControls)} className="lg:hidden bg-amber-500 hover:bg-amber-600 text-black" size="sm">
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      {/* Style & Category - moved to top */}
      <div className="bg-zinc-950 p-4 border-b border-amber-500/20">
        <h2 className="text-lg font-semibold mb-3">STYLE & CATEGORY</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 h-12 text-base">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {STYLE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 h-12 text-base">
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              {STYLES_BY_CATEGORY[selectedCategory]?.map((style) => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Song Timeline */}
        <div className="w-full lg:w-2/3 flex flex-col overflow-hidden">
          <div className="bg-zinc-950 p-4 border-b border-amber-500/20">
            <h2 className="text-lg font-semibold mb-3">SONG TIMELINE</h2>
            <div className="flex gap-2">
              <Button onClick={handleOpenSong} variant="outline" className="border-amber-500/50 hover:bg-amber-500/10">
                <FolderOpen className="h-4 w-4 mr-2" /> Open Song
              </Button>
              <Button onClick={handleSaveSong} variant="outline" className="border-amber-500/50 hover:bg-amber-500/10">
                <Save className="h-4 w-4 mr-2" /> Save Song
              </Button>
              <Button onClick={handleAddSection} className="bg-amber-500 hover:bg-amber-600 text-black">
                <Plus className="h-4 w-4 mr-2" /> Add Section
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto p-4 bg-grid-pattern">
            <div className="flex gap-4 pb-4">
              {sections.map((section) => (
                <div
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'relative rounded-xl cursor-pointer transition-all flex-shrink-0 shadow-lg hover:shadow-2xl',
                    'border-2 hover:scale-105',
                    activeSection === section.id
                      ? 'border-amber-500 ring-2 ring-amber-500/50'
                      : 'border-transparent',
                  )}
                  style={{
                    width: '280px',
                    background:
                      SECTION_COLORS[section.name as keyof typeof SECTION_COLORS] || section.color,
                    minWidth: '280px',
                  }}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg text-black">Song Structure</h3>
                      <Button
                        onClick={() =>
                          setSections(sections.filter((s) => s.id !== section.id))
                        }
                        variant="ghost"
                        size="sm"
                        className="text-black hover:bg-black/20 p-1 h-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Select
                        value={section.name}
                        onValueChange={(value) => {
                          handleUpdateSection(section.id, {
                            name: value,
                            color:
                              SECTION_COLORS[value as keyof typeof SECTION_COLORS] ||
                              section.color,
                          })
                        }}
                      >
                        <SelectTrigger className="bg-black/20 border-black/30 text-black font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTION_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={section.stylePart}
                        onValueChange={(value) => handleUpdateSection(section.id, { stylePart: value })}
                      >
                        <SelectTrigger className="bg-black/20 border-black/30 text-black font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STYLE_PARTS.map((part) => (
                            <SelectItem key={part} value={part}>
                              {part}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={String(section.bars)}
                        onValueChange={(value) =>
                          handleUpdateSection(section.id, { bars: Number.parseInt(value) })
                        }
                      >
                        <SelectTrigger className="bg-black/20 border-black/30 text-black font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={String(num)}>
                              {num} {num === 1 ? 'bar' : 'bars'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Resize Handle */}
                  <div
                    className="absolute top-0 right-0 h-full w-2 cursor-ew-resize bg-amber-500/50 rounded-r-xl"
                    onMouseDown={(e) => handleResizeStart(section.id, e)}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Chord Grid */}
          {activeS && (
            <div className="flex-1 flex flex-col bg-zinc-900 border-t-4 border-amber-500">
              <div className="p-4 bg-zinc-950 border-b border-amber-500/20">
                <h2 className="text-lg font-semibold">Editing Section</h2>
                <p className="text-amber-400">
                  {activeS.name} • {activeS.stylePart}
                </p>
                <p className="text-sm text-gray-400">
                  Resolution: {resolution === 'whole' ? '1 bar' : resolution === 'half' ? '½ bar' : '¼ bar'}
                </p>
              </div>
              <div
                className="flex-1 overflow-auto p-4 bg-grid-pattern-dark"
                style={{ gridTemplateColumns: `repeat(${activeS.bars * 4}, 80px)` }}
              >
                <div className="grid" style={{ gridTemplateColumns: `repeat(${activeS.bars * 4}, 80px)` }}>
                  {Array.from({ length: activeS.bars * 4 }, (_, beatIndex) => {
                    // Check if this beat is occupied by a chord
                    const chord = activeS.chords.find(
                      (c) => beatIndex >= c.beat && beatIndex < c.beat + c.duration,
                    )
                    const isChordStart = chord && chord.beat === beatIndex
                    const isBeingDragged = draggingChord?.chordId === chord?.id
                    const isDropTarget = dragOverBeat === beatIndex && !isBeingDragged

                    return (
                      <div
                        key={beatIndex}
                        data-beat={beatIndex}
                        onClick={() => {
                          if (!chord && clipboardChord) {
                            handlePasteChord(activeS.id, beatIndex)
                          } else if (!chord) {
                            handleOpenChordWheel(activeS.id, beatIndex)
                          }
                        }}
                        onDragOver={(e) => handleCellDragOver(e, beatIndex)}
                        onDrop={(e) => handleCellDrop(e, activeS.id, beatIndex)}
                        className={cn(
                          'h-56 flex items-center justify-center cursor-pointer transition-all relative bg-zinc-800/50',
                          !chord &&
                            clipboardChord &&
                            'hover:bg-green-500/20 border-2 border-dashed border-green-500/50',
                          !chord && !clipboardChord && 'hover:bg-blue-500/20',
                          chord && isChordStart && 'hover:ring-2 hover:ring-amber-400',
                          beatIndex % 4 === 0 && 'border-l-4 border-l-amber-500',
                          isDropTarget && 'bg-amber-500/30 ring-2 ring-500',
                          isBeingDragged && 'opacity-50',
                        )}
                        style={{
                          gridColumn: isChordStart ? `span ${chord.duration}` : undefined,
                          display: chord && !isChordStart ? 'none' : 'flex',
                        }}
                      >
                        {isChordStart && chord ? (
                          <div
                            draggable
                            onDragStart={(e) => handleChordDragStart(e, activeS.id, chord.id)}
                            onDragEnd={handleChordDragEnd}
                            onTouchStart={(e) => {
                              // Only start drag if not tapping controls
                              const target = e.target as HTMLElement
                              if (!target.closest('button')) {
                                handleChordTouchStart(e, activeS.id, chord.id)
                              }
                            }}
                            onTouchMove={handleChordTouchMove}
                            onTouchEnd={(e) => handleChordTouchEnd(e, activeS.id)}
                            className="relative w-full h-full flex flex-col bg-gradient-to-br from-amber-500 to-amber-600 text-black cursor-move overflow-hidden"
                          >
                            {/* Drag Handle - Top Left */}
                            <div className="absolute top-1 left-1 text-black/50">
                              <GripVertical size={16} />
                            </div>

                            {/* Chord Name - Center */}
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
                              <div className="font-bold text-4xl">{chord.symbol}</div>
                              <div className="text-sm opacity-80">
                                {chord.duration === 4
                                  ? '1 bar'
                                  : chord.duration === 2
                                    ? '½ bar'
                                    : chord.duration === 3
                                      ? '¾ bar'
                                      : '¼ bar'}
                              </div>
                            </div>

                            {/* Control Buttons - Bottom Row */}
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/20 flex justify-around items-center p-1 gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenChordWheel(activeS.id, beatIndex)
                                }}
                                onTouchEnd={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  handleOpenChordWheel(activeS.id, beatIndex)
                                }}
                                className="h-12 w-12 bg-purple-500/80 hover:bg-purple-600 active:scale-95 rounded-lg flex items-center justify-center transition-all touch-manipulation shadow-lg"
                                title="Edit chord"
                              >
                                <Settings size={20} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDecreaseChordDuration(activeS.id, chord.id)
                                }}
                                onTouchEnd={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  handleDecreaseChordDuration(activeS.id, chord.id)
                                }}
                                disabled={chord.duration <= 1}
                                className={cn(
                                  'h-12 w-12 rounded-lg flex items-center justify-center transition-all touch-manipulation shadow-lg',
                                  chord.duration <= 1
                                    ? 'bg-black/30 cursor-not-allowed opacity-40'
                                    : 'bg-black/50 hover:bg-black/70 active:scale-95',
                                )}
                                title="Decrease duration"
                              >
                                <Minus size={20} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleIncreaseChordDuration(activeS.id, chord.id)
                                }}
                                onTouchEnd={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  handleIncreaseChordDuration(activeS.id, chord.id)
                                }}
                                disabled={chord.duration >= 4}
                                className={cn(
                                  'h-12 w-12 rounded-lg flex items-center justify-center transition-all touch-manipulation shadow-lg',
                                  chord.duration >= 4
                                    ? 'bg-black/30 cursor-not-allowed opacity-40'
                                    : 'bg-black/50 hover:bg-black/70 active:scale-95',
                                )}
                                title="Increase duration"
                              >
                                <Plus size={20} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyChord(activeS.id, chord.id)
                                }}
                                onTouchEnd={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  handleCopyChord(activeS.id, chord.id)
                                }}
                                className="h-12 w-12 bg-blue-500/80 hover:bg-blue-600 active:scale-95 rounded-lg flex items-center justify-center transition-all touch-manipulation shadow-lg"
                                title="Copy chord"
                              >
                                <Copy size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteChord(activeS.id, chord.id)
                                }}
                                onTouchEnd={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  handleDeleteChord(activeS.id, chord.id)
                                }}
                                className="h-12 w-12 bg-red-500/80 hover:bg-red-600 active:scale-95 rounded-lg flex items-center justify-center transition-all touch-manipulation shadow-lg"
                                title="Delete chord"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ) : !chord ? (
                          <div className="text-center">
                            <div className="text-4xl font-bold text-zinc-600">
                              {clipboardChord ? (
                                <>
                                  <Download /> Paste
                                </> 
                              ) : (
                                <>
                                  <Plus /> Add
                                </>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Tyros Control */}
        <aside
          className={cn(
            'w-full lg:w-1/3 bg-zinc-950 border-l border-amber-500/20 p-4 flex flex-col gap-6 transition-transform duration-300 ease-in-out',
            'lg:translate-x-0',
            showMobileControls ? 'translate-x-0' : 'translate-x-full absolute right-0 h-full',
          )}
        >
          {/* Transport Controls */}
          <div className="flex gap-2">
            <Button onClick={isPlaying ? handleStop : handlePlay} className="flex-1 h-16 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold shadow-lg">
              {isPlaying ? (
                <>
                  <StopCircle className="h-6 w-6 mr-2" /> Stop
                </> 
              ) : (
                <>
                  <Play className="h-6 w-6 mr-2" /> Play
                </> 
              )}
            </Button>
            <Button onClick={handleRecord} variant={isRecording ? 'destructive' : 'outline'} className="h-16 w-32 border-amber-500/50 hover:bg-amber-500/10 text-lg font-bold shadow-lg">
              Record
            </Button>
          </div>
          {isRecording && (
            <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-lg text-center">
              <p className="font-bold">Recording MIDI...</p>
              <p className="text-sm">Drag the icon below to your DAW when finished.</p>
              <div className="mt-2 text-4xl cursor-grab active:cursor-grabbing">
                <Music />
              </div>
              <p className="text-xs mt-1">Drag to DAW</p>
            </div>
          )}

          {/* Tyros Control */}
          <div>
            <h2 className="text-lg font-semibold mb-3">TYROS CONTROL</h2>
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => setLocalControl(!localControl)}
                className={cn(
                  'w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all shadow-md',
                  localControl
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700',
                )}
              >
                Local Control: {localControl ? 'ON' : 'OFF'}
              </Button>
              <Button
                onClick={() => setClockSource(clockSource === 'internal' ? 'external' : 'internal')}
                className={cn(
                  'w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all shadow-md',
                  clockSource === 'external'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700',
                )}
              >
                Clock: {clockSource === 'internal' ? 'Internal' : 'External'}
              </Button>
              <Button
                onClick={() => setAccompaniment(!accompaniment)}
                className={cn(
                  'w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all shadow-md',
                  accompaniment
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700',
                )}
              >
                Accompaniment: {accompaniment ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>

          {/* Tempo */}
          <div>
            <h2 className="text-lg font-semibold mb-3">TEMPO</h2>
            <div className="flex items-center gap-2">
              <Button onClick={() => handleTempoChange(-1)} size="sm" className="bg-zinc-800 hover:bg-zinc-700 h-12 w-12 p-0 shadow-md">
                <Minus />
              </Button>
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(Number.parseInt(e.target.value) || 120)}
                className="flex-1 h-12 bg-zinc-800 border border-amber-500/30 rounded-lg text-center font-bold text-xl text-white shadow-md"
                min="40"
                max="240"
              />
              <Button onClick={() => handleTempoChange(1)} size="sm" className="bg-zinc-800 hover:bg-zinc-700 h-12 w-12 p-0 shadow-md">
                <Plus />
              </Button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">BPM (40-240)</p>
          </div>
        </aside>
      </div>

      {/* Chord Builder Wheel - Redesigned to follow musical theory */}
      {showChordWheel && (
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 flex items-center justify-center"
          onClick={() => setShowChordWheel(false)}
        >
          <div
            className="bg-zinc-900 rounded-2xl shadow-2xl w-[95%] max-w-4xl h-[90%] max-h-[1000px] flex flex-col border-2 border-amber-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-6 border-b border-amber-500/20">
              <h2 className="text-2xl font-bold text-amber-400">CHORD BUILDER</h2>
              <p className="text-gray-400">Build chords following proper musical theory</p>
            </header>

            {/* Preview */}
            <div className="p-6 bg-zinc-950">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Chord Preview</h3>
              <div className="bg-zinc-800 rounded-lg p-4 text-center">
                <p className="font-bold text-5xl text-white">
                  {selectedRoot.split('/')[0]}
                  {selectedQuality === 'Major' && selectedExtension === 'none' && ''}
                  {selectedQuality === 'Minor' && selectedExtension === 'none' && 'm'}
                  {selectedQuality === 'Major' && selectedExtension !== 'none' && selectedExtension}
                  {selectedQuality === 'Minor' && selectedExtension !== 'none' && selectedExtension}
                  {selectedQuality === 'Dominant' && selectedExtension}
                  {selectedQuality === 'Diminished' && selectedExtension}
                  {selectedQuality === 'Augmented' && selectedExtension}
                  {selectedQuality === 'Suspended' && selectedExtension}
                  {selectedBass && `/${selectedBass.split('/')[0]}`}
                </p>
                <p className="text-amber-400 mt-1">
                  {selectedQuality} {selectedExtension !== 'none' && `• ${selectedExtension}`}
                  {selectedBass && ` • Bass: ${selectedBass.split('/')[0]}`}
                </p>
              </div>
              <div className="mt-4">
                <label className="text-sm font-semibold text-gray-500">Chord Duration</label>
                <Select
                  value={String(selectedChordDuration)}
                  onValueChange={(value) => setSelectedChordDuration(Number.parseInt(value))}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 h-12 text-base mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1/4 bar (1 beat)</SelectItem>
                    <SelectItem value="2">1/2 bar (2 beats)</SelectItem>
                    <SelectItem value="3">3/4 bar (3 beats)</SelectItem>
                    <SelectItem value="4">1 bar (4 beats)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 flex gap-4 border-t border-amber-500/20">
              <Button
                onClick={() => setShowChordWheel(false)}
                variant="outline"
                className="flex-1 h-14 border-amber-500/50 hover:bg-amber-500/10 text-base font-semibold"
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmChordWheel} className="flex-1 h-14 bg-amber-500 hover:bg-amber-600 text-black text-base font-semibold">
                Confirm Chord
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-zinc-950/50">
              {/* Root Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Step 1: Select Root Note</h3>
                <div className="grid grid-cols-6 gap-2">
                  {ROOT_NOTES.map((root) => (
                    <Button
                      key={root}
                      onClick={() => setSelectedRoot(root)}
                      className={cn(
                        'font-bold h-16 text-base transition-all shadow-md',
                        selectedRoot === root
                          ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-black scale-105 ring-2 ring-amber-400'
                          : 'bg-zinc-800 text-white hover:bg-zinc-700',
                      )}
                    >
                      {root}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quality Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Step 2: Select Chord Quality</h3>
                <div className="grid grid-cols-3 gap-2">
                  {CHORD_QUALITIES.map((quality) => (
                    <Button
                      key={quality}
                      onClick={() => handleQualityChange(quality)}
                      className={cn(
                        'font-bold h-16 text-base transition-all shadow-md',
                        selectedQuality === quality
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-105 ring-2 ring-blue-400'
                          : 'bg-zinc-800 text-white hover:bg-zinc-700',
                      )}
                    >
                      {quality}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-3 text-center">
                  {selectedQuality === 'Major' && 'Major triads and extensions (6, maj7, 9, etc.)'}
                  {selectedQuality === 'Minor' && 'Minor triads and extensions (m6, m7, m9, etc.)'}
                  {selectedQuality === 'Dominant' &&
                    'Dominant 7th chords and alterations (7, 9, 13, etc.)'}
                  {selectedQuality === 'Diminished' && 'Diminished triads and 7th chords'}
                  {selectedQuality === 'Augmented' && 'Augmented triads and 7th chords'}
                  {selectedQuality === 'Suspended' && 'Suspended chords (sus2, sus4, 7sus4, etc.)'}
                </p>
              </div>

              {/* Extension Selection - Contextual based on quality */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Step 3: Select Extension/Alteration</h3>
                <div className="grid grid-cols-4 gap-2">
                  {availableExtensions.map((extension) => (
                    <Button
                      key={extension}
                      onClick={() => setSelectedExtension(extension)}
                      className={cn(
                        'font-bold h-16 text-sm transition-all shadow-md',
                        selectedExtension === extension
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white scale-105 ring-2 ring-purple-400'
                          : 'bg-zinc-800 text-white hover:bg-zinc-700',
                      )}
                    >
                      {extension === 'none' ? 'Basic' : extension}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Bass Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Step 4: Select Bass Note (Optional)</h3>
                <div className="grid grid-cols-6 gap-2">
                  {BASS_NOTES.map((bass) => (
                    <Button
                      key={bass}
                      onClick={() => setSelectedBass(selectedBass === bass ? null : bass)}
                      className={cn(
                        'font-bold h-14 text-sm transition-all shadow-md',
                        selectedBass === bass
                          ? 'bg-gradient-to-br from-green-500 to-green-600 text-white scale-105 ring-2 ring-green-400'
                          : 'bg-zinc-800 text-white hover:bg-zinc-700',
                      )}
                    >
                      {bass.split('/')[0]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Style Part Menu */}
      {showStylePartMenu && (
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center"
          onClick={() => setShowStylePartMenu(null)}
        >
          <div
            className="bg-zinc-900 rounded-2xl shadow-2xl w-[95%] max-w-xs flex flex-col border-2 border-amber-500/30 p-4 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-amber-400 text-center mb-2">SELECT STYLE PART</h2>
            {STYLE_PARTS.map((part) => (
              <Button
                key={part}
                onClick={() => {
                  handleUpdateSection(showStylePartMenu, { stylePart: part })
                  setShowStylePartMenu(null)
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm h-12 font-semibold shadow-md"
              >
                {part}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
