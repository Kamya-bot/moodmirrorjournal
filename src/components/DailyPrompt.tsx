import { getDailyPrompt } from "@/lib/journalPrompts";
import { Lightbulb } from "lucide-react";

interface DailyPromptProps {
  onUsePrompt: (prompt: string) => void;
}

export default function DailyPrompt({ onUsePrompt }: DailyPromptProps) {
  const prompt = getDailyPrompt();

  return (
    <button
      onClick={() => onUsePrompt(prompt)}
      className="w-full text-left px-4 py-3 bg-accent/50 border border-accent rounded-xl flex items-start gap-3 hover:bg-accent/70 transition-colors group"
    >
      <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-medium text-primary mb-0.5">Today's Prompt</p>
        <p className="text-sm text-foreground">{prompt}</p>
      </div>
    </button>
  );
}
