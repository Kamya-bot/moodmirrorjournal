import { useState, useMemo } from "react";
import { useJournalEntries, useDeleteEntry } from "@/hooks/useJournal";
import { Mood } from "@/types/mood";
import { MOOD_EMOJI } from "@/lib/moodAnalysis";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function SearchEntries() {
  const { data: entries, isLoading } = useJournalEntries();
  const deleteEntry = useDeleteEntry();
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState<Mood | "all">("all");

  const filtered = useMemo(() => {
    if (!entries) return [];
    return entries.filter(e => {
      const matchesSearch = search === "" || e.text.toLowerCase().includes(search.toLowerCase());
      const matchesMood = moodFilter === "all" || e.detected_mood === moodFilter;
      return matchesSearch && matchesMood;
    });
  }, [entries, search, moodFilter]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const moods: (Mood | "all")[] = ["all", "happy", "sad", "angry", "stressed", "anxious", "calm"];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 animate-fade-in">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search entries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {moods.map(m => (
          <button
            key={m}
            onClick={() => setMoodFilter(m)}
            className={`px-3 py-1 text-xs rounded-full transition-colors capitalize ${
              moodFilter === m
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {m === "all" ? "All" : `${MOOD_EMOJI[m]} ${m}`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No entries found.</p>
        )}
        {filtered.map(entry => (
          <Card key={entry.id} className="p-4">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{MOOD_EMOJI[entry.detected_mood as Mood]}</span>
                  <span className="text-xs font-medium capitalize text-muted-foreground">
                    {entry.detected_mood}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    · {format(new Date(entry.created_at), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
                <p className="text-sm text-foreground">{entry.text}</p>
                {entry.tip && (
                  <p className="text-xs text-muted-foreground mt-2 italic">💡 {entry.tip}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteEntry.mutate(entry.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
