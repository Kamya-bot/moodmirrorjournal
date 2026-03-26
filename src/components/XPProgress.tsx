import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";

interface UserProgress {
  id: string;
  user_id: string;
  xp: number;
  level: number;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  mission_type: string;
  target: number;
  xp_reward: number;
  period: string;
  icon: string;
}

interface UserMission {
  id: string;
  mission_id: string;
  progress: number;
  completed: boolean;
  period_start: string;
}

const LEVEL_THRESHOLDS = [0, 50, 120, 220, 350, 520, 730, 1000, 1350, 1800, 2500];
const RANK_NAMES = ["Beginner", "Thinker", "Reflector", "Journaler", "Writer", "Storyteller", "Philosopher", "Sage", "Master", "Legend", "Enlightened"];

function getLevelInfo(xp: number) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 500;
  const progressInLevel = xp - currentThreshold;
  const levelRange = nextThreshold - currentThreshold;
  return { level, rank: RANK_NAMES[level - 1] || "Enlightened", progress: (progressInLevel / levelRange) * 100, xpToNext: nextThreshold - xp };
}

export function useUserProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_progress").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      if (!data) {
        const { data: newData, error: err } = await supabase
          .from("user_progress")
          .insert({ user_id: user!.id, xp: 0, level: 1 } as any)
          .select()
          .single();
        if (err) throw err;
        return newData as unknown as UserProgress;
      }
      return data as unknown as UserProgress;
    },
    enabled: !!user,
  });
}

export function useAddXP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      const { data: current } = await supabase.from("user_progress").select("xp").eq("user_id", user!.id).single();
      const newXP = ((current as any)?.xp || 0) + amount;
      const { level } = getLevelInfo(newXP);
      await supabase.from("user_progress").update({ xp: newXP, level } as any).eq("user_id", user!.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-progress"] }),
  });
}

export default function XPProgress() {
  const { data: progress } = useUserProgress();
  const { user } = useAuth();

  const { data: missions } = useQuery({
    queryKey: ["missions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("missions").select("*");
      if (error) throw error;
      return data as unknown as Mission[];
    },
  });

  const { data: userMissions } = useQuery({
    queryKey: ["user-missions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_missions").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data as unknown as UserMission[];
    },
    enabled: !!user,
  });

  if (!progress) return null;

  const info = getLevelInfo(progress.xp);

  return (
    <div className="space-y-4">
      {/* XP Card */}
      <div className="border border-border rounded-xl p-4 bg-card">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-display font-bold text-lg">Level {info.level}</h3>
            <p className="text-sm text-primary font-medium">{info.rank}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{progress.xp}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
        </div>
        <Progress value={info.progress} className="h-3 mb-1" />
        <p className="text-xs text-muted-foreground">{info.xpToNext} XP to next level</p>
      </div>

      {/* Missions */}
      {missions && missions.length > 0 && (
        <div className="border border-border rounded-xl p-4 bg-card">
          <h3 className="font-display font-semibold mb-3">📋 Weekly Missions</h3>
          <div className="space-y-2">
            {missions.filter((m) => m.period === "weekly").map((m) => {
              const um = userMissions?.find((um) => um.mission_id === m.id);
              const prog = um?.progress || 0;
              const completed = um?.completed || false;
              return (
                <div key={m.id} className={`flex items-center gap-3 p-2 rounded-lg ${completed ? "bg-primary/10" : "bg-secondary/50"}`}>
                  <span className="text-lg">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${completed ? "line-through text-muted-foreground" : ""}`}>{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium">{Math.min(prog, m.target)}/{m.target}</p>
                    <p className="text-xs text-primary">+{m.xp_reward} XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
