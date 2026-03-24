import { useState, useMemo } from "react";
import { useJournalEntries, useToggleFavorite } from "@/hooks/useJournal";
import { JournalEntry, Mood } from "@/types/mood";
import { MOOD_EMOJI, MOOD_COLORS } from "@/lib/moodAnalysis";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star, Search, ArrowUpDown, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function FavoritesPage() {
  const { data: entries, isLoading } = useJournalEntries();
  const toggleFav = useToggleFavorite();
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

  const favorites = useMemo(() => {
    if (!entries) return [];
    let favs = entries.filter((e) => e.is_favorite);
    if (search.trim()) {
      const q = search.toLowerCase();
      favs = favs.filter(
        (e) =>
          e.text.toLowerCase().includes(q) ||
          e.detected_mood.toLowerCase().includes(q)
      );
    }
    favs.sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortAsc ? diff : -diff;
    });
    return favs;
  }, [entries, search, sortAsc]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 overflow-y-auto max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          ⭐ Favorite Memories
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your most meaningful journal moments
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search favorites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortAsc(!sortAsc)}
          title={sortAsc ? "Oldest first" : "Newest first"}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">⭐</p>
          <p className="font-medium">No favorites yet</p>
          <p className="text-sm mt-1">
            Star entries in your journal to save them here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((entry) => (
            <FavoriteCard
              key={entry.id}
              entry={entry}
              onUnfavorite={() =>
                toggleFav.mutate({ id: entry.id, is_favorite: false })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FavoriteCard({
  entry,
  onUnfavorite,
}: {
  entry: JournalEntry;
  onUnfavorite: () => void;
}) {
  const mood = entry.detected_mood as Mood;

  return (
    <Card className="p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${MOOD_COLORS[mood]}`}
            />
            <span className="text-xs font-medium text-muted-foreground capitalize">
              {MOOD_EMOJI[mood]} {mood}
            </span>
            <span className="text-xs text-muted-foreground">
              · {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{entry.text}</p>
          {entry.tip && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              💡 {entry.tip}
            </p>
          )}
        </div>
        <button
          onClick={onUnfavorite}
          className="text-yellow-500 hover:text-muted-foreground transition-colors shrink-0 mt-1"
          title="Remove from favorites"
        >
          <Star className="h-4 w-4 fill-current" />
        </button>
      </div>
    </Card>
  );
}
