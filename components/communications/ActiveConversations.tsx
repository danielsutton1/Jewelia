"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import ConversationDetailDrawer from "./ConversationDetailDrawer";
import { format, isWithinInterval, parseISO } from "date-fns";
import Fuse from "fuse.js";
// import { supabase } from "@/lib/supabase"; // Removed problematic import
import MessagePreview from './MessagePreview';
import QuickActionsPanel from './QuickActionsPanel';

// Create a local Supabase client to bypass the corrupted lib/supabase.ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error("Supabase environment variables not found. Real-time features will be disabled.");
  // Create a mock client to avoid crashes
  supabase = {
    channel: () => ({
      on: () => ({
        subscribe: () => ({
          unsubscribe: () => {}
        })
      }),
    }),
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      in: () => Promise.resolve({ data: null, error: null }),
      eq: () => Promise.resolve({ data: null, error: null }),
      order: () => Promise.resolve({ data: [], error: null }),
      limit: () => Promise.resolve({ data: [], error: null }),
      range: () => Promise.resolve({ data: [], error: null }),
    })
  };
}

const statusColors: Record<string, string> = {
  "Design": "#8B5CF6",
  "CAD": "#3B82F6",
  "Casting": "#F59E0B",
  "Setting": "#10B981",
  "QC": "#6366F1",
  "Parts": "#F97316",
  "Assembly": "#059669"
};

const filters = ["All", "Clients", "Partners", "Urgent"] as const;
type FilterType = typeof filters[number];

type Conversation = {
  id: string;
  projectName: string;
  partnerName: string;
  partnerRole: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  projectStatus: string;
  isUrgent: boolean;
  avatar: string;
};

type SortField = 'last_message_at' | 'priority' | 'status' | 'partner_name';
type SortOrder = 'asc' | 'desc';

export default function ActiveConversations() {
  const [filter, setFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [filterClients, setFilterClients] = useState(false);
  const [filterPartners, setFilterPartners] = useState(false);
  const [dateRange, setDateRange] = useState<{from: string, to: string}>({from: "", to: ""});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortField, setSortField] = useState<SortField>('last_message_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const ITEMS_PER_PAGE = 20;
  const unreadBadgeRef = useRef<HTMLSpanElement>(null);
  const observer = useRef<IntersectionObserver | undefined>(undefined);
  const loadingRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showInvitePartnerModal, setShowInvitePartnerModal] = useState(false);
  const [showClientUpdateModal, setShowClientUpdateModal] = useState(false);
  const [partners, setPartners] = useState<{ id: string; name: string; company?: string }[]>([]);
  const [conversationOptions, setConversationOptions] = useState<{ id: string; subject: string }[]>([]);
  const [newProject, setNewProject] = useState({ partner_id: '', subject: '', type: 'message', priority: 'medium', loading: false, error: '', success: false });
  const [invitePartner, setInvitePartner] = useState({ name: '', email: '', type: '', loading: false, error: '', success: false });
  const [clientUpdate, setClientUpdate] = useState({ email: '', content: '', loading: false, error: '', success: false });
  const [partnerSearch, setPartnerSearch] = useState('');
  const [readStatusFilter, setReadStatusFilter] = useState<'all' | 'read' | 'unread'>('unread');

  // Real-time subscription setup
  useEffect(() => {
    const threadsSubscription = supabase
      .channel('threads-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'communication_threads' 
        }, 
        async () => {
          await refetchConversations();
        }
      )
      .subscribe();

    const messagesSubscription = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'communication_messages' 
        }, 
        async () => {
          await refetchConversations();
        }
      )
      .subscribe();

    return () => {
      threadsSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, []);

  // Modified fetchConversations to support pagination and sorting
  const fetchConversations = async (pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const from = (pageNum - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: threads, error: threadsError, count } = await supabase
        .from("communication_threads")
        .select(`
          id,
          subject,
          partner:partner_id (name, role),
          priority,
          status,
          last_message_at,
          pinned,
          archived,
          is_read
        `, { count: 'exact' })
        .order(sortField, { ascending: sortOrder === 'asc' })
        .range(from, to);

      if (threadsError) throw threadsError;

      // Update hasMore based on total count
      if (count !== null) {
        setHasMore(count > to + 1);
      }

      // Fetch latest message for each thread
      const conversations: Conversation[] = [];
      for (const thread of threads) {
        const { data: messages, error: msgError } = await supabase
          .from("communication_messages")
          .select("content, timestamp, is_read, sender_id")
          .eq("thread_id", thread.id)
          .order("timestamp", { ascending: false })
          .limit(1);
        if (msgError) throw msgError;
        const lastMessage = messages && messages.length > 0 ? messages[0] : null;

        conversations.push({
          id: thread.id,
          projectName: thread.subject,
          partnerName: thread.partner?.[0]?.name || "Unknown",
          partnerRole: thread.partner?.[0]?.role || "Partner",
          lastMessage: lastMessage?.content || "No messages yet",
          timestamp: lastMessage?.timestamp
            ? new Date(lastMessage.timestamp).toLocaleString()
            : "-",
          unreadCount: lastMessage && !lastMessage.is_read ? 1 : 0,
          projectStatus: thread.status,
          isUrgent: thread.priority === "urgent",
          avatar: thread.partner?.[0]?.name
            ? thread.partner[0].name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
            : "?",
        });
      }

      setConversations(prev => append ? [...prev, ...conversations] : conversations);
    } catch (err: any) {
      setError(err.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and page change handler
  useEffect(() => {
    fetchConversations(page, page > 1);
  }, [page, sortField, sortOrder]);

  // Fuzzy search setup
  const fuse = new Fuse(conversations, {
    keys: ["projectName", "partnerName", "lastMessage"],
    threshold: 0.4,
    minMatchCharLength: 2,
    ignoreLocation: true,
  });

  let filtered = conversations;
  if (search) {
    const fuseResults = fuse.search(search);
    filtered = fuseResults.map(r => r.item);
  }
  filtered = filtered.filter((c) => {
    if (filterUrgent && !c.isUrgent) return false;
    if (filterClients && c.partnerRole !== "Client") return false;
    if (filterPartners && c.partnerRole === "Client") return false;
    if (dateRange.from && dateRange.to) {
      const ts = parseISO(c.timestamp);
      if (!isWithinInterval(ts, { start: parseISO(dateRange.from), end: parseISO(dateRange.to) })) return false;
    }
    return true;
  });

  const unreadCount = useMemo(() => conversations.filter(c => c.unreadCount > 0).length, [conversations]);
  const readCount = useMemo(() => conversations.filter(c => c.unreadCount === 0).length, [conversations]);

  // Apply read/unread filter
  if (readStatusFilter === 'read') {
    filtered = filtered.filter(c => c.unreadCount === 0);
  } else if (readStatusFilter === 'unread') {
    filtered = filtered.filter(c => c.unreadCount > 0);
  }

  // Bulk actions (persist to Supabase)
  const handleBulkRead = async () => {
    await supabase.from('communication_threads').update({ is_read: true }).in('id', selectedIds);
    setReadIds(ids => Array.from(new Set([...ids, ...selectedIds])));
    await refetchConversations();
  };
  const handleBulkUnread = async () => {
    await supabase.from('communication_threads').update({ is_read: false }).in('id', selectedIds);
    setReadIds(ids => ids.filter(id => !selectedIds.includes(id)));
    await refetchConversations();
  };
  const handleBulkPin = async () => {
    await supabase.from('communication_threads').update({ pinned: true }).in('id', selectedIds);
    setPinnedIds(ids => Array.from(new Set([...ids, ...selectedIds])));
    await refetchConversations();
  };
  const handleBulkArchive = async () => {
    await supabase.from('communication_threads').update({ archived: true }).in('id', selectedIds);
    setArchivedIds(ids => Array.from(new Set([...ids, ...selectedIds])));
    await refetchConversations();
  };

  // Refetch conversations after update
  const refetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch threads with partner info and latest message
      const { data: threads, error: threadsError } = await supabase
        .from("communication_threads")
        .select(`
          id,
          subject,
          partner:partner_id (name, role),
          priority,
          status,
          last_message_at,
          pinned,
          archived,
          is_read
        `)
        .order("last_message_at", { ascending: false });
      if (threadsError) throw threadsError;
      // Fetch latest message for each thread
      const conversations: Conversation[] = [];
      for (const thread of threads) {
        const { data: messages, error: msgError } = await supabase
          .from("communication_messages")
          .select("content, timestamp, is_read, sender_id")
          .eq("thread_id", thread.id)
          .order("timestamp", { ascending: false })
          .limit(1);
        if (msgError) throw msgError;
        const lastMessage = messages && messages.length > 0 ? messages[0] : null;
        conversations.push({
          id: thread.id,
          projectName: thread.subject,
          partnerName: thread.partner?.[0]?.name || "Unknown",
          partnerRole: thread.partner?.[0]?.role || "Partner",
          lastMessage: lastMessage?.content || "No messages yet",
          timestamp: lastMessage?.timestamp
            ? new Date(lastMessage.timestamp).toLocaleString()
            : "-",
          unreadCount: lastMessage && !lastMessage.is_read ? 1 : 0, // Simplified
          projectStatus: thread.status,
          isUrgent: thread.priority === "urgent",
          avatar: thread.partner?.[0]?.name
            ? thread.partner[0].name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
            : "?",
        });
      }
      setConversations(conversations);
    } catch (err: any) {
      setError(err.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  // Bulk actions
  const allVisibleIds = filtered.map(c => c.id);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedIds.includes(id));
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(allVisibleIds);
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };

  // Pin and archive filtering
  let displayList = filtered.filter(c => !archivedIds.includes(c.id));
  displayList = [
    ...displayList.filter(c => pinnedIds.includes(c.id)),
    ...displayList.filter(c => !pinnedIds.includes(c.id)),
  ];

  // Fetch partners and conversations for dropdowns
  useEffect(() => {
    const fetchPartners = async () => {
      const { data, error } = await supabase.from('partners').select('id, name, company');
      if (!error && data) setPartners(data);
    };
    const fetchConversations = async () => {
      const { data, error } = await supabase.from('communication_threads').select('id, subject');
      if (!error && data) setConversationOptions(data);
    };
    fetchPartners();
    fetchConversations();
  }, []);

  // For partner search in new project modal
  const filteredPartners = useMemo(() => {
    if (!partnerSearch) return partners;
    return partners.filter(p =>
      p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      (p.company && p.company.toLowerCase().includes(partnerSearch.toLowerCase()))
    );
  }, [partnerSearch, partners]);

  // Handlers for form submission
  const handleNewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewProject((s) => ({ ...s, loading: true, error: '', success: false }));
    const { partner_id, subject, type, priority } = newProject;
    const { error } = await supabase.from('communication_threads').insert({ partner_id, subject, type, priority });
    if (error) setNewProject((s) => ({ ...s, loading: false, error: error.message, success: false }));
    else setNewProject((s) => ({ ...s, loading: false, error: '', success: true, partner_id: '', subject: '', type: 'message', priority: 'medium' }));
  };
  const handleInvitePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvitePartner((s) => ({ ...s, loading: true, error: '', success: false }));
    const { name, email, type } = invitePartner;
    const { error } = await supabase.from('partners').insert({ name, email, type });
    if (error) setInvitePartner((s) => ({ ...s, loading: false, error: error.message, success: false }));
    else setInvitePartner((s) => ({ ...s, loading: false, error: '', success: true, name: '', email: '', type: '' }));
  };
  const handleClientUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientUpdate((s) => ({ ...s, loading: true, error: '', success: false }));
    const { email, content } = clientUpdate;
    const { error } = await supabase.from('client_updates').insert({ email, content });
    if (error) setClientUpdate((s) => ({ ...s, loading: false, error: error.message, success: false }));
    else setClientUpdate((s) => ({ ...s, loading: false, error: '', success: true, email: '', content: '' }));
  };

  return (
    <>
      {/* Main Messages Card */}
      <div className="bg-white rounded-2xl shadow-lg p-0 h-full flex flex-col w-full max-w-5xl mx-auto" aria-label="Active Conversations">
        {/* Title */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-white rounded-t-2xl">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Messages</h2>
        </div>
        {/* Quick Actions Buttons Row (now inside the card) */}
        <div className="flex flex-col md:flex-row justify-start items-start gap-3 px-6 pt-4 pb-3 w-full border-b border-gray-100">
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105 w-full md:w-auto"
          >
            Start New Project Conversation
          </button>
          <button
            onClick={() => setShowInvitePartnerModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105 w-full md:w-auto"
          >
            Invite Partner
          </button>
          <button
            onClick={() => setShowClientUpdateModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105 w-full md:w-auto"
          >
            Send Client Update
          </button>
        </div>
        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 px-6 py-2 bg-emerald-100/60 border-b border-emerald-200 sticky top-0 z-10">
            <span className="font-semibold text-sm text-emerald-900">{selectedIds.length} selected</span>
            <button className="text-xs px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 transition text-white shadow-sm" onClick={handleBulkRead}>Mark as Read</button>
            <button className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 transition text-white shadow-sm" onClick={handleBulkUnread}>Mark as Unread</button>
            <button className="text-xs px-2 py-1 rounded bg-yellow-400 hover:bg-yellow-500 transition text-white shadow-sm" onClick={handleBulkPin}>Pin</button>
            <button className="text-xs px-2 py-1 rounded bg-gray-400 hover:bg-gray-500 transition text-white shadow-sm" onClick={handleBulkArchive}>Archive</button>
            <button className="ml-auto text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 transition text-gray-700" onClick={() => setSelectedIds([])}>Clear</button>
          </div>
        )}
        {/* Search Bar, Date Filters & Sorting */}
        <div className="flex flex-col gap-4 px-6 pt-4 pb-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Search order #, name, business, or project..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-[250px] px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-sm shadow-sm bg-gray-50/80"
              aria-label="Search conversations"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Filter by Date:</label>
              <div className="flex gap-1 items-center text-sm">
                <span className="text-gray-500">From:</span>
                <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({...r, from: e.target.value}))} className="border-2 rounded-lg px-2 py-1 bg-white shadow-sm focus:ring-emerald-400 focus:border-emerald-400" />
                <span className="text-gray-500">To:</span>
                <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({...r, to: e.target.value}))} className="border-2 rounded-lg px-2 py-1 bg-white shadow-sm focus:ring-emerald-400 focus:border-emerald-400" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
               <select 
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortField(field as SortField);
                  setSortOrder(order as SortOrder);
                  setPage(1);
                }}
                className="text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-emerald-400 focus:border-emerald-400"
              >
                <option value="last_message_at-desc">Newest First</option>
                <option value="last_message_at-asc">Oldest First</option>
                <option value="priority-desc">Priority (High to Low)</option>
                <option value="priority-asc">Priority (Low to High)</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={filterUrgent} onChange={e => setFilterUrgent(e.target.checked)} className="h-4 w-4 rounded accent-red-500" /> Urgent
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={filterClients} onChange={e => setFilterClients(e.target.checked)} className="h-4 w-4 rounded accent-emerald-500" /> Clients
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={filterPartners} onChange={e => setFilterPartners(e.target.checked)} className="h-4 w-4 rounded accent-blue-500" /> Partners
              </label>
            </div>
          </div>
        </div>

        {/* Read/Unread Tabs */}
        <div className="px-6 py-2 flex items-center gap-2 border-b border-gray-100">
           <button onClick={() => setReadStatusFilter('all')} className={`px-3 py-1 text-sm font-semibold rounded-full ${readStatusFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            All ({conversations.length})
          </button>
          <button onClick={() => setReadStatusFilter('read')} className={`px-3 py-1 text-sm font-semibold rounded-full ${readStatusFilter === 'read' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Read ({readCount})
          </button>
          <button onClick={() => setReadStatusFilter('unread')} className={`px-3 py-1 text-sm font-semibold rounded-full ${readStatusFilter === 'unread' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Unread ({unreadCount})
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-grow overflow-y-auto" role="listbox" tabIndex={0}>
           <div className="p-4 space-y-3">
              {/* Select All Checkbox */}
              <div className="flex items-center px-3 py-2 bg-gray-50/80 rounded-lg sticky top-0 z-10 border-b border-gray-100">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Select all conversations" className="h-4 w-4 rounded accent-emerald-500" />
                <span className="ml-3 text-sm font-medium text-gray-600">Select All</span>
              </div>
              {loading && (
                <div className="p-6 text-center text-muted-foreground">Loading conversations...</div>
              )}
              {error && (
                <div className="p-6 text-center text-red-600">{error}</div>
              )}
              {!loading && !error && displayList.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">No conversations found.</div>
              )}
              {displayList.map((c, idx) => {
                // Highlight search matches
                const highlight = (text: string) => {
                  if (!search) return text;
                  const i = text.toLowerCase().indexOf(search.toLowerCase());
                  if (i === -1) return text;
                  return <>{text.slice(0, i)}<mark className="bg-yellow-100 px-0.5 rounded">{text.slice(i, i+search.length)}</mark>{text.slice(i+search.length)}</>;
                };
                return (
                  <div
                    key={c.id}
                    className={`flex items-center p-4 cursor-pointer transition-colors duration-200 rounded-xl mb-2 shadow-sm border ${selected?.id === c.id ? "bg-emerald-100/70 border-emerald-300" : "bg-white hover:bg-emerald-50/60 border-gray-200"}`}
                    style={{ minHeight: 80 }}
                    onClick={() => setSelected(c)}
                    role="option"
                    aria-selected={selected?.id === c.id}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setSelected(c); }}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={e => { e.stopPropagation(); toggleSelect(c.id); }}
                      className="mr-3 accent-emerald-500"
                      aria-label={`Select conversation with ${c.partnerName}`}
                      tabIndex={0}
                      onClick={e => e.stopPropagation()}
                    />
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center text-lg font-bold text-gray-500 mr-4 border border-gray-300 shadow-sm">
                      {c.avatar}
                    </div>
                    {/* Main Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base truncate text-gray-900">{highlight(c.projectName)}</span>
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">{c.projectStatus}</span>
                        {c.isUrgent && <span className="ml-2 w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow" title="Urgent"></span>}
                        {pinnedIds.includes(c.id) && <span className="ml-2 text-yellow-500" title="Pinned">📌</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500 truncate">{highlight(`${c.partnerName} (${c.partnerRole})`)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <MessagePreview content={c.lastMessage} maxLength={40} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{c.timestamp}</span>
                      </div>
                    </div>
                    {/* Right Side */}
                    <div className="flex flex-col items-end gap-2 ml-4">
                      {c.unreadCount > 0 && (
                        <span ref={unreadBadgeRef} className="bg-emerald-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
           </div>
          {/* Loading indicator for infinite scroll */}
          <div ref={loadingRef} className="p-4 text-center">
            {loading && !error && <div className="text-sm text-gray-500">Loading more conversations...</div>}
          </div>
        </div>
      </div>
      <ConversationDetailDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        threadId={selected?.id || null}
        partnerName={selected?.partnerName || ""}
        partnerAvatar={selected?.avatar || ""}
        partnerRole={selected?.partnerRole || ""}
      />
      {/* Modals for each action (scaffolded) - render at root */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Start New Project Conversation</h3>
            <form onSubmit={handleNewProject} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Partner</label>
                <input
                  type="text"
                  placeholder="Search by name or company..."
                  value={partnerSearch}
                  onChange={e => setPartnerSearch(e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-2"
                />
                <select required value={newProject.partner_id} onChange={e => setNewProject(s => ({ ...s, partner_id: e.target.value }))} className="w-full border rounded px-2 py-1">
                  <option value="">Select partner</option>
                  {filteredPartners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.company ? ` (${p.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input required value={newProject.subject} onChange={e => setNewProject(s => ({ ...s, subject: e.target.value }))} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select value={newProject.type} onChange={e => setNewProject(s => ({ ...s, type: e.target.value }))} className="w-full border rounded px-2 py-1">
                  <option value="message">Message</option>
                  <option value="email">Email</option>
                  <option value="call">Call</option>
                  <option value="meeting">Meeting</option>
                  <option value="document">Document</option>
                  <option value="task">Task</option>
                  <option value="issue">Issue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select value={newProject.priority} onChange={e => setNewProject(s => ({ ...s, priority: e.target.value }))} className="w-full border rounded px-2 py-1">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              {newProject.error && <div className="text-red-600 text-sm">{newProject.error}</div>}
              {newProject.success && <div className="text-green-600 text-sm">Project conversation created!</div>}
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-sm font-medium" disabled={newProject.loading}>{newProject.loading ? 'Creating...' : 'Create'}</button>
                <button type="button" className="text-sm text-gray-600 hover:underline" onClick={() => setShowNewProjectModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showInvitePartnerModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Invite Partner</h3>
            <form onSubmit={handleInvitePartner} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required value={invitePartner.name} onChange={e => setInvitePartner(s => ({ ...s, name: e.target.value }))} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input required type="email" value={invitePartner.email} onChange={e => setInvitePartner(s => ({ ...s, email: e.target.value }))} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type/Role</label>
                <input required value={invitePartner.type} onChange={e => setInvitePartner(s => ({ ...s, type: e.target.value }))} className="w-full border rounded px-2 py-1" placeholder="e.g. Supplier, Partner, Client" />
              </div>
              {invitePartner.error && <div className="text-red-600 text-sm">{invitePartner.error}</div>}
              {invitePartner.success && <div className="text-green-600 text-sm">Partner invited!</div>}
              <div className="flex items-center gap-2 mt-2">
                <button type="button" className="bg-gray-200 px-3 py-1.5 rounded text-sm font-medium" onClick={() => alert('QR Scanner coming soon!')}>Scan QR</button>
                <span className="text-xs text-gray-500">or fill out the form</span>
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium" disabled={invitePartner.loading}>{invitePartner.loading ? 'Inviting...' : 'Invite'}</button>
                <button type="button" className="text-sm text-gray-600 hover:underline" onClick={() => setShowInvitePartnerModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showClientUpdateModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send Client Update</h3>
            <form onSubmit={handleClientUpdate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Client Email</label>
                <input required type="email" value={clientUpdate.email || ''} onChange={e => setClientUpdate(s => ({ ...s, email: e.target.value }))} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea required value={clientUpdate.content} onChange={e => setClientUpdate(s => ({ ...s, content: e.target.value }))} className="w-full border rounded px-2 py-1" rows={4} />
              </div>
              {clientUpdate.error && <div className="text-red-600 text-sm">{clientUpdate.error}</div>}
              {clientUpdate.success && <div className="text-green-600 text-sm">Client update sent!</div>}
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded text-sm font-medium" disabled={clientUpdate.loading}>{clientUpdate.loading ? 'Sending...' : 'Send'}</button>
                <button type="button" className="text-sm text-gray-600 hover:underline" onClick={() => setShowClientUpdateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 