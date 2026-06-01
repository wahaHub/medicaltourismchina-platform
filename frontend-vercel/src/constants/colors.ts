export const COLORS = {
  PRIMARY_GREEN: 'rgb(82, 175, 152)',
  // Add other colors here as needed
} as const;

// Type for color keys
export type ColorKey = keyof typeof COLORS; 