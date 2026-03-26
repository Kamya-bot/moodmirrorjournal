import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen } from "lucide-react";

interface Template {
  id: string;
  title: string;
  content: string;
  category: string;
  is_system: boolean;
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "morning", label: "🌅 Morning" },
  { value: "evening", label: "🌙 Evening" },
  { value: "weekly", label: "📅 Weekly" },
  { value: "gratitude", label: "🙏 Gratitude" },
  { value: "goals", label: "🎯 Goals" },
  { value: "healing", label: "💚 Healing" },
  { value: "growth", label: "💪 Growth" },
  { value: "freeform", label: "✍️ Freeform" },
];

export default function TemplatesPicker({ onUseTemplate }: { onUseTemplate: (content: string) => void }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("all");

  const { data: templates } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("templates").select("*").order("category");
      if (error) throw error;
      return data as unknown as Template[];
    },
  });

  const filtered = category === "all" ? templates : templates?.filter((t) => t.category === category);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground" title="Templates">
          <BookOpen className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Journal Templates</DialogTitle>
        </DialogHeader>
        <div className="flex gap-1.5 flex-wrap pb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                category === c.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {filtered?.map((t) => (
            <div key={t.id} className="border border-border rounded-lg p-3 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-sm">{t.title}</h3>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => { onUseTemplate(t.content); setOpen(false); }}
                >
                  Use
                </Button>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-line">{t.content}</p>
            </div>
          ))}
          {(!filtered || filtered.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-8">No templates in this category yet.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
