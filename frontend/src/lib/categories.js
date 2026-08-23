// Category color system tokens & metadata
export const CATEGORY_COLORS = {
  Comedy: {
    name: "Comedy",
    hex: "#E8A23D", // Amber
    bgTint: "rgba(232, 162, 61, 0.15)",
    text: "#B47118",
    border: "rgba(232, 162, 61, 0.3)",
    glow: "rgba(232, 162, 61, 0.4)",
  },
  Theatre: {
    name: "Theatre",
    hex: "#8B5FBF", // Violet
    bgTint: "rgba(139, 95, 191, 0.15)",
    text: "#6B3FA0",
    border: "rgba(139, 95, 191, 0.3)",
    glow: "rgba(139, 95, 191, 0.4)",
  },
  Music: {
    name: "Music",
    hex: "#D9527A", // Rose
    bgTint: "rgba(217, 82, 122, 0.15)",
    text: "#B8305A",
    border: "rgba(217, 82, 122, 0.3)",
    glow: "rgba(217, 82, 122, 0.4)",
  },
  Literature: {
    name: "Literature",
    hex: "#3D8B7A", // Teal-green
    bgTint: "rgba(61, 139, 122, 0.15)",
    text: "#2A6E60",
    border: "rgba(61, 139, 122, 0.3)",
    glow: "rgba(61, 139, 122, 0.4)",
  },
  "Visual Art": {
    name: "Visual Art",
    hex: "#C4622D", // Burnt orange — hero brand accent
    bgTint: "rgba(196, 98, 45, 0.15)",
    text: "#A34919",
    border: "rgba(196, 98, 45, 0.3)",
    glow: "rgba(196, 98, 45, 0.4)",
  },
};

export const DEFAULT_CATEGORY_STYLE = {
  name: "Event",
  hex: "#C4622D",
  bgTint: "rgba(196, 98, 45, 0.15)",
  text: "#A34919",
  border: "rgba(196, 98, 45, 0.3)",
  glow: "rgba(196, 98, 45, 0.4)",
};

export function getCategoryStyle(category) {
  if (!category) return DEFAULT_CATEGORY_STYLE;

  // Normalized matching for variants like "Art" or "Theater"
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  if (category === "Art") return CATEGORY_COLORS["Visual Art"];
  if (category === "Theater") return CATEGORY_COLORS["Theatre"];
  if (category === "Film") return CATEGORY_COLORS["Theatre"];

  return DEFAULT_CATEGORY_STYLE;
}
