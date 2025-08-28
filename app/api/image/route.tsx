import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { templateId, themeColor, ratio, textZone, seed = 0 } = await request.json()

    // Generate a mock background using canvas
    const canvas = document.createElement ? document.createElement("canvas") : null

    if (!canvas) {
      // Fallback for server-side - return a simple SVG
      const dimensions = {
        "1:1": { width: 1080, height: 1080 },
        "4:5": { width: 1080, height: 1350 },
        "9:16": { width: 1080, height: 1920 },
      }

      const { width, height } = dimensions[ratio as keyof typeof dimensions]

      // Create gradient based on template and theme color
      const gradients = {
        "clean-gradient": `linear-gradient(135deg, ${themeColor}20, ${themeColor}40)`,
        "bokeh-studio": `radial-gradient(circle at 30% 70%, ${themeColor}30, transparent 50%), radial-gradient(circle at 70% 30%, ${themeColor}20, transparent 50%)`,
        "coupon-slash": `linear-gradient(45deg, ${themeColor}40, ${themeColor}60, ${themeColor}40)`,
        "collage-grid": `linear-gradient(90deg, ${themeColor}20 0%, transparent 50%, ${themeColor}20 100%)`,
        "concrete-texture": `linear-gradient(180deg, #f0f0f0, #e0e0e0)`,
        "night-neon": `radial-gradient(circle at center, ${themeColor}60, #000000)`,
      }

      const gradient = gradients[templateId as keyof typeof gradients] || gradients["clean-gradient"]

      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>
              .bg { background: ${gradient}; }
            </style>
          </defs>
          <rect width="100%" height="100%" style="background: ${gradient}"/>
          <filter id="noise">
            <feTurbulence baseFrequency="0.9" numOctaves="1" result="noise"/>
            <feColorMatrix in="noise" type="saturate" values="0"/>
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0.1"/>
            </feComponentTransfer>
            <feComposite operator="over" in2="SourceGraphic"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" opacity="0.1"/>
        </svg>
      `

      const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`

      return NextResponse.json({
        backgroundDataUrl: dataUrl,
      })
    }

    // Client-side canvas generation would go here
    return NextResponse.json({
      backgroundDataUrl:
        "data:image/svg+xml;base64," +
        btoa(`
        <svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${themeColor}40;stop-opacity:1" />
              <stop offset="100%" style="stop-color:${themeColor}20;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)"/>
        </svg>
      `),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate background" }, { status: 500 })
  }
}
