"use client"

import {
  Music,
  Piano,
  Guitar,
  Drum,
  Mic2,
  Radio,
  Wind,
  Sparkles,
  Volume2,
  Bell,
  Waves,
  Zap,
  Music2,
  Music3,
  Music4,
} from "lucide-react"

interface VoiceIconProps {
  subcategory: string
  category?: string
  className?: string
  size?: number
}

function getInstrumentIcon(subcategory: string, category?: string) {
  const sub = subcategory?.toLowerCase() || ""
  const cat = category?.toLowerCase() || ""

  // Piano & Keyboard instruments
  if (sub.includes("grand") && sub.includes("piano")) return { icon: Piano, color: "text-blue-400" }
  if (sub.includes("upright") || (sub.includes("piano") && !sub.includes("electric")))
    return { icon: Piano, color: "text-blue-400" }
  if (sub.includes("epiano") || sub.includes("e.piano") || sub.includes("electric piano"))
    return { icon: Piano, color: "text-purple-400" }
  if (sub.includes("harpsichord")) return { icon: Music2, color: "text-amber-400" }
  if (sub.includes("clavi")) return { icon: Music2, color: "text-yellow-400" }

  // Organ
  if (sub.includes("pipe") && sub.includes("organ")) return { icon: Radio, color: "text-orange-400" }
  if (sub.includes("jazz") && sub.includes("organ")) return { icon: Radio, color: "text-orange-500" }
  if (sub.includes("rock") && sub.includes("organ")) return { icon: Radio, color: "text-red-400" }
  if (sub.includes("organ")) return { icon: Radio, color: "text-orange-400" }

  // Guitar family
  if (sub.includes("nylon") || sub.includes("classical")) return { icon: Guitar, color: "text-amber-500" }
  if (sub.includes("steel") || sub.includes("folk")) return { icon: Guitar, color: "text-yellow-600" }
  if (sub.includes("12-string")) return { icon: Guitar, color: "text-yellow-500" }
  if (sub.includes("jazz") && sub.includes("guitar")) return { icon: Guitar, color: "text-orange-600" }
  if (sub.includes("clean") || (sub.includes("electric") && sub.includes("guitar")))
    return { icon: Guitar, color: "text-red-500" }
  if (sub.includes("muted") || sub.includes("overdrive")) return { icon: Guitar, color: "text-red-600" }
  if (sub.includes("distortion")) return { icon: Guitar, color: "text-red-700" }
  if (sub.includes("guitar") && !sub.includes("bass")) return { icon: Guitar, color: "text-amber-500" }

  // Bass instruments
  if (sub.includes("acoustic") && sub.includes("bass")) return { icon: Volume2, color: "text-indigo-400" }
  if (sub.includes("fingered") || sub.includes("electric bass")) return { icon: Volume2, color: "text-indigo-500" }
  if (sub.includes("picked")) return { icon: Volume2, color: "text-indigo-600" }
  if (sub.includes("fretless")) return { icon: Volume2, color: "text-blue-500" }
  if (sub.includes("slap")) return { icon: Volume2, color: "text-purple-500" }
  if (sub.includes("bass")) return { icon: Volume2, color: "text-indigo-500" }

  // Strings & Orchestra
  if (sub.includes("violin")) return { icon: Music3, color: "text-rose-400" }
  if (sub.includes("viola")) return { icon: Music3, color: "text-rose-500" }
  if (sub.includes("cello")) return { icon: Music3, color: "text-rose-600" }
  if (sub.includes("contrabass") || sub.includes("double bass")) return { icon: Music3, color: "text-rose-700" }
  if (sub.includes("harp")) return { icon: Sparkles, color: "text-cyan-400" }
  if (sub.includes("pizzicato")) return { icon: Music3, color: "text-pink-400" }
  if (sub.includes("string") || sub.includes("ensemble")) return { icon: Music3, color: "text-rose-500" }
  if (sub.includes("orchestral") || sub.includes("orchestra")) return { icon: Music4, color: "text-purple-400" }

  // Brass instruments
  if (sub.includes("trumpet")) return { icon: Wind, color: "text-yellow-500" }
  if (sub.includes("trombone")) return { icon: Wind, color: "text-yellow-600" }
  if (sub.includes("tuba")) return { icon: Wind, color: "text-yellow-700" }
  if (sub.includes("french horn") || sub.includes("horn")) return { icon: Wind, color: "text-amber-500" }
  if (sub.includes("brass")) return { icon: Wind, color: "text-yellow-500" }

  // Woodwind & Reed instruments
  if (sub.includes("soprano") && sub.includes("sax")) return { icon: Wind, color: "text-teal-400" }
  if (sub.includes("alto") && sub.includes("sax")) return { icon: Wind, color: "text-teal-500" }
  if (sub.includes("tenor") && sub.includes("sax")) return { icon: Wind, color: "text-teal-600" }
  if (sub.includes("baritone") && sub.includes("sax")) return { icon: Wind, color: "text-teal-700" }
  if (sub.includes("saxophone") || sub.includes("sax")) return { icon: Wind, color: "text-teal-500" }
  if (sub.includes("flute")) return { icon: Wind, color: "text-sky-400" }
  if (sub.includes("piccolo")) return { icon: Wind, color: "text-sky-300" }
  if (sub.includes("clarinet")) return { icon: Wind, color: "text-cyan-500" }
  if (sub.includes("oboe")) return { icon: Wind, color: "text-cyan-600" }
  if (sub.includes("bassoon")) return { icon: Wind, color: "text-cyan-700" }
  if (sub.includes("pan flute")) return { icon: Wind, color: "text-emerald-400" }
  if (sub.includes("recorder")) return { icon: Wind, color: "text-sky-500" }
  if (sub.includes("ocarina")) return { icon: Wind, color: "text-emerald-500" }

  // Chromatic Percussion
  if (sub.includes("vibraphone")) return { icon: Bell, color: "text-lime-400" }
  if (sub.includes("marimba")) return { icon: Bell, color: "text-lime-500" }
  if (sub.includes("xylophone")) return { icon: Bell, color: "text-lime-600" }
  if (sub.includes("glockenspiel")) return { icon: Bell, color: "text-yellow-300" }
  if (sub.includes("tubular") || sub.includes("bell")) return { icon: Bell, color: "text-amber-400" }
  if (sub.includes("celesta")) return { icon: Bell, color: "text-blue-300" }

  // Choir & Voice
  if (sub.includes("choir")) return { icon: Mic2, color: "text-pink-400" }
  if (sub.includes("voice") || sub.includes("vocal")) return { icon: Mic2, color: "text-pink-500" }
  if (sub.includes("aahs") || sub.includes("oohs")) return { icon: Mic2, color: "text-pink-400" }

  // Synth sounds
  if (sub.includes("synth lead")) return { icon: Zap, color: "text-violet-400" }
  if (sub.includes("synth pad")) return { icon: Waves, color: "text-violet-500" }
  if (sub.includes("synth")) return { icon: Zap, color: "text-violet-400" }
  if (sub.includes("square") || sub.includes("saw")) return { icon: Zap, color: "text-fuchsia-400" }
  if (sub.includes("warm") || sub.includes("polysynth")) return { icon: Waves, color: "text-purple-400" }

  // Accordion & Harmonica
  if (sub.includes("accordion")) return { icon: Radio, color: "text-red-400" }
  if (sub.includes("harmonica")) return { icon: Wind, color: "text-blue-400" }
  if (sub.includes("bandoneon")) return { icon: Radio, color: "text-red-500" }

  // Ethnic & World instruments
  if (sub.includes("sitar")) return { icon: Sparkles, color: "text-orange-400" }
  if (sub.includes("shamisen")) return { icon: Sparkles, color: "text-red-400" }
  if (sub.includes("koto")) return { icon: Sparkles, color: "text-amber-400" }
  if (sub.includes("kalimba")) return { icon: Sparkles, color: "text-green-400" }
  if (sub.includes("bagpipe")) return { icon: Sparkles, color: "text-emerald-500" }
  if (sub.includes("banjo")) return { icon: Guitar, color: "text-orange-500" }
  if (sub.includes("mandolin")) return { icon: Guitar, color: "text-amber-600" }
  if (sub.includes("ukulele")) return { icon: Guitar, color: "text-yellow-400" }
  if (sub.includes("dulcimer")) return { icon: Sparkles, color: "text-teal-400" }

  // Percussion & Drums
  if (sub.includes("standard") && sub.includes("kit")) return { icon: Drum, color: "text-slate-400" }
  if (sub.includes("room") && sub.includes("kit")) return { icon: Drum, color: "text-slate-500" }
  if (sub.includes("electronic") && sub.includes("kit")) return { icon: Drum, color: "text-purple-500" }
  if (sub.includes("timpani")) return { icon: Drum, color: "text-orange-600" }
  if (sub.includes("taiko")) return { icon: Drum, color: "text-red-600" }
  if (sub.includes("conga")) return { icon: Drum, color: "text-amber-600" }
  if (sub.includes("bongo")) return { icon: Drum, color: "text-yellow-600" }
  if (sub.includes("steel drum")) return { icon: Drum, color: "text-cyan-500" }
  if (sub.includes("drum")) return { icon: Drum, color: "text-slate-400" }

  // Category-based fallbacks
  if (cat.includes("piano")) return { icon: Piano, color: "text-blue-400" }
  if (cat.includes("organ")) return { icon: Radio, color: "text-orange-400" }
  if (cat.includes("guitar")) return { icon: Guitar, color: "text-amber-500" }
  if (cat.includes("bass")) return { icon: Volume2, color: "text-indigo-500" }
  if (cat.includes("string")) return { icon: Music3, color: "text-rose-500" }
  if (cat.includes("brass")) return { icon: Wind, color: "text-yellow-500" }
  if (cat.includes("reed") || cat.includes("woodwind")) return { icon: Wind, color: "text-teal-500" }
  if (cat.includes("pipe")) return { icon: Wind, color: "text-sky-400" }
  if (cat.includes("synth")) return { icon: Zap, color: "text-violet-400" }
  if (cat.includes("ethnic")) return { icon: Sparkles, color: "text-orange-400" }
  if (cat.includes("percussion") || cat.includes("drum")) return { icon: Drum, color: "text-slate-400" }
  if (cat.includes("choir") || cat.includes("voice")) return { icon: Mic2, color: "text-pink-400" }
  if (cat.includes("chromatic")) return { icon: Bell, color: "text-lime-400" }

  // Final fallback
  return { icon: Music, color: "text-gray-400" }
}

export function VoiceIcon({ subcategory, category, className = "", size = 24 }: VoiceIconProps) {
  const { icon: Icon, color } = getInstrumentIcon(subcategory, category)

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Icon className={`${color} drop-shadow-lg`} size={size} strokeWidth={2} />
    </div>
  )
}
