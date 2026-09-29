import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

let localSecrets: any = {};
try {
  const secretsPath = path.join(process.cwd(), 'data', 'supabase-secrets.json');
  if (fs.existsSync(secretsPath)) {
    localSecrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
  }
} catch {
  // Silent fallback
}

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  localSecrets.supabaseUrl ||
  'https://pyeeubnlblmvxqavvjtv.supabase.co';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  localSecrets.supabaseKey ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  localSecrets.supabasePublishableKey ||
  '';

export const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const isSupabaseConfigured = () => {
  return Boolean(supabaseKey && supabaseKey.length > 20);
};

export const syncRegistrationToSupabase = async (registration: any) => {
  if (!supabase) return { success: false, reason: 'Supabase anon/service key not set' };
  try {
    const { data, error } = await supabase.from('registrations').upsert(
      {
        id: registration.id,
        code: registration.code,
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        birth_date: registration.birthDate,
        age: registration.age,
        city: registration.city,
        state: registration.state,
        organization: registration.organization,
        ticket_type: registration.ticketType,
        status: registration.status,
        checked_in_at: registration.checkedInAt,
        checked_in_by: registration.checkedInBy,
        created_at: registration.createdAt,
      },
      { onConflict: 'code' }
    );
    if (error) {
      console.warn('Supabase sync error:', error.message);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err: any) {
    console.warn('Supabase sync exception:', err.message);
    return { success: false, error: err };
  }
};
