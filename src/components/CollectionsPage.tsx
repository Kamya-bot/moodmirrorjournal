import { useCollections } from "@/components/CollectionsManager";
import { useJournalEntries, useToggleFavorite } from "@/hooks/useJournal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { MOOD_EMOJI } from "@/lib/moodAnalysis";
import { Mood } from "@/types/mood";
import { format } from "date-fns";
import { Star, FolderOpen } from "lucide-react";

export default function CollectionsPage() {
  const { data: collections } = useCollections();
  const { data: entries } = useJournalEntries();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const toggleFav = useToggleFavorite();

  const selectedEntries = entries?.filter((e) => (e as any).collection_id === selectedId) || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-display font-bold mb-2">📂 Collections</h1>
        <p className="text-muted-foreground mb-6">Organize your entries into meaningful spaces.</p>

        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setSelectedId(null)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              !selectedId ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {collections?.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedId === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {selectedId ? (
          selectedEntries.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No entries in this collection yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Assign entries from the journal view.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEntries.map((entry) => (
                <div key={entry.id} className="border border-border rounded-xl p-4 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{MOOD_EMOJI[entry.detected_mood as Mood]} {entry.detected_mood}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(entry.created_at), "MMM d, h:mm a")}</span>
                  </div>
                  <p className="text-sm">{entry.text}</p>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {collections?.map((c) => {
              const count = entries?.filter((e) => (e as any).collection_id === c.id).length || 0;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className="border border-border rounded-xl p-6 bg-card hover:shadow-md transition-all text-left"
                >
                  <span className="text-3xl">{c.icon}</span>
                  <h3 className="font-medium mt-2">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{count} entries</p>
                </button>
              );
            })}
            {(!collections || collections.length === 0) && (
              <p className="text-muted-foreground col-span-2 text-center py-12">
                No collections yet. Create one from the sidebar or journal view.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
