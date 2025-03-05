import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type AnalysisResults = {
  layout: {
    score: number;
    feedback: string[];
  };
  lighting: {
    score: number;
    feedback: string[];
  };
  flow: {
    score: number;
    feedback: string[];
  };
}

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json()

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this floorplan and provide feedback in the following JSON format:\n{\n  \"layout\": {\n    \"score\": <number 0-100>,\n    \"feedback\": [\"detailed point 1\", \"detailed point 2\", ...]\n  },\n  \"lighting\": {\n    \"score\": <number 0-100>,\n    \"feedback\": [\"detailed point 1\", \"detailed point 2\", ...]\n  },\n  \"flow\": {\n    \"score\": <number 0-100>,\n    \"feedback\": [\"detailed point 1\", \"detailed point 2\", ...]\n  }\n}"
            },
            {
              type: "image_url",
              image_url: {
                "url": imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" }
    })

    const analysis: AnalysisResults = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
} 