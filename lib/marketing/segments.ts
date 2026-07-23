// Motore di segmentazione campagne email — PURO e testabile.
// L'aggregazione pesante è nel DB (RPC get_marketing_audience); qui applichiamo
// i filtri componibili in memoria. Nessuna dipendenza server: solo tipi + logica.
// I predicati sono TUTTI in AND. Aggiungere un filtro = aggiungere un campo al
// criterio + il suo predicato in `applySegment` (aperto all'estensione).

import type { Database } from "@/lib/supabase/database.types";

/** Riga grezza restituita dalla RPC get_marketing_audience (snake_case). */
type AudienceRpcRow =
  Database["public"]["Functions"]["get_marketing_audience"]["Returns"][number];

const DAY_MS = 86_400_000;

/** Una persona contattabile: email univoca, registrata o guest, con metriche. */
export interface AudienceRow {
  email: string;
  name: string | null;
  phone: string | null;
  customerId: string | null;
  isRegistered: boolean;
  marketingConsent: boolean;
  totalOrders: number;
  totalSpentCents: number;
  avgTicketCents: number;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
  deliveryOrders: number;
  pickupOrders: number;
  usedCodes: string[];
  orderedCategoryIds: string[];
  registeredAt: string | null;
}

/**
 * Mappa la riga RPC (i tipi generati marcano non-null anche i campi nullable:
 * name/phone/customerId/date/registeredAt possono essere null a runtime) nel
 * nostro tipo con nullability corretta.
 */
export function mapAudienceRow(r: AudienceRpcRow): AudienceRow {
  return {
    email: r.email,
    name: r.name ?? null,
    phone: r.phone ?? null,
    customerId: r.customer_id ?? null,
    isRegistered: r.is_registered,
    marketingConsent: r.marketing_consent,
    totalOrders: r.total_orders ?? 0,
    totalSpentCents: r.total_spent_cents ?? 0,
    avgTicketCents: r.avg_ticket_cents ?? 0,
    firstOrderAt: r.first_order_at ?? null,
    lastOrderAt: r.last_order_at ?? null,
    deliveryOrders: r.delivery_orders ?? 0,
    pickupOrders: r.pickup_orders ?? 0,
    usedCodes: r.used_codes ?? [],
    orderedCategoryIds: r.ordered_category_ids ?? [],
    registeredAt: r.registered_at ?? null,
  };
}

// ── Criteri di segmentazione ────────────────────────────────────────────────

export type ConsentFilter = "any" | "consenting" | "non_consenting";
export type RegistrationFilter = "any" | "registered" | "guest";
export type OrderActivityFilter = "any" | "never" | "has_ordered";
export type OrderTypeFilter = "any" | "delivery" | "pickup";
export type DiscountUseFilter = "any" | "used_any" | "never_used" | "used_specific";

/** Tutti i campi opzionali/neutri di default → "any" = nessun vincolo. */
export interface SegmentCriteria {
  // Consenso + anagrafica
  consent: ConsentFilter;
  registration: RegistrationFilter;
  orderActivity: OrderActivityFilter; // "never" = mai comprato, "has_ordered" = almeno 1 ordine
  registeredWithinDays: number | null; // nuovi iscritti (solo registrati)
  // Comportamento d'acquisto
  minOrders: number | null; // frequenza minima (>=)
  minSpentCents: number | null; // spesa totale minima (>=)
  inactiveDays: number | null; // dormienti: ultimo ordine da almeno N giorni
  // Preferenze
  orderType: OrderTypeFilter; // ha almeno un ordine di questo tipo
  categoryId: string | null; // ha ordinato almeno un piatto di questa categoria
  // Uso promo
  discountUse: DiscountUseFilter;
  discountCode: string | null; // per discountUse = "used_specific"
}

export const DEFAULT_CRITERIA: SegmentCriteria = {
  consent: "any",
  registration: "any",
  orderActivity: "any",
  registeredWithinDays: null,
  minOrders: null,
  minSpentCents: null,
  inactiveDays: null,
  orderType: "any",
  categoryId: null,
  discountUse: "any",
  discountCode: null,
};

/**
 * Applica i criteri all'audience. TUTTI i predicati in AND. `nowMs` iniettato
 * per purezza/testabilità (di default l'ora corrente).
 */
export function applySegment(
  rows: AudienceRow[],
  c: SegmentCriteria,
  nowMs: number = Date.now(),
): AudienceRow[] {
  return rows.filter((r) => matchesCriteria(r, c, nowMs));
}

export function matchesCriteria(
  r: AudienceRow,
  c: SegmentCriteria,
  nowMs: number = Date.now(),
): boolean {
  // Consenso
  if (c.consent === "consenting" && !r.marketingConsent) return false;
  if (c.consent === "non_consenting" && r.marketingConsent) return false;

  // Registrazione
  if (c.registration === "registered" && !r.isRegistered) return false;
  if (c.registration === "guest" && r.isRegistered) return false;

  // Attività d'ordine
  if (c.orderActivity === "never" && r.totalOrders > 0) return false;
  if (c.orderActivity === "has_ordered" && r.totalOrders === 0) return false;

  // Nuovi iscritti (solo registrati con registered_at recente)
  if (c.registeredWithinDays != null) {
    if (!r.registeredAt) return false;
    const ms = new Date(r.registeredAt).getTime();
    if (Number.isNaN(ms)) return false;
    const ageDays = (nowMs - ms) / DAY_MS;
    if (ageDays > c.registeredWithinDays) return false;
  }

  // Frequenza
  if (c.minOrders != null && r.totalOrders < c.minOrders) return false;

  // Spesa totale
  if (c.minSpentCents != null && r.totalSpentCents < c.minSpentCents) return false;

  // Dormienza (recency): ha ordinato ma non da almeno N giorni
  if (c.inactiveDays != null) {
    if (!r.lastOrderAt) return false; // mai ordinato → non è "dormiente"
    const ms = new Date(r.lastOrderAt).getTime();
    if (Number.isNaN(ms)) return false;
    const daysSince = (nowMs - ms) / DAY_MS;
    if (daysSince < c.inactiveDays) return false;
  }

  // Preferenza tipo ordine (ha almeno un ordine di quel tipo)
  if (c.orderType === "delivery" && r.deliveryOrders === 0) return false;
  if (c.orderType === "pickup" && r.pickupOrders === 0) return false;

  // Categoria ordinata
  if (c.categoryId && !r.orderedCategoryIds.includes(c.categoryId)) return false;

  // Uso sconti
  if (c.discountUse === "used_any" && r.usedCodes.length === 0) return false;
  if (c.discountUse === "never_used" && r.usedCodes.length > 0) return false;
  if (c.discountUse === "used_specific") {
    const code = (c.discountCode ?? "").toUpperCase();
    if (!code || !r.usedCodes.some((x) => x.toUpperCase() === code)) return false;
  }

  return true;
}

// ── Preset (scorciatoie): criteri predefiniti mostrati come chip ────────────

export interface SegmentPreset {
  id: string;
  label: string;
  description: string;
  criteria: SegmentCriteria;
}

export const SEGMENT_PRESETS: SegmentPreset[] = [
  {
    id: "dormant",
    label: "Dormienti 30gg",
    description: "Ha ordinato ma non da 30+ giorni",
    criteria: { ...DEFAULT_CRITERIA, orderActivity: "has_ordered", inactiveDays: 30 },
  },
  {
    id: "new",
    label: "Nuovi iscritti",
    description: "Registrati negli ultimi 30 giorni",
    criteria: { ...DEFAULT_CRITERIA, registration: "registered", registeredWithinDays: 30 },
  },
  {
    id: "top_spenders",
    label: "Top spender",
    description: "Spesa totale ≥ 60€",
    criteria: { ...DEFAULT_CRITERIA, minSpentCents: 6000 },
  },
  {
    id: "repeat",
    label: "Clienti abituali",
    description: "Almeno 2 ordini",
    criteria: { ...DEFAULT_CRITERIA, orderActivity: "has_ordered", minOrders: 2 },
  },
  {
    id: "never_ordered",
    label: "Mai ordinato",
    description: "Registrati che non hanno mai comprato",
    criteria: { ...DEFAULT_CRITERIA, registration: "registered", orderActivity: "never" },
  },
  {
    id: "no_consent",
    label: "Senza consenso",
    description: "Non hanno dato consenso marketing",
    criteria: { ...DEFAULT_CRITERIA, consent: "non_consenting" },
  },
];
