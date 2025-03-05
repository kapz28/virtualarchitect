import { Suspense } from "react"
import { Upload } from "lucide-react"
import FloorplanUploader from "@/components/floorplan-uploader"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <h1 className="text-2xl font-bold tracking-tight">Virtual Architect</h1>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="outline" size="sm">
              Documentation
            </Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <section className="mx-auto max-w-5xl space-y-8 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
              Optimize Your Space <br className="hidden sm:inline" />
              with AI-Powered Floorplan Analysis
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Upload your floorplan to receive instant feedback on layout efficiency, natural lighting, and traffic
              flow. Chat with our Virtual Architect for personalized recommendations.
            </p>
          </div>

          <div className="w-full rounded-lg border-2 border-dashed border-slate-200 p-10 dark:border-slate-800">
            <Suspense fallback={<div>Loading uploader...</div>}>
              <FloorplanUploader />
            </Suspense>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Upload Your Floorplan</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Supported formats: JPG, PNG, PDF (up to 10MB)</p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <h3 className="font-semibold">Chat with Your Virtual Architect</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask questions about your floorplan and get personalized recommendations
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

