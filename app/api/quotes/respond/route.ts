import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tracking = searchParams.get('tracking');
    const action = searchParams.get('action');

    if (!tracking || !action) {
      return NextResponse.json(
        { error: 'Missing tracking or action parameters' },
        { status: 400 }
      );
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "decline"' },
        { status: 400 }
      );
    }

    // Extract quote number from tracking ID
    const quoteNumber = tracking.split('_')[1];
    
    console.log('Quote response received:', {
      tracking,
      action,
      quoteNumber,
      timestamp: new Date().toISOString(),
    });

    // In a real application, you would:
    // 1. Validate the tracking ID
    // 2. Update the quote status in the database
    // 3. Send confirmation emails
    // 4. Log the response for analytics

    // For demo purposes, we'll show a success page
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quote Response - Jewelia CRM</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { 
            max-width: 500px; 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
          }
          .icon { 
            font-size: 64px; 
            margin-bottom: 20px; 
          }
          .success { color: #27ae60; }
          .decline { color: #e74c3c; }
          h1 { color: #333; margin-bottom: 20px; }
          p { color: #666; margin-bottom: 15px; }
          .quote-number { 
            background: #f8f9fa; 
            padding: 10px; 
            border-radius: 6px; 
            font-weight: bold; 
            color: #333;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon ${action === 'accept' ? 'success' : 'decline'}">
            ${action === 'accept' ? '✓' : '✗'}
          </div>
          <h1>Quote ${action === 'accept' ? 'Accepted' : 'Declined'}</h1>
          <div class="quote-number">${quoteNumber}</div>
          <p>
            ${action === 'accept' 
              ? 'Thank you for accepting our quote! We will contact you shortly to proceed with your order.' 
              : 'Thank you for your response. We understand and appreciate you considering our services.'
            }
          </p>
          <p>
            <strong>Response received:</strong> ${new Date().toLocaleString()}
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            This response has been automatically recorded in our system.
          </p>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error processing quote response:', error);
    return NextResponse.json(
      { error: 'Failed to process quote response' },
      { status: 500 }
    );
  }
} 