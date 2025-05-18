// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseKey = 'your-public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
