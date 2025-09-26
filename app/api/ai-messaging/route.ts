import { NextRequest, NextResponse } from 'next/server'
import { AIMessagingService } from '@/lib/services/AIMessagingService'

// =====================================================
// AI MESSAGING API
// =====================================================
// This endpoint provides AI-powered messaging features
// Similar to Apple's AI features in Messages app

export async function POST(request: NextRequest) {
  try {
    const service = new AIMessagingService()
    const body = await request.json()
    
    const { action, ...params } = body
    
    switch (action) {
      case 'generate_completions':
        const completionRequest = {
          conversationContext: params.conversationContext || '',
          userInput: params.userInput || '',
          messageHistory: params.messageHistory || [],
          businessContext: params.businessContext || 'general',
          tone: params.tone || 'professional',
          language: params.language || 'en',
          maxLength: params.maxLength || 150
        }
        
        const completions = await service.generateCompletions(completionRequest)
        return NextResponse.json({
          success: true,
          data: completions
        })
        
      case 'get_typing_assistant':
        const typingAssistant = await service.getTypingAssistant(
          params.partialText || '',
          params.context || ''
        )
        return NextResponse.json({
          success: true,
          data: typingAssistant
        })
        
      case 'analyze_conversation':
        const analysis = await service.analyzeConversation(
          params.messages || [],
          params.businessContext || 'general'
        )
        return NextResponse.json({
          success: true,
          data: analysis
        })
        
      case 'analyze_tone':
        const toneAnalysis = await service.analyzeTone(params.message || '')
        return NextResponse.json({
          success: true,
          data: toneAnalysis
        })
        
      case 'check_grammar':
        const grammarCheck = await service.checkGrammar(params.text || '')
        return NextResponse.json({
          success: true,
          data: grammarCheck
        })
        
      case 'analyze_business_context':
        const businessInsights = await service.analyzeBusinessContext({
          conversationContext: params.conversationContext || '',
          userInput: params.userInput || '',
          messageHistory: params.messageHistory || [],
          businessContext: params.businessContext || 'general',
          tone: params.tone || 'professional',
          language: params.language || 'en'
        })
        return NextResponse.json({
          success: true,
          data: businessInsights
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action specified'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in AI messaging API:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process AI messaging request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const service = new AIMessagingService()
    const { searchParams } = new URL(request.url)
    
    const action = searchParams.get('action')
    
    if (action === 'health_check') {
      return NextResponse.json({
        success: true,
        message: 'AI Messaging Service is running',
        features: [
          'Message completions',
          'Real-time typing assistance',
          'Tone analysis',
          'Business insights',
          'Grammar checking',
          'Conversation analysis'
        ]
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action specified'
    }, { status: 400 })
  } catch (error) {
    console.error('Error in AI messaging API GET:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process AI messaging request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
