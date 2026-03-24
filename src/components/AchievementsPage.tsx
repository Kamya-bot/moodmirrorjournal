import { useAchievements } from "@/hooks/useAchievements";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { Card } from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import { format } from "date-fns";

export default function AchievementsPage() {
  const { data: achievements, isLoading } = useAchievements();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unlockedKeys = new Set((achievements || []).map(a => a.achievement_key));
  const unlockedMap = Object.fromEntries(
    (achievements || []).map(a => [a.achievement_key, a.unlocked_at])
  );

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 overflow-y-auto">
      <h2 className="text-xl font-bold text-foreground">🏅 Achievements</h2>
      <p className="text-sm text-muted-foreground">
        {unlockedKeys.size} / {ACHIEVEMENTS.length} unlocked
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACHIEVEMENTS.map(def => {
          const unlocked = unlockedKeys.has(def.key);
          return (
            <Card
              key={def.key}
              className={`p-4 flex items-start gap-3 transition-all ${
                unlocked ? "bg-card" : "bg-muted/50 opacity-60"
              }`}
            >
              <span className="text-2xl">{unlocked ? def.emoji : "🔒"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{def.title}</p>
                <p className="text-xs text-muted-foreground">{def.description}</p>
                {unlocked && unlockedMap[def.key] && (
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Unlocked {format(new Date(unlockedMap[def.key]), "MMM d, yyyy")}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
