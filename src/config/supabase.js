import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

console.log('Inicializando cliente Supabase...');

const supabaseUrl = 'https://abkhgnefvzlqqamfpyvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFia2hnbmVmdnpscXFhbWZweXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4ODU1MjgsImV4cCI6MjA0OTQ2MTUyOH0.K-xv30H1ULn7CSsi7yPbnofQR6PsfxXdH7W-WQAtZYc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      async getItem(key) {
        try {
          return null;
        } catch (e) {
          console.error('Error getting item from storage:', e);
          return null;
        }
      },
      async setItem(key, value) {
        try {
          // noop
        } catch (e) {
          console.error('Error setting item to storage:', e);
        }
      },
      async removeItem(key) {
        try {
          // noop
        } catch (e) {
          console.error('Error removing item from storage:', e);
        }
      },
    },
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

console.log('Cliente Supabase inicializado!');