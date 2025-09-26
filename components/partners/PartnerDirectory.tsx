import { useState, useEffect } from "react"
import { Partner } from "@/types/partner-management"
import { PartnerCard } from "./partner-card"

export function PartnerDirectory({ onSelectPartner }: { onSelectPartner: (partner: Partner) => void }) {
  const [search, setSearch] = useState("")
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/partners')
        const data = await response.json()
        
        if (data.success) {
          setPartners(data.data || [])
        } else {
          setError('Failed to fetch partners')
        }
      } catch (err) {
        setError('Error loading partners')
        console.error('Error fetching partners:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPartners()
  }, [])

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="w-96 border-r bg-white h-full flex flex-col">
        <div className="p-4 border-b">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Search partners..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center text-gray-500">Loading partners...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-96 border-r bg-white h-full flex flex-col">
        <div className="p-4 border-b">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Search partners..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-96 border-r bg-white h-full flex flex-col">
      <div className="p-4 border-b">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Search partners..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-4">
        {filteredPartners.map(partner => (
          <div key={partner.id} onClick={() => onSelectPartner(partner)} style={{ cursor: 'pointer' }}>
            <PartnerCard 
              partner={partner}
              onRequest={() => {}}
              onMessage={() => {}}
              onViewProfile={() => onSelectPartner(partner)}
            />
          </div>
        ))}
        {filteredPartners.length === 0 && (
          <div className="text-gray-400 text-center">
            {search ? 'No partners found matching your search.' : 'No partners available.'}
          </div>
        )}
      </div>
    </div>
  )
} 