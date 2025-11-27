// Supabase client initialization
// Fill in your project URL and anon key from Supabase dashboard
// Project Settings -> API -> Project URL & anon public key

// Replace these placeholders with your actual values
const SUPABASE_URL = 'https://pqicjbfqjydibiouvzgt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaWNqYmZxanlkaWJpb3V2emd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTk1MzksImV4cCI6MjA3NzY3NTUzOX0.7jMABqPocJP1SMo0iXlXNwbRW91DzXOUU7FlJXCwdW4';

// Guard against missing library
if (typeof supabase === 'undefined') {
  console.error('Supabase JS library not loaded. Ensure the CDN script is included before supabaseClient.js');
} else {
  window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}