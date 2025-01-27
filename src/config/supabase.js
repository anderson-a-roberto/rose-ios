import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://abkhgnefvzlqqamfpyvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFia2hnbmVmdnpscXFhbWZweXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4ODU1MjgsImV4cCI6MjA0OTQ2MTUyOH0.K-xv30H1ULn7CSsi7yPbnofQR6PsfxXdH7W-WQAtZYc';

console.log('Inicializando cliente Supabase...');
export const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Cliente Supabase inicializado!');