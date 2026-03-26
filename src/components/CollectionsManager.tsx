import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FolderPlus, Trash2, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Collection {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

const ICONS = ["📁", "💼", "❤️", "🙏", "🎯", "✈️", "📚", "💪", "🌱", "🏠", "🧠", "🎨"];

export function useCollections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["collections", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("collections").select("*").order("created_at");
      if (error) throw error;
      return data as unknown as Collection[];
    },
    enabled: !!user,
  });
}

export default function CollectionsManager() {
  const { user } = useAuth();
  const { data: collections } = useCollections();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📁");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("collections").insert({ user_id: user!.id, name: name.trim(), icon } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setName("");
      toast.success("Collection created!");
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, newName }: { id: string; newName: string }) => {
      const { error } = await supabase.from("collections").update({ name: newName } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setEditingId(null);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Collection deleted");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FolderPlus className="h-4 w-4" />
          Collections
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Collections</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex gap-1 flex-wrap">
              {ICONS.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`text-lg p-1 rounded ${icon === i ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-secondary"}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Collection name..." maxLength={30} />
            <Button onClick={() => create.mutate()} disabled={!name.trim() || create.isPending} size="sm">
              Add
            </Button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {collections?.map((c) => (
              <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                <span>{c.icon}</span>
                {editingId === c.id ? (
                  <>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm" />
                    <button onClick={() => update.mutate({ id: c.id, newName: editName })} className="text-primary"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditingId(null)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium">{c.name}</span>
                    <button onClick={() => { setEditingId(c.id); setEditName(c.name); }} className="text-muted-foreground hover:text-foreground"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => remove.mutate(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </>
                )}
              </div>
            ))}
            {(!collections || collections.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No collections yet. Create one above!</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
