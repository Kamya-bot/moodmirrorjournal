import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  category: string;
  icon: string;
  prompts: string[];
}

interface UserChallenge {
  id: string;
  challenge_id: string;
  started_at: string;
  completed_at: string | null;
  current_day: number;
  entries_completed: string[];
}

export default function ChallengesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: challenges } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("challenges").select("*");
      if (error) throw error;
      return data as unknown as Challenge[];
    },
  });

  const { data: userChallenges } = useQuery({
    queryKey: ["user-challenges", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_challenges").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data as unknown as UserChallenge[];
    },
    enabled: !!user,
  });

  const startChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await supabase.from("user_challenges").insert({
        user_id: user!.id,
        challenge_id: challengeId,
        current_day: 1,
        entries_completed: [],
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-challenges"] });
      toast.success("Challenge started! 🎯");
    },
  });

  const getUserChallenge = (challengeId: string) =>
    userChallenges?.find((uc) => uc.challenge_id === challengeId && !uc.completed_at);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">🎯 Challenges</h1>
        <p className="text-muted-foreground mb-6">Mini journaling programs to build healthy habits.</p>

        {/* Active Challenges */}
        {userChallenges && userChallenges.filter((uc) => !uc.completed_at).length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Active Challenges</h2>
            <div className="space-y-3">
              {userChallenges.filter((uc) => !uc.completed_at).map((uc) => {
                const challenge = challenges?.find((c) => c.id === uc.challenge_id);
                if (!challenge) return null;
                const progress = ((uc.current_day - 1) / challenge.duration_days) * 100;
                return (
                  <div key={uc.id} className="border border-border rounded-xl p-4 bg-card">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{challenge.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium">{challenge.title}</h3>
                        <p className="text-xs text-muted-foreground">Day {uc.current_day} of {challenge.duration_days}</p>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                    {challenge.prompts && challenge.prompts.length >= uc.current_day && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        Today's prompt: "{challenge.prompts[uc.current_day - 1]}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Challenges */}
        <h2 className="text-lg font-semibold mb-3">Available Challenges</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {challenges?.map((c) => {
            const active = getUserChallenge(c.id);
            return (
              <div key={c.id} className="border border-border rounded-xl p-4 bg-card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{c.icon}</span>
                  <div>
                    <h3 className="font-medium">{c.title}</h3>
                    <p className="text-xs text-muted-foreground">{c.duration_days} days · {c.category}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
                <Button
                  size="sm"
                  onClick={() => startChallenge.mutate(c.id)}
                  disabled={!!active || startChallenge.isPending}
                  variant={active ? "secondary" : "default"}
                >
                  {active ? "In Progress" : "Start Challenge"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
