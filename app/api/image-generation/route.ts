import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    })

    // Fetch the generated image and convert to base64
    const imageUrl = image.data[0].url
    console.log("Generated image URL:", imageUrl)
    
    const imageResponse = await fetch(imageUrl)
    
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch generated image")
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mimeType = imageResponse.headers.get('content-type') || 'image/png'
    const dataUrl = `data:${mimeType};base64,${base64Image}`
    
    console.log("Converted to data URL:", {
      mimeType,
      base64Length: base64Image.length,
      dataUrlPrefix: dataUrl.substring(0, 100)
    })

    return NextResponse.json({ imageUrl: dataUrl })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
