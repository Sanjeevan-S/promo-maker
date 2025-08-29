import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "Simple test route working!" })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ 
      success: true, 
      received: body,
      message: "POST request working!"
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
}
