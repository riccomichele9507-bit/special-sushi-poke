#!/usr/bin/env node
// Crea un utente Admin su Supabase: auth.users (email confermata) + riga in admin_users.
// Idempotente: se l'email esiste già, recupera l'id e aggiunge solo l'admin role.
//
// Uso:
//   node --env-file=.env.local --use-system-ca scripts/create-admin-user.mjs <email> <password> [nome]

const email = process.argv[2];
const password = process.argv[3];
const fullName = process.argv[4] ?? email.split("@")[0];

if (!email || !password) {
  console.error("Uso: create-admin-user.mjs <email> <password> [nome]");
  process.exit(1);
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error("❌ Manca NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

// ----- 1) Crea utente Auth con email già confermata -----
const createRes = await fetch(`${URL}/auth/v1/admin/users`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  }),
});
const createBody = await createRes.json();

let userId;
if (createRes.ok) {
  userId = createBody.id;
  console.log(`✅ Utente creato in auth.users: ${email}\n   id=${userId}`);
} else if (
  createRes.status === 422 ||
  (createBody?.msg ?? "").toLowerCase().includes("already") ||
  (createBody?.message ?? "").toLowerCase().includes("already")
) {
  // Utente già esistente, recupera l'id
  const listRes = await fetch(
    `${URL}/auth/v1/admin/users?filter=${encodeURIComponent(email)}`,
    { headers },
  );
  const listBody = await listRes.json();
  const existing = (listBody.users ?? []).find((u) => u.email === email);
  if (!existing) {
    console.error("❌ Utente già esistente ma non trovato:", createBody);
    process.exit(1);
  }
  userId = existing.id;
  console.log(`⚠️  Utente già esistente in auth.users: ${email}\n   id=${userId}`);
} else {
  console.error(`❌ Errore creazione utente (${createRes.status}):`, createBody);
  process.exit(1);
}

// ----- 2) Inserisci nella tabella admin_users (upsert) -----
const adminRes = await fetch(`${URL}/rest/v1/admin_users`, {
  method: "POST",
  headers: {
    ...headers,
    Prefer: "resolution=merge-duplicates,return=representation",
  },
  body: JSON.stringify({
    user_id: userId,
    notes: `${fullName} — promosso admin via script create-admin-user.mjs`,
  }),
});

if (!adminRes.ok) {
  const body = await adminRes.text();
  console.error(`❌ Errore aggiunta admin role (${adminRes.status}):`, body);
  process.exit(1);
}

console.log(`✅ Admin role assegnato — ${email} ora è amministratore.`);
console.log(`\n🎉 Pronto. Vai su /login → email+password → reindirizzato a /admin.`);
console.log(`   (richiede che le env vars Supabase siano configurate su Vercel).`);
