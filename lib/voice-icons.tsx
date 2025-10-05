import { Music, Piano, Guitar, Drum, Mic2, Radio, Waves, Zap, Volume2, Bell, Wind, Sparkles } from "lucide-react"

export function getVoiceIcon(subcategory: string, category?: string) {
  const sub = subcategory?.toLowerCase() || ""
  const cat = category?.toLowerCase() || ""

  // Piano & Keyboard instruments
  if (sub.includes("piano") || sub.includes("epiano") || sub.includes("e.piano")) return Piano
  if (sub.includes("harpsichord") || sub.includes("clavi")) return Piano

  // Organ
  if (sub.includes("organ") || sub.includes("jazz organ") || sub.includes("rock organ")) return Radio

  // Guitar family
  if (sub.includes("guitar") && !sub.includes("bass")) return Guitar
  if (sub.includes("nylon") || sub.includes("steel") || sub.includes("12-string")) return Guitar
  if (sub.includes("clean") || sub.includes("muted") || sub.includes("overdrive") || sub.includes("distortion"))
    return Guitar
  if (sub.includes("banjo") || sub.includes("mandolin") || sub.includes("ukulele")) return Guitar

  // Bass instruments
  if (sub.includes("bass")) return Volume2
  if (sub.includes("fingered") || sub.includes("picked") || sub.includes("fretless") || sub.includes("slap"))
    return Volume2

  // Strings & Orchestra
  if (sub.includes("violin") || sub.includes("viola") || sub.includes("cello") || sub.includes("contrabass"))
    return Music
  if (sub.includes("string") || sub.includes("tremolo") || sub.includes("pizzicato")) return Music
  if (sub.includes("harp") || sub.includes("lyre")) return Sparkles
  if (sub.includes("orchestral") || sub.includes("orchestra") || sub.includes("ensemble")) return Music

  // Brass instruments
  if (sub.includes("trumpet") || sub.includes("cornet")) return Volume2
  if (sub.includes("trombone") || sub.includes("tuba") || sub.includes("euphonium")) return Volume2
  if (sub.includes("horn") || sub.includes("french horn")) return Volume2
  if (sub.includes("brass")) return Volume2

  // Woodwind & Reed instruments
  if (sub.includes("saxophone") || sub.includes("sax")) return Wind
  if (sub.includes("soprano") || sub.includes("alto") || sub.includes("tenor") || sub.includes("baritone")) {
    if (cat.includes("reed") || cat.includes("sax")) return Wind
  }
  if (sub.includes("flute") || sub.includes("piccolo") || sub.includes("recorder")) return Wind
  if (sub.includes("oboe") || sub.includes("english horn") || sub.includes("bassoon")) return Wind
  if (sub.includes("clarinet") || sub.includes("pan flute") || sub.includes("whistle")) return Wind
  if (sub.includes("woodwind") || sub.includes("ocarina")) return Wind

  // Chromatic Percussion
  if (sub.includes("vibraphone") || sub.includes("marimba") || sub.includes("xylophone") || sub.includes("mallet"))
    return Bell
  if (sub.includes("bell") || sub.includes("glockenspiel") || sub.includes("celesta")) return Bell

  // Choir & Voice
  if (sub.includes("choir") || sub.includes("voice") || sub.includes("vocal")) return Mic2
  if (sub.includes("aahs") || sub.includes("oohs") || sub.includes("doo")) return Mic2

  // Synth sounds
  if (sub.includes("synth") || sub.includes("lead") || sub.includes("pad")) return Zap
  if (sub.includes("square") || sub.includes("saw") || sub.includes("calliope")) return Zap
  if (sub.includes("warm") || sub.includes("polysynth") || sub.includes("bowed")) return Zap
  if (sub.includes("metallic") || sub.includes("halo") || sub.includes("sweep")) return Waves

  // Accordion & Harmonica
  if (sub.includes("accordion") || sub.includes("harmonica")) return Radio

  // Ethnic & World instruments
  if (sub.includes("sitar") || sub.includes("shamisen") || sub.includes("koto")) return Sparkles
  if (sub.includes("kalimba") || sub.includes("bagpipe") || sub.includes("fiddle")) return Sparkles
  if (sub.includes("shanai") || sub.includes("ethnic") || sub.includes("world")) return Sparkles

  // Percussion & Drums
  if (sub.includes("drum") || sub.includes("kit") || sub.includes("standard")) return Drum
  if (sub.includes("room") || sub.includes("power") || sub.includes("electronic")) return Drum
  if (sub.includes("brush") || sub.includes("timpani") || sub.includes("taiko")) return Drum
  if (sub.includes("percussion") || sub.includes("tom") || sub.includes("cymbal")) return Drum
  if (sub.includes("agogo") || sub.includes("steel drum") || sub.includes("woodblock")) return Drum

  // Category-based fallbacks
  if (cat.includes("piano")) return Piano
  if (cat.includes("organ")) return Radio
  if (cat.includes("guitar")) return Guitar
  if (cat.includes("bass")) return Volume2
  if (cat.includes("string")) return Music
  if (cat.includes("brass")) return Volume2
  if (cat.includes("reed") || cat.includes("woodwind")) return Wind
  if (cat.includes("pipe")) return Wind
  if (cat.includes("synth")) return Zap
  if (cat.includes("ethnic")) return Sparkles
  if (cat.includes("percussion") || cat.includes("drum")) return Drum
  if (cat.includes("choir") || cat.includes("voice")) return Mic2
  if (cat.includes("chromatic")) return Bell

  // Final fallback
  return Music
}
