import { useMemo, useState } from "react";
import { useJournalEntries } from "@/hooks/useJournal";
import { Mood } from "@/types/mood";
import { MOOD_EMOJI } from "@/lib/moodAnalysis";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import MoodInsights from "@/components/MoodInsights";
import MonthlyRecap from "@/components/MonthlyRecap";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";

const MOOD_HEX: Record<Mood, string> = {
  happy: "#f0b429",
  sad: "#4a7ddd",
  angry: "#e53e3e",
  stressed: "#e07020",
  anxious: "#9f5abf",
  calm: "#2b9a8f",
};

const ALL_MOODS: Mood[] = ["happy", "sad", "angry", "stressed", "anxious", "calm"];

export default function Dashboard() {
  const { data: entries, isLoading } = useJournalEntries();
  const [range, setRange] = useState<"week" | "month">("week");

  const stats = useMemo(() => {
    if (!entries || entries.length === 0) return null;

    const moodCounts: Record<Mood, number> = { happy: 0, sad: 0, angry: 0, stressed: 0, anxious: 0, calm: 0 };
    entries.forEach(e => moodCounts[e.detected_mood as Mood]++);

    const mostFrequent = (Object.entries(moodCounts) as [Mood, number][])
      .sort((a, b) => b[1] - a[1])[0][0];

    // Streak calculation
    const today = startOfDay(new Date());
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const day = subDays(today, i);
      const hasEntry = entries.some(e => startOfDay(new Date(e.created_at)).getTime() === day.getTime());
      if (hasEntry) streak++;
      else break;
    }

    // Trend data
    const days = range === "week" ? 7 : 30;
    const trendData = Array.from({ length: days }, (_, i) => {
      const day = subDays(today, days - 1 - i);
      const dayEntries = entries.filter(
        e => startOfDay(new Date(e.created_at)).getTime() === day.getTime()
      );
      return {
        date: format(day, range === "week" ? "EEE" : "MMM d"),
        count: dayEntries.length,
        ...ALL_MOODS.reduce((acc, m) => ({
          ...acc,
          [m]: dayEntries.filter(e => e.detected_mood === m).length,
        }), {}),
      };
    });

    const pieData = (Object.entries(moodCounts) as [Mood, number][])
      .filter(([, v]) => v > 0)
      .map(([mood, count]) => ({
        name: `${MOOD_EMOJI[mood]} ${mood}`,
        value: count,
        color: MOOD_HEX[mood],
      }));

    return { moodCounts, mostFrequent, streak, trendData, pieData, total: entries.length };
  }, [entries, range]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No entries yet. Start journaling to see your mood insights!</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
        <StatCard label="Total Entries" value={stats.total} />
        <StatCard label="Current Streak" value={`${stats.streak} 🔥`} />
        <StatCard label="Most Frequent" value={`${MOOD_EMOJI[stats.mostFrequent]} ${stats.mostFrequent}`} />
        <StatCard label="Today's Entries" value={
          entries?.filter(e => startOfDay(new Date(e.created_at)).getTime() === startOfDay(new Date()).getTime()).length || 0
        } />
      </div>

      {/* Range toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setRange("week")}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            range === "week" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setRange("month")}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            range === "month" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          Monthly
        </button>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Mood Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              {ALL_MOODS.map(m => (
                <Bar key={m} dataKey={m} stackId="mood" fill={MOOD_HEX[m]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Mood Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {stats.pieData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Entry count trend */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Daily Activity</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={stats.trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Monthly Recap */}
      {entries && <MonthlyRecap entries={entries} />}

      {/* Mood Insights */}
      {entries && <MoodInsights entries={entries} />}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </Card>
  );
}
