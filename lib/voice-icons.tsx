import Icon from "@mdi/react"
import {
  mdiPiano,
  mdiGuitarAcoustic,
  mdiGuitarElectric,
  mdiMicrophone,
  mdiSaxophone,
  mdiViolin,
  mdiTrumpet,
  mdiMusic,
  mdiMusicNote,
} from "@mdi/js"

// Helper component to wrap MDI icons with consistent sizing
export function VoiceIconWrapper({ path, className = "" }: { path: string; className?: string }) {
  return <Icon path={path} size={1} className={className} />
}

export function getVoiceIcon(subcategory: string, category?: string) {
  const sub = subcategory?.toLowerCase() || ""
  const cat = category?.toLowerCase() || ""

  // Piano & Keyboard instruments
  if (sub.includes("piano") || sub.includes("epiano") || sub.includes("e.piano")) return mdiPiano
  if (sub.includes("harpsichord") || sub.includes("clavi")) return mdiPiano

  // Organ
  if (sub.includes("organ") || sub.includes("jazz organ") || sub.includes("rock organ")) return mdiPiano

  // Guitar family
  if (sub.includes("guitar") && !sub.includes("bass")) {
    if (sub.includes("electric") || sub.includes("overdrive") || sub.includes("distortion")) return mdiGuitarElectric
    return mdiGuitarAcoustic
  }
  if (sub.includes("nylon") || sub.includes("steel") || sub.includes("12-string")) return mdiGuitarAcoustic
  if (sub.includes("clean") || sub.includes("muted")) return mdiGuitarElectric
  if (sub.includes("banjo") || sub.includes("mandolin") || sub.includes("ukulele")) return mdiGuitarAcoustic

  // Bass instruments
  if (sub.includes("bass")) return mdiGuitarElectric
  if (sub.includes("fingered") || sub.includes("picked") || sub.includes("fretless") || sub.includes("slap"))
    return mdiGuitarElectric

  // Strings & Orchestra
  if (sub.includes("violin") || sub.includes("viola") || sub.includes("cello") || sub.includes("contrabass"))
    return mdiViolin
  if (sub.includes("string") || sub.includes("tremolo") || sub.includes("pizzicato")) return mdiViolin
  if (sub.includes("harp") || sub.includes("lyre")) return mdiViolin
  if (sub.includes("orchestral") || sub.includes("orchestra") || sub.includes("ensemble")) return mdiViolin

  // Brass instruments
  if (sub.includes("trumpet") || sub.includes("cornet")) return mdiTrumpet
  if (sub.includes("trombone") || sub.includes("tuba") || sub.includes("euphonium")) return mdiTrumpet
  if (sub.includes("horn") || sub.includes("french horn")) return mdiTrumpet
  if (sub.includes("brass")) return mdiTrumpet

  // Woodwind & Reed instruments
  if (sub.includes("saxophone") || sub.includes("sax")) return mdiSaxophone
  if (sub.includes("soprano") || sub.includes("alto") || sub.includes("tenor") || sub.includes("baritone")) {
    if (cat.includes("reed") || cat.includes("sax")) return mdiSaxophone
  }
  if (sub.includes("flute") || sub.includes("piccolo") || sub.includes("recorder")) return mdiSaxophone
  if (sub.includes("oboe") || sub.includes("english horn") || sub.includes("bassoon")) return mdiSaxophone
  if (sub.includes("clarinet") || sub.includes("pan flute") || sub.includes("whistle")) return mdiSaxophone
  if (sub.includes("woodwind") || sub.includes("ocarina")) return mdiSaxophone

  // Chromatic Percussion
  if (sub.includes("vibraphone") || sub.includes("marimba") || sub.includes("xylophone") || sub.includes("mallet"))
    return mdiMusicNote
  if (sub.includes("bell") || sub.includes("glockenspiel") || sub.includes("celesta")) return mdiMusicNote

  // Choir & Voice
  if (sub.includes("choir") || sub.includes("voice") || sub.includes("vocal")) return mdiMicrophone
  if (sub.includes("aahs") || sub.includes("oohs") || sub.includes("doo")) return mdiMicrophone

  // Synth sounds
  if (sub.includes("synth") || sub.includes("lead") || sub.includes("pad")) return mdiMusicNote
  if (sub.includes("square") || sub.includes("saw") || sub.includes("calliope")) return mdiMusicNote
  if (sub.includes("warm") || sub.includes("polysynth") || sub.includes("bowed")) return mdiMusicNote
  if (sub.includes("metallic") || sub.includes("halo") || sub.includes("sweep")) return mdiMusicNote

  // Accordion & Harmonica
  if (sub.includes("accordion")) return mdiPiano
  if (sub.includes("harmonica")) return mdiSaxophone

  // Ethnic & World instruments
  if (sub.includes("sitar") || sub.includes("shamisen") || sub.includes("koto")) return mdiGuitarAcoustic
  if (sub.includes("kalimba") || sub.includes("bagpipe") || sub.includes("fiddle")) return mdiViolin
  if (sub.includes("shanai") || sub.includes("ethnic") || sub.includes("world")) return mdiSaxophone

  // Percussion & Drums
  if (sub.includes("drum") || sub.includes("kit") || sub.includes("standard")) return mdiMusicNote
  if (sub.includes("room") || sub.includes("power") || sub.includes("electronic")) return mdiMusicNote
  if (sub.includes("brush") || sub.includes("timpani") || sub.includes("taiko")) return mdiMusicNote
  if (sub.includes("percussion") || sub.includes("tom") || sub.includes("cymbal")) return mdiMusicNote
  if (sub.includes("agogo") || sub.includes("steel drum") || sub.includes("woodblock")) return mdiMusicNote

  // Category-based fallbacks
  if (cat.includes("piano")) return mdiPiano
  if (cat.includes("organ")) return mdiPiano
  if (cat.includes("guitar")) return mdiGuitarAcoustic
  if (cat.includes("bass")) return mdiGuitarElectric
  if (cat.includes("string")) return mdiViolin
  if (cat.includes("brass")) return mdiTrumpet
  if (cat.includes("reed") || cat.includes("woodwind")) return mdiSaxophone
  if (cat.includes("pipe")) return mdiSaxophone
  if (cat.includes("synth")) return mdiMusicNote
  if (cat.includes("ethnic")) return mdiGuitarAcoustic
  if (cat.includes("percussion") || cat.includes("drum")) return mdiMusicNote
  if (cat.includes("choir") || cat.includes("voice")) return mdiMicrophone
  if (cat.includes("chromatic")) return mdiMusicNote

  // Final fallback
  return mdiMusic
}

export function getSubCategoryColor(subcategory: string, category?: string): string {
  const sub = subcategory?.toLowerCase() || ""
  const cat = category?.toLowerCase() || ""

  // Piano & Keyboard - Blue shades
  if (sub.includes("piano") || sub.includes("epiano")) return "text-blue-400"
  if (sub.includes("harpsichord") || sub.includes("clavi")) return "text-sky-400"

  // Organ - Red/Orange shades
  if (sub.includes("jazz organ")) return "text-red-400"
  if (sub.includes("rock organ")) return "text-orange-500"
  if (sub.includes("organ")) return "text-red-500"

  // Guitar - Amber/Yellow shades
  if (sub.includes("nylon") || sub.includes("steel")) return "text-amber-400"
  if (sub.includes("electric") || sub.includes("overdrive")) return "text-yellow-500"
  if (sub.includes("clean") || sub.includes("muted")) return "text-yellow-400"

  // Bass - Green shades
  if (sub.includes("fingered") || sub.includes("picked")) return "text-green-400"
  if (sub.includes("fretless") || sub.includes("slap")) return "text-emerald-500"
  if (sub.includes("bass")) return "text-green-500"

  // Strings - Emerald/Teal shades
  if (sub.includes("violin") || sub.includes("viola")) return "text-emerald-400"
  if (sub.includes("cello") || sub.includes("contrabass")) return "text-teal-400"
  if (sub.includes("string") || sub.includes("ensemble")) return "text-teal-500"

  // Brass - Cyan shades
  if (sub.includes("trumpet") || sub.includes("cornet")) return "text-cyan-400"
  if (sub.includes("trombone") || sub.includes("tuba")) return "text-cyan-500"
  if (sub.includes("horn") || sub.includes("brass")) return "text-sky-500"

  // Woodwind - Indigo/Purple shades
  if (sub.includes("saxophone") || sub.includes("sax")) return "text-indigo-400"
  if (sub.includes("flute") || sub.includes("piccolo")) return "text-purple-400"
  if (sub.includes("clarinet") || sub.includes("oboe")) return "text-violet-400"

  // Choir & Voice - Pink shades
  if (sub.includes("choir") || sub.includes("voice")) return "text-pink-400"
  if (sub.includes("aahs") || sub.includes("oohs")) return "text-rose-400"

  // Synth - Fuchsia/Magenta shades
  if (sub.includes("lead")) return "text-fuchsia-400"
  if (sub.includes("pad")) return "text-purple-500"
  if (sub.includes("synth")) return "text-violet-500"

  // Percussion - Orange/Lime shades
  if (sub.includes("drum") || sub.includes("kit")) return "text-orange-400"
  if (sub.includes("percussion")) return "text-lime-400"

  // Chromatic - Yellow shades
  if (sub.includes("vibraphone") || sub.includes("marimba")) return "text-yellow-400"
  if (sub.includes("bell") || sub.includes("glockenspiel")) return "text-amber-500"

  // Ethnic - Rose/Pink shades
  if (sub.includes("sitar") || sub.includes("ethnic")) return "text-rose-500"

  // Category-based fallbacks
  if (cat.includes("piano")) return "text-blue-400"
  if (cat.includes("organ")) return "text-red-400"
  if (cat.includes("guitar")) return "text-amber-400"
  if (cat.includes("bass")) return "text-green-400"
  if (cat.includes("string")) return "text-emerald-400"
  if (cat.includes("brass")) return "text-cyan-400"
  if (cat.includes("reed") || cat.includes("woodwind")) return "text-indigo-400"
  if (cat.includes("synth")) return "text-fuchsia-400"
  if (cat.includes("choir")) return "text-pink-400"
  if (cat.includes("percussion")) return "text-orange-400"

  return "text-amber-400"
}
