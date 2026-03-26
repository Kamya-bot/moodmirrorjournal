import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Hash, Plus } from "lucide-react";

interface Tag {
  id: string;
  user_id: string;
  name: string;
}

export function useTags() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tags", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("tags").select("*").order("name");
      if (error) throw error;
      return data as unknown as Tag[];
    },
    enabled: !!user,
  });
}

export function useEntryTags(entryId: string) {
  return useQuery({
    queryKey: ["entry-tags", entryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entry_tags")
        .select("tag_id, tags(id, name)")
        .eq("entry_id", entryId);
      if (error) throw error;
      return (data || []).map((d: any) => d.tags as Tag);
    },
  });
}

export default function TagManager({ entryId }: { entryId: string }) {
  const { user } = useAuth();
  const { data: allTags } = useTags();
  const { data: entryTags } = useEntryTags(entryId);
  const queryClient = useQueryClient();
  const [newTag, setNewTag] = useState("");
  const [showInput, setShowInput] = useState(false);

  const addTag = useMutation({
    mutationFn: async (tagName: string) => {
      const trimmed = tagName.trim().toLowerCase().replace(/^#/, "");
      if (!trimmed) return;

      // Find or create tag
      let tagId: string;
      const existing = allTags?.find((t) => t.name === trimmed);
      if (existing) {
        tagId = existing.id;
      } else {
        const { data, error } = await supabase
          .from("tags")
          .insert({ user_id: user!.id, name: trimmed } as any)
          .select()
          .single();
        if (error) throw error;
        tagId = (data as any).id;
      }

      // Link to entry
      const { error } = await supabase
        .from("entry_tags")
        .insert({ entry_id: entryId, tag_id: tagId } as any);
      if (error && !error.message.includes("duplicate")) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entry-tags", entryId] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setNewTag("");
      setShowInput(false);
    },
  });

  const removeTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from("entry_tags")
        .delete()
        .eq("entry_id", entryId)
        .eq("tag_id", tagId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entry-tags", entryId] });
    },
  });

  return (
    <div className="flex items-center gap-1 flex-wrap mt-1">
      {entryTags?.map((tag) => (
        <Badge key={tag.id} variant="secondary" className="text-xs gap-1 py-0 px-1.5">
          <Hash className="h-2.5 w-2.5" />
          {tag.name}
          <button onClick={() => removeTag.mutate(tag.id)} className="hover:text-destructive">
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
      {showInput ? (
        <div className="flex items-center gap-1">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addTag.mutate(newTag); if (e.key === "Escape") setShowInput(false); }}
            placeholder="#tag"
            className="h-6 w-20 text-xs px-1"
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-0.5"
        >
          <Plus className="h-3 w-3" />
          tag
        </button>
      )}
    </div>
  );
}
