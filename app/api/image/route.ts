import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { templates } from "@/lib/templates"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { templateId, themeColor, ratio, textZone, seed } = await request.json()

    if (!templateId || !themeColor || !ratio || !textZone) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const template = templates.find((t) => t.id === templateId)

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Construct the DALL-E prompt
    const prompt = `Generate a promotional image background for a product. \n
Style: ${template.imagePrompt}.\n
Main Color: ${themeColor}.\n
Aspect Ratio: ${ratio}.\n
Tone: ${template.tone}.\n
Consider the text will be placed in the ${textZone} area of the image, so keep that area relatively clear or complementary to text. The overall aesthetic should be modern, clean, and visually appealing.`

    // Generate image using DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3", // or "dall-e-2" if preferred
      prompt: prompt,
      n: 1,
      size: "1024x1024", // DALL-E 3 supports 1024x1024, 1024x1792, 1792x1024
      response_format: "b64_json",
      // seed: seed, // DALL-E 3 does not support seed directly through this API
    })

    const base64Image = response.data[0].b64_json

    return NextResponse.json({ backgroundDataUrl: `data:image/png;base64,${base64Image}` })
  } catch (error) {
    console.error('DALL-E image generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic' // Ensure this is a dynamic route for API handling
