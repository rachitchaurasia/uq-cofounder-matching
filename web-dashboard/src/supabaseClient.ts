import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oebbdjlfnnjivqsspcuf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lYmJkamxmbm5qaXZxc3NwY3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTQ1NTEsImV4cCI6MjA2Mjc5MDU1MX0.ek52B8QGGXyz1JqubR80eGq2eKWKK9UVcBkHvXDYqxc';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);