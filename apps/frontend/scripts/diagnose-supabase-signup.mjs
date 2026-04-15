#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Faltan variables requeridas: SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = `signup_diagnostic_${Date.now()}@example.com`;
const password = `Diag${Date.now()}Aa!`;

console.log('🔎 Probando creación de usuario en Supabase Auth...');
console.log(`Proyecto: ${SUPABASE_URL}`);
console.log(`Email de prueba: ${email}`);

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: false,
  user_metadata: {
    full_name: 'Signup Diagnostic',
    role: 'comunidad',
  },
});

if (error) {
  console.error('\n❌ Error al crear usuario');
  console.error(`Mensaje: ${error.message}`);
  console.error(`Status: ${error.status ?? 'N/A'}`);
  if (error.message?.toLowerCase().includes('database error saving new user')) {
    console.error('\n💡 Diagnóstico: hay un trigger/función en auth.users o una dependencia en public que está rompiendo el signup.');
    console.error('   Ejecuta el bloque de reparación de supabase-schema.sql (handle_new_user + trigger on_auth_user_created).');
  }
  process.exit(2);
}

console.log(`\n✅ Usuario creado: ${data.user?.id}`);

if (data.user?.id) {
  const { error: deleteError } = await supabase.auth.admin.deleteUser(data.user.id);
  if (deleteError) {
    console.warn(`⚠️ No se pudo borrar el usuario de prueba ${data.user.id}: ${deleteError.message}`);
  } else {
    console.log('🧹 Usuario de prueba eliminado.');
  }
}

console.log('\n✅ Diagnóstico completado.');
