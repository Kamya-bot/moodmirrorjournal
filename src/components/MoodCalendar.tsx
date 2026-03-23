import { useMemo } from "react";
import { useJournalEntries } from "@/hooks/useJournal";
import { Mood } from "@/types/mood";
import { MOOD_EMOJI, MOOD_COLORS } from "@/lib/moodAnalysis";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, getDay,
  addMonths, subMonths,
} from "date-fns";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MoodCalendar() {
  const { data: entries, isLoading } = useJournalEntries();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarData = useMemo(() => {
    if (!entries) return [];

    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayEntries = entries.filter(e => isSameDay(new Date(e.created_at), day));
      const moods = dayEntries.map(e => e.detected_mood as Mood);
      const dominantMood = moods.length > 0
        ? (Object.entries(
            moods.reduce((acc, m) => ({ ...acc, [m]: (acc[m] || 0) + 1 }), {} as Record<string, number>)
          ).sort((a, b) => b[1] - a[1])[0][0] as Mood)
        : null;

      return { date: day, entries: dayEntries.length, dominantMood };
    });
  }, [entries, currentMonth]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const startDay = getDay(startOfMonth(currentMonth));
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fade-in">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-display font-semibold text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
              {d}
            </div>
          ))}

          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {calendarData.map(({ date, entries, dominantMood }) => (
            <div
              key={date.toISOString()}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                dominantMood
                  ? `${MOOD_COLORS[dominantMood]} text-primary-foreground`
                  : "bg-secondary/50 text-foreground"
              } ${isSameDay(date, new Date()) ? "ring-2 ring-primary" : ""}`}
            >
              <span className="text-xs font-medium">{format(date, "d")}</span>
              {dominantMood && (
                <span className="text-xs">{MOOD_EMOJI[dominantMood]}</span>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          {(["happy", "sad", "angry", "stressed", "anxious", "calm"] as Mood[]).map(mood => (
            <div key={mood} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`w-3 h-3 rounded-full ${MOOD_COLORS[mood]}`} />
              {MOOD_EMOJI[mood]} {mood}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
