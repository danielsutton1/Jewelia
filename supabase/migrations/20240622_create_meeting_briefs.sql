-- Meeting Briefs Table
CREATE TABLE meeting_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    transcript_source TEXT NOT NULL,
    original_transcript TEXT NOT NULL,
    summary TEXT,
    key_points TEXT[],
    decisions TEXT[],
    action_items JSONB, -- [{task, assignee, due_date}]
    follow_ups TEXT[],
    attendee_insights JSONB, -- [{name, contributions}]
    ai_processing_time INTEGER,
    edited_by_user BOOLEAN DEFAULT false,
    shared_with_attendees BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_meeting_briefs_event_id ON meeting_briefs(event_id); 