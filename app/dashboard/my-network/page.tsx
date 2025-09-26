"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, MessageSquare, Trash2, Search, Filter, UserPlus, Download, Upload, Eye, Star, Users, X, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConnectionRequestsPanel } from "@/components/networking/ConnectionRequestsPanel";
import { ConnectionRequestModal } from "@/components/networking/ConnectionRequestModal";

// --- Types ---
type Specialty = "Manufacturer" | "Retailer" | "Designer" | "Supplier" | "Gem Dealer" | "Polisher" | "Setter" | "Appraiser";
interface Connection {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  company: string;
  specialties: Specialty[];
  location: string;
  description: string;
  connectedOn: string;
  email?: string;
  phone?: string;
  trusted?: boolean;
}

// --- Mock Data ---
const mockConnections: Connection[] = [
  {
    id: "1",
    name: "Ava Thompson",
    title: "Owner & Designer",
    company: "Thompson Fine Jewelry",
    specialties: ["Designer", "Manufacturer"],
    location: "New York, NY",
    description: "Award-winning custom jewelry designer and manufacturer.",
    connectedOn: "June 9, 2025",
    trusted: true,
    email: "ava@thompsonjewelry.com",
    phone: "(212) 555-1234",
  },
  {
    id: "2",
    name: "Miguel Santos",
    title: "Gem Dealer",
    company: "Santos Gems Intl.",
    specialties: ["Gem Dealer", "Supplier"],
    location: "Miami, FL",
    description: "Ethically sourced colored stones and diamonds.",
    connectedOn: "May 22, 2025",
    trusted: false,
    email: "miguel@santosgems.com",
  },
  {
    id: "3",
    name: "Priya Patel",
    title: "Retail Manager",
    company: "Patel Jewelers",
    specialties: ["Retailer"],
    location: "San Francisco, CA",
    description: "Family-owned retail jewelry store since 1985.",
    connectedOn: "April 10, 2025",
    trusted: true,
    email: "priya@pateljewelers.com",
  },
  {
    id: "4",
    name: "James Lee",
    title: "Master Polisher",
    company: "Lee Polishing Studio",
    specialties: ["Polisher"],
    location: "Los Angeles, CA",
    description: "High-end finishing for custom and vintage pieces.",
    connectedOn: "March 18, 2025",
    trusted: false,
    email: "james@leepolishing.com",
  },
  {
    id: "5",
    name: "Sofia Rossi",
    title: "Stone Setter",
    company: "Rossi Atelier",
    specialties: ["Setter", "Designer"],
    location: "Chicago, IL",
    description: "Expert in micro-pavé and invisible settings.",
    connectedOn: "February 2, 2025",
    trusted: true,
    email: "sofia@rossiatelier.com",
  },
  // ... more mock connections ...
];

const sortOptions = [
  { value: "recent", label: "Recently added" },
  { value: "name", label: "Name" },
  { value: "company", label: "Company" },
];

const specialtyOptions: Specialty[] = [
  "Manufacturer", "Retailer", "Designer", "Supplier", "Gem Dealer", "Polisher", "Setter", "Appraiser"
];

// --- Main Page ---
export default function MyNetworkPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [specialty, setSpecialty] = useState<Specialty | "All">("All");
  const [connections, setConnections] = useState<Connection[]>(mockConnections);
  const [selected, setSelected] = useState<string[]>([]);
  const [moreMenu, setMoreMenu] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState<Connection | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showConnectionRequest, setShowConnectionRequest] = useState<Connection | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Analytics
  const newThisMonth = connections.filter(c => c.connectedOn.includes("2025")).length; // Placeholder
  const trustedCount = connections.filter(c => c.trusted).length;

  // Fetch pending connection requests count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await fetch('/api/network/connection-requests?type=incoming')
        if (response.ok) {
          const data = await response.json()
          setPendingRequestsCount(data.data.incoming || 0)
        }
      } catch (error) {
        console.error('Error fetching pending requests count:', error)
      }
    }
    
    fetchPendingCount()
  }, [])

  // Filtered and sorted connections
  const filtered = connections.filter((c) =>
    (specialty === "All" || c.specialties.includes(specialty)) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase()))
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "company") return a.company.localeCompare(b.company);
    return 0; // recently added (default order)
  });

  // Handlers
  const handleRemove = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
    setMoreMenu(null);
  };
  const handleMessage = (id: string) => {
    router.push(`/dashboard/messaging?recipient=${id}`)
  };

  const handleViewInventory = (id: string) => {
    router.push(`/dashboard/shared-inventory?partner=${id}`)
  };
  const handleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };
  const handleBulkRemove = () => {
    setConnections((prev) => prev.filter((c) => !selected.includes(c.id)));
    setSelected([]);
  };
  const handleExport = () => {
    setShowExport(true);
  };
  const handleImport = () => {
    setShowImport(true);
  };
  const handleInvite = () => {
    setShowInvite(true);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Sidebar Filters & Analytics */}
      <aside className="lg:hidden bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="h-5 w-5" /> My Network</h2>
          <button className="text-sm text-emerald-600 font-semibold" onClick={handleInvite}>Invite New</button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-yellow-400" /> Trusted: <span className="font-bold">{trustedCount}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <UserPlus className="h-4 w-4 text-emerald-500" /> New this month: <span className="font-bold">{newThisMonth}</span>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium mb-1">Specialty</label>
          <select className="w-full border rounded px-2 py-1 text-sm" value={specialty} onChange={e => setSpecialty(e.target.value as Specialty | "All")}> 
            <option value="All">All</option>
            {specialtyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-white border border-emerald-600 text-emerald-700 rounded py-2 font-semibold hover:bg-emerald-50 transition flex items-center justify-center gap-2 text-sm min-h-[44px] min-w-[44px]" onClick={handleImport}><Upload className="h-4 w-4" /> Import</button>
          <button className="flex-1 bg-white border border-emerald-600 text-emerald-700 rounded py-2 font-semibold hover:bg-emerald-50 transition flex items-center justify-center gap-2 text-sm min-h-[44px] min-w-[44px]" onClick={handleExport}><Download className="h-4 w-4" /> Export</button>
        </div>
      </aside>
      <aside className="hidden lg:block w-72 bg-white border-r p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Users className="h-5 w-5" /> My Network</h2>
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-yellow-400" /> Trusted: <span className="font-bold">{trustedCount}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <UserPlus className="h-4 w-4 text-emerald-500" /> New this month: <span className="font-bold">{newThisMonth}</span>
          </div>
          {pendingRequestsCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4 text-orange-500" /> Pending: <span className="font-bold">{pendingRequestsCount}</span>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium mb-1">Specialty</label>
          <select className="w-full border rounded px-2 py-1 text-sm" value={specialty} onChange={e => setSpecialty(e.target.value as Specialty | "All")}> 
            <option value="All">All</option>
            {specialtyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <button className="w-full bg-emerald-600 text-white rounded py-2 mt-4 font-semibold hover:bg-emerald-700 transition min-h-[44px] min-w-[44px]" onClick={handleInvite}><UserPlus className="h-4 w-4 mr-1 inline" /> Invite New Connection</button>
        <button className="w-full bg-white border border-emerald-600 text-emerald-700 rounded py-2 mt-2 font-semibold hover:bg-emerald-50 transition flex items-center justify-center gap-2 min-h-[44px] min-w-[44px]" onClick={handleImport}><Upload className="h-4 w-4" /> Import</button>
        <button className="w-full bg-white border border-emerald-600 text-emerald-700 rounded py-2 mt-2 font-semibold hover:bg-emerald-50 transition flex items-center justify-center gap-2 min-h-[44px] min-w-[44px]" onClick={handleExport}><Download className="h-4 w-4" /> Export</button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Discover New Connections Card */}
        <div className="mb-6 sm:mb-8">
          <Link href="/dashboard/search-network" className="block group">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl shadow bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold text-emerald-800 group-hover:text-emerald-900 transition">Discover New Connections</span>
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-emerald-200 text-emerald-800 font-semibold">New</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Expand your professional jewelry network. Find manufacturers, retailers, designers, suppliers, and more.</div>
              </div>
              <button className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm shadow hover:bg-emerald-700 transition group-hover:scale-105 min-h-[44px] min-w-[44px]">Search Network</button>
            </div>
          </Link>
        </div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold my-network-heading">{connections.length.toLocaleString()} connections</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center flex-wrap">
            <div className="relative">
              <input
                type="text"
                className="border rounded px-3 py-1.5 pr-10 text-sm w-full sm:w-64 min-h-[44px] min-w-[44px]"
                placeholder="Search by name or company"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button
              className="flex items-center gap-1 px-3 py-1.5 border rounded text-sm bg-white hover:bg-gray-50 min-h-[44px] min-w-[44px]"
              onClick={() => alert('Advanced filters coming soon!')}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Search with filters</span>
              <span className="sm:hidden">Filters</span>
            </button>
            <select
              className="border rounded px-2 py-1 text-sm min-h-[44px] min-w-[44px]"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {selected.length > 0 && (
              <button className="px-4 py-1.5 border border-red-500 text-red-700 rounded-full font-semibold text-sm hover:bg-red-50 transition min-h-[44px] min-w-[44px]" onClick={handleBulkRemove}>
                Remove Selected ({selected.length})
              </button>
            )}
          </div>
        </div>


        {/* Connection Requests Panel */}
        {pendingRequestsCount > 0 && (
          <div className="mb-6">
            <ConnectionRequestsPanel />
          </div>
        )}

        {/* Connections List */}
        <div className="bg-white rounded-lg shadow divide-y">
          {sorted.map((c) => (
            <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 group hover:bg-emerald-50 transition relative">
              <div className="flex items-center gap-3 sm:gap-4">
                <input type="checkbox" className="mr-2" checked={selected.includes(c.id)} onChange={() => handleSelect(c.id)} aria-label="Select connection" />
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400 overflow-hidden">
                  {c.avatar ? <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" /> : c.name[0]}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowProfile(c)}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{c.name}</span>
                    {c.trusted && <Star className="h-4 w-4 text-yellow-400" aria-label="Trusted" />}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 truncate">{c.title}{c.company && ` at ${c.company}`}</div>
                  <div className="text-xs text-gray-500 truncate">{c.description}</div>
                  <div className="text-xs text-gray-400 mt-1">{c.specialties.join(", ")} • {c.location}</div>
                  <div className="text-xs text-gray-400 mt-1">connected on {c.connectedOn}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                <button
                  className="px-3 sm:px-4 py-1.5 border border-emerald-500 text-emerald-700 rounded-full font-semibold text-xs sm:text-sm hover:bg-emerald-50 transition min-h-[44px] min-w-[44px]"
                  onClick={() => setShowConnectionRequest(c)}
                >
                  Connect
                </button>
                <button
                  className="px-3 sm:px-4 py-1.5 border border-blue-500 text-blue-700 rounded-full font-semibold text-xs sm:text-sm hover:bg-blue-50 transition min-h-[44px] min-w-[44px]"
                  onClick={() => handleMessage(c.id)}
                >
                  Message
                </button>
                <button
                  className="px-3 sm:px-4 py-1.5 border border-purple-500 text-purple-700 rounded-full font-semibold text-xs sm:text-sm hover:bg-purple-50 transition min-h-[44px] min-w-[44px]"
                  onClick={() => handleViewInventory(c.id)}
                >
                  Inventory
                </button>
                <div className="relative">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 min-h-[44px] min-w-[44px]"
                    onClick={() => setMoreMenu(m => m === c.id ? null : c.id)}
                    aria-label="More"
                  >
                    <MoreHorizontal className="h-5 w-5 text-gray-500" />
                  </button>
                  {moreMenu === c.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                      <button
                        className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm hover:bg-gray-50 min-h-[44px] min-w-[44px]"
                        onClick={() => handleRemove(c.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" /> Remove connection
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm hover:bg-gray-50 min-h-[44px] min-w-[44px]"
                        onClick={() => setShowProfile(c)}
                      >
                        <Eye className="h-4 w-4 text-emerald-500" /> View Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-gray-400">No connections found.</div>
          )}
        </div>
      </main>

      {/* Profile Preview Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-4 sm:p-6 relative">
            <button className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 min-h-[44px] min-w-[44px]" onClick={() => setShowProfile(null)} aria-label="Close"><X className="h-5 w-5" /></button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl sm:text-3xl font-bold text-gray-400 overflow-hidden">
                {showProfile.avatar ? <img src={showProfile.avatar} alt={showProfile.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover" /> : showProfile.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base sm:text-lg">{showProfile.name}</span>
                  {showProfile.trusted && <Star className="h-4 w-4 text-yellow-400" aria-label="Trusted" />}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">{showProfile.title}{showProfile.company && ` at ${showProfile.company}`}</div>
                <div className="text-xs text-gray-400">{showProfile.specialties.join(", ")} • {showProfile.location}</div>
              </div>
            </div>
            <div className="mb-2 text-xs sm:text-sm text-gray-700">{showProfile.description}</div>
            <div className="mb-2 text-xs text-gray-500">Connected on {showProfile.connectedOn}</div>
            <div className="mb-2 text-xs text-gray-500">Email: {showProfile.email || "-"}</div>
            <div className="mb-2 text-xs text-gray-500">Phone: {showProfile.phone || "-"}</div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button className="bg-emerald-600 text-white rounded px-4 py-2 font-semibold hover:bg-emerald-700 transition min-h-[44px] min-w-[44px]" onClick={() => alert('Message feature coming soon!')}>Message</button>
              <button className="bg-white border border-emerald-600 text-emerald-700 rounded px-4 py-2 font-semibold hover:bg-emerald-50 transition min-h-[44px] min-w-[44px]" onClick={() => alert('Invite to project coming soon!')}>Invite to Project</button>
            </div>
            <div className="mt-4 text-xs text-gray-400">Notes, tags, and analytics coming soon.</div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-4 sm:p-6 relative">
            <button className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 min-h-[44px] min-w-[44px]" onClick={() => setShowInvite(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            <h2 className="text-lg font-bold mb-4">Invite New Connection</h2>
            <input className="w-full border rounded px-3 py-2 mb-3 min-h-[44px] min-w-[44px]" placeholder="Name or Email" />
            <button className="w-full bg-emerald-600 text-white rounded py-2 font-semibold hover:bg-emerald-700 transition min-h-[44px] min-w-[44px]">Send Invite</button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-4 sm:p-6 relative">
            <button className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 min-h-[44px] min-w-[44px]" onClick={() => setShowImport(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            <h2 className="text-lg font-bold mb-4">Import Connections</h2>
            <input type="file" className="mb-3" />
            <button className="w-full bg-emerald-600 text-white rounded py-2 font-semibold hover:bg-emerald-700 transition min-h-[44px] min-w-[44px]">Import</button>
            <div className="mt-2 text-xs text-gray-500">Supported: CSV, vCard, LinkedIn export</div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-4 sm:p-6 relative">
            <button className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 min-h-[44px] min-w-[44px]" onClick={() => setShowExport(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            <h2 className="text-lg font-bold mb-4">Export Connections</h2>
            <button className="w-full bg-emerald-600 text-white rounded py-2 font-semibold hover:bg-emerald-700 transition mb-2 min-h-[44px] min-w-[44px]">Export as CSV</button>
            <button className="w-full bg-emerald-600 text-white rounded py-2 font-semibold hover:bg-emerald-700 transition min-h-[44px] min-w-[44px]">Export as vCard</button>
            <div className="mt-2 text-xs text-gray-500">Export your network for compliance or marketing.</div>
          </div>
        </div>
      )}

      {/* Connection Request Modal */}
      {showConnectionRequest && (
        <ConnectionRequestModal
          isOpen={!!showConnectionRequest}
          onClose={() => setShowConnectionRequest(null)}
          partner={{
            id: showConnectionRequest.id,
            name: showConnectionRequest.name,
            company: showConnectionRequest.company || '',
            avatar_url: showConnectionRequest.avatar,
            location: showConnectionRequest.location,
            specialties: showConnectionRequest.specialties,
            rating: 0, // Mock rating for now
            description: showConnectionRequest.description
          }}
          onRequestSent={() => {
            // Refresh pending requests count
            setPendingRequestsCount(prev => prev + 1)
          }}
        />
      )}
    </div>
  );
} 