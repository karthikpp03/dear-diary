const MOOD_COLOR_MAP: Record<string, string> = {
  calm: "var(--accent-moss)",
  content: "var(--accent-moss)",
  peaceful: "var(--accent-moss)",
  relaxed: "var(--accent-moss)",
  happy: "var(--accent-ember)",
  excited: "var(--accent-ember)",
  joyful: "var(--accent-ember)",
  grateful: "var(--accent-ember)",
  hopeful: "var(--accent-ember)",
  tired: "var(--accent-dusk)",
  drained: "var(--accent-dusk)",
  low: "var(--accent-dusk)",
  sad: "var(--accent-dusk)",
  lonely: "var(--accent-dusk)",
  stressed: "var(--accent-clay)",
  anxious: "var(--accent-clay)",
  overwhelmed: "var(--accent-clay)",
  frustrated: "var(--accent-clay)",
  angry: "var(--accent-clay)",
};

export function moodColor(mood: string): string {
  const key = mood.trim().toLowerCase().split(/[\s/]+/)[0];
  return MOOD_COLOR_MAP[key] ?? "var(--accent-ember-soft)";
}
