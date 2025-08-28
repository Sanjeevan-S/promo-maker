import tinycolor from "tinycolor2"

export const PRIMARY_COLOR = '#F14A52';

export const PRIMARY_COLOR_VARIANTS = {
  base: PRIMARY_COLOR,
  hover: 'rgba(241, 74, 82, 0.05)',  // 5% opacity for hover states
  outline: 'rgba(241, 74, 82, 0.2)', // 20% opacity for outlines
  disabled: 'rgba(241, 74, 82, 0.4)', // 40% opacity for disabled states
  accent: 'rgba(241, 74, 82, 0.1)',   // 10% opacity for subtle accents
};

export function getPrimaryColorVariant(variant: keyof typeof PRIMARY_COLOR_VARIANTS = 'base'): string {
  return PRIMARY_COLOR_VARIANTS[variant];
}

export function createColorVariants(color: string): Record<string, string> {
  return {
    base: color,
    hover: adjustColorOpacity(color, 0.05),
    outline: adjustColorOpacity(color, 0.2),
    disabled: adjustColorOpacity(color, 0.4),
    accent: adjustColorOpacity(color, 0.1),
  };
}

export function adjustColorOpacity(color: string, opacity: number): string {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function getContrastColor(backgroundColor: string): string {
  const color = tinycolor(backgroundColor);
  return color.isDark() ? '#FFFFFF' : '#000000';
}

export function addStrokeIfNeeded(
  textColor: string,
  backgroundColor: string,
): { color: string; stroke?: string; strokeWidth?: number } {
  const contrast = tinycolor.readability(textColor, backgroundColor)

  if (contrast < 3) {
    const strokeColor = textColor === "#ffffff" ? "#000000" : "#ffffff"
    return {
      color: textColor,
      stroke: strokeColor,
      strokeWidth: 2,
    }
  }

  return { color: textColor }
}

export function lighten(color: string, amount = 0.1): string {
  return tinycolor(color)
    .lighten(amount * 100)
    .toString()
}

export function darken(color: string, amount = 0.1): string {
  return tinycolor(color)
    .darken(amount * 100)
    .toString()
}
