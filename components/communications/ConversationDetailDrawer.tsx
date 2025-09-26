"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ConversationDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  threadId: string | null;
  partnerName: string;
  partnerAvatar?: string;
  partnerRole?: string;
}

export default function ConversationDetailDrawer({ open, onClose, threadId, partnerName, partnerAvatar, partnerRole }: ConversationDetailDrawerProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !threadId) return;
    setLoading(true);
    setError(null);
    supabase
      .from("communication_messages")
      .select("id, sender_id, content, timestamp, is_read")
      .eq("thread_id", threadId)
      .order("timestamp", { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setMessages(data || []);
        setLoading(false);
      });
  }, [open, threadId]);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Animate new message arrival
  useEffect(() => {
    if (open && messages.length > 0) {
      const lastMsg = document.getElementById(`msg-${messages[messages.length-1].id}`);
      if (lastMsg) {
        lastMsg.classList.add("animate-flash");
        setTimeout(() => lastMsg.classList.remove("animate-flash"), 600);
      }
    }
  }, [messages, open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !threadId) return;
    const { error } = await supabase.from("communication_messages").insert({
      thread_id: threadId,
      sender_id: null, // TODO: Replace with current user id
      content: newMessage,
      is_read: false,
    });
    if (error) {
      setError(error.message);
    } else {
      setNewMessage("");
      // Refetch messages
      const { data } = await supabase
        .from("communication_messages")
        .select("id, sender_id, content, timestamp, is_read")
        .eq("thread_id", threadId)
        .order("timestamp", { ascending: true });
      setMessages(data || []);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"} bg-black bg-opacity-30 flex justify-end`}
      style={{ pointerEvents: open ? "auto" : "none" }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`bg-white w-full max-w-md h-full shadow-xl flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"} md:rounded-l-lg md:max-w-lg md:w-[400px]`}
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
        onClick={e => e.stopPropagation()}
        tabIndex={0}
        aria-label={`Conversation with ${partnerName}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
            {partnerAvatar || (partnerName ? partnerName.split(" ").map(n => n[0]).join("") : "?")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base truncate">{partnerName}</div>
            <div className="text-xs text-gray-500 truncate">{partnerRole}</div>
          </div>
          <button className="ml-2 text-gray-400 hover:text-gray-700" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" role="log" aria-live="polite">
          {loading && <div className="text-center text-muted-foreground">Loading messages...</div>}
          {error && <div className="text-center text-red-600">{error}</div>}
          {!loading && !error && messages.length === 0 && <div className="text-center text-muted-foreground">No messages yet.</div>}
          {messages.map((msg) => (
            <div key={msg.id} id={`msg-${msg.id}`} className="flex flex-col focus:outline-none" tabIndex={0} role="article">
              <div className="text-xs text-gray-500 mb-1">{new Date(msg.timestamp).toLocaleString()}</div>
              <div className={`rounded-lg px-3 py-2 max-w-[80%] ${msg.sender_id ? "bg-emerald-100 self-end" : "bg-white self-start border"}`}>{msg.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {/* Message Input */}
        <form onSubmit={handleSend} className="p-4 border-t flex gap-2 bg-white" aria-label="Send message">
          <input
            type="text"
            className="flex-1 px-3 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            aria-label="Type a message"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
            disabled={!newMessage.trim()}
            aria-label="Send"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 