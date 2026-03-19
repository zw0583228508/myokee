export const BG_STYLES = [
  { id: "aurora",         label: "זוהר צפוני",   emoji: "🌌", colors: ["#1a0040", "#0033cc", "#6600cc"] },
  { id: "neon_pulse",     label: "ניאון",         emoji: "💜", colors: ["#330044", "#ff00ff", "#0ff"] },
  { id: "fire_storm",     label: "סערת אש",      emoji: "🔥", colors: ["#1a0500", "#ff4400", "#ff8800"] },
  { id: "ocean_deep",     label: "אוקיינוס",     emoji: "🌊", colors: ["#001020", "#0066cc", "#00ccff"] },
  { id: "galaxy",         label: "גלקסיה",       emoji: "✨", colors: ["#0a0020", "#6633ff", "#cc66ff"] },
  { id: "sunset_vibes",   label: "שקיעה",        emoji: "🌅", colors: ["#200810", "#ff3366", "#ff9966"] },
  { id: "matrix_rain",    label: "מטריקס",       emoji: "💚", colors: ["#001a00", "#00ff00", "#66ff66"] },
  { id: "electric_storm", label: "סערת ברקים",   emoji: "⚡", colors: ["#080820", "#4488ff", "#88ccff"] },
  { id: "golden_luxury",  label: "זהב יוקרתי",   emoji: "👑", colors: ["#1a0f00", "#ffcc00", "#ffe066"] },
  { id: "cherry_blossom", label: "פריחת דובדבן", emoji: "🌸", colors: ["#200810", "#ff88aa", "#ffccdd"] },
  { id: "cyber_punk",     label: "סייבר-פאנק",   emoji: "🤖", colors: ["#100030", "#ff0066", "#cc33ff"] },
] as const;

export type BgStyleId = typeof BG_STYLES[number]["id"];
