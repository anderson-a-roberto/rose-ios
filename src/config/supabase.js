import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://asmzdxzpzommleypocli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbXpkeHpwem9tbWxleXBvY2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4NDU0NjgsImV4cCI6MjA0ODQyMTQ2OH0.iwoRu2DNz2EY5fsT4WQDLol--zyd1B58_m_Qv6Lm4r8';

console.log('Inicializando cliente Supabase...');
export const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Cliente Supabase inicializado!'); 