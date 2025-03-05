"use client"

import type React from "react"

// Add type declaration for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Mic, MicOff, User } from "lucide-react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import OpenAI from "openai"

type Message = {
  role: "user" | "assistant"
  content: string
}

type AnalysisResults = {
  layout: { score: number; feedback: string[] }
  lighting: { score: number; feedback: string[] }
  flow: { score: number; feedback: string[] }
} | null

export default function ChatInterface({
  analysisResults,
  isVoiceEnabled,
}: {
  analysisResults: AnalysisResults
  isVoiceEnabled: boolean
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  // Initialize speech recognition
  // useEffect(() => {
  //   if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
  //     const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
  //     const recognitionInstance = new SpeechRecognition()

  //     recognitionInstance.continuous = true
  //     recognitionInstance.interimResults = true

  //     recognitionInstance.onresult = (event) => {
  //       const transcript = Array.from(event.results)
  //         .map((result) => result[0])
  //         .map((result) => result.transcript)
  //         .join("")

  //       setInput(transcript)
  //     }

  //     recognitionInstance.onend = () => {
  //       setIsRecording(false)
  //     }

  //     setRecognition(recognitionInstance)
  //   }
  // }, [])

  // Add initial welcome message
  useEffect(() => {
    if (analysisResults) {
      const welcomeMessage = {
        role: "assistant" as const,
        content:
          "Hello! I'm your Virtual Architect. I've analyzed your floorplan and found several opportunities for improvement. Feel free to ask me specific questions about the layout, lighting, or traffic flow!",
      }
      setMessages([welcomeMessage])
    }
  }, [analysisResults])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Speak assistant messages when voice is enabled
  useEffect(() => {
    if (isVoiceEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant") {
        const utterance = new SpeechSynthesisUtterance(lastMessage.content)
        utterance.rate = 0.9
        utterance.pitch = 1
        window.speechSynthesis.speak(utterance)
      }
    }
  }, [messages, isVoiceEnabled])

  // const toggleRecording = () => {
  //   if (!recognition) return

  //   if (isRecording) {
  //     recognition.stop()
  //     setIsRecording(false)
  //   } else {
  //     setInput("")
  //     recognition.start()
  //     setIsRecording(true)
  //   }
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading || !analysisResults) return

    const userMessage: Message = {
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const analysisContext = `
        Layout Efficiency Score: ${analysisResults.layout.score}/100
        Layout Feedback: ${analysisResults.layout.feedback.join(". ")}
        
        Natural Lighting Score: ${analysisResults.lighting.score}/100
        Lighting Feedback: ${analysisResults.lighting.feedback.join(". ")}
        
        Traffic Flow Score: ${analysisResults.flow.score}/100
        Traffic Flow Feedback: ${analysisResults.flow.feedback.join(". ")}
      `

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          analysisContext,
        }),
      })

      const data = await response.json()
      console.log("response data:", data)

      if (!response.ok) {
        throw new Error('Failed to generate response')
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
      }

      setMessages((prev) => {
        const newMessages = [...prev, assistantMessage];
        console.log("Updated messages:", newMessages);
        return newMessages;
      })
    } catch (error) {
      console.error("Error generating response:", error)

      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I encountered an error while analyzing your question. Please try again.",
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[600px] flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex max-w-[80%] items-start gap-3 rounded-lg p-3 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="mt-0.5 h-8 w-8 border">
                    <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                      A
                    </div>
                  </Avatar>
                )}
                <div className="text-sm">
                  {message.content.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-1" : ""}>
                      {line}
                    </p>
                  ))}
                </div>
                {message.role === "user" && (
                  <Avatar className="mt-0.5 h-8 w-8 border">
                    <div className="flex h-full w-full items-center justify-center bg-background text-foreground">
                      <User className="h-4 w-4" />
                    </div>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] items-start gap-3 rounded-lg bg-muted p-3">
                <Avatar className="mt-0.5 h-8 w-8 border">
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                    A
                  </div>
                </Avatar>
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-primary"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-primary"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your floorplan..."
            className="min-h-[60px] flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <div className="flex flex-col gap-2">
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

