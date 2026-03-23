import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { JournalEntry, Mood } from "@/types/mood";
import { detectMood, getTipForMood } from "@/lib/moodAnalysis";

export function useJournalEntries() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["journal-entries", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as JournalEntry[];
    },
    enabled: !!user,
  });
}

async function detectMoodWithFallback(text: string): Promise<{ mood: Mood; tip: string }> {
  const mood = detectMood(text);
  const tip = getTipForMood(mood);

  // Check if keyword score is low (defaults to "calm" with no strong signals)
  // In that case, try AI fallback
  const lower = text.toLowerCase();
  const hasStrongSignal = ["happy", "sad", "angry", "stressed", "anxious", "calm"].some(
    (m) => lower.includes(m)
  );

  if (mood === "calm" && !hasStrongSignal && text.trim().length > 15) {
    try {
      const { data, error } = await supabase.functions.invoke("detect-mood", {
        body: { text },
      });
      if (!error && data?.mood) {
        return {
          mood: data.mood as Mood,
          tip: data.tip || getTipForMood(data.mood as Mood),
        };
      }
    } catch {
      // Fallback to keyword-based detection silently
    }
  }

  return { mood, tip };
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("Not authenticated");
      const { mood, tip } = await detectMoodWithFallback(text);

      const { data, error } = await supabase
        .from("journal_entries")
        .insert({ user_id: user.id, text, detected_mood: mood, tip })
        .select()
        .single();

      if (error) throw error;
      return data as JournalEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const { mood, tip } = await detectMoodWithFallback(text);

      const { data, error } = await supabase
        .from("journal_entries")
        .update({ text, detected_mood: mood, tip })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as JournalEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
  });
}
