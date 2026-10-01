/**
 * Supabase Client Configuration for Next.js Frontend
 */
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project-id.supabase.co",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key",
  isConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
};

export async function fetchSupabaseTable<T = any>(table: string, query: string = ""): Promise<T[]> {
  if (!SUPABASE_CONFIG.isConfigured) {
    return [];
  }
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
      },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn(`[Supabase] Table fetch failed for ${table}:`, err);
    return [];
  }
}
