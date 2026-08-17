export interface JournalEntry {
  id: string;
  date: string; // e.g. "17 August 2026 — Monday"
  isoDate: string; // e.g. "2026-08-17" — derived from created_at, used for sorting/grouping
  rawMessage: string;
  journalText: string;
  mood: string;
  energy: number; // 1-10
  highlights: string[];
  reflection: string;
  tags: string[];
  createdAt: string; // ISO timestamp
}

export interface GeneratedJournal {
  journalText: string;
  mood: string;
  energy: number;
  highlights: string[];
  reflection: string;
  tags: string[];
}
