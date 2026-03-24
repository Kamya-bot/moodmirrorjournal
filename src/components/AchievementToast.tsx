import { useEffect, useRef, useState } from "react";
import { useJournalEntries } from "@/hooks/useJournal";
import { useAchievements, useUnlockAchievement } from "@/hooks/useAchievements";
import { checkNewAchievements, ACHIEVEMENTS } from "@/lib/achievements";
import { useToast } from "@/hooks/use-toast";

export default function AchievementToast() {
  const { data: entries } = useJournalEntries();
  const { data: achievements } = useAchievements();
  const unlock = useUnlockAchievement();
  const { toast } = useToast();
  const checkedRef = useRef(false);
  const [lastEntryCount, setLastEntryCount] = useState(0);

  useEffect(() => {
    if (!entries || !achievements) return;
    if (entries.length === lastEntryCount && checkedRef.current) return;

    checkedRef.current = true;
    setLastEntryCount(entries.length);

    const unlockedKeys = new Set(achievements.map(a => a.achievement_key));
    const newKeys = checkNewAchievements(entries, unlockedKeys);

    newKeys.forEach(key => {
      const def = ACHIEVEMENTS.find(a => a.key === key);
      if (def) {
        unlock.mutate(key);
        toast({
          title: `${def.emoji} Achievement Unlocked!`,
          description: `${def.title} — ${def.description}`,
        });
      }
    });
  }, [entries, achievements]);

  return null;
}
