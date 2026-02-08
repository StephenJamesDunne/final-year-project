export const CARD_DIMENSIONS = {
  WIDTH: 100,
  HEIGHT: 140,
  BORDER_RADIUS: 8,
} as const;

// Element Colors - Themes of Irish Mythology represented visually
// Colors chosen to match most themes of the elements seen in Irish mythology and landscapes
export const COLORS = {
  ELEMENTS: {
    fire: 0xdc2626,       // Red-600
    water: 0x2563eb,      // Blue-600
    earth: 0x16a34a,      // Green-600
    air: 0x9333ea,        // Purple-600
    spirit: 0x4f46e5,     // Indigo-600
    neutral: 0x6b7280,    // Gray-500
  },
  BORDERS: {
    fire: 0xfbbf24,       // Amber-400
    water: 0x60a5fa,      // Blue-400
    earth: 0x4ade80,      // Green-400
    air: 0xc084fc,        // Purple-400
    spirit: 0x818cf8,     // Indigo-400
    neutral: 0x9ca3af,    // Gray-400
  },
  UI: {
    // Accent Colors
    gold: 0xd4af37,          // Classic gold - Legendary items
    lightGold: 0xfbbf24,     // Amber-400 - Highlights
    victory: 0xfbbf24,       // Amber-400 - Victory state

    // Backgrounds
    baseBG: 0x0a0e1a,        // Very dark blue - Main background
    darkBg: 0x1e293b,        // Slate-800 - Card text backgrounds
    deckBg: 0x2d1810,        // Dark brown - Deck/card back

    // Team Colors  
    blue: 0x3b82f6,          // Blue-500 - Player elements
    red: 0xef4444,           // Red-500 - Enemy elements
    green: 0x10b981,         // Emerald-500 - Positive actions
    greenHover: 0x059669,    // Emerald-600 - Button hover

    // Nature Theme (Irish countryside)
    forest: 0x2d5a2d,        // Dark forest green - Player zone
    forestGlow: 0x22c55e,    // Green-500 - Player highlights
    brown: 0x8b4513,         // Saddle brown - Earth tones

    // Neutral UI
    gray: 0x64748b,          // Slate-500 - Disabled state
    grayStroke: 0x475569,    // Slate-600 - Subtle borders
    white: 0xffffff,         // Pure white - Text
    black: 0x000000,         // Pure black - Shadows

    // Specific Elements
    logText: 0xe2e8f0,       // Slate-200 - Combat log readability
    placeholder: 0x333333,   // Dark gray - Missing images
    cardFill: 0xffffff,      // White - Mask fills

    // Tints (for sprite coloring)
    playerTint: 0x3b82f6,    // Blue tint - Player cards
    aiTint: 0xef4444,        // Red tint - AI cards
    aiTint2: 0xff6666,       // Lighter red - AI face target
  },
  BOARD: {
    background: 0x0f172a,    // Slate-900
  },
  TEAMS: {
    player: 0x1a472a,
    ai: 0x7f1d1d,
  },
} as const;

export const FONTS = {
  CARD_NAME: {
    fontSize: 10,
    fontWeight: 'bold',
    fill: 0xffffff,         // White for contrast
  },
  STATS: {
    fontSize: 16,
    fontWeight: 'bold',
    fill: 0xffffff,         
  },
  COMBAT_LOG: {
    fontSize: 14,
    fill: 0xe2e8f0,
  },
} as const;