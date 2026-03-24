const PROMPTS = [
  "What made you smile today?",
  "What's weighing on your mind right now?",
  "What is one thing you want to let go of?",
  "Describe a moment today that felt meaningful.",
  "What are you grateful for right now?",
  "If today had a color, what would it be and why?",
  "What would you tell your past self about today?",
  "What small win did you have today?",
  "What's something you're looking forward to?",
  "How did you take care of yourself today?",
  "What conversation stuck with you recently?",
  "What's one thing you'd change about today?",
  "Write about a person who made your day better.",
  "What fear did you face recently?",
  "What's something you learned this week?",
  "Describe how your body feels right now.",
  "What boundary do you need to set?",
  "What made you feel proud recently?",
  "What would make tomorrow great?",
  "Write a letter to your future self.",
  "What's a habit you want to build?",
  "What emotion are you avoiding?",
  "Describe your ideal peaceful moment.",
  "What's draining your energy lately?",
  "What act of kindness did you witness or do?",
  "What are you holding onto that no longer serves you?",
  "What does 'enough' look like for you today?",
  "Write about a challenge you overcame.",
  "What song matches your mood right now?",
  "What's one thing you're curious about?",
];

export function getDailyPrompt(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return PROMPTS[dayOfYear % PROMPTS.length];
}
