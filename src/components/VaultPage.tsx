import { useState } from "react";
import { useJournalEntries, useToggleFavorite, useTogglePin } from "@/hooks/useJournal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MOOD_EMOJI } from "@/lib/moodAnalysis";
import { Mood, JournalEntry } from "@/types/mood";
import { Lock, Unlock, Star, Pin, Trash2, Search, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function VaultPage() {
  const { data: entries } = useJournalEntries();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const toggleFav = useToggleFavorite();
  const togglePin = useTogglePin();

  // Simple PIN — stored in localStorage
  const storedPin = localStorage.getItem("moodmirror-vault-pin");

  const handleSetPin = () => {
    if (pin.length < 4) { toast.error("PIN must be at least 4 digits"); return; }
    localStorage.setItem("moodmirror-vault-pin", pin);
    setUnlocked(true);
    toast.success("Vault PIN set!");
  };

  const handleUnlock = () => {
    if (pin === storedPin) {
      setUnlocked(true);
    } else {
      toast.error("Incorrect PIN");
    }
    setPin("");
  };

  const toggleVault = useMutation({
    mutationFn: async ({ id, is_vault }: { id: string; is_vault: boolean }) => {
      const { error } = await supabase.from("journal_entries").update({ is_vault } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      toast.success("Entry updated");
    },
  });

  if (!unlocked) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <ShieldCheck className="h-16 w-16 mx-auto text-primary mb-4" />
          <h2 className="text-xl font-display font-bold mb-2">Private Vault</h2>
          <p className="text-muted-foreground text-sm mb-6">
            {storedPin ? "Enter your PIN to access private entries." : "Set a PIN to protect your most private entries."}
          </p>
          <div className="flex gap-2 justify-center">
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter PIN..."
              className="w-32 text-center text-lg tracking-widest"
              onKeyDown={(e) => e.key === "Enter" && (storedPin ? handleUnlock() : handleSetPin())}
            />
            <Button onClick={storedPin ? handleUnlock : handleSetPin}>
              {storedPin ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const vaultEntries = entries?.filter((e) => (e as any).is_vault) || [];
  const filtered = search
    ? vaultEntries.filter((e) => e.text.toLowerCase().includes(search.toLowerCase()))
    : vaultEntries;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold">🔒 Private Vault</h1>
            <p className="text-sm text-muted-foreground">{vaultEntries.length} private entries</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setUnlocked(false)}>
            <Lock className="h-4 w-4 mr-1" /> Lock
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vault..." className="pl-9" />
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            {vaultEntries.length === 0 ? "No entries in vault yet. Move entries here from the journal." : "No matches found."}
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry) => (
              <div key={entry.id} className="border border-border rounded-xl p-4 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">{MOOD_EMOJI[entry.detected_mood as Mood]} {entry.detected_mood}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(entry.created_at), "MMM d, h:mm a")}</span>
                </div>
                <p className="text-sm mb-2">{entry.text}</p>
                <div className="flex gap-1">
                  <button onClick={() => toggleFav.mutate({ id: entry.id, is_favorite: !entry.is_favorite })} className={entry.is_favorite ? "text-yellow-500" : "text-muted-foreground"}>
                    <Star className={`h-3.5 w-3.5 ${entry.is_favorite ? "fill-current" : ""}`} />
                  </button>
                  <button onClick={() => toggleVault.mutate({ id: entry.id, is_vault: false })} className="text-muted-foreground hover:text-foreground text-xs ml-2">
                    Remove from vault
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
