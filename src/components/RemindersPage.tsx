import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Bell, Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

interface Reminder {
  id: string;
  user_id: string;
  reminder_time: string;
  reminder_type: string;
  enabled: boolean;
}

export default function RemindersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [time, setTime] = useState("09:00");
  const [type, setType] = useState("daily");

  const { data: reminders } = useQuery({
    queryKey: ["reminders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("reminders").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data as unknown as Reminder[];
    },
    enabled: !!user,
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reminders").insert({
        user_id: user!.id,
        reminder_time: time,
        reminder_type: type,
        enabled: true,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder set!");
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase.from("reminders").update({ enabled } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reminders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder removed");
    },
  });

  const TYPES = [
    { value: "daily", label: "Daily Journal" },
    { value: "streak", label: "Streak Warning" },
    { value: "challenge", label: "Challenge Reminder" },
    { value: "reflection", label: "Weekly Reflection" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-display font-bold mb-2">🔔 Reminders</h1>
        <p className="text-muted-foreground mb-6">Set reminders to keep your journaling habit strong.</p>

        <div className="border border-border rounded-xl p-4 bg-card mb-6">
          <h3 className="font-medium mb-3">Add Reminder</h3>
          <div className="flex gap-3 items-end flex-wrap">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-32" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <Button onClick={() => create.mutate()} disabled={create.isPending} className="gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {reminders?.map((r) => (
            <div key={r.id} className="flex items-center gap-4 border border-border rounded-xl p-4 bg-card">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{r.reminder_time.slice(0, 5)}</p>
                <p className="text-xs text-muted-foreground capitalize">{r.reminder_type.replace("_", " ")}</p>
              </div>
              <Switch checked={r.enabled} onCheckedChange={(enabled) => toggle.mutate({ id: r.id, enabled })} />
              <button onClick={() => remove.mutate(r.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {(!reminders || reminders.length === 0) && (
            <p className="text-center text-muted-foreground py-8">No reminders yet. Add one above!</p>
          )}
        </div>
      </div>
    </div>
  );
}
