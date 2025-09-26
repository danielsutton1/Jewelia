import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
}

export function PartnerMessagingPanel({ partner, onClose, onSendMessage }: { partner: any, onClose: () => void, onSendMessage: (msg: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!partner?.id) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/partners/messages?partner_id=${partner.id}`)
        const data = await response.json()
        
        if (data.success) {
          setMessages(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [partner?.id])

  const handleSend = async () => {
    if (!input.trim() || !partner?.id) return
    
    try {
      const response = await fetch('/api/partners/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: partner.id,
          content: input,
          message_type: 'text'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Add new message to the list
        const newMsg = {
          id: data.data.id,
          sender: "You",
          content: input,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, newMsg])
        onSendMessage(input)
        setInput("")
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Message {partner?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.sender === "You" 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 text-gray-800"
                }`}>
                  <div className="text-sm">{msg.content}</div>
                  <div className={`text-xs mt-1 ${
                    msg.sender === "You" ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim()}>
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 