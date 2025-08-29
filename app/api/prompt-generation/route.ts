import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { 
      userDescription, 
      templateStyle, 
      aspectRatio, 
      themeColor, 
      hasLogo, 
      hasPhotos 
    } = await request.json()

    if (!userDescription || !templateStyle || !aspectRatio) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const systemPrompt = `You are a professional marketing copywriter and visual designer. Your task is to create a detailed, specific prompt for an AI image generation tool (DALL-E 3) that will create a promotional image.

The prompt should:
1. Incorporate the user's description and business context
2. Follow the specified template style and design aesthetic
3. Be optimized for the given aspect ratio
4. Include the theme color in the design
5. Account for whether there will be a logo and photos overlaid
6. Create a cohesive, professional promotional image
7. Be specific enough for consistent AI generation
8. Focus on the background and overall composition

Return only the image generation prompt, nothing else.`

    const userPrompt = `Create a promotional image prompt with these specifications:

User Description: ${userDescription}
Template Style: ${templateStyle}
Aspect Ratio: ${aspectRatio}
Theme Color: ${themeColor}
Logo Present: ${hasLogo ? 'Yes' : 'No'}
Photos Present: ${hasPhotos ? 'Yes' : 'No'}

Generate a detailed, specific prompt for DALL-E 3 that will create a professional promotional image incorporating all these elements.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const generatedPrompt = completion.choices[0]?.message?.content

    if (!generatedPrompt) {
      throw new Error("Failed to generate prompt")
    }

    return NextResponse.json({ prompt: generatedPrompt })
  } catch (error) {
    console.error("Error generating prompt:", error)
    return NextResponse.json({ error: "Failed to generate prompt" }, { status: 500 })
  }
}
