import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Try to query each possible table name to see what exists
    const possibleTables = [
      'social_posts',
      'social_comments',
      'social_post_comments',
      'social_likes',
      'social_post_likes',
      'social_media',
      'social_post_media',
      'social_tags',
      'social_post_tags'
    ]

    const tableResults: any = {}

    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (!error) {
          tableResults[tableName] = {
            exists: true,
            sampleData: data?.[0] || null
          }
        } else {
          tableResults[tableName] = {
            exists: false,
            error: error.message
          }
        }
      } catch (e) {
        tableResults[tableName] = {
          exists: false,
          error: 'Table does not exist'
        }
      }
    }

    // Try to get a sample post to see its structure
    let postStructure = null
    try {
      const { data: samplePost } = await supabase
        .from('social_posts')
        .select('*')
        .limit(1)
        .single()

      if (samplePost) {
        postStructure = {
          columns: Object.keys(samplePost),
          sample: samplePost
        }
      }
    } catch (e) {
      // Ignore errors here
    }

    // Check users table structure
    let usersStructure = null
    try {
      const { data: sampleUser } = await supabase
        .from('users')
        .select('*')
        .limit(1)
        .single()

      if (sampleUser) {
        usersStructure = {
          columns: Object.keys(sampleUser),
          sample: sampleUser
        }
      }
    } catch (e) {
      // Ignore errors here
    }

    // Test different foreign key constraint names
    let foreignKeyTests: Record<string, any> = {}
    
    // Test the constraint name we're using
    try {
      const { data: testPost, error: testError } = await supabase
        .from('social_posts')
        .select(`
          *,
          user:users!social_posts_user_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .limit(1)

      foreignKeyTests['social_posts_user_id_fkey'] = {
        success: !testError,
        error: testError?.message || null,
        hasUserData: !!testPost?.[0]?.user
      }
    } catch (e) {
      foreignKeyTests['social_posts_user_id_fkey'] = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error',
        hasUserData: false
      }
    }

    // Test without constraint name (let Supabase guess)
    try {
      const { data: testPost, error: testError } = await supabase
        .from('social_posts')
        .select(`
          *,
          user:users(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .limit(1)

      foreignKeyTests['users_no_constraint'] = {
        success: !testError,
        error: testError?.message || null,
        hasUserData: !!testPost?.[0]?.user
      }
    } catch (e) {
      foreignKeyTests['users_no_constraint'] = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error',
        hasUserData: false
      }
    }

    // Test the exact query we're using in the service
    let serviceQueryTest = null
    try {
      const { data: testPost, error: testError } = await supabase
        .from('social_posts')
        .select(`
          *,
          user:users!social_posts_user_id_fkey(
            id,
            full_name,
            email,
            avatar_url,
            role,
            location,
            bio
          )
        `)
        .limit(1)

      serviceQueryTest = {
        success: !testError,
        error: testError?.message || null,
        data: testPost?.[0] || null,
        hasUserData: !!testPost?.[0]?.user
      }
    } catch (e) {
      serviceQueryTest = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error',
        data: null,
        hasUserData: false
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        tableResults,
        postStructure,
        usersStructure,
        foreignKeyTests,
        serviceQueryTest
      }
    })

  } catch (error) {
    console.error('Error in check-schema:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
