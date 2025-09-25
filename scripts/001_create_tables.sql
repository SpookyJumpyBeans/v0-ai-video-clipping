-- Create projects table to store video editing projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  original_video_url TEXT NOT NULL,
  music_style TEXT,
  voice_style TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clips table to store generated video clips
CREATE TABLE IF NOT EXISTS clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  duration INTEGER, -- duration in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_clips_project_id ON clips(project_id);

-- Enable Row Level Security (RLS) - for future user authentication
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (we'll add user-specific policies later when auth is added)
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations on clips" ON clips FOR ALL USING (true);
