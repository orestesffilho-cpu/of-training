import { createClient } from '@supabase/supabase-js';

// URL gerada com base no seu Project ID ativo
const supabaseUrl = 'https://folrrnlbuvdczdzzhecl.supabase.co';

// Chave JWT pública fornecida para autenticação local estável
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbHJybmxidXZkY3pkenpoZWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTkyMDUsImV4cCI6MjA5NjQzNTIwNX0.gxZNze0p7xWJrMLDdubW5eQw6ZQGU2kfsJ53NcCGBt4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);