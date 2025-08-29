import { type NextRequest, NextResponse } from "next/server"
import { createCenterHoleMask, calculateAspectRatioDimensions } from "@/lib/mask"

export async function POST(request: NextRequest) {
  try {
    const { 
      userDescription = "bold, energetic burger deal",
      templateStyle = "modern, minimal, geometric",
      aspectRatio = "1:1",
      themeColor = "#C62828",
      hasLogo = true,
      hasPhotos = true
    } = await request.json()

    // Test mask generation
    const dimensions = calculateAspectRatioDimensions(aspectRatio)
    const maskBuffer = createCenterHoleMask({
      width: dimensions.width,
      height: dimensions.height,
      centerHolePercent: 68,
      borderRadiusPercent: 8
    })

    // Convert to base64 for testing
    const base64Mask = maskBuffer.toString('base64')
    const dataUrl = `data:image/png;base64,${base64Mask}`

    return NextResponse.json({ 
      success: true,
      maskDataUrl: dataUrl,
      dimensions,
      testData: {
        userDescription,
        templateStyle,
        aspectRatio,
        themeColor,
        hasLogo,
        hasPhotos
      }
    })
  } catch (error) {
    console.error("Error testing mask:", error)
    return NextResponse.json({ error: "Failed to test mask" }, { status: 500 })
  }
}
