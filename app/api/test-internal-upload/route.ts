import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test internal upload endpoint called')
    
    const formData = await request.formData()
    const messageId = formData.get('messageId') as string
    const file = formData.get('file') as File
    
    console.log('📝 Received data:', {
      messageId,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    })
    
    return NextResponse.json({
      success: true,
      message: 'Test upload received successfully',
      data: {
        messageId,
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type
      }
    })
    
  } catch (error) {
    console.error('❌ Test upload error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
