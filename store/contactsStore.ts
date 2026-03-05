import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, uid } from '../types/Contact';

// Sample contacts so the app isn't empty on first launch
const SAMPLES: Contact[] = [
  {
    id: uid(), name: 'الأم', phone: '', tag: 'family',
    interval: 3, priority: true,
    notes: 'تحب أن تسمع عن يومك.',
    nextCallNote: 'كانت مريضة آخر مرة، اسأل كيف تشعر.',
    lastCalled: null, callHistory: [],
  },
  {
    id: uid(), name: 'عبدالله', phone: '', tag: 'friend',
    interval: 7, priority: false,
    notes: 'صديق الجامعة.',
    nextCallNote: 'اسأل عن وظيفته الجديدة.',
    lastCalled: '2026-02-20', callHistory: [],
  },
  {
    id: uid(), name: 'سارة', phone: '', tag: 'family',
    interval: 5, priority: false,
    notes: 'أختي الصغيرة.',
    nextCallNote: 'هنّئها على الشقة الجديدة!',
    lastCalled: '2026-02-28', callHistory: [],
  },
];

interface Store {
  contacts: Contact[];
  streak: number;
  todayCalledId: string | null;
  lang: 'ar' | 'en';

  addContact:    (c: Contact) => void;
  updateContact: (c: Contact) => void;
  deleteContact: (id: string) => void;
  setLang:       (lang: 'ar' | 'en') => void;
  markCalled:    (id: string, nextNote: string, newInterval: number) => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      contacts: SAMPLES,
      streak: 0,
      todayCalledId: null,
      lang: 'ar',

      addContact: (c) =>
        set(s => ({ contacts: [...s.contacts, c] })),

      updateContact: (c) =>
        set(s => ({ contacts: s.contacts.map(x => x.id === c.id ? c : x) })),

      deleteContact: (id) =>
        set(s => ({ contacts: s.contacts.filter(c => c.id !== id) })),

      setLang: (lang) => set({ lang }),

      markCalled: (id, nextNote, newInterval) =>
        set(s => {
          const today = new Date().toISOString().split('T')[0];
          const old = s.contacts.find(c => c.id === id)!;
          return {
            streak: s.streak + 1,
            todayCalledId: id,
            contacts: s.contacts.map(c => c.id !== id ? c : {
              ...c,
              lastCalled: today,
              interval: newInterval,
              nextCallNote: nextNote,
              callHistory: [
                { date: today, note: old.nextCallNote },
                ...(c.callHistory || []),
              ].slice(0, 30),
            }),
          };
        }),
    }),
    {
      name: 'silah-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);