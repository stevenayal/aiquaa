import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Sin esto, Next.js cachea el GET en build-time y sirve un conteo fijo.
// Revalidamos cada 60s para reflejar nuevos registros sin pegarle a la DB en cada visita.
export const revalidate = 60;

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase.rpc('get_registered_user_count');
    if (error) throw error;
    return NextResponse.json({ count: data ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
