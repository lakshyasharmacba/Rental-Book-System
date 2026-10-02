import LedgerEntry from '../models/LedgerEntry.js';
export const addLedgerEntry = async ({ bookingId, type, amount, direction, party, refs = {} }, session) => {
  const key = `${bookingId}:${type}:${Date.now()}:${Math.random()}`;
  const opts = session ? { session } : {};
  return LedgerEntry.create([{ bookingId, type, amount, direction, party, refs, idempotencyKey: key }], opts);
};

