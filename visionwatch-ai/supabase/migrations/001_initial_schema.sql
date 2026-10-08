-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Videos Table
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    status TEXT DEFAULT 'processing' CHECK (status IN ('uploading', 'processing', 'completed', 'failed')),
    context_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis Results Table (Aggregated Stats)
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    total_people_detected INT DEFAULT 0,
    peak_occupancy INT DEFAULT 0,
    peak_activity_period TEXT,
    ai_summary TEXT,
    recommendations TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Detected Events / Timeline Table
CREATE TABLE detected_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    timestamp_start FLOAT NOT NULL,
    timestamp_end FLOAT NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('Low', 'Medium', 'High')),
    is_anomaly BOOLEAN DEFAULT FALSE,
    involved_person_ids TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ask AI Chat History
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    referenced_timestamps FLOAT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Allow completely public access for all tables
CREATE POLICY "Allow public access to videos" ON videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to analysis" ON analysis_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to events" ON detected_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to conversations" ON ai_conversations FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true) ON CONFLICT (id) DO NOTHING;

