
export type SkillKey = "syllogism" | "fallacy" | "deduction" | "induction";

export interface Question {
  id: string;
  skill: SkillKey;
  level: number;
  text: string;
  options: string[];
  answer: string;
}

export const SKILL_LABELS: Record<SkillKey, string> = {
  syllogism: "Syllogism",
  fallacy: "Fallacy",
  deduction: "Deduction",
  induction: "Induction",
};

export const SKILL_SYMBOLS: Record<SkillKey, string> = {
  syllogism: "📜",
  fallacy: "🤔",
  deduction: "🧐",
  induction: "🤯",
};

export const MAX_LEVEL = 10;

// Dummy implementations

export const createDefaultStats = () => ({
  syllogism: { level: 1, streak: 0, mistakeStreak: 0, history: [] },
  fallacy: { level: 1, streak: 0, mistakeStreak: 0, history: [] },
  deduction: { level: 1, streak: 0, mistakeStreak: 0, history: [] },
  induction: { level: 1, streak: 0, mistakeStreak: 0, history: [] },
});

export const generateQuestion = (skill: SkillKey, level: number): Question => {
  const questions: Question[] = [
    {
      id: "1",
      skill: "syllogism",
      level: 1,
      text: "All men are mortal. Socrates is a man. Therefore, Socrates is mortal.",
      options: ["Valid", "Invalid"],
      answer: "Valid",
    },
    {
      id: "2",
      skill: "fallacy",
      level: 1,
      text: "You're either with us or against us.",
      options: ["False Dilemma", "Ad Hominem", "Strawman"],
      answer: "False Dilemma",
    },
    {
      id: "3",
      skill: "deduction",
      level: 1,
      text: "If it rains, the ground will be wet. It is raining. Therefore...",
      options: ["The ground is wet", "The ground is dry", "It is sunny"],
      answer: "The ground is wet",
    },
    {
        id: "4",
        skill: "induction",
        level: 1,
        text: "The sun has risen every day so far. Therefore...",
        options: ["The sun will rise tomorrow", "The sun will not rise tomorrow", "The sun is a star"],
        answer: "The sun will rise tomorrow",
    }
  ];
  return questions.find(q => q.skill === skill) ?? questions[0];
};

export const getAccuracy = (stats: any) => 0;
export const getAverageMs = (stats: any) => 0;
export const getTargetMs = (level: number) => 5000;
export const getWeakestSkill = (stats: any): SkillKey => "syllogism";
export const pickSkill = (stats: any): SkillKey => "syllogism";

export const updateStats = (stats: any, skill: SkillKey, correct: boolean, ms: number) => {
  return stats;
};

