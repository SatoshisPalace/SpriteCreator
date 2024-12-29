interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export const GREY_SHADES = [
  { r: 64, g: 64, b: 64 },    // Dark grey
  { r: 108, g: 108, b: 108 }, // Darkish grey
  { r: 144, g: 144, b: 144 }, // Medium grey
  { r: 176, g: 176, b: 176 }, // Light grey
  { r: 200, g: 200, b: 200 }, // Lightest grey
];

// Convert hex color to RGB
export function hexToRgb(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error('Invalid hex color');
  
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

// Calculate shades of a color based on grey level
export function calculateColorShade(baseColor: RGBColor, greyLevel: number): RGBColor {
  const factor = greyLevel / 255;
  return {
    r: Math.round(baseColor.r * factor),
    g: Math.round(baseColor.g * factor),
    b: Math.round(baseColor.b * factor)
  };
}

// Check if a color matches one of our grey shades (with some tolerance)
export function matchesGreyShade(color: RGBColor): number {
  const tolerance = 1; // Allow 1 unit of difference to account for image compression

  for (let i = 0; i < GREY_SHADES.length; i++) {
    const shade = GREY_SHADES[i];
    if (
      Math.abs(color.r - shade.r) <= tolerance &&
      Math.abs(color.g - shade.g) <= tolerance &&
      Math.abs(color.b - shade.b) <= tolerance
    ) {
      return i;
    }
  }
  return -1;
}

// Get the brightness level for a grey shade index
export function getGreyLevel(shadeIndex: number): number {
  if (shadeIndex < 0 || shadeIndex >= GREY_SHADES.length) return 255;
  return GREY_SHADES[shadeIndex].r; // Since R=G=B for grey, we can use any channel
}
