"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MessageSquare, Maximize, Minimize, Volume2, VolumeX } from "lucide-react"
import ChatInterface from "@/components/chat-interface"
import Link from "next/link"

// Define the type at the top level
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

export default function AnalysisPage() {
  const searchParams = useSearchParams()
  const imageUrl = searchParams.get("image") || "/placeholder.svg"
  const analysisParam = searchParams.get("analysis")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null)

  // Add type guard for the analysis results
  const isValidAnalysis = (analysis: any): analysis is AnalysisResults => {
    return (
      analysis &&
      typeof analysis.layout?.score === 'number' &&
      Array.isArray(analysis.layout?.feedback) &&
      typeof analysis.lighting?.score === 'number' &&
      Array.isArray(analysis.lighting?.feedback) &&
      typeof analysis.flow?.score === 'number' &&
      Array.isArray(analysis.flow?.feedback)
    )
  }

  useEffect(() => {
    if (analysisParam) {
      try {
        console.log("analysisParam", analysisParam);
        const parsedAnalysis = JSON.parse(decodeURIComponent(analysisParam))
        console.log("parsedAnalysis", parsedAnalysis);
        if (isValidAnalysis(parsedAnalysis)) {
          setAnalysisResults(parsedAnalysis)
        } else {
          console.error('Invalid analysis format')
        }
      } catch (error) {
        console.error('Failed to parse analysis results:', error)
        // Could add error state handling here
      }
    }
  }, [analysisParam])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled)

    if (!isVoiceEnabled && analysisResults) {
      const summary = `I've analyzed your floorplan and found several opportunities for improvement. 
        The layout scores ${analysisResults.layout.score} out of 100, ${analysisResults.layout.feedback[0]}. 
        Natural lighting scores ${analysisResults.lighting.score} out of 100, ${analysisResults.lighting.feedback[0]}. 
        Traffic flow scores ${analysisResults.flow.score} out of 100, ${analysisResults.flow.feedback[0]}.`

      const utterance = new SpeechSynthesisUtterance(summary)
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    } else {
      window.speechSynthesis.cancel()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back</span>
          </Link>
          <h1 className="ml-4 text-xl font-bold tracking-tight">Floorplan Analysis</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleVoice}
              className={isVoiceEnabled ? "text-primary" : ""}
            >
              {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className={`grid gap-6 ${isFullscreen ? "" : "lg:grid-cols-5"}`}>
          <div className={`${isFullscreen ? "hidden" : "lg:col-span-3"}`}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Floorplan</CardTitle>
                <CardDescription>Uploaded floorplan with analysis highlights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border">
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt="Uploaded floorplan"
                    fill
                    className="object-contain"
                  />
                  {/* Analysis overlay markers would go here in a real implementation */}
                  {analysisResults && (
                    <>
                      {/* Example of how we might highlight areas - in a real app these would be positioned based on AI analysis */}
                      <div className="absolute left-[30%] top-[40%] h-16 w-16 rounded-full border-2 border-yellow-500 bg-yellow-500/20 animate-pulse" />
                      <div className="absolute left-[60%] top-[30%] h-12 w-12 rounded-full border-2 border-green-500 bg-green-500/20 animate-pulse" />
                      <div className="absolute left-[45%] top-[60%] h-14 w-14 rounded-full border-2 border-blue-500 bg-blue-500/20 animate-pulse" />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {analysisResults ? (
              <Tabs defaultValue="layout" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="layout">Layout Efficiency</TabsTrigger>
                  <TabsTrigger value="lighting">Natural Lighting</TabsTrigger>
                  <TabsTrigger value="flow">Traffic Flow</TabsTrigger>
                </TabsList>
                <TabsContent value="layout" className="mt-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle>Layout Analysis</CardTitle>
                        <Badge
                          variant={
                            analysisResults?.layout?.score >= 80
                              ? "default"
                              : analysisResults?.layout?.score >= 60
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          Score: {analysisResults.layout.score}/100
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                          <span>{analysisResults.layout.feedback[0]}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="lighting" className="mt-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle>Lighting Analysis</CardTitle>
                        <Badge
                          variant={
                            analysisResults.lighting?.score >= 80
                              ? "default"
                              : analysisResults.lighting?.score >= 60
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          Score: {analysisResults.lighting?.score}/100
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                          <span>{analysisResults.lighting?.feedback[0]}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="flow" className="mt-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle>Traffic Flow Analysis</CardTitle>
                        <Badge
                          variant={
                            analysisResults.flow?.score >= 80
                              ? "default"
                              : analysisResults.flow?.score >= 60
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          Score: {analysisResults.flow?.score}/100
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                          <span>{analysisResults.flow?.feedback[0]}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <div>Analyzing floorplan...</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className={`${isFullscreen ? "w-full" : "lg:col-span-2"}`}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Virtual Architect
                  </CardTitle>
                  <CardDescription>Ask questions about your floorplan</CardDescription>
                </div>
                {isFullscreen && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleVoice}
                      className={isVoiceEnabled ? "text-primary" : ""}
                    >
                      {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                      <Minimize className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                {analysisResults && (
                  <ChatInterface analysisResults={analysisResults} isVoiceEnabled={isVoiceEnabled} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

