import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { JournalEntry, Mood } from "@/types/mood";
import { detectMoodSentenceLevel, getTipForMood } from "@/lib/moodAnalysis";

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
      return data as unknown as JournalEntry[];
    },
    enabled: !!user,
  });
}

async function detectMoodWithFallback(text: string): Promise<{ mood: Mood; tip: string; confidence: number }> {
  // Use sentence-level analysis
  const result = detectMoodSentenceLevel(text);
  const tip = getTipForMood(result.mood);

  // If confidence is low and text is substantial, try AI fallback
  if (result.confidence < 0.5 && text.trim().length > 15) {
    try {
      const { data, error } = await supabase.functions.invoke("detect-mood", {
        body: { text },
      });
      if (!error && data?.mood) {
        return {
          mood: data.mood as Mood,
          tip: data.tip || getTipForMood(data.mood as Mood),
          confidence: data.confidence ?? 0.8,
        };
      }
    } catch {
      // Fallback silently to keyword-based
    }
  }

  return { mood: result.mood, tip, confidence: result.confidence };
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("Not authenticated");
      const { mood, tip, confidence } = await detectMoodWithFallback(text);

      const { data, error } = await supabase
        .from("journal_entries")
        .insert({ user_id: user.id, text, detected_mood: mood, tip, confidence } as any)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as JournalEntry;
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
      const { mood, tip, confidence } = await detectMoodWithFallback(text);

      const { data, error } = await supabase
        .from("journal_entries")
        .update({ text, detected_mood: mood, tip, confidence } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as JournalEntry;
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

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { error } = await supabase
        .from("journal_entries")
        .update({ is_favorite } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
  });
}

export function useTogglePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_pinned }: { id: string; is_pinned: boolean }) => {
      const { error } = await supabase
        .from("journal_entries")
        .update({ is_pinned } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
  });
}
