# Fix para "Database error saving new user" en Supabase Auth

Este error suele aparecer cuando un trigger en `auth.users` falla al intentar sincronizar datos hacia tablas de `public`.

## 1) Aplicar SQL de reparación

En el SQL Editor de Supabase, ejecutá el bloque final de `supabase-schema.sql` (función `public.handle_new_user` y trigger `on_auth_user_created`).

La versión actual está endurecida para **no romper el signup** si falla la sincronización de perfil:
- ignora `email` nulo,
- normaliza metadata vacía (`full_name`, `role`),
- captura excepciones (`undefined_table` y `others`) y retorna `NEW`.

## 2) Diagnosticar con script

Desde `apps/frontend`:

```bash
SUPABASE_URL="https://TU-PROYECTO.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY" \
node scripts/diagnose-supabase-signup.mjs
```

Si devuelve `Database error saving new user`, el script te indica revisar trigger/función.

## 3) Verificación manual mínima

- Intentá registro desde `/register`.
- Confirmá que no aparece el error.
- Revisá si el perfil quedó en `public.usuarios`.

