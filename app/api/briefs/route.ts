import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// TODO: Store your OpenAI API key securely
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Helper: Call OpenAI Whisper for audio transcription
async function transcribeAudio(fileBuffer: Buffer, fileType: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer]), `audio.${fileType}`);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'text');
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData as any,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Whisper API error: ' + err);
  }
  return await res.text();
}

// Helper: Call OpenAI ChatGPT for meeting brief generation
async function generateMeetingBrief(transcript: string): Promise<string> {
  const prompt = `Analyze this meeting transcript and create a structured brief:\n\nTRANSCRIPT: ${transcript}\n\nPlease provide:\n1. Executive Summary (2-3 sentences)\n2. Key Discussion Points (bullet points)\n3. Decisions Made (clear outcomes)\n4. Action Items (task, person responsible, timeline)\n5. Follow-up Requirements\n6. Meeting Effectiveness Assessment\n\nFormat as clean, professional meeting minutes.`
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes meetings.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'OpenAI API error')
  return data.choices[0].message.content
}

// Helper: Parse AI summary into structured fields
function parseBrief(briefText: string) {
  // Simple regex-based parsing for demo; can be improved for robustness
  const summary = (briefText.match(/Executive Summary[\s\S]*?\n([\s\S]*?)(?:\n\d+\.|\nKey Discussion Points:|$)/i) || [])[1]?.trim() || ''
  const keyPoints = (briefText.match(/Key Discussion Points[\s\S]*?\n([\s\S]*?)(?:\n\d+\.|\nDecisions Made:|$)/i) || [])[1]?.split(/\n|\*/).map(s => s.trim()).filter(Boolean) || []
  const decisions = (briefText.match(/Decisions Made[\s\S]*?\n([\s\S]*?)(?:\n\d+\.|\nAction Items:|$)/i) || [])[1]?.split(/\n|\*/).map(s => s.trim()).filter(Boolean) || []
  const actionItemsRaw = (briefText.match(/Action Items[\s\S]*?\n([\s\S]*?)(?:\n\d+\.|\nFollow-up Requirements:|$)/i) || [])[1] || ''
  const actionItems = actionItemsRaw.split(/\n|\*/).map(s => {
    // Try to extract task, assignee, due date
    const match = s.match(/(.+?)\s*-\s*Assigned to: (.+?)(?:, Due: (.+))?$/)
    if (match) {
      return { task: match[1].trim(), assignee: match[2].trim(), due_date: match[3]?.trim() || '' }
    }
    return null
  }).filter(Boolean) || []
  const followUps = (briefText.match(/Follow-up Requirements[\s\S]*?\n([\s\S]*?)(?:\n\d+\.|\nMeeting Effectiveness Assessment:|$)/i) || [])[1]?.split(/\n|\*/).map(s => s.trim()).filter(Boolean) || []
  // Attendee insights and effectiveness can be added as needed
  return { summary, keyPoints, decisions, actionItems, followUps, attendeeInsights: [] }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set')
}
function getSupabaseClient() {
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set')
  }
  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(request: Request) {
  try {
    let transcript = ''
    let transcriptSource = 'manual'
    let eventId = null
    // Check content type for file upload
    const contentType = request.headers.get('content-type') || ''
    if (contentType.startsWith('multipart/form-data')) {
      const form = await request.formData()
      const file = form.get('audio') as File | null
      eventId = form.get('eventId') || null
      if (!file) {
        return NextResponse.json({ error: 'Audio file is required' }, { status: 400 })
      }
      if (!file.type.startsWith('audio/')) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
      }
      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 400 })
      }
      const arrayBuffer = await file.arrayBuffer()
      transcript = await transcribeAudio(Buffer.from(arrayBuffer), file.type.split('/')[1])
      transcriptSource = 'audio'
    } else {
      // JSON body: { transcript, transcriptSource, eventId }
      const body = await request.json()
      transcript = body.transcript
      transcriptSource = body.transcriptSource || 'manual'
      eventId = body.eventId || null
      if (!transcript) {
        return NextResponse.json({ error: 'Transcript is required' }, { status: 400 })
      }
    }
    // Call OpenAI to generate the brief
    const aiStart = Date.now()
    const briefText = await generateMeetingBrief(transcript)
    const aiProcessingTime = Date.now() - aiStart
    const parsed = parseBrief(briefText)
    // Store in DB
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('meeting_briefs')
      .insert([
        {
          event_id: eventId,
          transcript_source: transcriptSource,
          original_transcript: transcript,
          summary: parsed.summary,
          key_points: parsed.keyPoints,
          decisions: parsed.decisions,
          action_items: parsed.actionItems,
          follow_ups: parsed.followUps,
          attendee_insights: parsed.attendeeInsights,
          ai_processing_time: aiProcessingTime,
          edited_by_user: false,
          shared_with_attendees: false,
        }
      ])
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ meetingBrief: data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate meeting brief', details: String(error) }, { status: 500 })
  }
}

// GET /api/briefs?eventId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
    }
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('meeting_briefs')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ meetingBriefs: data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch meeting briefs', details: String(error) }, { status: 500 })
  }
}

// PATCH /api/briefs?id=...
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    const body = await request.json()
    const { summary, key_points, decisions, action_items, follow_ups, attendee_insights, edited_by_user, shared_with_attendees } = body
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('meeting_briefs')
      .update({
        summary,
        key_points,
        decisions,
        action_items,
        follow_ups,
        attendee_insights,
        edited_by_user,
        shared_with_attendees,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ meetingBrief: data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update meeting brief', details: String(error) }, { status: 500 })
  }
}

// TODO: Add DB storage and event association
// TODO: Add GET endpoint for retrieving briefs by eventId 