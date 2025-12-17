// Supabase Edge Function to generate Stream Video tokens
// Deploy with: npx supabase functions deploy create-stream-token

import { StreamClient } from 'npm:@stream-io/node-sdk';

const STREAM_API_KEY = Deno.env.get('STREAM_API_KEY') || '';
const STREAM_API_SECRET = Deno.env.get('STREAM_API_SECRET') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, userName, appointmentId } = await req.json();

    if (!userId || !appointmentId) {
      throw new Error('userId and appointmentId are required');
    }

    // Initialize Stream client
    const client = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

    // Generate user token
    const token = client.generateUserToken({ user_id: userId });

    // Create call ID based on appointment
    const callId = `pav-dental-${appointmentId}`;

    return new Response(
      JSON.stringify({
        token,
        callId,
        apiKey: STREAM_API_KEY,
        userId,
        userName: userName || 'Patient',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error('Error creating Stream token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
