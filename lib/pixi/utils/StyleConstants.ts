export const CARD_DIMENSIONS = {
  WIDTH: 100,
  HEIGHT: 140,
  BORDER_RADIUS: 8,
} as const;

export const COLORS = {
  ELEMENTS: {
    fire: 0xdc2626,
    water: 0x2563eb,
    earth: 0x16a34a,
    air: 0x9333ea,
    spirit: 0x4f46e5,
    neutral: 0x6b7280,
  },
  BORDERS: {
    fire: 0xfbbf24,
    water: 0x60a5fa,
    earth: 0x4ade80,
    air: 0xc084fc,
    spirit: 0x818cf8,
    neutral: 0x9ca3af,
  },
  UI: {
    gold: 0xd4af37,
    darkBg: 0x1e293b,
    lightGold: 0xfbbf24,
    green: 0x10b981,       
    greenHover: 0x059669,  
    blue: 0x3b82f6,         
    red: 0xef4444,          
    brown: 0x8b4513,        
    deckBg: 0x2d1810,       
    gray: 0x64748b,   
    grayStroke: 0x475569,   
    victory: 0xfbbf24,      
    logText: 0xe2e8f0,      
    playerTint: 0x3b82f6,   
    aiTint: 0xef4444,
    white: 0xffffff,
    black: 0x000000,
    placeholder: 0x333333,
    forest: 0x2d5a2d,
    forestGlow: 0x22c55e,
    baseBG: 0x0a0e1a,
    cardFill: 0xffffff,
    aiTint2: 0xff6666
  },
  BOARD: {
  background: 0x0f172a,
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
    fill: 0xffffff,
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