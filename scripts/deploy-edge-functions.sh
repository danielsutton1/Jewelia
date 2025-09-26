#!/bin/bash

# Deploy send-email function
echo "Deploying send-email function..."
supabase functions deploy send-email --project-ref your-project-ref

# Set environment variables
echo "Setting environment variables..."
supabase secrets set RESEND_API_KEY=your-resend-api-key --project-ref your-project-ref

echo "Deployment complete!" 