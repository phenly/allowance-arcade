import { createClient } from '@supabase/supabase-js'
import { createDemoClient } from './demoClient'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Demo mode: run against browser-local sample data instead of a real backend.
// Triggered explicitly (VITE_DEMO_MODE=true) or implicitly whenever no Supabase
// credentials are configured — which is how the public deployment stays a safe,
// throwaway sandbox that can never reach a real family's data.
export const IS_DEMO =
  import.meta.env.VITE_DEMO_MODE === 'true' || !supabaseUrl || !supabaseKey

export const supabase = IS_DEMO
  ? createDemoClient()
  : createClient(supabaseUrl, supabaseKey)
