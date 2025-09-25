"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Video, Music, Mic, Sparkles, Scissors, Zap, Play, Download, Share2, ArrowLeft } from "lucide-react"

interface GeneratedClip {
  id: string
  title: string
  duration: number
  thumbnail_url: string
  video_url: string
  project_id?: string
}

export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedMusic, setSelectedMusic] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [generatedClips, setGeneratedClips] = useState<GeneratedClip[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      setUploadedFile(file)
      setError(null)
    }
  }, [])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith("video/")) {
      setUploadedFile(file)
      setError(null)
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const handleGenerate = async () => {
    if (!uploadedFile || !prompt) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      console.log("[v0] Starting video upload...")

      const uploadFormData = new FormData()
      uploadFormData.append("video", uploadedFile)

      setProgress(20)

      const uploadResponse = await fetch("/api/upload-video", {
        method: "POST",
        body: uploadFormData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload video")
      }

      const uploadResult = await uploadResponse.json()
      console.log("[v0] Video uploaded successfully:", uploadResult.url)

      setProgress(40)

      const processFormData = new FormData()
      processFormData.append("videoUrl", uploadResult.url)
      processFormData.append("prompt", prompt)
      processFormData.append("musicStyle", selectedMusic || "none")
      processFormData.append("voiceStyle", selectedVoice || "none")
      processFormData.append("title", `AI Video Project - ${new Date().toLocaleDateString()}`)

      setProgress(60)

      const processResponse = await fetch("/api/process-video", {
        method: "POST",
        body: processFormData,
      })

      if (!processResponse.ok) {
        throw new Error("Failed to process video")
      }

      const processResult = await processResponse.json()
      console.log("[v0] Video processing complete:", processResult)

      setProgress(100)
      setCurrentProjectId(processResult.projectId)
      setGeneratedClips(processResult.clips)

      setTimeout(() => {
        setIsProcessing(false)
        setShowResults(true)
      }, 1000)
    } catch (error) {
      console.error("[v0] Error during processing:", error)
      setError(error instanceof Error ? error.message : "An error occurred during processing")
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleBackToEditor = () => {
    setShowResults(false)
    setProgress(0)
    setUploadedFile(null)
    setPrompt("")
    setSelectedMusic("")
    setSelectedVoice("")
    setGeneratedClips([])
    setError(null)
    setCurrentProjectId(null)
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Scissors className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold font-serif text-foreground">ClipCraft AI</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleBackToEditor}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Editor
            </Button>
          </div>
        </header>

        <section className="py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Processing Complete
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold font-serif text-balance mb-4 text-foreground">
                Your AI Shorts are Ready!
              </h1>
              <p className="text-lg text-muted-foreground">
                We've generated {generatedClips.length} engaging shorts from your video. Preview and download below.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {generatedClips.map((clip) => (
                <Card key={clip.id} className="overflow-hidden">
                  <div className="relative aspect-[9/16] bg-muted">
                    <img
                      src={clip.thumbnail_url || "/placeholder.svg"}
                      alt={clip.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary">
                        <Play className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-primary">{clip.duration}s</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold font-serif mb-2">{clip.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">AI-generated short optimized for social media</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center space-y-4">
              <div className="flex justify-center gap-4">
                <Button size="lg" className="px-8">
                  <Download className="w-5 h-5 mr-2" />
                  Download All Shorts
                </Button>
                <Button size="lg" variant="outline" onClick={handleBackToEditor}>
                  Create More Shorts
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                All shorts are optimized for TikTok and YouTube Shorts (9:16 aspect ratio)
              </p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Scissors className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold font-serif text-foreground">ClipCraft AI</h1>
          </div>
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </div>
      </header>

      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Video Editing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-balance mb-6 text-foreground">
            Transform Videos into <span className="text-primary">Viral Shorts</span>
          </h1>
          <p className="text-lg text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
            Upload your video, describe what you want, and let our AI automatically create engaging TikTok and YouTube
            shorts with custom music and voice-overs.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Your Video
                </CardTitle>
                <CardDescription>Drag and drop your video file or click to browse</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input id="file-upload" type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                  {uploadedFile ? (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Video className="w-8 h-8" />
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Drop your video here</p>
                      <p className="text-sm">Supports MP4, MOV, AVI files up to 500MB</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Zap className="w-5 h-5 text-primary" />
                  Editing Instructions
                </CardTitle>
                <CardDescription>Describe how you want your shorts to be edited</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Example: Create 3 engaging 30-second clips focusing on the most exciting moments. Add dynamic transitions, highlight key quotes, and make it perfect for TikTok with trending hashtags..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-32 resize-none"
                />

                <Tabs defaultValue="music" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="music" className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      Music
                    </TabsTrigger>
                    <TabsTrigger value="voice" className="flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      Voice-Over
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="music" className="space-y-3">
                    <Select value={selectedMusic} onValueChange={setSelectedMusic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose background music" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upbeat">Upbeat & Energetic</SelectItem>
                        <SelectItem value="chill">Chill & Relaxed</SelectItem>
                        <SelectItem value="dramatic">Dramatic & Cinematic</SelectItem>
                        <SelectItem value="trending">Trending TikTok Sounds</SelectItem>
                        <SelectItem value="none">No Background Music</SelectItem>
                      </SelectContent>
                    </Select>
                  </TabsContent>

                  <TabsContent value="voice" className="space-y-3">
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select voice-over style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="narrator">Professional Narrator</SelectItem>
                        <SelectItem value="casual">Casual & Friendly</SelectItem>
                        <SelectItem value="energetic">High Energy</SelectItem>
                        <SelectItem value="ai-generated">AI Generated Script</SelectItem>
                        <SelectItem value="none">No Voice-Over</SelectItem>
                      </SelectContent>
                    </Select>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={!uploadedFile || !prompt || isProcessing}
              className="px-8 py-3 text-lg font-semibold"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate AI Shorts
                </>
              )}
            </Button>
          </div>

          {error && (
            <Card className="mt-8 border-destructive">
              <CardContent className="pt-6">
                <div className="text-center text-destructive">
                  <p className="font-medium">Processing Error</p>
                  <p className="text-sm mt-1">{error}</p>
                  <Button variant="outline" size="sm" className="mt-3 bg-transparent" onClick={() => setError(null)}>
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isProcessing && (
            <Card className="mt-8">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {progress < 30
                        ? "Uploading video..."
                        : progress < 70
                          ? "Processing with AI..."
                          : "Finalizing shorts..."}
                    </span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    AI is analyzing your video and creating engaging shorts
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-serif mb-4 text-foreground">Powerful AI Features</h2>
            <p className="text-muted-foreground text-lg">Everything you need to create viral content</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Scissors className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold font-serif mb-2">Smart Clipping</h3>
                <p className="text-sm text-muted-foreground">
                  AI identifies the most engaging moments and creates perfect clips automatically
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold font-serif mb-2">Dynamic Music</h3>
                <p className="text-sm text-muted-foreground">
                  Sync background music perfectly with your content's rhythm and mood
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold font-serif mb-2">AI Voice-Over</h3>
                <p className="text-sm text-muted-foreground">
                  Generate natural-sounding narration that enhances your video's impact
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">© 2024 ClipCraft AI. Transform your videos into viral content.</p>
        </div>
      </footer>
    </div>
  )
}
