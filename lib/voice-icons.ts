export function getVoiceIconPath(subcategory: string): string {
  // Return the path to the icon file in public/icons/
  // The filename should match the subcategory name exactly
  return `/icons/${subcategory}.svg`
}

export function getVoiceIconAlt(subcategory: string): string {
  return `${subcategory} icon`
}
