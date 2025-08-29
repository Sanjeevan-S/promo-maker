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

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const systemPrompt = `You are an expert at creating concise, effective prompts for DALL-E 2 to transform images into professional promotional posters.

CRITICAL RULES:
- Create prompts that will transform existing images into professional posters
- Focus on creating cohesive, visually stunning promotional designs
- Use specific design terminology that DALL-E 2 understands
- Emphasize high-quality, poster-worthy results
- Keep prompts concise and under 500 characters
- Make the image look like it was professionally designed, not just edited

Return only the image transformation prompt, no explanations.`

    const userPrompt = `Create a concise prompt to transform this image into a professional promotional poster.

User Description: ${userDescription}
Template Style: ${templateStyle}
Aspect Ratio: ${aspectRatio}
Theme Color: ${themeColor}

REQUIREMENTS:
- Integrate user description: "${userDescription}"
- Apply professional design aesthetic
- Use ${themeColor} as primary accent color
- Create professional poster for ${aspectRatio} format
- Ensure result looks like premium marketing poster
- Make text appear professionally integrated, not overlaid
- Keep prompt concise and under 500 characters

Generate a concise, specific prompt that will create an exceptional poster-quality result.`

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

    console.log(`Generated prompt for ${aspectRatio}:`, generatedPrompt.substring(0, 100) + '...')

    return NextResponse.json({ prompt: generatedPrompt })
  } catch (error) {
    console.error("Error generating prompt:", error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json({ error: "Invalid or missing OpenAI API key" }, { status: 401 })
      }
      if (error.message.includes("rate limit")) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
      }
    }
    
    return NextResponse.json({ error: "Failed to generate prompt. Please check your OpenAI API key and try again." }, { status: 500 })
  }
}
