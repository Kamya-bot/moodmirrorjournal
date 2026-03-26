import { useState, useRef, useEffect } from "react";
import { useJournalEntries, useCreateEntry, useDeleteEntry, useToggleFavorite, useTogglePin } from "@/hooks/useJournal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MOOD_EMOJI, MOOD_COLORS, getQuoteForMood } from "@/lib/moodAnalysis";
import { JournalEntry, Mood } from "@/types/mood";
import { Send, Trash2, Loader2, Star, Pin, Maximize2 } from "lucide-react";
import EntryReactions from "@/components/EntryReactions";
import { format } from "date-fns";
import VoiceInput from "@/components/VoiceInput";
import ExportEntries from "@/components/ExportEntries";
import DailyPrompt from "@/components/DailyPrompt";
import AchievementToast from "@/components/AchievementToast";
import MoodThemeBackground from "@/components/MoodThemeBackground";
import AmbientMode from "@/components/AmbientMode";
import TemplatesPicker from "@/components/TemplatesPicker";
import TagManager from "@/components/TagManager";

const DRAFT_KEY = "moodmirror-draft";

export default function JournalChat() {
  const [text, setText] = useState(() => {
    try {
      const prompt = sessionStorage.getItem("moodmirror-use-prompt");
      if (prompt) { sessionStorage.removeItem("moodmirror-use-prompt"); return prompt; }
      return localStorage.getItem(DRAFT_KEY) || "";
    } catch { return ""; }
  });
  const { data: entries, isLoading } = useJournalEntries();
  const createEntry = useCreateEntry();
  const deleteEntry = useDeleteEntry();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [ambientOpen, setAmbientOpen] = useState(false);

  // Autosave draft
  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, text); } catch {}
    }, 500);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || createEntry.isPending) return;
    setText("");
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    await createEntry.mutateAsync(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sorted = [...(entries || [])].reverse();
  const pinned = sorted.filter(e => e.is_pinned);
  const unpinned = sorted.filter(e => !e.is_pinned);
  const sortedEntries = [...pinned, ...unpinned];

  const latestMood = sortedEntries.length > 0
    ? (sortedEntries[0].detected_mood as Mood)
    : null;

  return (
    <div className="flex flex-col h-full relative">
      <MoodThemeBackground mood={latestMood} />
      <AchievementToast />
      <AmbientMode
        open={ambientOpen}
        onClose={() => setAmbientOpen(false)}
        initialText={text}
        onTextChange={(t) => setText(t)}
      />
      {entries && entries.length > 0 && (
        <div className="flex justify-end px-4 pt-3">
          <ExportEntries entries={entries} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sortedEntries.length === 0 && (
          <div className="text-center text-muted-foreground py-12 animate-fade-in">
            <p className="text-5xl mb-4">🪞</p>
            <h2 className="text-xl font-display font-semibold">Welcome to MoodMirror</h2>
            <p className="mt-2 mb-6">Write your first thought to begin your journey.</p>
            <DailyPrompt onUsePrompt={(p) => setText(p)} />
          </div>
        )}

        {sortedEntries.length > 0 && !text && (
          <div className="max-w-3xl mx-auto">
            <DailyPrompt onUsePrompt={(p) => setText(p)} />
          </div>
        )}

        {sortedEntries.map((entry) => (
          <ChatBubble key={entry.id} entry={entry} onDelete={() => deleteEntry.mutate(entry.id)} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-4 bg-card">
        {text && (
          <p className="text-xs text-muted-foreground/60 mb-1 max-w-3xl mx-auto">
            Draft auto-saved
          </p>
        )}
        <div className="flex gap-2 items-end max-w-3xl mx-auto">
          <VoiceInput
            onTranscript={(t) => setText((prev) => (prev ? prev + " " + t : t))}
            disabled={createEntry.isPending}
          />
          <TemplatesPicker onUseTemplate={(t) => setText(t)} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAmbientOpen(true)}
            className="shrink-0 text-muted-foreground"
            title="Focus Mode"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Textarea
            placeholder="How are you feeling today?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[48px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!text.trim() || createEntry.isPending}
            size="icon"
            className="shrink-0"
          >
            {createEntry.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ entry, onDelete }: { entry: JournalEntry; onDelete: () => void }) {
  const mood = entry.detected_mood as Mood;
  const confidencePct = entry.confidence != null ? Math.round(entry.confidence * 100) : null;
  const toggleFav = useToggleFavorite();
  const togglePin = useTogglePin();

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex justify-end mb-2">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
          {entry.is_pinned && (
            <span className="text-xs opacity-70 block mb-1">📌 Pinned</span>
          )}
          <p className="text-sm">{entry.text}</p>
          <p className="text-xs opacity-70 mt-1 text-right">
            {format(new Date(entry.created_at), "MMM d, h:mm a")}
          </p>
        </div>
      </div>

      <div className="flex justify-start mb-1">
        <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${MOOD_COLORS[mood]}`} />
            <span className="text-xs font-medium text-muted-foreground capitalize">
              {MOOD_EMOJI[mood]} {mood}
            </span>
            {confidencePct != null && (
              <span className="text-xs text-muted-foreground/70">
                · {confidencePct}% confidence
              </span>
            )}
          </div>
          {entry.tip && <p className="text-sm text-foreground">{entry.tip}</p>}
          <p className="text-xs text-muted-foreground mt-2 italic">
            {getQuoteForMood(mood)}
          </p>
          <div className="flex items-center justify-between mt-1 gap-1">
            <EntryReactions entryId={entry.id} reactions={entry.reactions || {}} />
            <div className="flex gap-1">
            <button
              onClick={() => toggleFav.mutate({ id: entry.id, is_favorite: !entry.is_favorite })}
              className={`transition-colors ${entry.is_favorite ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`}
              title={entry.is_favorite ? "Unfavorite" : "Favorite"}
            >
              <Star className={`h-3.5 w-3.5 ${entry.is_favorite ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => togglePin.mutate({ id: entry.id, is_pinned: !entry.is_pinned })}
              className={`transition-colors ${entry.is_pinned ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
              title={entry.is_pinned ? "Unpin" : "Pin"}
            >
              <Pin className={`h-3.5 w-3.5 ${entry.is_pinned ? "fill-current" : ""}`} />
            </button>
            <button onClick={onDelete} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            </div>
          </div>
          <TagManager entryId={entry.id} />
        </div>
      </div>
    </div>
  );
}
