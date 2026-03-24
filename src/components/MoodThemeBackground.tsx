import { Mood } from "@/types/mood";

const MOOD_GRADIENTS: Record<Mood, string> = {
  happy:
    "radial-gradient(ellipse at 50% 0%, hsl(var(--mood-happy) / 0.12) 0%, transparent 60%)",
  sad:
    "radial-gradient(ellipse at 50% 0%, hsl(var(--mood-sad) / 0.12) 0%, transparent 60%)",
  angry:
    "radial-gradient(ellipse at 50% 0%, hsl(var(--mood-angry) / 0.10) 0%, transparent 60%)",
  stressed:
    "radial-gradient(ellipse at 50% 0%, hsl(var(--mood-stressed) / 0.10) 0%, transparent 60%)",
  anxious:
    "radial-gradient(ellipse at 50% 0%, hsl(var(--mood-anxious) / 0.12) 0%, transparent 60%)",
  calm:
    "radial-gradient(ellipse at 50% 0%, hsl(var(--mood-calm) / 0.12) 0%, transparent 60%)",
};

interface MoodThemeBackgroundProps {
  mood: Mood | null;
}

export default function MoodThemeBackground({ mood }: MoodThemeBackgroundProps) {
  if (!mood) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-in-out"
      style={{ background: MOOD_GRADIENTS[mood] }}
      aria-hidden
    />
  );
}
