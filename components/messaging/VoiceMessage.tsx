'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Play, Pause, Square, Send, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceMessageProps {
  onSend: (audioBlob: Blob) => void
  onCancel: () => void
  disabled?: boolean
}

export function VoiceMessage({ onSend, onCancel, disabled = false }: VoiceMessageProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const playRecording = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob)
      setAudioBlob(null)
      setAudioUrl(null)
      setRecordingTime(0)
    }
  }

  const handleCancel = () => {
    if (audioBlob) {
      setAudioBlob(null)
      setAudioUrl(null)
      setRecordingTime(0)
    }
    onCancel()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      {!audioBlob ? (
        // Recording state
        <>
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            variant={isRecording ? "destructive" : "default"}
            size="sm"
            className="flex items-center gap-2"
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Record
              </>
            )}
          </Button>
          
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}
        </>
      ) : (
        // Playback state
        <>
          <audio
            ref={audioRef}
            src={audioUrl || undefined}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
          />
          
          <Button
            onClick={isPlaying ? pauseRecording : playRecording}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Play
              </>
            )}
          </Button>
          
          <span className="text-sm text-gray-600">
            {formatTime(recordingTime)}
          </span>
          
          <div className="flex items-center gap-1 ml-auto">
            <Button
              onClick={handleSend}
              size="sm"
              className="flex items-center gap-1"
            >
              <Send className="h-3 w-3" />
              Send
            </Button>
            
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
} 