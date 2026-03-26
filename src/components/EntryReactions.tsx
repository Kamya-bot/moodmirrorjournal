import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const REACTIONS = [
  { emoji: "❤️", label: "Love" },
  { emoji: "💭", label: "Reflect" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "🌟", label: "Proud" },
  { emoji: "🤗", label: "Hug" },
];

interface EntryReactionsProps {
  entryId: string;
  reactions: Record<string, number>;
}

export default function EntryReactions({ entryId, reactions: initialReactions }: EntryReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const queryClient = useQueryClient();

  const toggleReaction = useMutation({
    mutationFn: async (emoji: string) => {
      const current = { ...initialReactions };
      current[emoji] = (current[emoji] || 0) > 0 ? 0 : 1;
      // Clean up zeros
      Object.keys(current).forEach((k) => { if (current[k] === 0) delete current[k]; });

      const { error } = await supabase
        .from("journal_entries")
        .update({ reactions: current } as any)
        .eq("id", entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
  });

  const activeReactions = Object.entries(initialReactions || {}).filter(([, v]) => v > 0);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {activeReactions.map(([emoji]) => (
        <motion.button
          key={emoji}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-sm bg-primary/10 rounded-full px-1.5 py-0.5 hover:bg-primary/20 transition-colors"
          onClick={() => toggleReaction.mutate(emoji)}
        >
          {emoji}
        </motion.button>
      ))}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-muted-foreground hover:text-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center bg-secondary/50 hover:bg-secondary transition-colors"
        >
          +
        </button>
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 4 }}
              className="absolute bottom-8 left-0 bg-card border border-border rounded-lg p-1.5 flex gap-1 shadow-lg z-10"
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => {
                    toggleReaction.mutate(r.emoji);
                    setShowPicker(false);
                  }}
                  className="text-lg hover:scale-125 transition-transform p-1"
                  title={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
