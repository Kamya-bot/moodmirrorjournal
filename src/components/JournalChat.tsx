import { useState, useRef, useEffect } from "react";
import { useJournalEntries, useCreateEntry, useDeleteEntry } from "@/hooks/useJournal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MOOD_EMOJI, MOOD_COLORS, getQuoteForMood } from "@/lib/moodAnalysis";
import { JournalEntry, Mood } from "@/types/mood";
import { Send, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function JournalChat() {
  const [text, setText] = useState("");
  const { data: entries, isLoading } = useJournalEntries();
  const createEntry = useCreateEntry();
  const deleteEntry = useDeleteEntry();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || createEntry.isPending) return;
    setText("");
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

  const sortedEntries = [...(entries || [])].reverse();

  return (
    <div className="flex flex-col h-full">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sortedEntries.length === 0 && (
          <div className="text-center text-muted-foreground py-20 animate-fade-in">
            <p className="text-5xl mb-4">🪞</p>
            <h2 className="text-xl font-display font-semibold">Welcome to MoodMirror</h2>
            <p className="mt-2">Write your first thought to begin your journey.</p>
          </div>
        )}

        {sortedEntries.map((entry) => (
          <ChatBubble key={entry.id} entry={entry} onDelete={() => deleteEntry.mutate(entry.id)} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4 bg-card">
        <div className="flex gap-2 items-end max-w-3xl mx-auto">
          <Textarea
            placeholder="How are you feeling today?"
            value={text}
            onChange={e => setText(e.target.value)}
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

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* User message */}
      <div className="flex justify-end mb-2">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
          <p className="text-sm">{entry.text}</p>
          <p className="text-xs opacity-70 mt-1 text-right">
            {format(new Date(entry.created_at), "MMM d, h:mm a")}
          </p>
        </div>
      </div>

      {/* AI response */}
      <div className="flex justify-start mb-1">
        <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${MOOD_COLORS[mood]}`} />
            <span className="text-xs font-medium text-muted-foreground capitalize">
              {MOOD_EMOJI[mood]} {mood}
            </span>
          </div>
          {entry.tip && <p className="text-sm text-foreground">{entry.tip}</p>}
          <p className="text-xs text-muted-foreground mt-2 italic">
            {getQuoteForMood(mood)}
          </p>
          <div className="flex justify-end mt-1">
            <button onClick={onDelete} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
