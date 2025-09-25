import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const projectId = params.projectId

    console.log("[v0] Checking status for project:", projectId)

    const supabase = await createClient()

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select(`
        *,
        clips (*)
      `)
      .eq("id", projectId)
      .single()

    if (projectError) {
      console.error("[v0] Database error:", projectError)
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Calculate progress based on status
    const progress = project.status === "completed" ? 100 : project.status === "processing" ? 50 : 0

    return NextResponse.json({
      projectId,
      status: project.status,
      progress,
      clips: project.clips || [],
      message: project.status === "completed" ? "Video processing completed successfully" : "Processing in progress...",
    })
  } catch (error) {
    console.error("[v0] Status check error:", error)
    return NextResponse.json({ error: "Status check failed" }, { status: 500 })
  }
}
