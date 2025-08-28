import tinycolor from "tinycolor2"

export function getContrastColor(
  backgroundColor: string,
  sampleArea?: { x: number; y: number; width: number; height: number },
  canvas?: HTMLCanvasElement,
): string {
  let bgColor = backgroundColor

  // If we have canvas and sample area, get average color from that region
  if (canvas && sampleArea) {
    const ctx = canvas.getContext("2d")
    if (ctx) {
      try {
        const imageData = ctx.getImageData(sampleArea.x, sampleArea.y, sampleArea.width, sampleArea.height)
        const data = imageData.data
        let r = 0,
          g = 0,
          b = 0
        const pixelCount = data.length / 4

        for (let i = 0; i < data.length; i += 4) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
        }

        r = Math.round(r / pixelCount)
        g = Math.round(g / pixelCount)
        b = Math.round(b / pixelCount)

        bgColor = `rgb(${r}, ${g}, ${b})`
      } catch (e) {
        // Fallback to provided background color
      }
    }
  }

  const color = tinycolor(bgColor)
  const contrast = tinycolor.readability(color, "#ffffff")

  return contrast > 4.5 ? "#ffffff" : "#000000"
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
