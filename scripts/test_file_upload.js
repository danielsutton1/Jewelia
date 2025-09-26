// Test File Upload System
// Run this in your browser console on the internal messages page

async function testFileUpload() {
  console.log('🧪 Testing File Upload System...')
  
  try {
    // Test 1: Check if storage bucket exists
    console.log('1️⃣ Checking storage bucket...')
    const bucketResponse = await fetch('/api/internal-messages/upload?messageId=test')
    console.log('Bucket check response:', bucketResponse.status)
    
    // Test 2: Create a test file
    console.log('2️⃣ Creating test file...')
    const testFile = new File(['Hello World! This is a test file.'], 'test.txt', {
      type: 'text/plain'
    })
    
    // Test 3: Try to upload (this will fail without proper message ID, but tests the endpoint)
    console.log('3️⃣ Testing upload endpoint...')
    const formData = new FormData()
    formData.append('file', testFile)
    formData.append('messageId', 'test-message-id')
    formData.append('uploadedBy', 'test-user')
    
    const uploadResponse = await fetch('/api/internal-messages/upload', {
      method: 'POST',
      body: formData
    })
    
    console.log('Upload response status:', uploadResponse.status)
    const uploadResult = await uploadResponse.json()
    console.log('Upload result:', uploadResult)
    
    console.log('✅ File upload test completed!')
    
  } catch (error) {
    console.error('❌ File upload test failed:', error)
  }
}

// Run the test
testFileUpload()
