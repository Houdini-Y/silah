export interface CallRecord {
  date: string;   // "2026-02-20"
  note: string;   // what was discussed
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  tag: 'family' | 'friend' | 'colleague' | 'other';
  interval: number;       // days between calls
  priority: boolean;
  notes: string;          // permanent notes
  nextCallNote: string;   // resets after each call
  lastCalled: string | null;
  callHistory: CallRecord[];
}

// Helper — how many days until next call (negative = overdue)
export const getDaysUntil = (contact: Contact): number => {
  if (!contact.lastCalled) return -999;
  const last = new Date(contact.lastCalled);
  const next = new Date(last);
  next.setDate(next.getDate() + contact.interval);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((next.getTime() - now.getTime()) / 86400000);
};

// Helper — generate a random ID (like UUID)
export const uid = (): string => Math.random().toString(36).slice(2, 9);