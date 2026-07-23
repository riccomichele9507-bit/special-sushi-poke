"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  DEFAULT_CRITERIA,
  SEGMENT_PRESETS,
  type SegmentCriteria,
} from "@/lib/marketing/segments";
import { EMAIL_TEMPLATES, type EmailTemplate } from "@/data/email-templates";
import {
  previewSegment,
  sendCampaign,
  type PreviewResult,
  type SendCampaignResult,
} from "@/app/actions/admin/marketing";

type CategoryOpt = { id: string; label: string };
type CodeOpt = { code: string; label: string | null };

const DEFAULT_MESSAGE =
  "Torna a trovarci da Special Sushi Poke! Sushi e poke freschi, consegna gratis a Bari. Ti aspettiamo.";

function euro(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

/** Traduce i criteri attivi (diversi dal default) in etichette leggibili. */
function activeConditions(
  c: SegmentCriteria,
  catLabel: (id: string) => string,
): string[] {
  const out: string[] = [];
  if (c.consent === "consenting") out.push("con consenso");
  if (c.consent === "non_consenting") out.push("senza consenso");
  if (c.registration === "registered") out.push("registrati");
  if (c.registration === "guest") out.push("guest (senza account)");
  if (c.orderActivity === "has_ordered") out.push("ha ordinato");
  if (c.orderActivity === "never") out.push("mai ordinato");
  if (c.registeredWithinDays != null) out.push(`iscritti da ≤${c.registeredWithinDays}gg`);
  if (c.inactiveDays != null) out.push(`non ordina da ≥${c.inactiveDays}gg`);
  if (c.minOrders != null) out.push(`≥${c.minOrders} ordini`);
  if (c.minSpentCents != null) out.push(`spesa ≥ €${Math.round(c.minSpentCents / 100)}`);
  if (c.orderType === "delivery") out.push("ordina in consegna");
  if (c.orderType === "pickup") out.push("ordina al ritiro");
  if (c.categoryId) out.push(`categoria: ${catLabel(c.categoryId)}`);
  if (c.discountUse === "used_any") out.push("ha usato uno sconto");
  if (c.discountUse === "never_used") out.push("mai usato sconti");
  if (c.discountUse === "used_specific" && c.discountCode) out.push(`ha usato ${c.discountCode}`);
  return out;
}

export function CampaignBuilder({
  categories,
  discountCodes,
}: {
  categories: CategoryOpt[];
  discountCodes: CodeOpt[];
}) {
  const [criteria, setCriteria] = useState<SegmentCriteria>(DEFAULT_CRITERIA);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [promoCode, setPromoCode] = useState<string>("");
  const [includeNoConsent, setIncludeNoConsent] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [sampleQuery, setSampleQuery] = useState("");

  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewing, startPreview] = useTransition();
  const [sending, startSend] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = useCallback(<K extends keyof SegmentCriteria>(key: K, value: SegmentCriteria[K]) => {
    setCriteria((c) => ({ ...c, [key]: value }));
    setActivePreset(null);
  }, []);

  const runPreview = useCallback((c: SegmentCriteria) => {
    startPreview(async () => {
      const r = await previewSegment(c);
      setPreview(r);
    });
  }, []);

  // Anteprima live (debounce 350ms) a ogni cambio criteri.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runPreview(criteria), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [criteria, runPreview]);

  const applyPreset = (id: string, c: SegmentCriteria) => {
    setCriteria(c);
    setActivePreset(id);
  };

  const applyTemplate = (t: EmailTemplate) => {
    setSubject(t.subject);
    setMessage(t.message);
    setPromoCode(t.suggestedPromoCode ?? "");
    if (t.suggestedPresetId) {
      const p = SEGMENT_PRESETS.find((x) => x.id === t.suggestedPresetId);
      if (p) {
        setCriteria(p.criteria);
        setActivePreset(p.id);
      }
    }
    toast.success(`Template "${t.label}" caricato. Controlla e invia.`);
  };

  const reachableForce =
    preview?.ok ? preview.total - preview.suppressed : 0;
  const target = includeNoConsent ? reachableForce : preview?.ok ? preview.reachableDefault : 0;

  const handleSend = () => {
    if (!subject.trim() || subject.trim().length < 3) {
      toast.error("Scrivi un oggetto (min 3 caratteri).");
      return;
    }
    if (message.trim().length < 5) {
      toast.error("Scrivi un messaggio.");
      return;
    }
    if (target === 0) {
      toast.error("Nessun destinatario con questi filtri.");
      return;
    }
    if (includeNoConsent) {
      if (
        !confirm(
          "⚠️ ATTENZIONE: stai per scrivere ANCHE a chi NON ha dato il consenso marketing.\n\nÈ un rischio legale (GDPR) e per la reputazione del dominio email: se qualcuno segnala spam, le email possono smettere di arrivare — anche quelle degli ordini.\n\nVuoi davvero continuare?",
        )
      )
        return;
      if (
        !confirm(
          `Ultima conferma: invio a ${reachableForce} destinatari INCLUSI i non consenzienti. Procedo?`,
        )
      )
        return;
    } else {
      if (!confirm(`Inviare la campagna a ${target} destinatari con consenso?`)) return;
    }

    startSend(async () => {
      const r: SendCampaignResult = await sendCampaign(criteria, {
        subject: subject.trim(),
        message: message.trim(),
        promoCode: promoCode || null,
        includeNoConsent,
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      const bits = [`Inviate ${r.sent} email`];
      if (r.skippedNoConsent > 0) bits.push(`${r.skippedNoConsent} saltati (no consenso)`);
      if (r.suppressed > 0) bits.push(`${r.suppressed} disiscritti esclusi`);
      if (r.capped) bits.push("invio troncato dal limite mensile Resend");
      toast.success(bits.join(" · "));
      runPreview(criteria);
    });
  };

  const conditions = activeConditions(
    criteria,
    (id) => categories.find((c) => c.id === id)?.label ?? id,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Colonna sinistra: filtri + compose */}
      <div className="space-y-6">
        {/* Preset */}
        <section className="rounded-xl border border-bamboo/20 p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Segmenti rapidi</h2>
          <div className="flex flex-wrap gap-2">
            {SEGMENT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                title={p.description}
                onClick={() => applyPreset(p.id, p.criteria)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  activePreset === p.id
                    ? "border-bamboo bg-bamboo text-paper"
                    : "border-bamboo/25 bg-paper text-warm-gray hover:border-bamboo/50"
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => applyPreset("__reset", DEFAULT_CRITERIA)}
              className="rounded-full border border-bamboo/25 bg-paper px-3 py-1 text-xs text-warm-gray hover:border-bamboo/50"
            >
              Azzera filtri
            </button>
          </div>
        </section>

        {/* Filtri componibili */}
        <section className="rounded-xl border border-bamboo/20 p-4">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-ink">Filtri</h2>
            <p className="text-xs text-warm-gray">
              Puoi combinarne quanti vuoi: si sommano <strong>tutti insieme</strong> (E).
              Es. <em>registrati</em> + <em>mai ordinato</em> + <em>con consenso</em>.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Consenso marketing">
              <Select
                value={criteria.consent}
                onChange={(v) => set("consent", v as SegmentCriteria["consent"])}
                options={[
                  ["any", "Tutti"],
                  ["consenting", "Solo con consenso"],
                  ["non_consenting", "Solo senza consenso"],
                ]}
              />
            </Field>

            <Field label="Tipo cliente">
              <Select
                value={criteria.registration}
                onChange={(v) => set("registration", v as SegmentCriteria["registration"])}
                options={[
                  ["any", "Tutti"],
                  ["registered", "Registrati"],
                  ["guest", "Guest (senza account)"],
                ]}
              />
            </Field>

            <Field label="Attività d'ordine">
              <Select
                value={criteria.orderActivity}
                onChange={(v) => set("orderActivity", v as SegmentCriteria["orderActivity"])}
                options={[
                  ["any", "Tutti"],
                  ["has_ordered", "Ha ordinato almeno 1 volta"],
                  ["never", "Mai ordinato"],
                ]}
              />
            </Field>

            <Field label="Non ordina da (giorni)">
              <NumberInput
                value={criteria.inactiveDays}
                min={1}
                placeholder="es. 30"
                onChange={(v) => set("inactiveDays", v)}
              />
            </Field>

            <Field label="N. ordini minimo">
              <NumberInput
                value={criteria.minOrders}
                min={1}
                placeholder="es. 2"
                onChange={(v) => set("minOrders", v)}
              />
            </Field>

            <Field label="Spesa totale minima (€)">
              <NumberInput
                value={criteria.minSpentCents == null ? null : Math.round(criteria.minSpentCents / 100)}
                min={0}
                placeholder="es. 60"
                onChange={(v) => set("minSpentCents", v == null ? null : v * 100)}
              />
            </Field>

            <Field label="Iscritti da meno di (giorni)">
              <NumberInput
                value={criteria.registeredWithinDays}
                min={1}
                placeholder="es. 30"
                onChange={(v) => set("registeredWithinDays", v)}
              />
            </Field>

            <Field label="Preferenza ordine">
              <Select
                value={criteria.orderType}
                onChange={(v) => set("orderType", v as SegmentCriteria["orderType"])}
                options={[
                  ["any", "Indifferente"],
                  ["delivery", "Ordina in consegna"],
                  ["pickup", "Ordina al ritiro"],
                ]}
              />
            </Field>

            <Field label="Ha ordinato la categoria">
              <Select
                value={criteria.categoryId ?? ""}
                onChange={(v) => set("categoryId", v || null)}
                options={[["", "Qualsiasi"], ...categories.map((c) => [c.id, c.label] as [string, string])]}
              />
            </Field>

            <Field label="Uso codici sconto">
              <Select
                value={criteria.discountUse}
                onChange={(v) => set("discountUse", v as SegmentCriteria["discountUse"])}
                options={[
                  ["any", "Indifferente"],
                  ["used_any", "Ha usato uno sconto"],
                  ["never_used", "Non ha mai usato sconti"],
                  ["used_specific", "Ha usato un codice specifico"],
                ]}
              />
            </Field>

            {criteria.discountUse === "used_specific" && (
              <Field label="Codice specifico">
                <Select
                  value={criteria.discountCode ?? ""}
                  onChange={(v) => set("discountCode", v || null)}
                  options={[
                    ["", "Seleziona…"],
                    ...discountCodes.map((c) => [c.code, c.code] as [string, string]),
                  ]}
                />
              </Field>
            )}
          </div>
        </section>

        {/* Template pronti (prima di Componi email) */}
        <section className="rounded-xl border border-bamboo/20 p-4">
          <h2 className="text-sm font-semibold text-ink">Template pronti</h2>
          <p className="mb-3 text-xs text-warm-gray">
            Scegli un template: imposta con un click segmento, oggetto, messaggio e
            (dove previsto) il codice sconto. Poi controlli l&apos;anteprima e invii.
          </p>
          {(["offerta", "annuncio"] as const).map((g) => (
            <div key={g} className="mb-3 last:mb-0">
              <div className="mb-1.5 text-xs font-medium text-warm-gray">
                {g === "offerta" ? "Con offerta (sconto)" : "Senza sconto (annunci)"}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {EMAIL_TEMPLATES.filter((t) => t.group === g).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="rounded-lg border border-bamboo/20 p-3 text-left transition-colors hover:border-bamboo/50 hover:bg-bamboo/5"
                  >
                    <div className="text-sm font-medium text-ink">{t.label}</div>
                    <div className="text-xs text-warm-gray">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Componi email */}
        <section className="rounded-xl border border-bamboo/20 p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Componi email</h2>
          <div className="space-y-3">
            <Field label="Oggetto">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={150}
                placeholder="es. Ci manchi! Un'offerta per te 🍣"
                className="w-full rounded-md border border-bamboo/25 px-3 py-2 text-sm outline-none focus:border-bamboo"
              />
            </Field>
            <Field label="Messaggio">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                rows={5}
                className="w-full resize-y rounded-md border border-bamboo/25 px-3 py-2 text-sm outline-none focus:border-bamboo"
              />
            </Field>
            <Field label="Codice sconto (opzionale)">
              <Select
                value={promoCode}
                onChange={setPromoCode}
                options={[
                  ["", "Nessuno"],
                  ...discountCodes.map((c) => [c.code, c.label ? `${c.code} — ${c.label}` : c.code] as [string, string]),
                ]}
              />
            </Field>
          </div>
        </section>
      </div>

      {/* Colonna destra: anteprima + invio (sticky su desktop) */}
      <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <section className="rounded-xl border border-bamboo/20 p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Anteprima destinatari</h2>

          <div className="mb-3 rounded-lg bg-paper-warm/60 p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-warm-gray">
              Chi ricevrà (tutte le condizioni insieme)
            </div>
            {conditions.length === 0 ? (
              <div className="mt-1 text-xs text-ink">Tutti i clienti (nessun filtro)</div>
            ) : (
              <div className="mt-1.5 flex flex-wrap items-center gap-1">
                {conditions.map((c, i) => (
                  <span key={c} className="inline-flex items-center gap-1">
                    {i > 0 && <span className="text-[10px] text-warm-gray">e</span>}
                    <span className="rounded-full bg-bamboo/10 px-2 py-0.5 text-[11px] text-bamboo-deep">
                      {c}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {!preview || !preview.ok ? (
            <p className="text-sm text-warm-gray">
              {previewing ? "Calcolo…" : preview && !preview.ok ? preview.error : "—"}
            </p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <Stat label="Nel segmento" value={preview.total} />
                <Stat label="Con consenso" value={preview.consenting} />
              </div>
              <div className="rounded-lg bg-bamboo/10 p-3 text-center">
                <div className="text-2xl font-bold text-bamboo-deep">{target}</div>
                <div className="text-xs text-warm-gray">
                  destinatari all&apos;invio{includeNoConsent ? " (inclusi i no)" : " (solo consenso)"}
                </div>
              </div>
              {preview.suppressed > 0 && (
                <p className="text-xs text-warm-gray">
                  {preview.suppressed} disiscritti esclusi automaticamente.
                </p>
              )}
              {previewing && <p className="text-xs text-warm-gray">Aggiorno…</p>}
              {preview.sample.length > 0 && (() => {
                const q = sampleQuery.trim().toLowerCase();
                const shown = q
                  ? preview.sample.filter(
                      (r) =>
                        r.email.toLowerCase().includes(q) ||
                        (r.name ?? "").toLowerCase().includes(q),
                    )
                  : preview.sample;
                return (
                  <div className="space-y-1.5">
                    <input
                      value={sampleQuery}
                      onChange={(e) => setSampleQuery(e.target.value)}
                      placeholder="Cerca nome o email…"
                      className="w-full rounded-md border border-bamboo/25 px-2.5 py-1.5 text-xs outline-none focus:border-bamboo"
                    />
                    <div className="max-h-80 overflow-y-auto rounded-lg border border-bamboo/10">
                      <table className="w-full text-xs">
                        <tbody>
                          {shown.map((r) => (
                            <tr key={r.email} className="border-t border-bamboo/10 first:border-t-0">
                              <td className="px-2 py-1.5">
                                <div className="truncate max-w-[160px] text-ink" title={r.email}>
                                  {r.name ? `${r.name} · ` : ""}
                                  {r.email}
                                </div>
                                <div className="text-[10px] text-warm-gray">
                                  {r.isRegistered ? "registrato" : "guest"} ·{" "}
                                  {r.totalOrders} ord · {euro(r.totalSpentCents)}
                                </div>
                              </td>
                              <td className="px-2 py-1.5 text-right">
                                {r.suppressed ? (
                                  <span className="text-sushi-red">disiscritto</span>
                                ) : r.marketingConsent ? (
                                  <span className="text-bamboo-deep">✓ consenso</span>
                                ) : (
                                  <span className="text-warm-gray">no consenso</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {shown.length === 0 && (
                            <tr>
                              <td className="px-2 py-3 text-center text-warm-gray">
                                Nessuno corrisponde a “{sampleQuery}”.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-warm-gray">
                      {q
                        ? `${shown.length} risultati per "${sampleQuery}"`
                        : `Mostrati ${preview.sample.length} di ${preview.total}`}
                      {preview.sampleTruncated && !q
                        ? " · usa i filtri per restringere"
                        : ""}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </section>

        {/* Guardia consenso + invio */}
        <section className="rounded-xl border border-bamboo/20 p-4 space-y-3">
          <label className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={includeNoConsent}
              onChange={(e) => setIncludeNoConsent(e.target.checked)}
              className="mt-0.5"
            />
            <span className={includeNoConsent ? "text-sushi-red" : "text-warm-gray"}>
              Includi anche chi <strong>non</strong> ha dato consenso marketing
            </span>
          </label>
          {includeNoConsent && (
            <p className="rounded-md bg-sushi-red/10 p-2 text-xs text-sushi-red">
              ⚠️ Rischio GDPR e deliverability: scrivere a chi non ha dato consenso può
              far segnalare il dominio come spam. Procedi solo se sai cosa fai.
            </p>
          )}
          <button
            type="button"
            disabled={sending}
            onClick={handleSend}
            className="w-full rounded-full bg-bamboo px-4 py-2.5 text-sm font-semibold text-paper hover:bg-bamboo/90 disabled:opacity-50"
          >
            {sending ? "Invio in corso…" : `Invia campagna${target ? ` (${target})` : ""}`}
          </button>
          <p className="text-center text-[10px] text-warm-gray">
            Ogni email include il link di disiscrizione. Un destinatario riceve la
            stessa campagna una sola volta al mese.
          </p>
        </section>
      </aside>
    </div>
  );
}

// ── Primitivi UI locali ──────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-warm-gray">{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-bamboo/25 bg-paper px-3 py-2 text-sm outline-none focus:border-bamboo"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  placeholder,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") return onChange(null);
        const n = Math.floor(Number(raw));
        if (Number.isNaN(n)) return onChange(null);
        onChange(min != null ? Math.max(min, n) : n);
      }}
      className="w-full rounded-md border border-bamboo/25 px-3 py-2 text-sm outline-none focus:border-bamboo"
    />
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-bamboo/15 py-2">
      <div className="text-lg font-bold text-ink">{value}</div>
      <div className="text-[10px] text-warm-gray">{label}</div>
    </div>
  );
}
