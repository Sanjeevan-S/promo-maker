import { createCanvas } from 'canvas'

export interface MaskOptions {
  width: number
  height: number
  centerHolePercent?: number // Percentage of shortest dimension for center hole
  borderRadiusPercent?: number // Percentage of shortest dimension for border radius
}

export function createCenterHoleMask(options: MaskOptions): Buffer {
  const { width, height, centerHolePercent = 68, borderRadiusPercent = 8 } = options
  
  // Create canvas
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  
  // Fill entire canvas with white (opaque)
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)
  
  // Calculate center hole dimensions
  const shortestDimension = Math.min(width, height)
  const holeSize = (shortestDimension * centerHolePercent) / 100
  const borderRadius = (shortestDimension * borderRadiusPercent) / 100
  
  // Calculate center position
  const centerX = width / 2
  const centerY = height / 2
  const holeHalfSize = holeSize / 2
  
  // Set composite operation to punch out the center
  ctx.globalCompositeOperation = 'destination-out'
  
  // Create rounded rectangle path for the hole
  ctx.beginPath()
  ctx.roundRect(
    centerX - holeHalfSize,
    centerY - holeHalfSize,
    holeSize,
    holeSize,
    borderRadius
  )
  ctx.fill()
  
  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over'
  
  // Return PNG buffer
  return canvas.toBuffer('image/png')
}

export function calculateAspectRatioDimensions(aspectRatio: string): { width: number; height: number } {
  const [width, height] = aspectRatio.split(':').map(Number)
  
  // Base size is 1024, scale proportionally
  const baseSize = 1024
  const maxDimension = Math.max(width, height)
  
  if (width >= height) {
    return {
      width: baseSize,
      height: Math.round((height / maxDimension) * baseSize)
    }
  } else {
    return {
      width: Math.round((width / maxDimension) * baseSize),
      height: baseSize
    }
  }
}
