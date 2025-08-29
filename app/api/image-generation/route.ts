import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import sharp from "sharp"
import { createEnhancedPrompt } from "@/lib/prompt-enhancer"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function to convert image to RGBA format (required by DALL-E 2)
async function convertToRGBA(base64Data: string): Promise<Buffer> {
  try {
    // Remove data URL prefix
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '')
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, 'base64')
    
    // Use sharp to convert to RGBA PNG format
    const convertedBuffer = await sharp(imageBuffer)
      .png()
      .ensureAlpha() // Ensures RGBA format with alpha channel
      .toBuffer()
    
    return convertedBuffer
  } catch (error) {
    console.error("Sharp conversion failed:", error)
    throw new Error("Failed to convert image format")
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = "1:1", userImage, promptStyle = "professional-poster", themeColor = "#F14A52", userDescription = "", hasLogo = false, hasPhotos = false } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!userImage) {
      return NextResponse.json({ error: "User image is required" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    console.log(`Editing image for ${aspectRatio} with prompt:`, prompt.substring(0, 100) + '...')

    // Convert base64 data URL to buffer and check size
    const base64Data = userImage.replace(/^data:image\/[a-z]+;base64,/, '')
    let imageBuffer = Buffer.from(base64Data, 'base64')
    
    // Check file size (DALL-E 2 has 4MB limit)
    const fileSizeMB = imageBuffer.length / (1024 * 1024)
    console.log(`Original image size: ${fileSizeMB.toFixed(2)}MB`)
    
    if (fileSizeMB > 4) {
      return NextResponse.json({ 
        error: `Image too large (${fileSizeMB.toFixed(2)}MB). Please use an image smaller than 4MB.` 
      }, { status: 400 })
    }

          // Convert image to RGBA format (required by DALL-E 2)
      try {
        console.log("Converting image to RGBA format...")
        const convertedBuffer = await convertToRGBA(userImage)
        imageBuffer = Buffer.from(convertedBuffer)
        const convertedSizeMB = imageBuffer.length / (1024 * 1024)
        console.log(`Converted image size: ${convertedSizeMB.toFixed(2)}MB`)
        
        if (convertedSizeMB > 4) {
          return NextResponse.json({ 
            error: `Converted image too large (${convertedSizeMB.toFixed(2)}MB). Please use a smaller image.` 
          }, { status: 400 })
        }
      } catch (conversionError) {
        console.error("Image conversion failed:", conversionError)
        return NextResponse.json({ 
          error: "Failed to convert image format. Please ensure your image is a valid PNG." 
        }, { status: 400 })
      }

    // Create a file object from the converted buffer
    const imageFile = new File([imageBuffer], 'user-image.png', { type: 'image/png' })

    // Use the advanced prompt enhancement system
    let enhancedPrompt = createEnhancedPrompt({
      basePrompt: prompt,
      promptStyle,
      themeColor,
      aspectRatio,
      userDescription,
      hasLogo,
      hasPhotos
    })

    // Ensure prompt doesn't exceed DALL-E 2's 1000 character limit
    if (enhancedPrompt.length > 1000) {
      console.log(`Prompt too long (${enhancedPrompt.length} chars), truncating to 1000...`)
      enhancedPrompt = enhancedPrompt.substring(0, 997) + "..."
      console.log(`Truncated prompt length: ${enhancedPrompt.length} chars`)
    }

    console.log(`Final prompt length: ${enhancedPrompt.length} chars`)

    // Use DALL-E 2 edit endpoint (more reliable than gpt-image-1 for now)
    console.log("Attempting to edit with DALL-E 2...")
    const image = await openai.images.edit({
      model: "dall-e-2",
      image: imageFile,
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024", // DALL-E 2 only supports square
      response_format: "b64_json",
    })

    if (!image.data || image.data.length === 0) {
      throw new Error("No images generated")
    }

    const generatedImage = image.data[0]
    if (!generatedImage.b64_json) {
      throw new Error("No valid image data in generated image")
    }

    console.log(`Successfully edited image with DALL-E 2 for ${aspectRatio}`)

    // Return base64 data URL
    const dataUrl = `data:image/png;base64,${generatedImage.b64_json}`

    return NextResponse.json({ imageUrl: dataUrl })

  } catch (error) {
    console.error("Error editing image:", error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json({ error: "Invalid or missing OpenAI API key" }, { status: 401 })
      }
      if (error.message.includes("rate limit")) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
      }
      if (error.message.includes("content policy")) {
        return NextResponse.json({ error: "Content policy violation. Please modify your description." }, { status: 400 })
      }
      if (error.message.includes("file size")) {
        return NextResponse.json({ error: "Image file too large. Please use a smaller image." }, { status: 400 })
      }
      if (error.message.includes("Invalid input image")) {
        return NextResponse.json({ error: "Image format issue. Please ensure your image is a valid PNG with transparency support." }, { status: 400 })
      }
    }
    
    return NextResponse.json({ 
      error: `Failed to edit image: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your OpenAI API key and try again.` 
    }, { status: 500 })
  }
}
