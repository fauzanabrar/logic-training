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
  syllogism: "S",
  fallacy: "F",
  deduction: "D",
  induction: "I",
};

export const MAX_LEVEL = 10;

// Dummy implementations

export const createDefaultStats = () => ({
  syllogism: { level: 1, streak: 0, mistakeStreak: 0, history: [] },
  fallacy: { level: 1, streak: 0, mistakeStreak: 0, history: [] },
  deduction: { level: 1, streak: 0, mistakeStreak: 0, history: [] },
  induction: { level: 1, streak: 0, mistakeStreak: 0, history: [] },
});

// Import questions data
import questionsData from "@/data/questions.json";

export const generateQuestion = (skill: SkillKey, level: number, language: string = "en"): Question => {
  // Clamp level to valid range
  const clampedLevel = Math.max(1, Math.min(level, MAX_LEVEL));
  const levelKey = `level${clampedLevel}` as keyof typeof questionsData[SkillKey];
  
  // Get the questions for this skill and level
  const skillData = (questionsData as any)[skill];
  if (!skillData || !skillData[levelKey]) {
    return {
      id: "default",
      skill,
      level: 1,
      text: "Question not found",
      options: ["Option 1", "Option 2"],
      answer: "Option 1",
    };
  }
  
  const levelQuestions = skillData[levelKey];
  const languageQuestions = language === "id" ? levelQuestions.id : levelQuestions.en;
  
  if (!languageQuestions || languageQuestions.length === 0) {
    return {
      id: "default",
      skill,
      level: clampedLevel,
      text: "Question not found",
      options: ["Option 1", "Option 2"],
      answer: "Option 1",
    };
  }
  
  // Pick a random question from the level
  const randomIndex = Math.floor(Math.random() * languageQuestions.length);
  return languageQuestions[randomIndex];
};

export const getAccuracy = (stats: any) => {
  let totalCorrect = 0;
  let totalAttempts = 0;
  
  Object.values(stats).forEach((skillStats: any) => {
    if (skillStats.history && Array.isArray(skillStats.history)) {
      skillStats.history.forEach((attempt: any) => {
        totalAttempts++;
        if (attempt.correct) totalCorrect++;
      });
    }
  });
  
  return totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
};

export const getAverageMs = (stats: any) => {
  let totalMs = 0;
  let totalAttempts = 0;
  
  Object.values(stats).forEach((skillStats: any) => {
    if (skillStats.history && Array.isArray(skillStats.history)) {
      skillStats.history.forEach((attempt: any) => {
        totalMs += attempt.ms || 0;
        totalAttempts++;
      });
    }
  });
  
  return totalAttempts > 0 ? Math.round(totalMs / totalAttempts) : 0;
};

export const getWeakestSkill = (stats: any): SkillKey => {
  let weakest: SkillKey = "syllogism";
  let lowestLevel = MAX_LEVEL + 1;
  let lowestAccuracy = 100;
  
  Object.entries(stats).forEach(([skill, skillStats]: [string, any]) => {
    const skillKey = skill as SkillKey;
    const level = skillStats.level || 1;
    
    // Calculate accuracy for this skill
    const history = skillStats.history || [];
    const correct = history.filter((h: any) => h.correct).length;
    const accuracy = history.length > 0 ? correct / history.length : 0.5;
    
    // Find skill with lowest level, or lowest accuracy at same level
    if (level < lowestLevel || (level === lowestLevel && accuracy < lowestAccuracy)) {
      lowestLevel = level;
      lowestAccuracy = accuracy;
      weakest = skillKey;
    }
  });
  
  return weakest;
};

export const pickSkill = (stats: any): SkillKey => {
  return getWeakestSkill(stats);
};

export const getTargetMs = (level: number) => {
  // Target time decreases as level increases
  // Level 1: 6000ms (6 seconds)
  // Level 5: 4500ms (4.5 seconds)
  // Level 10: 3000ms (3 seconds)
  const maxLevel = 10;
  const minMs = 3000;
  const maxMs = 6000;
  const clampedLevel = Math.max(1, Math.min(level, maxLevel));
  return Math.round(maxMs - ((clampedLevel - 1) / (maxLevel - 1)) * (maxMs - minMs));
};

export const updateStats = (stats: any, skill: SkillKey, correct: boolean, ms: number) => {
  const skillStats = stats[skill];
  if (!skillStats) return stats;

  let newStats = { ...stats };
  let newSkillStats = { ...skillStats };
  let newHistory = [...skillStats.history];

  // Add to history
  newHistory.push({
    correct,
    ms,
  });

  // Keep only last 100 attempts
  if (newHistory.length > 100) {
    newHistory = newHistory.slice(-100);
  }

  if (correct) {
    // Correct answer: increase streak, reset mistake streak
    newSkillStats.streak = (newSkillStats.streak || 0) + 1;
    newSkillStats.mistakeStreak = 0;

    // Level up: after 5 correct in a row
    if (newSkillStats.streak >= 5) {
      newSkillStats.level = Math.min(newSkillStats.level + 1, MAX_LEVEL);
      newSkillStats.streak = 0; // Reset streak after leveling up
    }
  } else {
    // Wrong answer: increase mistake streak, reset correct streak
    newSkillStats.mistakeStreak = (newSkillStats.mistakeStreak || 0) + 1;
    newSkillStats.streak = 0;

    // Level down: after 2 mistakes in a row
    if (newSkillStats.mistakeStreak >= 2) {
      newSkillStats.level = Math.max(newSkillStats.level - 1, 1);
      newSkillStats.mistakeStreak = 0; // Reset mistake streak after leveling down
    }
  }

  newSkillStats.history = newHistory;
  newStats[skill] = newSkillStats;

  return newStats;
};

