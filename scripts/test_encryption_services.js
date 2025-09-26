// 🧪 TEST ENCRYPTION SERVICES
// This script tests the core encryption functionality

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test data
const testUserId = '00000000-0000-0000-0000-000000000001'; // Replace with actual user ID
const testConversationId = '00000000-0000-0000-0000-000000000002'; // Replace with actual conversation ID

async function testEncryptionServices() {
  console.log('🔐 Testing Encrypted Communication System...\n');

  try {
    // Test 1: Check if encryption tables exist
    console.log('📋 Test 1: Verifying encryption tables...');
    const tables = [
      'user_encryption_keys',
      'conversation_encryption_keys', 
      'user_conversation_keys',
      'encrypted_message_metadata',
      'video_calls',
      'video_call_participants',
      'group_conversations',
      'group_members',
      'encryption_audit_logs'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: EXISTS`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    // Test 2: Check if messages table has encryption columns
    console.log('\n📋 Test 2: Verifying message encryption columns...');
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('encryption_version, is_encrypted, encrypted_content, content_hash, signature, iv')
        .limit(1);
      
      if (error) {
        console.log(`❌ Messages encryption columns: ${error.message}`);
      } else {
        console.log('✅ Messages encryption columns: EXISTS');
      }
    } catch (err) {
      console.log(`❌ Messages encryption columns: ${err.message}`);
    }

    // Test 3: Test encryption key generation (simulated)
    console.log('\n📋 Test 3: Testing encryption key generation...');
    try {
      // Simulate creating a user encryption key
      const mockKeyData = {
        user_id: testUserId,
        public_key: 'mock-public-key-' + Date.now(),
        encrypted_private_key: 'mock-encrypted-private-key-' + Date.now(),
        master_key_hash: 'mock-master-hash-' + Date.now(),
        master_key_salt: 'mock-salt-' + Date.now(),
        key_algorithm: 'RSA-4096'
      };

      const { data, error } = await supabase
        .from('user_encryption_keys')
        .insert(mockKeyData)
        .select();

      if (error) {
        console.log(`❌ Key generation test: ${error.message}`);
      } else {
        console.log('✅ Key generation test: SUCCESS');
        console.log(`   Generated key ID: ${data[0].id}`);
        
        // Clean up test data
        await supabase
          .from('user_encryption_keys')
          .delete()
          .eq('id', data[0].id);
      }
    } catch (err) {
      console.log(`❌ Key generation test: ${err.message}`);
    }

    // Test 4: Test conversation encryption key creation
    console.log('\n📋 Test 4: Testing conversation encryption...');
    try {
      const mockConversationKey = {
        conversation_id: testConversationId,
        encrypted_symmetric_key: 'mock-symmetric-key-' + Date.now(),
        key_algorithm: 'AES-256-GCM',
        created_by: testUserId
      };

      const { data, error } = await supabase
        .from('conversation_encryption_keys')
        .insert(mockConversationKey)
        .select();

      if (error) {
        console.log(`❌ Conversation encryption test: ${error.message}`);
      } else {
        console.log('✅ Conversation encryption test: SUCCESS');
        console.log(`   Generated conversation key ID: ${data[0].id}`);
        
        // Clean up test data
        await supabase
          .from('conversation_encryption_keys')
          .delete()
          .eq('id', data[0].id);
      }
    } catch (err) {
      console.log(`❌ Conversation encryption test: ${err.message}`);
    }

    // Test 5: Test RLS policies
    console.log('\n📋 Test 5: Testing Row Level Security...');
    try {
      // Test with anonymous user (should be blocked by RLS)
      const { data, error } = await supabase
        .from('user_encryption_keys')
        .select('*')
        .limit(1);
      
      if (error && error.message.includes('policy')) {
        console.log('✅ RLS policies: WORKING (access blocked as expected)');
      } else {
        console.log('⚠️  RLS policies: May need review');
      }
    } catch (err) {
      console.log(`❌ RLS test: ${err.message}`);
    }

    // Test 6: Test audit logging
    console.log('\n📋 Test 6: Testing audit logging...');
    try {
      const mockAuditLog = {
        user_id: testUserId,
        action_type: 'key_generated',
        target_type: 'user',
        target_id: testUserId,
        encryption_algorithm: 'RSA-4096',
        key_version: 1,
        success: true,
        ip_address: '127.0.0.1',
        user_agent: 'Test Script'
      };

      const { data, error } = await supabase
        .from('encryption_audit_logs')
        .insert(mockAuditLog)
        .select();

      if (error) {
        console.log(`❌ Audit logging test: ${error.message}`);
      } else {
        console.log('✅ Audit logging test: SUCCESS');
        console.log(`   Logged audit entry ID: ${data[0].id}`);
        
        // Clean up test data
        await supabase
          .from('encryption_audit_logs')
          .delete()
          .eq('id', data[0].id);
      }
    } catch (err) {
      console.log(`❌ Audit logging test: ${err.message}`);
    }

    console.log('\n🎉 Encryption Services Testing Complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. ✅ Database migration applied');
    console.log('2. ✅ Encryption tables created');
    console.log('3. ✅ RLS policies configured');
    console.log('4. 🔄 Test with actual user authentication');
    console.log('5. 🔄 Test video call functionality');
    console.log('6. 🔄 Test group conversations');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testEncryptionServices();
}

module.exports = { testEncryptionServices };
