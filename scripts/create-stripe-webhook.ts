// Crea (o ricrea) il webhook Stripe LIVE di produzione.
//
// Legge STRIPE_SECRET_KEY da .env.local, crea l'endpoint con i 3 eventi
// realmente gestiti da app/api/stripe/webhook/route.ts, e scrive
// STRIPE_WEBHOOK_SECRET dentro .env.local. Il signing secret NON viene
// mai stampato a schermo (resta solo nel file gitignored).
//
// Run:  npm run stripe:webhook
//   (cross-env NODE_OPTIONS=--use-system-ca → gestisce la TLS con CA aziendale)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";

const ENV_PATH = resolve(process.cwd(), ".env.local");
const WEBHOOK_URL = "https://specialsushipokebari.com/api/stripe/webhook";

// DEVONO combaciare con lo switch in app/api/stripe/webhook/route.ts
const EVENTS: Stripe.WebhookEndpointCreateParams["enabled_events"] = [
  "checkout.session.completed",
  "charge.refunded",
  "payment_intent.payment_failed",
];

function readEnvFile(): string {
  return existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
}

function getVar(content: string, name: string): string | null {
  const m = content.match(new RegExp(`^${name}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
}

function upsertVar(content: string, name: string, value: string): string {
  const line = `${name}=${value}`;
  if (new RegExp(`^${name}=.*$`, "m").test(content)) {
    return content.replace(new RegExp(`^${name}=.*$`, "m"), line);
  }
  return `${content.replace(/\s*$/, "")}\n${line}\n`;
}

async function main(): Promise<void> {
  const key = getVar(readEnvFile(), "STRIPE_SECRET_KEY");

  if (!key) {
    console.error("❌ STRIPE_SECRET_KEY non trovata in .env.local. Aggiungila e rilancia.");
    process.exit(1);
  }
  if (!key.startsWith("sk_live_")) {
    console.error(
      `❌ La chiave in .env.local inizia con "${key.slice(0, 8)}…": NON è una chiave LIVE.\n` +
        "   Per il webhook di produzione serve sk_live_. Inserisci la chiave live e rilancia.",
    );
    process.exit(1);
  }

  const stripe = new Stripe(key);

  // 1) Elimina eventuali webhook già presenti sullo stesso URL (niente doppioni)
  const existing = await stripe.webhookEndpoints.list({ limit: 100 });
  for (const ep of existing.data) {
    if (ep.url === WEBHOOK_URL) {
      await stripe.webhookEndpoints.del(ep.id);
      console.log(`🧹 Rimosso webhook precedente sullo stesso URL: ${ep.id}`);
    }
  }

  // 2) Crea il webhook LIVE
  const ep = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: EVENTS,
    description: "Special Sushi Poke — produzione",
  });

  if (!ep.secret) {
    console.error("❌ Stripe non ha restituito il signing secret. Riprova.");
    process.exit(1);
  }

  // 3) Scrivi il signing secret in .env.local (senza stamparlo)
  writeFileSync(ENV_PATH, upsertVar(readEnvFile(), "STRIPE_WEBHOOK_SECRET", ep.secret), "utf8");

  console.log("\n✅ Webhook LIVE creato:");
  console.log(`   id     : ${ep.id}`);
  console.log(`   url    : ${ep.url}`);
  console.log(`   status : ${ep.status}`);
  console.log(`   eventi : ${(ep.enabled_events ?? []).join(", ")}`);
  console.log("\n✅ STRIPE_WEBHOOK_SECRET scritto in .env.local (nascosto per sicurezza).");
  console.log("👉 Ora le 3 variabili vanno portate su Vercel + redeploy.");
}

main().catch((e) => {
  console.error("❌ Errore:", e instanceof Error ? e.message : e);
  process.exit(1);
});
