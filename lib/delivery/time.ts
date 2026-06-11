// Helper timezone Europe/Rome DST-aware.
// MAI usare new Date() o aritmetica Date.getTime() per logica di cutoff —
// passare sempre da queste utility per evitare bug DST (ora legale marzo/ottobre).

import { toZonedTime, fromZonedTime } from "date-fns-tz";

export const TZ_ROME = "Europe/Rome";

/** Adesso, come Date "shiftata" per leggere ore/minuti in Roma tramite i getter standard. */
export function nowInRome(): { utc: Date; rome: Date } {
  const utc = new Date();
  return { utc, rome: toZonedTime(utc, TZ_ROME) };
}

/** Giorno della settimana in Roma (0 = Dom, 6 = Sab). */
export function weekdayInRome(d: Date): number {
  return toZonedTime(d, TZ_ROME).getDay();
}

/** Formatta "HH:mm" letto come ora locale Roma. */
export function timeOfDayRome(d: Date): string {
  const r = toZonedTime(d, TZ_ROME);
  const hh = r.getHours().toString().padStart(2, "0");
  const mm = r.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Confronta due "HH:mm" lessicograficamente (funziona perché HH è 0-padded). */
export function isTimeBefore(a: string, b: string): boolean {
  return a < b;
}

/**
 * Data Roma → UTC. Riceve i campi wall-clock Roma e ritorna il Date UTC equivalente.
 * year/month/day si riferiscono alla data Roma; hour/min al wall time Roma.
 * month è 1-12 (NON 0-11).
 */
export function romeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  return fromZonedTime(iso, TZ_ROME);
}

/**
 * Aggiunge minuti a un istante UTC, ritorna il nuovo Date.
 * NB: aritmetica ms-based è safe per ADD (non per parsing wall-clock).
 */
export function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60_000);
}

/**
 * Ceiling STRICT alla prossima mezz'ora (o multiplo configurabile) in Roma.
 * Esempi:
 *   20:00:00 → 20:30 (strict: 20:00 esatto NON è 20:00 ma 20:30)
 *   20:15:00 → 20:30
 *   20:30:00 → 21:00 (strict)
 *   20:33:00 → 21:00
 *   23:55:00 → 00:30 del giorno dopo
 *
 * @param t1 istante UTC
 * @param stepMinutes default 30
 */
export function ceilToNextSlotRome(t1: Date, stepMinutes = 30): Date {
  const r = toZonedTime(t1, TZ_ROME);
  const year = r.getFullYear();
  const month = r.getMonth() + 1; // 0-11 → 1-12
  const day = r.getDate();
  const hour = r.getHours();
  const minute = r.getMinutes();
  const seconds = r.getSeconds() + r.getMilliseconds() / 1000;

  // Strict: se siamo ESATTAMENTE su un boundary, scatta al successivo.
  // "Esattamente" = minute multiplo di step E seconds=0.
  const isOnBoundary = minute % stepMinutes === 0 && seconds === 0;

  let newMinute = Math.ceil(minute / stepMinutes) * stepMinutes;
  if (isOnBoundary) newMinute += stepMinutes;

  let newHour = hour;
  let newDay = day;
  let newMonth = month;
  let newYear = year;

  if (newMinute >= 60) {
    newHour += Math.floor(newMinute / 60);
    newMinute = newMinute % 60;
  }
  if (newHour >= 24) {
    // overflow giornaliero: ricostruisci data Roma con UTC che gestisce mese/anno
    const dayBoost = Math.floor(newHour / 24);
    newHour = newHour % 24;
    const tmp = new Date(Date.UTC(year, month - 1, day + dayBoost));
    newYear = tmp.getUTCFullYear();
    newMonth = tmp.getUTCMonth() + 1;
    newDay = tmp.getUTCDate();
  }

  return romeToUtc(newYear, newMonth, newDay, newHour, newMinute);
}

/**
 * Sottrae minuti da un istante UTC (per calcolare slot_start = slot_end - duration).
 */
export function subMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() - minutes * 60_000);
}

/**
 * Formato leggibile "20:00" per UI customer.
 */
export function formatRomeHHmm(d: Date): string {
  return timeOfDayRome(d);
}

/**
 * Verifica se un Date cade in un giorno della settimana incluso in closed_weekdays.
 * Note: closed_weekdays usa convenzione 0=Dom, 6=Sab.
 */
export function isClosedWeekday(d: Date, closedWeekdays: number[]): boolean {
  return closedWeekdays.includes(weekdayInRome(d));
}

/**
 * Estrae la data (giorno) di un Date come stringa YYYY-MM-DD in Roma.
 * Utile per match con closures.start_date/end_date.
 */
export function dateInRome(d: Date): string {
  const r = toZonedTime(d, TZ_ROME);
  const yy = r.getFullYear();
  const mm = String(r.getMonth() + 1).padStart(2, "0");
  const dd = String(r.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** È un weekend? (Sabato=6 o Domenica=0 in Roma) */
export function isWeekendRome(d: Date): boolean {
  const w = weekdayInRome(d);
  return w === 0 || w === 6;
}

/**
 * Costruisce un istante UTC che rappresenta una data Roma + un wall-clock time "HH:mm".
 * @param baseDate giorno di riferimento (legge year/month/day in Roma da qui)
 * @param hhmm es. "12:30"
 * @param dayOffset 0 = stesso giorno, 1 = giorno dopo, ecc.
 */
export function romeAtTimeOfDay(
  baseDate: Date,
  hhmm: string,
  dayOffset = 0,
): Date {
  const r = toZonedTime(baseDate, TZ_ROME);
  const [hh, mm] = hhmm.split(":").map(Number);
  // Genera la data target sommando i giorni in UTC (i.e. salta DST safely)
  const target = new Date(
    Date.UTC(r.getFullYear(), r.getMonth(), r.getDate() + dayOffset),
  );
  return romeToUtc(
    target.getUTCFullYear(),
    target.getUTCMonth() + 1,
    target.getUTCDate(),
    hh,
    mm,
  );
}

/**
 * Display friendly italiano per una data: "oggi", "domani" o "lun 15 giu".
 * Confronta col day-in-Rome corrente.
 */
export function relativeDayLabel(slot: Date, now: Date = new Date()): string {
  const slotDate = dateInRome(slot);
  const todayDate = dateInRome(now);
  if (slotDate === todayDate) return "oggi";
  const tomorrow = new Date(Date.UTC(
    parseInt(todayDate.slice(0, 4)),
    parseInt(todayDate.slice(5, 7)) - 1,
    parseInt(todayDate.slice(8, 10)) + 1,
  ));
  const tomorrowStr = `${tomorrow.getUTCFullYear()}-${String(tomorrow.getUTCMonth() + 1).padStart(2, "0")}-${String(tomorrow.getUTCDate()).padStart(2, "0")}`;
  if (slotDate === tomorrowStr) return "domani";
  // Più in là: "lun 15 giu"
  const r = toZonedTime(slot, TZ_ROME);
  const days = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  const months = [
    "gen", "feb", "mar", "apr", "mag", "giu",
    "lug", "ago", "set", "ott", "nov", "dic",
  ];
  return `${days[r.getDay()]} ${r.getDate()} ${months[r.getMonth()]}`;
}
