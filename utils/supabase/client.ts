import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Há credenciais Supabase configuradas? Define se o app usa DB ou mock. */
export function hasSupabaseEnv(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

/** Client browser (@supabase/ssr), chave publishable, leitura pública via RLS. */
export const createClient = () => createBrowserClient(supabaseUrl!, supabaseKey!);
