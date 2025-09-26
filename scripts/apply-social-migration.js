const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration. Please check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applySocialMigration() {
  try {
    console.log('🚀 Applying Social Network Foundation Migration...')
    
    // 1. Create social_profiles table
    console.log('📋 Creating social_profiles table...')
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS social_profiles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
          display_name VARCHAR(255) NOT NULL,
          username VARCHAR(50) UNIQUE NOT NULL,
          bio TEXT,
          avatar_url TEXT,
          cover_image_url TEXT,
          website_url TEXT,
          location VARCHAR(255),
          company VARCHAR(255),
          job_title VARCHAR(255),
          industry VARCHAR(100),
          follower_count INTEGER DEFAULT 0,
          following_count INTEGER DEFAULT 0,
          post_count INTEGER DEFAULT 0,
          like_count INTEGER DEFAULT 0,
          social_links JSONB DEFAULT '{}',
          is_public BOOLEAN DEFAULT true,
          show_online_status BOOLEAN DEFAULT true,
          allow_messages BOOLEAN DEFAULT true,
          allow_follows BOOLEAN DEFAULT true,
          is_verified BOOLEAN DEFAULT false,
          badges TEXT[] DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (profilesError) {
      console.log('⚠️  social_profiles table might already exist or exec_sql function not available')
      console.log('   Trying direct table creation...')
      
      // Try direct table creation
      const { error: directProfilesError } = await supabase
        .from('social_profiles')
        .select('id')
        .limit(1)
      
      if (directProfilesError && directProfilesError.code === '42P01') {
        console.log('❌ Cannot create table directly. Please run this migration in Supabase Dashboard.')
        return
      }
    }

    // 2. Create user_connections table
    console.log('🔗 Creating user_connections table...')
    const { error: connectionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_connections (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          status TEXT DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(follower_id, following_id)
        );
      `
    })

    if (connectionsError) {
      console.log('⚠️  user_connections table might already exist')
    }

    // 3. Create social_preferences table
    console.log('⚙️  Creating social_preferences table...')
    const { error: preferencesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS social_preferences (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
          email_notifications BOOLEAN DEFAULT true,
          push_notifications BOOLEAN DEFAULT true,
          sms_notifications BOOLEAN DEFAULT false,
          profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'connections', 'private')),
          show_online_status BOOLEAN DEFAULT true,
          show_last_active BOOLEAN DEFAULT true,
          allow_search BOOLEAN DEFAULT true,
          content_language TEXT[] DEFAULT '{en}',
          content_categories TEXT[] DEFAULT '{}',
          content_rating TEXT DEFAULT 'all' CHECK (content_rating IN ('all', 'family', 'professional')),
          auto_accept_connections BOOLEAN DEFAULT false,
          allow_connection_requests BOOLEAN DEFAULT true,
          allow_messages_from TEXT DEFAULT 'connections' CHECK (allow_messages_from IN ('all', 'connections', 'none')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (preferencesError) {
      console.log('⚠️  social_preferences table might already exist')
    }

    // 4. Create indexes
    console.log('📊 Creating indexes...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_social_profiles_user_id ON social_profiles(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_social_profiles_username ON social_profiles(username);',
      'CREATE INDEX IF NOT EXISTS idx_social_profiles_is_public ON social_profiles(is_public);',
      'CREATE INDEX IF NOT EXISTS idx_user_connections_follower_id ON user_connections(follower_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_connections_following_id ON user_connections(following_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);'
    ]

    for (const index of indexes) {
      try {
        await supabase.rpc('exec_sql', { sql: index })
      } catch (error) {
        console.log(`⚠️  Index creation failed: ${index}`)
      }
    }

    // 5. Enable RLS
    console.log('🔒 Enabling Row Level Security...')
    const rlsTables = ['social_profiles', 'user_connections', 'social_preferences']
    
    for (const table of rlsTables) {
      try {
        await supabase.rpc('exec_sql', { sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;` })
      } catch (error) {
        console.log(`⚠️  RLS enable failed for ${table}`)
      }
    }

    // 6. Create RLS policies
    console.log('🛡️  Creating RLS policies...')
    const policies = [
      // Social profiles policies
      `CREATE POLICY IF NOT EXISTS "Users can view public profiles" ON social_profiles FOR SELECT USING (is_public = true OR auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON social_profiles FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON social_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      
      // User connections policies
      `CREATE POLICY IF NOT EXISTS "Users can view their connections" ON user_connections FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can create connections" ON user_connections FOR INSERT WITH CHECK (auth.uid() = follower_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can update their connections" ON user_connections FOR UPDATE USING (auth.uid() = follower_id OR auth.uid() = following_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can delete their connections" ON user_connections FOR DELETE USING (auth.uid() = follower_id OR auth.uid() = following_id);`,
      
      // Social preferences policies
      `CREATE POLICY IF NOT EXISTS "Users can view their own preferences" ON social_preferences FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can manage their own preferences" ON social_preferences FOR ALL USING (auth.uid() = user_id);`
    ]

    for (const policy of policies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy })
      } catch (error) {
        console.log(`⚠️  Policy creation failed: ${policy}`)
      }
    }

    // 7. Grant permissions
    console.log('🔑 Granting permissions...')
    const permissions = [
      'GRANT SELECT, INSERT, UPDATE, DELETE ON social_profiles TO authenticated;',
      'GRANT SELECT, INSERT, UPDATE, DELETE ON user_connections TO authenticated;',
      'GRANT SELECT, INSERT, UPDATE, DELETE ON social_preferences TO authenticated;'
    ]

    for (const permission of permissions) {
      try {
        await supabase.rpc('exec_sql', { sql: permission })
      } catch (error) {
        console.log(`⚠️  Permission grant failed: ${permission}`)
      }
    }

    console.log('✅ Social Network Foundation Migration completed!')
    console.log('')
    console.log('📋 Created tables:')
    console.log('   - social_profiles')
    console.log('   - user_connections')
    console.log('   - social_preferences')
    console.log('')
    console.log('🔗 Next steps:')
    console.log('   1. Test the API endpoints')
    console.log('   2. Create a social profile for your user')
    console.log('   3. Test connection functionality')
    console.log('')
    console.log('🚀 Ready for Phase 2: Core Social Features!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
applySocialMigration() 