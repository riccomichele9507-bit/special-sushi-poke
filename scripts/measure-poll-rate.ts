// Misura l'intervallo REALE di polling della stampante campionando last_poll_at.
// Run: NODE_OPTIONS=--use-system-ca npx tsx scripts/measure-poll-rate.ts
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const seen: string[] = [];
  console.log("Campiono last_poll_at per 60 secondi...\n");
  for (let i = 0; i < 30; i++) {
    const { data } = await sb
      .from("printer_health")
      .select("last_poll_at")
      .eq("id", 1)
      .maybeSingle();
    const ts = data?.last_poll_at as string | undefined;
    if (ts && !seen.includes(ts)) {
      seen.push(ts);
      console.log(`  poll #${seen.length}: ${ts}`);
    }
    await sleep(2000);
  }

  console.log(`\nPoll distinti in ~60s: ${seen.length}`);
  if (seen.length >= 2) {
    const gaps: number[] = [];
    for (let i = 1; i < seen.length; i++) {
      gaps.push(
        (new Date(seen[i]).getTime() - new Date(seen[i - 1]).getTime()) / 1000,
      );
    }
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    console.log("Intervalli (s):", gaps.map((g) => g.toFixed(1)).join(", "));
    console.log(`\n>>> INTERVALLO MEDIO REALE: ${avg.toFixed(1)} secondi`);
    console.log(`>>> Stima invocazioni/giorno dalla stampante: ${Math.round(86400 / avg)}`);
  } else {
    console.log("Pochi poll rilevati: stampante lenta o offline.");
  }
}

main().catch((e) => console.error("Errore:", e instanceof Error ? e.message : e));
