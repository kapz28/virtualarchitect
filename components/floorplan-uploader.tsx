"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

export default function FloorplanUploader() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(droppedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)

    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append('file', file)

      // Upload the file to your server
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const { imageUrl } = await uploadResponse.json()

      // Get AI analysis of the image
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed')
      }

      const analysisResults = await analysisResponse.json()

      // Redirect to analysis page with both image and analysis results
      router.push(`/analysis?image=${encodeURIComponent(imageUrl)}&analysis=${encodeURIComponent(JSON.stringify(analysisResults))}`)
    } catch (error) {
      console.error("Upload/analysis failed:", error)
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setUploadProgress(0)
  }

  return (
    <div className="w-full">
      {!file ? (
        <div
          className={`flex flex-col items-center justify-center rounded-lg border-2 ${
            dragOver ? "border-primary bg-primary/5" : "border-dashed border-slate-300 dark:border-slate-700"
          } p-12 text-center`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mb-4 rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Upload your floorplan</h3>
          <p className="mb-4 text-sm text-muted-foreground">Drag and drop your file here or click to browse</p>
          <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
            Select File
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
          />
          <p className="mt-2 text-xs text-muted-foreground">Supported formats: JPG, PNG, PDF (max 10MB)</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg border bg-card p-2">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur"
              onClick={clearFile}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="relative aspect-video overflow-hidden rounded">
              {preview && (
                <Image src={preview || "/placeholder.svg"} alt="Floorplan preview" fill className="object-contain" />
              )}
            </div>
            <div className="mt-2 flex items-center justify-between px-1">
              <span className="text-sm font-medium truncate max-w-[250px]">{file.name}</span>
              <span className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
          </div>

          {uploading ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2 w-full" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uploading...</span>
                <span className="text-sm font-medium">{uploadProgress}%</span>
              </div>
            </div>
          ) : (
            <Button className="w-full" onClick={handleUpload}>
              Analyze Floorplan
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

