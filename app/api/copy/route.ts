import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userDescription, templateId, tone } = await request.json()

    // Mock copy generation based on inputs
    const headlines = {
      friendly: ["Discover Something Amazing", "Your Perfect Match Awaits", "Made Just for You"],
      bold: ["Unleash Your Potential", "Break All Boundaries", "Dominate Your Space"],
      minimal: ["Simply Perfect", "Pure Excellence", "Effortless Quality"],
      festive: ["Celebrate in Style", "Party Like Never Before", "Make Every Moment Count"],
    }

    const subheads = {
      friendly: [
        "Experience the difference that quality makes",
        "Join thousands of happy customers",
        "Your satisfaction is our priority",
      ],
      bold: [
        "Revolutionary design meets unmatched performance",
        "Push limits. Exceed expectations.",
        "Where innovation meets excellence",
      ],
      minimal: ["Clean design. Maximum impact.", "Less noise. More focus.", "Simplicity at its finest"],
      festive: [
        "Limited time offer - don't miss out!",
        "Special celebration pricing inside",
        "Join the party - exclusive deals await",
      ],
    }

    const ctas = {
      friendly: ["Get Started Today", "Join Us Now", "Learn More"],
      bold: ["Take Action", "Claim Yours", "Get It Now"],
      minimal: ["Shop Now", "Discover", "Explore"],
      festive: ["Celebrate Now", "Join the Fun", "Get Yours"],
    }

    // Select based on description hash for consistency
    const hash = userDescription.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)

    const index = Math.abs(hash) % 3

    return NextResponse.json({
      headline: headlines[tone as keyof typeof headlines][index],
      subhead: subheads[tone as keyof typeof subheads][index],
      cta: ctas[tone as keyof typeof ctas][index],
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate copy" }, { status: 500 })
  }
}
