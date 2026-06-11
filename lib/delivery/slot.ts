// Calcolo Slot modello Glovo: arrotonda T1 alla prossima mezz'ora (strict),
// poi slot_start = slot_end - 30 min.

import { ceilToNextSlotRome, subMinutes } from "./time";

export interface SlotResult {
  start: Date; // UTC
  end: Date; // UTC
}

/**
 * Dato T1 (istante UTC stimato consegna), calcola la finestra slot da mostrare al cliente.
 *
 * @param t1 istante UTC stimato consegna
 * @param slotDurationMin default 30
 * @returns { start, end } slot range (UTC)
 */
export function computeSlot(t1: Date, slotDurationMin = 30): SlotResult {
  const end = ceilToNextSlotRome(t1, slotDurationMin);
  const start = subMinutes(end, slotDurationMin);
  return { start, end };
}

/**
 * Shift di uno slot in avanti (per auto-shift quando slot pieno).
 */
export function shiftSlotForward(
  slot: SlotResult,
  slotDurationMin = 30,
): SlotResult {
  // end + duration → ricalcolo come se T1 fosse end attuale
  const newEnd = ceilToNextSlotRome(slot.end, slotDurationMin);
  // Se ceilToNextSlotRome restituisce lo stesso end (perché end era già esattamente su boundary),
  // forza +slotDurationMin
  const finalEnd =
    newEnd.getTime() === slot.end.getTime()
      ? new Date(slot.end.getTime() + slotDurationMin * 60_000)
      : newEnd;
  return {
    start: subMinutes(finalEnd, slotDurationMin),
    end: finalEnd,
  };
}
