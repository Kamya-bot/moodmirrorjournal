import { Mood } from "@/types/mood";

const MOOD_KEYWORDS: Record<Mood, string[]> = {
  happy: [
    "happy", "joy", "joyful", "excited", "great", "wonderful", "amazing", "fantastic",
    "love", "loving", "grateful", "thankful", "blessed", "cheerful", "delighted",
    "thrilled", "ecstatic", "glad", "pleased", "content", "satisfied", "awesome",
    "brilliant", "excellent", "good", "nice", "beautiful", "fun", "laugh", "smile",
    "celebrate", "proud", "accomplish", "succeed", "win", "positive", "optimistic"
  ],
  sad: [
    "sad", "unhappy", "depressed", "down", "blue", "lonely", "alone", "crying",
    "tears", "heartbroken", "disappointed", "hopeless", "miserable", "gloomy",
    "melancholy", "grief", "loss", "miss", "missing", "empty", "numb", "hurt",
    "pain", "suffer", "sorrow", "regret", "sorry", "failed", "failure"
  ],
  angry: [
    "angry", "mad", "furious", "rage", "hate", "annoyed", "irritated", "frustrated",
    "upset", "outraged", "livid", "hostile", "aggressive", "bitter", "resentful",
    "disgusted", "fed up", "sick of", "tired of", "can't stand", "infuriated"
  ],
  stressed: [
    "stressed", "overwhelmed", "pressure", "deadline", "busy", "overworked",
    "exhausted", "burned out", "burnout", "too much", "can't cope", "struggling",
    "swamped", "loaded", "hectic", "chaos", "tension", "tense", "demanding"
  ],
  anxious: [
    "anxious", "anxiety", "worried", "nervous", "scared", "fear", "panic",
    "restless", "uneasy", "dread", "apprehensive", "uncertain", "insecure",
    "overthinking", "what if", "cant sleep", "insomnia", "trembling", "shaking"
  ],
  calm: [
    "calm", "peaceful", "relaxed", "serene", "tranquil", "zen", "meditation",
    "mindful", "balanced", "centered", "quiet", "still", "gentle", "ease",
    "comfortable", "rested", "refreshed", "harmony", "soothing", "breathing"
  ],
};

export function detectMood(text: string): Mood {
  const lower = text.toLowerCase();
  const scores: Record<Mood, number> = {
    happy: 0, sad: 0, angry: 0, stressed: 0, anxious: 0, calm: 0,
  };

  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS) as [Mood, string[]][]) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = lower.match(regex);
      if (matches) {
        scores[mood] += matches.length;
      }
    }
  }

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return "calm"; // default

  return (Object.entries(scores) as [Mood, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
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
