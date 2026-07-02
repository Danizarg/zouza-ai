/**
 * Aurora Homes runs in two modes:
 *  - Supabase mode: env vars are set, data/auth/storage go through Supabase.
 *  - Mock mode: no env vars needed, the whole app works on realistic demo data.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
