// supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssjzaknoqwpegttnahqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzanpha25vcXdwZWd0dG5haHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMDc1MzAsImV4cCI6MjA2MjU4MzUzMH0.4KucsNCcqNZtCC-kzeBreWXzv0U3QbzbtOUm2PALpbY'; // from Project Settings > API
// const supabaseKey = process.env.REACT_APP_MY_API_KEY;


export const supabase = createClient(supabaseUrl, supabaseKey);
