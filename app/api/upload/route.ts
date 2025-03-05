import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    // Upload to Vercel Blob Storage (or your preferred storage solution)
    const blob = await put(file.name, file, {
      access: 'public',
    })

    return NextResponse.json({ imageUrl: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
} 