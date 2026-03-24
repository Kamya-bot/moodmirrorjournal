import { useMemo } from "react";
import { JournalEntry, Mood } from "@/types/mood";
import { MOOD_EMOJI } from "@/lib/moodAnalysis";
import { Card } from "@/components/ui/card";
import { startOfDay, subDays, format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

interface MonthlyRecapProps {
  entries: JournalEntry[];
}

export default function MonthlyRecap({ entries }: MonthlyRecapProps) {
  const recap = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthEntries = entries.filter((e) =>
      isWithinInterval(new Date(e.created_at), { start: monthStart, end: monthEnd })
    );

    if (monthEntries.length === 0) return null;

    // Most frequent mood
    const moodCounts: Partial<Record<Mood, number>> = {};
    monthEntries.forEach((e) => {
      const m = e.detected_mood as Mood;
      moodCounts[m] = (moodCounts[m] || 0) + 1;
    });
    const topMood = (Object.entries(moodCounts) as [Mood, number][]).sort(
      (a, b) => b[1] - a[1]
    )[0][0];

    // Longest streak this month
    const today = startOfDay(now);
    const daySet = new Set(
      monthEntries.map((e) => startOfDay(new Date(e.created_at)).getTime())
    );
    let longest = 0;
    let current = 0;
    for (let d = monthStart; d <= monthEnd && d <= today; d = new Date(d.getTime() + 86400000)) {
      if (daySet.has(startOfDay(d).getTime())) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }

    // Unique days journaled
    const uniqueDays = daySet.size;

    // Average confidence
    const withConf = monthEntries.filter((e) => e.confidence != null);
    const avgConf =
      withConf.length > 0
        ? Math.round(
            (withConf.reduce((s, e) => s + (e.confidence || 0), 0) / withConf.length) * 100
          )
        : null;

    return {
      month: format(now, "MMMM yyyy"),
      total: monthEntries.length,
      uniqueDays,
      topMood,
      longest,
      avgConf,
      favorites: monthEntries.filter((e) => e.is_favorite).length,
    };
  }, [entries]);

  if (!recap) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <h3 className="text-lg font-display font-bold text-foreground mb-1">
        📅 {recap.month} Recap
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Your monthly reflection summary
      </p>

      <div className="grid grid-cols-2 gap-4">
        <RecapStat
          emoji="📝"
          label="Entries"
          value={String(recap.total)}
        />
        <RecapStat
          emoji="🔥"
          label="Longest Streak"
          value={`${recap.longest} days`}
        />
        <RecapStat
          emoji={MOOD_EMOJI[recap.topMood]}
          label="Top Mood"
          value={recap.topMood}
        />
        <RecapStat
          emoji="📆"
          label="Days Journaled"
          value={String(recap.uniqueDays)}
        />
        {recap.avgConf != null && (
          <RecapStat
            emoji="🎯"
            label="Avg Confidence"
            value={`${recap.avgConf}%`}
          />
        )}
        <RecapStat
          emoji="⭐"
          label="Favorites"
          value={String(recap.favorites)}
        />
      </div>

      <div className="mt-5 p-3 rounded-lg bg-primary/10 text-center">
        <p className="text-sm font-medium text-foreground">
          🪞 You showed up for yourself{" "}
          <span className="font-bold text-primary">{recap.uniqueDays}</span>{" "}
          {recap.uniqueDays === 1 ? "time" : "times"} this month
        </p>
      </div>
    </Card>
  );
}

function RecapStat({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">
      <p className="text-lg">{emoji}</p>
      <p className="text-sm font-bold text-foreground capitalize">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
