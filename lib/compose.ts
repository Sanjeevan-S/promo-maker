import type { Template } from "./templates"
import { getContrastColor, addStrokeIfNeeded } from "./colors"

export interface CompositionData {
  background: string
  photos: string[]
  logo?: string
  themeColor: string
  copy: {
    headline: string
    subhead: string
    cta: string
  }
  template: Template
}

export type AspectRatio = "1:1" | "4:5" | "9:16"

const CANVAS_SIZES = {
  "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
  "9:16": { width: 1080, height: 1920 },
}

export async function composeToCanvas(
  canvas: HTMLCanvasElement,
  ratio: AspectRatio,
  data: CompositionData,
): Promise<void> {
  const ctx = canvas.getContext("2d")!
  const size = CANVAS_SIZES[ratio]
  const layout = data.template.layout[ratio]

  canvas.width = size.width
  canvas.height = size.height

  // Clear canvas
  ctx.clearRect(0, 0, size.width, size.height)

  // Draw background
  await drawBackground(ctx, data.background, size.width, size.height)

  // Add subtle noise overlay
  addNoiseOverlay(ctx, size.width, size.height)

  // Draw photo frames
  await drawPhotoFrames(ctx, data.photos, layout.frames, size.width, size.height, data.themeColor)

  // Draw logo
  if (data.logo) {
    await drawLogo(ctx, data.logo, layout.logoPos, size.width, size.height)
  }

  // Draw text
  await drawText(ctx, data.copy, layout.textZone, size.width, size.height, canvas, data.template)
}

async function drawBackground(
  ctx: CanvasRenderingContext2D,
  backgroundUrl: string,
  width: number,
  height: number,
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      // Draw as cover (maintain aspect ratio, fill canvas)
      const imgRatio = img.width / img.height
      const canvasRatio = width / height

      let drawWidth,
        drawHeight,
        offsetX = 0,
        offsetY = 0

      if (imgRatio > canvasRatio) {
        drawHeight = height
        drawWidth = height * imgRatio
        offsetX = (width - drawWidth) / 2
      } else {
        drawWidth = width
        drawHeight = width / imgRatio
        offsetY = (height - drawHeight) / 2
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
      resolve()
    }
    img.src = backgroundUrl
  })
}

function addNoiseOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  try {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 10
      data[i] = Math.max(0, Math.min(255, data[i] + noise))
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
    }

    ctx.putImageData(imageData, 0, 0)
  } catch (error) {
    // Canvas is tainted (cross-origin image), skip noise overlay
    console.warn("Canvas is tainted, skipping noise overlay:", error)
  }
}

async function drawPhotoFrames(
  ctx: CanvasRenderingContext2D,
  photos: string[],
  frameType: "single" | "double" | "triple",
  width: number,
  height: number,
  themeColor: string,
): Promise<void> {
  const frameCount = frameType === "single" ? 1 : frameType === "double" ? 2 : 3
  const photosToUse = photos.slice(0, frameCount)

  if (photosToUse.length === 0) return

  const margin = 40
  const gap = 20
  const radius = 24
  const shadowOffset = 8
  const shadowBlur = 16

  // Calculate frame dimensions and positions
  const frames = calculateFramePositions(frameCount, width, height, margin, gap)

  for (let i = 0; i < photosToUse.length && i < frames.length; i++) {
    const frame = frames[i]
    const photoUrl = photosToUse[i]

    // Draw shadow
    ctx.save()
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
    ctx.shadowBlur = shadowBlur
    ctx.shadowOffsetX = shadowOffset
    ctx.shadowOffsetY = shadowOffset

    // Draw frame background
    ctx.fillStyle = "#ffffff"
    drawRoundedRect(ctx, frame.x, frame.y, frame.width, frame.height, radius)
    ctx.fill()

    ctx.restore()

    // Draw photo
    await drawPhoto(ctx, photoUrl, frame.x + 8, frame.y + 8, frame.width - 16, frame.height - 16, radius - 4)
  }
}

function calculateFramePositions(count: number, width: number, height: number, margin: number, gap: number) {
  const frames = []
  const availableWidth = width - margin * 2
  const availableHeight = height - margin * 2

  if (count === 1) {
    const frameWidth = Math.min(availableWidth * 0.7, 400)
    const frameHeight = frameWidth * 0.8
    frames.push({
      x: (width - frameWidth) / 2,
      y: (height - frameHeight) / 2,
      width: frameWidth,
      height: frameHeight,
    })
  } else if (count === 2) {
    const frameWidth = (availableWidth - gap) / 2
    const frameHeight = frameWidth * 0.8
    const startY = (height - frameHeight) / 2

    frames.push(
      { x: margin, y: startY, width: frameWidth, height: frameHeight },
      { x: margin + frameWidth + gap, y: startY, width: frameWidth, height: frameHeight },
    )
  } else {
    // count === 3
    const frameWidth = (availableWidth - gap * 2) / 3
    const frameHeight = frameWidth * 0.8
    const startY = (height - frameHeight) / 2

    for (let i = 0; i < 3; i++) {
      frames.push({
        x: margin + i * (frameWidth + gap),
        y: startY,
        width: frameWidth,
        height: frameHeight,
      })
    }
  }

  return frames
}

async function drawPhoto(
  ctx: CanvasRenderingContext2D,
  photoUrl: string,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      ctx.save()

      // Create clipping path
      ctx.beginPath()
      drawRoundedRect(ctx, x, y, width, height, radius)
      ctx.clip()

      // Draw image (contain fit)
      const imgRatio = img.width / img.height
      const frameRatio = width / height

      let drawWidth,
        drawHeight,
        offsetX = 0,
        offsetY = 0

      if (imgRatio > frameRatio) {
        drawHeight = height
        drawWidth = height * imgRatio
        offsetX = (width - drawWidth) / 2
      } else {
        drawWidth = width
        drawHeight = width / imgRatio
        offsetY = (height - drawHeight) / 2
      }

      ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight)

      ctx.restore()
      resolve()
    }
    img.src = photoUrl
  })
}

async function drawLogo(
  ctx: CanvasRenderingContext2D,
  logoUrl: string,
  position: "tl" | "tr" | "bl" | "br",
  width: number,
  height: number,
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const maxSize = Math.min(width * 0.18, 120)
      const padding = 32

      // Calculate logo size (maintain aspect ratio)
      const logoRatio = img.width / img.height
      let logoWidth, logoHeight

      if (logoRatio > 1) {
        logoWidth = maxSize
        logoHeight = maxSize / logoRatio
      } else {
        logoHeight = maxSize
        logoWidth = maxSize * logoRatio
      }

      // Calculate position
      let x, y
      switch (position) {
        case "tl":
          x = padding
          y = padding
          break
        case "tr":
          x = width - logoWidth - padding
          y = padding
          break
        case "bl":
          x = padding
          y = height - logoHeight - padding
          break
        case "br":
          x = width - logoWidth - padding
          y = height - logoHeight - padding
          break
      }

      ctx.drawImage(img, x, y, logoWidth, logoHeight)
      resolve()
    }
    img.src = logoUrl
  })
}

async function drawText(
  ctx: CanvasRenderingContext2D,
  copy: { headline: string; subhead: string; cta: string },
  textZone: "top" | "middle" | "bottom",
  width: number,
  height: number,
  canvas: HTMLCanvasElement,
  template: Template,
): Promise<void> {
  const padding = 40
  const maxTextWidth = width - padding * 2

  // Calculate text area
  let textY, textHeight
  switch (textZone) {
    case "top":
      textY = padding
      textHeight = height * 0.3
      break
    case "middle":
      textY = height * 0.35
      textHeight = height * 0.3
      break
    case "bottom":
      textY = height * 0.7
      textHeight = height * 0.25
      break
  }

  // Sample background color for contrast
  const sampleArea = { x: padding, y: textY, width: maxTextWidth, height: textHeight }
  const textColor = getContrastColor("#000000", sampleArea, canvas)
  const textStyle = addStrokeIfNeeded(textColor, "#transparent")

  ctx.textAlign = "center"
  ctx.textBaseline = "top"

  // Draw headline
  const headlineSize = fitTextToWidth(ctx, copy.headline, maxTextWidth, 48, 24)
  ctx.font = `bold ${headlineSize}px ${template.typography.headlineFont}`
  ctx.fillStyle = textStyle.color

  if (textStyle.stroke) {
    ctx.strokeStyle = textStyle.stroke
    ctx.lineWidth = textStyle.strokeWidth || 2
    ctx.strokeText(copy.headline, width / 2, textY)
  }
  ctx.fillText(copy.headline, width / 2, textY)

  // Draw subhead
  const subheadY = textY + headlineSize + 16
  const subheadSize = Math.min(headlineSize * 0.6, 24)
  ctx.font = `${subheadSize}px ${template.typography.subheadFont}`

  if (textStyle.stroke) {
    ctx.strokeText(copy.subhead, width / 2, subheadY)
  }
  ctx.fillText(copy.subhead, width / 2, subheadY)

  // Draw CTA as pill
  const ctaY = subheadY + subheadSize + 24
  const ctaSize = Math.min(subheadSize * 0.9, 20)
  ctx.font = `bold ${ctaSize}px ${template.typography.ctaFont}`

  const ctaMetrics = ctx.measureText(copy.cta)
  const ctaWidth = ctaMetrics.width + 32
  const ctaHeight = ctaSize + 16
  const ctaX = (width - ctaWidth) / 2

  // Draw CTA background
  ctx.fillStyle = textColor === "#ffffff" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)"
  drawRoundedRect(ctx, ctaX, ctaY, ctaWidth, ctaHeight, ctaHeight / 2)
  ctx.fill()

  // Draw CTA text
  ctx.fillStyle = textColor === "#ffffff" ? "#000000" : "#ffffff"
  ctx.fillText(copy.cta, width / 2, ctaY + 8)
}

function fitTextToWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
): number {
  let size = maxSize

  while (size >= minSize) {
    ctx.font = `bold ${size}px sans-serif`
    const metrics = ctx.measureText(text)

    if (metrics.width <= maxWidth) {
      return size
    }

    size -= 2
  }

  return minSize
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}
