import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "./env";

// Public pages read as an anonymous visitor, with no session attached. They only
// ever show published rows anyway, and it keeps a signed-in user's token out of
// the request: a token refreshed a moment ago can be rejected as "issued at
// future" when clocks drift slightly, which would take the homepage down.
let client: ReturnType<typeof createSupabaseClient> | null = null;

export function createPublicClient() {
  client ??= createSupabaseClient(supabaseUrl(), supabaseKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
