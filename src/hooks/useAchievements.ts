import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Achievement {
  id: string;
  user_id: string;
  achievement_key: string;
  unlocked_at: string;
}

export function useAchievements() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["achievements", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("unlocked_at", { ascending: false });
      if (error) throw error;
      return data as Achievement[];
    },
    enabled: !!user,
  });
}

export function useUnlockAchievement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (key: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("achievements")
        .insert({ user_id: user.id, achievement_key: key } as any);
      if (error && !error.message.includes("duplicate")) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}
