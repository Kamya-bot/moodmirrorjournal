export type Mood = "happy" | "sad" | "angry" | "stressed" | "anxious" | "calm";

export interface JournalEntry {
  id: string;
  user_id: string;
  text: string;
  detected_mood: Mood;
  tip: string | null;
  confidence: number | null;
  is_favorite: boolean;
  is_pinned: boolean;
  reactions: Record<string, number>;
  created_at: string;
  updated_at: string;
}
