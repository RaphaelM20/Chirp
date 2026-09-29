// Stable hue (0–359) derived from a string, for avatar fallbacks and covers.
export function hueFor(text = "") {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
}
