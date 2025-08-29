import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { userDescription, templateId, tone } = await request.json()

    if (!userDescription || !templateId || !tone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    console.log(`Generating copy for template: ${templateId}, tone: ${tone}, description: ${userDescription}`)

    const systemPrompt = `You are an expert copywriter specializing in promotional content. Create compelling, relevant copy based on the user's description.

Rules:
- Make the copy directly relevant to the user's description
- Use the specified tone (friendly, bold, minimal, or festive)
- Create a compelling headline, subhead, and call-to-action
- Keep it concise and impactful
- Ensure the copy relates to what the user is actually promoting

Return only a JSON object with: headline, subhead, cta`

    const userPrompt = `Create promotional copy for:

User Description: ${userDescription}
Template Style: ${templateId}
Tone: ${tone}

Requirements:
- Headline: Attention-grabbing, relevant to the description
- Subhead: Supporting text that explains the value proposition
- CTA: Clear call-to-action that matches the tone

Make sure the copy is specifically about what the user described, not generic promotional text.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const generatedContent = completion.choices[0]?.message?.content

    if (!generatedContent) {
      throw new Error("Failed to generate copy")
    }

    // Try to parse JSON response, fallback to structured generation if needed
    let copy;
    try {
      copy = JSON.parse(generatedContent);
    } catch (parseError) {
      console.warn("Failed to parse JSON response, using fallback generation");
      
      // Fallback: Generate structured copy based on description
      const fallbackHeadlines = {
        friendly: [`Amazing ${userDescription}`, `Discover ${userDescription}`, `Your Perfect ${userDescription}`],
        bold: [`Unleash ${userDescription}`, `Revolutionary ${userDescription}`, `Epic ${userDescription}`],
        minimal: [`Pure ${userDescription}`, `Simple ${userDescription}`, `Essential ${userDescription}`],
        festive: [`Celebrate ${userDescription}`, `Party ${userDescription}`, `Exciting ${userDescription}`],
      };
      
      const fallbackSubheads = {
        friendly: [`Experience the magic of ${userDescription}`, `Join thousands enjoying ${userDescription}`, `${userDescription} made just for you`],
        bold: [`Revolutionary ${userDescription} that changes everything`, `Push the limits with ${userDescription}`, `Where ${userDescription} meets excellence`],
        minimal: [`Clean ${userDescription}. Maximum impact.`, `Less noise. More ${userDescription}.`, `${userDescription} at its finest`],
        festive: [`Limited time ${userDescription} offer`, `Special ${userDescription} celebration`, `Join the ${userDescription} party`],
      };
      
      const fallbackCTAs = {
        friendly: ["Get Started", "Learn More", "Discover Now"],
        bold: ["Take Action", "Claim Yours", "Get It Now"],
        minimal: ["Shop Now", "Explore", "Discover"],
        festive: ["Celebrate Now", "Join the Fun", "Get Yours"],
      };
      
      const index = Math.abs(userDescription.length) % 3;
      
      copy = {
        headline: fallbackHeadlines[tone as keyof typeof fallbackHeadlines][index],
        subhead: fallbackSubheads[tone as keyof typeof fallbackSubheads][index],
        cta: fallbackCTAs[tone as keyof typeof fallbackCTAs][index],
      };
    }

    // Validate the copy structure
    if (!copy.headline || !copy.subhead || !copy.cta) {
      throw new Error("Generated copy is missing required fields");
    }

    console.log(`Generated copy:`, copy);

    return NextResponse.json(copy)
  } catch (error) {
    console.error("Error generating copy:", error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json({ error: "Invalid or missing OpenAI API key" }, { status: 401 })
      }
      if (error.message.includes("rate limit")) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
      }
    }
    
    return NextResponse.json({ error: "Failed to generate copy. Please check your OpenAI API key and try again." }, { status: 500 })
  }
}
