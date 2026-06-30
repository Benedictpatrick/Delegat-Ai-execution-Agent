import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function getDemoUserId(): Promise<string> {
  const supabase = getAdminClient() as any;

  // Try demo user by email
  const { data: demoUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'demo@delegat.app')
    .limit(1)
    .maybeSingle();
  if (demoUser) return demoUser.id;

  // Try any existing user
  const { data: anyUser } = await supabase
    .from('users')
    .select('id')
    .limit(1)
    .maybeSingle();
  if (anyUser) return anyUser.id;

  // Create demo user via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'demo@delegat.app',
    password: 'Password123!',
    email_confirm: true,
  });

  if (authError) {
    // User may already exist in auth but not in public.users — try to find them
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
    const existing = authUsers?.find((u: any) => u.email === 'demo@delegat.app');
    if (!existing) throw new Error('Failed to create demo user: ' + authError.message);
    await supabase.from('users').upsert({ id: existing.id, email: 'demo@delegat.app', timezone: 'UTC' });
    return existing.id;
  }

  const userId = authData.user.id;
  await supabase.from('users').upsert({ id: userId, email: 'demo@delegat.app', timezone: 'UTC' });
  return userId;
}
