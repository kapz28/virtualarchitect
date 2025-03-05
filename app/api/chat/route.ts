import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { message, analysisContext } = await request.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Virtual Architect, an AI assistant specialized in analyzing floorplans and providing architectural advice. 
          You have analyzed a floorplan with the following results:
          
          ${analysisContext}
          
          Respond to the user's questions about their floorplan based on this analysis. Be helpful, specific, and provide actionable recommendations. 
          If asked about something not covered in the analysis, you can make reasonable assumptions based on common architectural principles, 
          but make it clear when you're making an assumption versus referring to the specific analysis.
          Keep responses concise and focused on architectural insights.`
        },
        { role: "user", content: message }
      ]
    })

    return NextResponse.json({
      content: completion.choices[0].message.content || "I apologize, I couldn't generate a response."
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
} 