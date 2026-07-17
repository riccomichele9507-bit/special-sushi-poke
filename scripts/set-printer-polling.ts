// Mette in coda un job di CONFIGURAZIONE per la stampante Star (CloudPRNT):
// cambia il polling_time da remoto, senza toccare il pannello della stampante.
// La stampante scarica il job al prossimo poll, lo applica e conferma.
//
// Formato: Star Configuration Format Spec (rev 2.70), chiave
//   configurations[].password_protected_settings.cloudprnt.polling_time  (1-7200 s)
//
// Run: NODE_OPTIONS=--use-system-ca npx tsx scripts/set-printer-polling.ts <password> <secondi>
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ENV = resolve(process.cwd(), ".env.local");
function v(name: string): string | null {
  if (!existsSync(ENV)) return null;
  const m = readFileSync(ENV, "utf8").match(new RegExp(`^${name}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
}
const sb = createClient(v("NEXT_PUBLIC_SUPABASE_URL")!, v("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const password = process.argv[2];
const seconds = Number.parseInt(process.argv[3] ?? "60", 10);

if (!password) {
  console.error("Uso: npx tsx scripts/set-printer-polling.ts <password-admin-stampante> <secondi>");
  process.exit(1);
}
if (!Number.isFinite(seconds) || seconds < 1 || seconds > 7200) {
  console.error("Secondi ammessi: 1-7200 (da specifica Star).");
  process.exit(1);
}

// SOLO polling_time: nessun'altra impostazione toccata (raggio d'azione minimo).
// device_name è OBBLIGATORIO ("required when a parent element exists", spec pag. 28):
// senza, la stampante scarta il blocco in silenzio. Per TSP143IV il valore è
// "TSP100IV" (spec pag. 32: '"TSP100IV" TSP100IV series').
const config = {
  title: "star_configuration",
  version: "1.3.0",
  configurations: [
    {
      device_name: "TSP100IV",
      password_protected_settings: {
        current_password: password,
        cloudprnt: { polling_time: seconds },
      },
    },
  ],
};

async function main() {
  const payload = Buffer.from(JSON.stringify(config), "utf8").toString("base64");
  const { data, error } = await sb
    .from("print_jobs")
    .insert({
      payload,
      media_type: "application/vnd.star.starconfiguration",
      status: "pending",
      order_id: null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("❌ Errore inserimento job:", error.message);
    process.exit(1);
  }
  console.log("✅ Job di configurazione in coda:", data.id);
  console.log(`   polling_time -> ${seconds} secondi`);
  console.log("   La stampante lo scarica al prossimo poll e lo applica.");
  console.log("\nVerifica con: npx tsx scripts/check-printer.ts");
}

main().catch((e) => console.error("Errore:", e instanceof Error ? e.message : e));
