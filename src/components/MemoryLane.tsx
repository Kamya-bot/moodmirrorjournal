import { useJournalEntries } from "@/hooks/useJournal";
import { MOOD_EMOJI } from "@/lib/moodAnalysis";
import { Mood } from "@/types/mood";
import { format, subDays, subMonths, isSameDay } from "date-fns";
import { Star } from "lucide-react";
import { useToggleFavorite } from "@/hooks/useJournal";

export default function MemoryLane() {
  const { data: entries } = useJournalEntries();
  const toggleFav = useToggleFavorite();
  const today = new Date();

  if (!entries || entries.length === 0) return null;

  const flashbacks = [
    { label: "1 week ago", date: subDays(today, 7) },
    { label: "1 month ago", date: subMonths(today, 1) },
    { label: "3 months ago", date: subMonths(today, 3) },
    { label: "6 months ago", date: subMonths(today, 6) },
    { label: "1 year ago", date: subMonths(today, 12) },
  ];

  const memories = flashbacks
    .map(({ label, date }) => {
      const match = entries.find((e) => isSameDay(new Date(e.created_at), date));
      return match ? { label, entry: match } : null;
    })
    .filter(Boolean) as { label: string; entry: typeof entries[0] }[];

  // Also check "on this day" in any year
  const onThisDay = entries.filter((e) => {
    const d = new Date(e.created_at);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() !== today.getFullYear();
  });

  if (memories.length === 0 && onThisDay.length === 0) return null;

  return (
    <div className="border border-border rounded-xl p-4 bg-card">
      <h3 className="text-lg font-display font-semibold mb-3">🕰️ Memory Lane</h3>

      {onThisDay.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-primary mb-2">On This Day</p>
          {onThisDay.map((entry) => (
            <MemoryCard
              key={entry.id}
              label={format(new Date(entry.created_at), "MMM d, yyyy")}
              text={entry.text}
              mood={entry.detected_mood as Mood}
              isFavorite={entry.is_favorite}
              onToggleFav={() => toggleFav.mutate({ id: entry.id, is_favorite: !entry.is_favorite })}
            />
          ))}
        </div>
      )}

      {memories.map(({ label, entry }) => (
        <MemoryCard
          key={entry.id}
          label={label}
          text={entry.text}
          mood={entry.detected_mood as Mood}
          isFavorite={entry.is_favorite}
          onToggleFav={() => toggleFav.mutate({ id: entry.id, is_favorite: !entry.is_favorite })}
        />
      ))}
    </div>
  );
}

function MemoryCard({
  label, text, mood, isFavorite, onToggleFav,
}: {
  label: string; text: string; mood: Mood; isFavorite: boolean; onToggleFav: () => void;
}) {
  return (
    <div className="bg-secondary/50 rounded-lg p-3 mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm">{MOOD_EMOJI[mood]}</span>
          <button onClick={onToggleFav} className={isFavorite ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}>
            <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
      <p className="text-sm line-clamp-2">{text}</p>
    </div>
  );
}
