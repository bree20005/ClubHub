import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ssjzaknoqwpegttnahqq.supabase.co"
const supabaseAnonnKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzanpha25vcXdwZWd0dG5haHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMDc1MzAsImV4cCI6MjA2MjU4MzUzMH0.4KucsNCcqNZtCC-kzeBreWXzv0U3QbzbtOUm2PALpbY"

const supabase = createClient(supabaseUrl, supabaseAnonnKey);
export default supabase;