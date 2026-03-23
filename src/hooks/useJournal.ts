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

export function useCreateEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("Not authenticated");
      const mood = detectMood(text);
      const tip = getTipForMood(mood);

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
      const mood = detectMood(text);
      const tip = getTipForMood(mood);

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
