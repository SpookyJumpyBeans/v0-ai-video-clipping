import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Simulated AI processing function
async function processVideoWithAI(videoUrl: string, prompt: string, musicStyle: string, voiceStyle: string) {
  // In a real implementation, this would call actual AI services
  // For now, we'll simulate the processing with a delay

  console.log("[v0] Starting AI processing for:", videoUrl)
  console.log("[v0] Prompt:", prompt)
  console.log("[v0] Music style:", musicStyle)
  console.log("[v0] Voice style:", voiceStyle)

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Return mock processed clips
  return [
    {
      title: "Build Flappy Bird using Scratch AI",
      duration: 30,
      thumbnail_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ohT2Hd7WREEkQ3FKEuJjhBYDoQEBto.png",
      video_url: "/api/mock-video/1",
    },
    {
      title: "Coding Tips & Tricks",
      duration: 45,
      thumbnail_url: "/coding-tips-video-thumbnail.jpg",
      video_url: "/api/mock-video/2",
    },
    {
      title: "Behind the Scenes",
      duration: 60,
      thumbnail_url: "/behind-the-scenes-coding-video.jpg",
      video_url: "/api/mock-video/3",
    },
  ]
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const videoUrl = formData.get("videoUrl") as string
    const prompt = formData.get("prompt") as string
    const musicStyle = formData.get("musicStyle") as string
    const voiceStyle = formData.get("voiceStyle") as string
    const title = (formData.get("title") as string) || "AI Video Project"

    if (!videoUrl || !prompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Create project record
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        title,
        prompt,
        original_video_url: videoUrl,
        music_style: musicStyle,
        voice_style: voiceStyle,
        status: "processing",
      })
      .select()
      .single()

    if (projectError) {
      console.error("[v0] Database error:", projectError)
      return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
    }

    console.log("[v0] Processing video with AI services...")

    // Process video with AI
    const clipData = await processVideoWithAI(videoUrl, prompt, musicStyle, voiceStyle)

    const clipsToInsert = clipData.map((clip) => ({
      project_id: project.id,
      title: clip.title,
      video_url: clip.video_url,
      thumbnail_url: clip.thumbnail_url,
      duration: clip.duration,
    }))

    const { data: clips, error: clipsError } = await supabase.from("clips").insert(clipsToInsert).select()

    if (clipsError) {
      console.error("[v0] Clips database error:", clipsError)
      return NextResponse.json({ error: "Failed to save clips" }, { status: 500 })
    }

    await supabase.from("projects").update({ status: "completed" }).eq("id", project.id)

    console.log("[v0] AI processing complete, generated", clips.length, "clips")

    return NextResponse.json({
      success: true,
      projectId: project.id,
      clips,
      message: "Video processed successfully",
    })
  } catch (error) {
    console.error("[v0] Processing error:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}
