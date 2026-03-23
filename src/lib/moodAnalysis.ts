import { Mood } from "@/types/mood";

type Weight = "strong" | "medium" | "weak";
const WEIGHT_SCORE: Record<Weight, number> = { strong: 3, medium: 2, weak: 1 };

const MOOD_KEYWORDS: Record<Mood, Record<Weight, string[]>> = {
  happy: {
    strong: ["ecstatic", "thrilled", "overjoyed", "elated", "euphoric", "delighted", "blissful"],
    medium: ["happy", "joyful", "excited", "wonderful", "amazing", "fantastic", "love", "loving", "grateful", "cheerful", "proud", "celebrate"],
    weak: ["good", "nice", "pleased", "content", "satisfied", "okay", "fine", "fun", "smile", "positive", "optimistic"],
  },
  sad: {
    strong: ["heartbroken", "devastated", "miserable", "hopeless", "depressed", "grief", "despair"],
    medium: ["sad", "unhappy", "crying", "tears", "lonely", "gloomy", "melancholy", "sorrow"],
    weak: ["down", "blue", "disappointed", "miss", "missing", "empty", "regret", "sorry", "failed", "failure"],
  },
  angry: {
    strong: ["furious", "rage", "livid", "outraged", "infuriated", "hate", "hostile"],
    medium: ["angry", "mad", "aggressive", "bitter", "resentful", "disgusted", "fed up", "sick of", "can't stand"],
    weak: ["annoyed", "irritated", "frustrated", "upset", "tired of"],
  },
  stressed: {
    strong: ["overwhelmed", "burned out", "burnout", "can't cope", "breaking down"],
    medium: ["stressed", "overworked", "exhausted", "swamped", "chaos", "too much"],
    weak: ["busy", "pressure", "deadline", "hectic", "tense", "demanding", "loaded"],
  },
  anxious: {
    strong: ["panic", "dread", "terror", "paralyzed", "spiraling"],
    medium: ["anxious", "anxiety", "scared", "fear", "restless", "insomnia", "cant sleep", "overthinking"],
    weak: ["worried", "nervous", "uneasy", "uncertain", "insecure", "what if", "apprehensive"],
  },
  calm: {
    strong: ["serene", "blissful", "tranquil", "zen", "at peace"],
    medium: ["calm", "peaceful", "relaxed", "meditation", "mindful", "balanced", "centered", "harmony"],
    weak: ["quiet", "still", "gentle", "ease", "comfortable", "rested", "refreshed", "soothing", "breathing"],
  },
};

const NEGATION_WORDS = ["not", "don't", "dont", "doesn't", "doesnt", "isn't", "isnt", "wasn't", "wasnt", "never", "no", "hardly", "barely", "can't", "cant", "won't", "wont"];
const NEGATION_WINDOW = 3;

function isNegated(text: string, matchIndex: number): boolean {
  const before = text.slice(0, matchIndex).trim();
  const words = before.split(/\s+/).slice(-NEGATION_WINDOW);
  return words.some(w => NEGATION_WORDS.includes(w.toLowerCase()));
}

export interface MoodResult {
  mood: Mood;
  confidence: number;
  scores: Record<Mood, number>;
}

export function detectMood(text: string): Mood {
  return detectMoodDetailed(text).mood;
}

export function detectMoodDetailed(text: string): MoodResult {
  const lower = text.toLowerCase();
  const scores: Record<Mood, number> = {
    happy: 0, sad: 0, angry: 0, stressed: 0, anxious: 0, calm: 0,
  };

  for (const [mood, weights] of Object.entries(MOOD_KEYWORDS) as [Mood, Record<Weight, string[]>][]) {
    for (const [weight, keywords] of Object.entries(weights) as [Weight, string[]][]) {
      for (const keyword of keywords) {
        const escaped = keyword.replace(/\s+/g, "\\s+");
        const regex = new RegExp(`\\b${escaped}\\b`, "gi");
        let match: RegExpExecArray | null;
        while ((match = regex.exec(lower)) !== null) {
          if (isNegated(lower, match.index)) {
            scores[mood] -= WEIGHT_SCORE[weight] * 0.5;
          } else {
            scores[mood] += WEIGHT_SCORE[weight];
          }
        }
      }
    }
  }

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore <= 0) {
    return { mood: "calm", confidence: 0.3, scores };
  }

  const PRIORITY: Mood[] = ["anxious", "stressed", "sad", "angry", "happy", "calm"];
  const topMoods = (Object.entries(scores) as [Mood, number][]).filter(([, s]) => s === maxScore);
  const detectedMood = topMoods.length === 1
    ? topMoods[0][0]
    : PRIORITY.find(m => topMoods.some(([mood]) => mood === m)) || topMoods[0][0];

  // Calculate confidence as ratio of top score to total positive scores
  const totalPositive = Object.values(scores).filter(s => s > 0).reduce((a, b) => a + b, 0);
  const confidence = totalPositive > 0 ? Math.min(maxScore / totalPositive, 1) : 0.3;

  return { mood: detectedMood, confidence: Math.round(confidence * 100) / 100, scores };
}

/**
 * Sentence-level analysis: splits text into sentences,
 * analyzes each, and returns the combined result.
 */
export function detectMoodSentenceLevel(text: string): MoodResult {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 3);

  if (sentences.length <= 1) {
    return detectMoodDetailed(text);
  }

  const combinedScores: Record<Mood, number> = {
    happy: 0, sad: 0, angry: 0, stressed: 0, anxious: 0, calm: 0,
  };

  for (const sentence of sentences) {
    const result = detectMoodDetailed(sentence);
    for (const [mood, score] of Object.entries(result.scores) as [Mood, number][]) {
      combinedScores[mood] += score;
    }
  }

  const maxScore = Math.max(...Object.values(combinedScores));
  if (maxScore <= 0) {
    return { mood: "calm", confidence: 0.3, scores: combinedScores };
  }

  const PRIORITY: Mood[] = ["anxious", "stressed", "sad", "angry", "happy", "calm"];
  const topMoods = (Object.entries(combinedScores) as [Mood, number][]).filter(([, s]) => s === maxScore);
  const detectedMood = topMoods.length === 1
    ? topMoods[0][0]
    : PRIORITY.find(m => topMoods.some(([mood]) => mood === m)) || topMoods[0][0];

  const totalPositive = Object.values(combinedScores).filter(s => s > 0).reduce((a, b) => a + b, 0);
  const confidence = totalPositive > 0 ? Math.min(maxScore / totalPositive, 1) : 0.3;

  return { mood: detectedMood, confidence: Math.round(confidence * 100) / 100, scores: combinedScores };
}

const TIPS: Record<Mood, string[]> = {
  happy: [
    "Keep spreading that positive energy! 🌟",
    "Gratitude amplifies joy — write down 3 things you're grateful for.",
    "Share your happiness with someone you love today!",
    "This is a great day to start something new!",
  ],
  sad: [
    "It's okay to feel sad. Allow yourself to process these emotions. 💙",
    "Try reaching out to a friend or loved one for support.",
    "A short walk in nature can help lift your spirits.",
    "Remember: this feeling is temporary. Better days are ahead.",
  ],
  angry: [
    "Take 5 deep breaths before reacting. You've got this. 🧘",
    "Try writing down what's bothering you — it helps release tension.",
    "Physical exercise can be a great outlet for anger.",
    "Consider the other person's perspective — it might ease the frustration.",
  ],
  stressed: [
    "Break your tasks into smaller, manageable pieces. 📋",
    "Take a 5-minute break. Step away from the screen.",
    "Try the 4-7-8 breathing technique to calm your nervous system.",
    "Prioritize what truly matters. Not everything is urgent.",
  ],
  anxious: [
    "Ground yourself: name 5 things you can see, 4 you can touch. 🌿",
    "Remember: most things we worry about never actually happen.",
    "Try progressive muscle relaxation — tense and release each muscle group.",
    "Write down your worries, then challenge each one rationally.",
  ],
  calm: [
    "Beautiful state of mind. Maintain it with mindful breathing. 🕊️",
    "Use this calm energy to reflect on your goals and intentions.",
    "This is a perfect time for creative thinking or planning.",
    "Share your calm presence with others who might need it.",
  ],
};

export function getTipForMood(mood: Mood): string {
  const tips = TIPS[mood];
  return tips[Math.floor(Math.random() * tips.length)];
}

const QUOTES: Record<Mood, string[]> = {
  happy: [
    "\"Happiness is not something ready made. It comes from your own actions.\" — Dalai Lama",
    "\"The purpose of our lives is to be happy.\" — Dalai Lama",
    "\"Count your age by friends, not years.\" — John Lennon",
  ],
  sad: [
    "\"Even the darkest night will end and the sun will rise.\" — Victor Hugo",
    "\"The wound is the place where the Light enters you.\" — Rumi",
    "\"Every storm runs out of rain.\" — Maya Angelou",
  ],
  angry: [
    "\"For every minute you remain angry, you give up sixty seconds of peace of mind.\" — Ralph Waldo Emerson",
    "\"Holding on to anger is like grasping a hot coal.\" — Buddha",
    "\"Speak when you are angry and you will make the best speech you will ever regret.\" — Ambrose Bierce",
  ],
  stressed: [
    "\"It's not the load that breaks you down, it's the way you carry it.\" — Lou Holtz",
    "\"Almost everything will work again if you unplug it for a few minutes, including you.\" — Anne Lamott",
    "\"You don't have to see the whole staircase, just take the first step.\" — MLK Jr.",
  ],
  anxious: [
    "\"Nothing diminishes anxiety faster than action.\" — Walter Anderson",
    "\"You gain strength, courage, and confidence by every experience in which you stop to look fear in the face.\" — Eleanor Roosevelt",
    "\"Worry does not empty tomorrow of its sorrow, it empties today of its strength.\" — Corrie Ten Boom",
  ],
  calm: [
    "\"Peace comes from within. Do not seek it without.\" — Buddha",
    "\"In the middle of difficulty lies opportunity.\" — Albert Einstein",
    "\"Be still and know.\" — Psalm 46:10",
  ],
};

export function getQuoteForMood(mood: Mood): string {
  const quotes = QUOTES[mood];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export const MOOD_EMOJI: Record<Mood, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  stressed: "😰",
  anxious: "😟",
  calm: "😌",
};

export const MOOD_COLORS: Record<Mood, string> = {
  happy: "bg-mood-happy",
  sad: "bg-mood-sad",
  angry: "bg-mood-angry",
  stressed: "bg-mood-stressed",
  anxious: "bg-mood-anxious",
  calm: "bg-mood-calm",
};

export const MOOD_TEXT_COLORS: Record<Mood, string> = {
  happy: "text-mood-happy",
  sad: "text-mood-sad",
  angry: "text-mood-angry",
  stressed: "text-mood-stressed",
  anxious: "text-mood-anxious",
  calm: "text-mood-calm",
};
