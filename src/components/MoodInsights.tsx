import { useMemo } from "react";
import { JournalEntry, Mood } from "@/types/mood";
import { MOOD_EMOJI } from "@/lib/moodAnalysis";
import { Card } from "@/components/ui/card";
import { format, startOfDay, subDays, getDay } from "date-fns";
import { TrendingUp, TrendingDown, Minus, Brain, Calendar, Star } from "lucide-react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ALL_MOODS: Mood[] = ["happy", "sad", "angry", "stressed", "anxious", "calm"];

// Assign a positivity score to each mood for trend calculation
const MOOD_POSITIVITY: Record<Mood, number> = {
  happy: 5,
  calm: 4,
  stressed: 2,
  anxious: 2,
  sad: 1,
  angry: 1,
};

interface MoodInsightsProps {
  entries: JournalEntry[];
}

export default function MoodInsights({ entries }: MoodInsightsProps) {
  const insights = useMemo(() => {
    if (entries.length < 3) return null;

    // Most common mood
    const moodCounts: Record<Mood, number> = { happy: 0, sad: 0, angry: 0, stressed: 0, anxious: 0, calm: 0 };
    entries.forEach((e) => moodCounts[e.detected_mood as Mood]++);
    const mostCommon = (Object.entries(moodCounts) as [Mood, number][]).sort((a, b) => b[1] - a[1])[0];

    // Best/worst day of week
    const dayScores: Record<number, { total: number; count: number }> = {};
    for (let i = 0; i < 7; i++) dayScores[i] = { total: 0, count: 0 };
    entries.forEach((e) => {
      const day = getDay(new Date(e.created_at));
      dayScores[day].total += MOOD_POSITIVITY[e.detected_mood as Mood] || 3;
      dayScores[day].count++;
    });
    const dayAverages = Object.entries(dayScores)
      .filter(([, v]) => v.count > 0)
      .map(([day, v]) => ({ day: Number(day), avg: v.total / v.count }));
    const bestDay = dayAverages.sort((a, b) => b.avg - a.avg)[0];
    const worstDay = dayAverages.sort((a, b) => a.avg - b.avg)[0];

    // Weekly trend (last 7 days avg vs previous 7 days avg)
    const today = startOfDay(new Date());
    const recent = entries.filter((e) => {
      const d = startOfDay(new Date(e.created_at));
      return d >= subDays(today, 7);
    });
    const previous = entries.filter((e) => {
      const d = startOfDay(new Date(e.created_at));
      return d >= subDays(today, 14) && d < subDays(today, 7);
    });

    const recentAvg = recent.length > 0
      ? recent.reduce((sum, e) => sum + (MOOD_POSITIVITY[e.detected_mood as Mood] || 3), 0) / recent.length
      : 0;
    const previousAvg = previous.length > 0
      ? previous.reduce((sum, e) => sum + (MOOD_POSITIVITY[e.detected_mood as Mood] || 3), 0) / previous.length
      : 0;

    let trend: "improving" | "declining" | "stable" = "stable";
    if (previous.length > 0) {
      const diff = recentAvg - previousAvg;
      if (diff > 0.5) trend = "improving";
      else if (diff < -0.5) trend = "declining";
    }

    // Average confidence
    const withConfidence = entries.filter((e) => e.confidence != null);
    const avgConfidence = withConfidence.length > 0
      ? Math.round(withConfidence.reduce((s, e) => s + (e.confidence || 0), 0) / withConfidence.length * 100)
      : null;

    return {
      mostCommon,
      bestDay: bestDay ? DAY_NAMES[bestDay.day] : null,
      worstDay: worstDay ? DAY_NAMES[worstDay.day] : null,
      trend,
      recentAvg: Math.round(recentAvg * 10) / 10,
      avgConfidence,
      totalEntries: entries.length,
    };
  }, [entries]);

  if (!insights) return null;

  const TrendIcon = insights.trend === "improving" ? TrendingUp : insights.trend === "declining" ? TrendingDown : Minus;
  const trendColor = insights.trend === "improving" ? "text-mood-happy" : insights.trend === "declining" ? "text-mood-sad" : "text-muted-foreground";
  const trendLabel = insights.trend === "improving" ? "Your mood is improving! 🎉" : insights.trend === "declining" ? "Your mood has dipped. Take care of yourself. 💙" : "Your mood has been steady.";

  return (
    <Card className="p-5 space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Brain className="h-4 w-4" /> Mood Insights
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InsightItem
          icon={<Star className="h-4 w-4 text-mood-happy" />}
          label="Most frequent mood"
          value={`${MOOD_EMOJI[insights.mostCommon[0]]} ${insights.mostCommon[0]} (${insights.mostCommon[1]} entries)`}
        />
        <InsightItem
          icon={<TrendIcon className={`h-4 w-4 ${trendColor}`} />}
          label="Weekly trend"
          value={trendLabel}
        />
        {insights.bestDay && (
          <InsightItem
            icon={<Calendar className="h-4 w-4 text-mood-calm" />}
            label="Happiest day"
            value={`You feel best on ${insights.bestDay}s`}
          />
        )}
        {insights.worstDay && insights.worstDay !== insights.bestDay && (
          <InsightItem
            icon={<Calendar className="h-4 w-4 text-mood-stressed" />}
            label="Toughest day"
            value={`${insights.worstDay}s tend to be harder`}
          />
        )}
        {insights.avgConfidence != null && (
          <InsightItem
            icon={<Brain className="h-4 w-4 text-primary" />}
            label="Detection accuracy"
            value={`${insights.avgConfidence}% avg confidence`}
          />
        )}
      </div>
    </Card>
  );
}

function InsightItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
