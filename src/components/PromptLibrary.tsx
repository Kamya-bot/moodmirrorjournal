import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface Prompt {
  content: string;
  category: string;
}

const PROMPT_LIBRARY: Record<string, Prompt[]> = {
  gratitude: [
    { content: "What are 3 things you're grateful for today?", category: "gratitude" },
    { content: "Who has positively impacted your life recently?", category: "gratitude" },
    { content: "What simple pleasure brought you joy today?", category: "gratitude" },
    { content: "Write about a place that makes you feel at peace.", category: "gratitude" },
    { content: "What skill or talent are you most thankful for?", category: "gratitude" },
  ],
  "self-love": [
    { content: "What do you love most about yourself?", category: "self-love" },
    { content: "Write a love letter to your body.", category: "self-love" },
    { content: "What boundary are you proud of setting?", category: "self-love" },
    { content: "Describe a moment you chose yourself.", category: "self-love" },
    { content: "What would your best friend say they love about you?", category: "self-love" },
  ],
  healing: [
    { content: "What emotional wound needs attention right now?", category: "healing" },
    { content: "Write about something you need to forgive.", category: "healing" },
    { content: "What would letting go look like for you?", category: "healing" },
    { content: "Describe a time you were resilient.", category: "healing" },
    { content: "What does your inner child need to hear?", category: "healing" },
  ],
  productivity: [
    { content: "What's your most important task this week?", category: "productivity" },
    { content: "What distracts you most and how can you manage it?", category: "productivity" },
    { content: "Describe your ideal productive day.", category: "productivity" },
    { content: "What habit would make the biggest difference in your life?", category: "productivity" },
    { content: "What project excites you right now?", category: "productivity" },
  ],
  relationships: [
    { content: "Who do you need to reach out to?", category: "relationships" },
    { content: "Describe a relationship that has shaped who you are.", category: "relationships" },
    { content: "What do you need from the people in your life?", category: "relationships" },
    { content: "Write about a moment of deep connection.", category: "relationships" },
    { content: "How can you show up better for someone you love?", category: "relationships" },
  ],
  dreams: [
    { content: "Where do you see yourself in 5 years?", category: "dreams" },
    { content: "What dream have you been putting off?", category: "dreams" },
    { content: "If money wasn't an issue, what would you do?", category: "dreams" },
    { content: "What legacy do you want to leave?", category: "dreams" },
    { content: "Describe your dream life in detail.", category: "dreams" },
  ],
};

const CATEGORIES = [
  { key: "gratitude", label: "🙏 Gratitude" },
  { key: "self-love", label: "💜 Self-Love" },
  { key: "healing", label: "💚 Healing" },
  { key: "productivity", label: "⚡ Productivity" },
  { key: "relationships", label: "❤️ Relationships" },
  { key: "dreams", label: "🌟 Dreams" },
];

export default function PromptLibrary({ onUsePrompt }: { onUsePrompt: (text: string) => void }) {
  const [category, setCategory] = useState("gratitude");
  const prompts = PROMPT_LIBRARY[category] || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-display font-bold mb-2">💡 Prompt Library</h1>
        <p className="text-muted-foreground mb-6">Explore prompts by category to inspire your journaling.</p>

        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                category === c.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {prompts.map((p, i) => (
            <div key={i} className="border border-border rounded-xl p-4 bg-card flex items-center gap-4">
              <p className="flex-1 text-sm">{p.content}</p>
              <Button size="sm" variant="outline" onClick={() => onUsePrompt(p.content)}>
                Use
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
