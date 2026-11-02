import { createBrowserClient } from "@supabase/ssr";

// Connects to Supabase from code that runs in the visitor's browser.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
