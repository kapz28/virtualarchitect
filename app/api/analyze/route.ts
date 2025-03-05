import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json()

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this floorplan and provide detailed feedback on: 1) Layout efficiency (score out of 100 and specific feedback) 2) Natural lighting assessment (score and feedback) 3) Traffic flow analysis (score and feedback). Format the response as JSON."
            },
            {
              type: "image_url",
              image_url: imageUrl
            }
          ]
        }
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" }
    })

    const analysis = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
} 