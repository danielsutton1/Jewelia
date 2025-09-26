import { NextRequest, NextResponse } from 'next/server'
import { RBACService } from '@/lib/services/RBACService'
import { CreateTeamRequest } from '@/types/rbac'

const rbacService = new RBACService()

export async function GET(request: NextRequest) {
  try {
    const teams = await rbacService.getTeams()
    
    return NextResponse.json({
      success: true,
      data: teams
    })
  } catch (error: any) {
    console.error('Teams API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTeamRequest = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      )
    }

    const team = await rbacService.createTeam(body)

    if (!team) {
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: team
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create team API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
