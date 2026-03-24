import { JournalEntry } from "@/types/mood";
import { startOfDay, subDays } from "date-fns";

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  emoji: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: "first_entry", title: "First Step", description: "Write your first journal entry", emoji: "✍️" },
  { key: "streak_3", title: "Reflector", description: "Journal 3 days in a row", emoji: "🔥" },
  { key: "streak_7", title: "Consistency Hero", description: "Journal 7 days in a row", emoji: "⚡" },
  { key: "streak_30", title: "Mindful Master", description: "Journal 30 days in a row", emoji: "🏆" },
  { key: "entries_10", title: "Getting Started", description: "Write 10 entries", emoji: "📝" },
  { key: "entries_50", title: "Storyteller", description: "Write 50 entries", emoji: "📖" },
  { key: "entries_100", title: "Centurion", description: "Write 100 entries", emoji: "💯" },
  { key: "voice_journaler", title: "Voice Journaler", description: "Use voice input for an entry", emoji: "🎤" },
  { key: "night_owl", title: "Night Owl", description: "Write an entry after 11 PM", emoji: "🌙" },
  { key: "early_bird", title: "Early Bird", description: "Write an entry before 7 AM", emoji: "🌅" },
  { key: "all_moods", title: "Full Spectrum", description: "Experience all 6 mood types", emoji: "🌈" },
  { key: "favorites_5", title: "Memory Keeper", description: "Favorite 5 entries", emoji: "⭐" },
];

export function checkNewAchievements(
  entries: JournalEntry[],
  unlockedKeys: Set<string>,
  extra?: { usedVoice?: boolean }
): string[] {
  const newKeys: string[] = [];
  const check = (key: string, condition: boolean) => {
    if (!unlockedKeys.has(key) && condition) newKeys.push(key);
  };

  check("first_entry", entries.length >= 1);
  check("entries_10", entries.length >= 10);
  check("entries_50", entries.length >= 50);
  check("entries_100", entries.length >= 100);

  // Streak
  const today = startOfDay(new Date());
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = subDays(today, i);
    if (entries.some(e => startOfDay(new Date(e.created_at)).getTime() === day.getTime())) streak++;
    else break;
  }
  check("streak_3", streak >= 3);
  check("streak_7", streak >= 7);
  check("streak_30", streak >= 30);

  // Time-based
  const latestEntry = entries[0];
  if (latestEntry) {
    const hour = new Date(latestEntry.created_at).getHours();
    check("night_owl", hour >= 23 || hour < 4);
    check("early_bird", hour >= 4 && hour < 7);
  }

  // All moods
  const moods = new Set(entries.map(e => e.detected_mood));
  check("all_moods", moods.size >= 6);

  // Favorites
  const favCount = entries.filter(e => e.is_favorite).length;
  check("favorites_5", favCount >= 5);

  // Voice
  if (extra?.usedVoice) check("voice_journaler", true);

  return newKeys;
}
