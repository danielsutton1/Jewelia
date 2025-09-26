import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface Partner {
  id: string
  name: string
  type: 'supplier' | 'distributor' | 'manufacturer' | 'service_provider' | 'collaborator'
  email: string
  phone: string
  address: string
  website: string
  contactPerson: string
  description: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  rating: number
  notes: string
  specialties: string[]
  certifications: string[]
  paymentTerms: string
  leadTime: string
  minimumOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreatePartnerRequest {
  name: string
  type: Partner['type']
  email?: string
  phone?: string
  address?: string
  website?: string
  contactPerson?: string
  description?: string
  status?: Partner['status']
  rating?: number
  notes?: string
  specialties?: string[]
  certifications?: string[]
  paymentTerms?: string
  leadTime?: string
  minimumOrder?: number
}

export interface UpdatePartnerRequest extends Partial<CreatePartnerRequest> {
  id: string
}

export interface PartnerRelationship {
  id: string
  partnerId: string
  relatedPartnerId: string
  relationshipType: 'supplier' | 'customer' | 'competitor' | 'collaborator'
  strength: 'weak' | 'moderate' | 'strong'
  notes: string
  createdAt: string
}

export interface PartnerRequest {
  id: string
  partnerId: string
  type: 'partnership' | 'supply_agreement' | 'service_contract' | 'collaboration'
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  title: string
  description: string
  terms: string
  startDate: string
  endDate?: string
  value?: number
  notes: string
  createdAt: string
  updatedAt: string
}

export class PartnerService {
  private supabase: any

  constructor() {
    this.supabase = null
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createSupabaseServerClient()
    }
    return this.supabase
  }

  async create(data: CreatePartnerRequest): Promise<Partner> {
    const supabase = await this.getSupabase()

    const partnerData = {
      name: data.name,
      type: data.type,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      website: data.website || '',
      contact_person: data.contactPerson || '',
      description: data.description || '',
      status: data.status || 'active',
      rating: data.rating || 0,
      notes: data.notes || '',
      specialties: data.specialties || [],
      certifications: data.certifications || [],
      payment_terms: data.paymentTerms || '',
      lead_time: data.leadTime || '',
      minimum_order: data.minimumOrder || 0
    }

    const { data: partner, error } = await supabase
      .from('partners')
      .insert([partnerData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create partner: ${error.message}`)
    }

    return this.mapDatabaseToPartner(partner)
  }

  async getById(id: string): Promise<Partner | null> {
    const supabase = await this.getSupabase()

    const { data: partner, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch partner: ${error.message}`)
    }

    return this.mapDatabaseToPartner(partner)
  }

  async update(data: UpdatePartnerRequest): Promise<Partner> {
    const supabase = await this.getSupabase()

    const updateData: any = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.type !== undefined) updateData.type = data.type
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.address !== undefined) updateData.address = data.address
    if (data.website !== undefined) updateData.website = data.website
    if (data.contactPerson !== undefined) updateData.contact_person = data.contactPerson
    if (data.description !== undefined) updateData.description = data.description
    if (data.status !== undefined) updateData.status = data.status
    if (data.rating !== undefined) updateData.rating = data.rating
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.specialties !== undefined) updateData.specialties = data.specialties
    if (data.certifications !== undefined) updateData.certifications = data.certifications
    if (data.paymentTerms !== undefined) updateData.payment_terms = data.paymentTerms
    if (data.leadTime !== undefined) updateData.lead_time = data.leadTime
    if (data.minimumOrder !== undefined) updateData.minimum_order = data.minimumOrder

    const { data: partner, error } = await supabase
      .from('partners')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update partner: ${error.message}`)
    }

    return this.mapDatabaseToPartner(partner)
  }

  async delete(id: string): Promise<void> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete partner: ${error.message}`)
    }
  }

  async list(filters?: {
    search?: string
    type?: Partner['type']
    status?: Partner['status']
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{ data: Partner[], pagination: any }> {
    const supabase = await this.getSupabase()

    let query = supabase
      .from('partners')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    // Apply sorting and pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 50
    const offset = (page - 1) * limit
    const sortBy = filters?.sortBy || 'created_at'
    const sortOrder = filters?.sortOrder || 'desc'

    const { data: partners, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Failed to fetch partners: ${error.message}`)
    }

    return {
      data: (partners || []).map((partner: any) => this.mapDatabaseToPartner(partner)),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  async createRelationship(data: {
    partnerId: string
    relatedPartnerId: string
    relationshipType: PartnerRelationship['relationshipType']
    strength: PartnerRelationship['strength']
    notes?: string
  }): Promise<PartnerRelationship> {
    const supabase = await this.getSupabase()

    const relationshipData = {
      partner_a: data.partnerId,
      partner_b: data.relatedPartnerId,
      relationship_type: data.relationshipType,
      strength: data.strength,
      notes: data.notes || ''
    }

    const { data: relationship, error } = await supabase
      .from('partner_relationships')
      .insert([relationshipData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create relationship: ${error.message}`)
    }

    return this.mapDatabaseToRelationship(relationship)
  }

  async getRelationships(partnerId: string): Promise<PartnerRelationship[]> {
    const supabase = await this.getSupabase()

    // Check if partner_id column exists, if not use partner_a and partner_b
    const { data: relationships, error } = await supabase
      .from('partner_relationships')
      .select('*')
      .or(`partner_a.eq.${partnerId},partner_b.eq.${partnerId}`)

    if (error) {
      // If the error is about column not existing, try with the correct column names
      if (error.message.includes('partner_id') && error.message.includes('does not exist')) {
        const { data: relationshipsAlt, error: errorAlt } = await supabase
          .from('partner_relationships')
          .select('*')
          .or(`partner_a.eq.${partnerId},partner_b.eq.${partnerId}`)
        
        if (errorAlt) {
          throw new Error(`Failed to fetch relationships: ${errorAlt.message}`)
        }
        
        return (relationshipsAlt || []).map((rel: any) => this.mapDatabaseToRelationship(rel))
      }
      
      throw new Error(`Failed to fetch relationships: ${error.message}`)
    }

    return (relationships || []).map((rel: any) => this.mapDatabaseToRelationship(rel))
  }

  async createRequest(data: {
    partnerId: string
    type: PartnerRequest['type']
    title: string
    description: string
    terms: string
    startDate: string
    endDate?: string
    value?: number
    notes?: string
  }): Promise<PartnerRequest> {
    const supabase = await this.getSupabase()

    const requestData = {
      partner_id: data.partnerId,
      type: data.type,
      title: data.title,
      description: data.description,
      terms: data.terms,
      start_date: data.startDate,
      end_date: data.endDate,
      value: data.value,
      notes: data.notes || '',
      status: 'pending'
    }

    const { data: request, error } = await supabase
      .from('partner_requests')
      .insert([requestData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create request: ${error.message}`)
    }

    return this.mapDatabaseToRequest(request)
  }

  async updateRequestStatus(id: string, status: PartnerRequest['status']): Promise<PartnerRequest> {
    const supabase = await this.getSupabase()

    const { data: request, error } = await supabase
      .from('partner_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update request: ${error.message}`)
    }

    return this.mapDatabaseToRequest(request)
  }

  async getRequests(filters?: {
    partnerId?: string
    type?: PartnerRequest['type']
    status?: PartnerRequest['status']
    page?: number
    limit?: number
  }): Promise<{ data: PartnerRequest[], pagination: any }> {
    const supabase = await this.getSupabase()

    let query = supabase
      .from('partner_requests')
      .select('*', { count: 'exact' })

    if (filters?.partnerId) {
      query = query.eq('partner_id', filters.partnerId)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const offset = (page - 1) * limit

    const { data: requests, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Failed to fetch requests: ${error.message}`)
    }

    return {
      data: (requests || []).map((req: any) => this.mapDatabaseToRequest(req)),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  async getAnalytics(): Promise<{
    totalPartners: number
    activePartners: number
    partnersByType: Record<string, number>
    averageRating: number
    topPartners: Partner[]
    recentRequests: PartnerRequest[]
  }> {
    const supabase = await this.getSupabase()

    // Get total partners
    const { count: totalPartners } = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true })

    // Get active partners
    const { count: activePartners } = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get partners by type
    const { data: partnersByType } = await supabase
      .from('partners')
      .select('type')

    const typeCounts: Record<string, number> = {}
    partnersByType?.forEach((partner: any) => {
      typeCounts[partner.type] = (typeCounts[partner.type] || 0) + 1
    })

    // Get average rating
    const { data: ratings } = await supabase
      .from('partners')
      .select('rating')
      .gt('rating', 0)

    const averageRating = ratings && ratings.length > 0
      ? ratings.reduce((sum: number, p: any) => sum + p.rating, 0) / ratings.length
      : 0

    // Get top partners by rating
    const { data: topPartners } = await supabase
      .from('partners')
      .select('*')
      .gt('rating', 0)
      .order('rating', { ascending: false })
      .limit(5)

    // Get recent requests
    const { data: recentRequests } = await supabase
      .from('partner_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    return {
      totalPartners: totalPartners || 0,
      activePartners: activePartners || 0,
      partnersByType: typeCounts,
      averageRating: Math.round(averageRating * 100) / 100,
      topPartners: (topPartners || []).map((partner: any) => this.mapDatabaseToPartner(partner)),
      recentRequests: (recentRequests || []).map((r: any) => this.mapDatabaseToRequest(r))
    }
  }

  private mapDatabaseToPartner(dbPartner: any): Partner {
    return {
      id: dbPartner.id,
      name: dbPartner.name,
      type: dbPartner.type,
      email: dbPartner.email,
      phone: dbPartner.phone,
      address: dbPartner.address,
      website: dbPartner.website,
      contactPerson: dbPartner.contact_person,
      description: dbPartner.description,
      status: dbPartner.status,
      rating: dbPartner.rating,
      notes: dbPartner.notes,
      specialties: dbPartner.specialties || [],
      certifications: dbPartner.certifications || [],
      paymentTerms: dbPartner.payment_terms,
      leadTime: dbPartner.lead_time,
      minimumOrder: dbPartner.minimum_order,
      createdAt: dbPartner.created_at,
      updatedAt: dbPartner.updated_at
    }
  }

  private mapDatabaseToRelationship(dbRel: any): PartnerRelationship {
    return {
      id: dbRel.id,
      partnerId: dbRel.partner_a,
      relatedPartnerId: dbRel.partner_b,
      relationshipType: dbRel.relationship_type || 'collaborator',
      strength: dbRel.strength || 'moderate',
      notes: dbRel.notes || '',
      createdAt: dbRel.created_at
    }
  }

  private mapDatabaseToRequest(dbReq: any): PartnerRequest {
    return {
      id: dbReq.id,
      partnerId: dbReq.partner_id,
      type: dbReq.type,
      status: dbReq.status,
      title: dbReq.title,
      description: dbReq.description,
      terms: dbReq.terms,
      startDate: dbReq.start_date,
      endDate: dbReq.end_date,
      value: dbReq.value,
      notes: dbReq.notes,
      createdAt: dbReq.created_at,
      updatedAt: dbReq.updated_at
    }
  }
} 