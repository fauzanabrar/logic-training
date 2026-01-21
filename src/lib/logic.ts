/**
 * Core logic types and utilities for the training application.
 * Handles skill progression, question generation, and statistics calculation.
 */

export type SkillKey = "syllogism" | "fallacy" | "deduction" | "induction";

export interface Question {
  id: string;
  skill: SkillKey;
  level: number;
  text: string;
  options: string[];
  answer: string;
}

/** Validation error for invalid questions */
export class InvalidQuestionError extends Error {
  constructor(message: string) {
    super(`InvalidQuestionError: ${message}`);
    this.name = "InvalidQuestionError";
  }
}

/** Validation error for invalid skill */
export class InvalidSkillError extends Error {
  constructor(skill: string) {
    super(`InvalidSkillError: "${skill}" is not a valid skill`);
    this.name = "InvalidSkillError";
  }
}

export const SKILL_LABELS: Record<SkillKey, string> = {
  syllogism: "Syllogism",
  fallacy: "Fallacy",
  deduction: "Deduction",
  induction: "Induction",
} as const;

export const SKILL_SYMBOLS: Record<SkillKey, string> = {
  syllogism: "S",
  fallacy: "F",
  deduction: "D",
  induction: "I",
} as const;

export const ALL_SKILLS: SkillKey[] = ["syllogism", "fallacy", "deduction", "induction"] as const;
export const MAX_LEVEL = 10;
export const MIN_LEVEL = 1;
export const LEVEL_UP_STREAK = 5;
export const LEVEL_DOWN_STREAK = 2;
export const MAX_HISTORY_LENGTH = 100;

/** Validates if a value is a valid skill */
export const isValidSkill = (value: unknown): value is SkillKey => {
  return typeof value === "string" && ALL_SKILLS.includes(value as SkillKey);
};

// Dummy implementations

/** Initialize stats for all skills */
export const createDefaultStats = () => ({
  syllogism: { level: 1, streak: 0, mistakeStreak: 0, history: [] },
  fallacy: { level: 1, streak: 0, mistakeStreak: 0, history: [] },
  deduction: { level: 1, streak: 0, mistakeStreak: 0, history: [] },
  induction: { level: 1, streak: 0, mistakeStreak: 0, history: [] },
});

// Import questions data
import questionsData from "@/data/questions.json";

/**
 * Generate a random question for a given skill and level.
 * Clamps level to valid range and handles missing data gracefully.
 */
export const generateQuestion = (
  skill: SkillKey,
  level: number,
  language: "en" | "id" = "en"
): Question => {
  // Validate skill
  if (!isValidSkill(skill)) {
    throw new InvalidSkillError(skill);
  }

  // Clamp level to valid range
  const clampedLevel = Math.max(MIN_LEVEL, Math.min(level, MAX_LEVEL));
  const levelKey = `level${clampedLevel}` as keyof typeof questionsData[SkillKey];
  
  try {
    // Get the questions for this skill and level
    const skillData = (questionsData as any)[skill];
    if (!skillData) {
      throw new InvalidQuestionError(`No data for skill: ${skill}`);
    }

    const levelData = skillData[levelKey];
    if (!levelData) {
      throw new InvalidQuestionError(`No data for level: ${levelKey}`);
    }
    
    const languageQuestions = language === "id" ? levelData.id : levelData.en;
    
    if (!Array.isArray(languageQuestions) || languageQuestions.length === 0) {
      throw new InvalidQuestionError(
        `No questions for ${skill} ${levelKey} in language ${language}`
      );
    }
    
    // Pick a random question from the level
    const randomIndex = Math.floor(Math.random() * languageQuestions.length);
    const question = languageQuestions[randomIndex];

    // Validate question structure
    if (!question.text || !Array.isArray(question.options) || !question.answer) {
      throw new InvalidQuestionError("Malformed question data");
    }

    // Return question with skill and level included
    return {
      ...question,
      skill,
      level: clampedLevel,
    };
  } catch (error) {
    if (error instanceof InvalidQuestionError) {
      throw error;
    }
    throw new InvalidQuestionError(
      `Failed to generate question for ${skill} level ${clampedLevel}: ${error}`
    );
  }
};

/**
 * Calculate overall accuracy across all skills.
 * Returns percentage (0-100).
 */
export const getAccuracy = (stats: any): number => {
  if (!stats || typeof stats !== "object") return 0;

  let totalCorrect = 0;
  let totalAttempts = 0;
  
  Object.values(stats).forEach((skillStats: any) => {
    if (skillStats && skillStats.history && Array.isArray(skillStats.history)) {
      skillStats.history.forEach((attempt: any) => {
        if (attempt && typeof attempt === "object") {
          totalAttempts++;
          if (attempt.correct) totalCorrect++;
        }
      });
    }
  });
  
  return totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
};

/**
 * Calculate average response time across all skills.
 * Returns milliseconds.
 */
export const getAverageMs = (stats: any): number => {
  if (!stats || typeof stats !== "object") return 0;

  let totalMs = 0;
  let totalAttempts = 0;
  
  Object.values(stats).forEach((skillStats: any) => {
    if (skillStats && skillStats.history && Array.isArray(skillStats.history)) {
      skillStats.history.forEach((attempt: any) => {
        if (attempt && typeof attempt === "object") {
          totalMs += typeof attempt.ms === "number" ? attempt.ms : 0;
          totalAttempts++;
        }
      });
    }
  });
  
  return totalAttempts > 0 ? Math.round(totalMs / totalAttempts) : 0;
};

/**
 * Find the weakest skill based on level and accuracy.
 * Returns the skill that needs the most practice.
 */
export const getWeakestSkill = (stats: any): SkillKey => {
  let weakest: SkillKey = "syllogism";
  let lowestLevel = MAX_LEVEL + 1;
  let lowestAccuracy = 1;
  
  if (!stats || typeof stats !== "object") return weakest;

  Object.entries(stats).forEach(([skill, skillStats]: [string, any]) => {
    if (!isValidSkill(skill) || !skillStats || typeof skillStats !== "object") {
      return;
    }

    const skillKey = skill as SkillKey;
    const level = typeof skillStats.level === "number" ? skillStats.level : MIN_LEVEL;
    
    // Calculate accuracy for this skill
    const history = Array.isArray(skillStats.history) ? skillStats.history : [];
    const correct = history.filter((h: any) => h && h.correct).length;
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

/**
 * Pick the next skill to practice (same as weakest skill).
 */
export const pickSkill = (stats: any): SkillKey => {
  return getWeakestSkill(stats);
};

/**
 * Get target response time for a given level.
 * Target time decreases as level increases:
 * - Level 1: 6000ms (6 seconds)
 * - Level 5: 4500ms (4.5 seconds)
 * - Level 10: 3000ms (3 seconds)
 */
export const getTargetMs = (level: number): number => {
  const minMs = 3000;
  const maxMs = 6000;
  const clampedLevel = Math.max(MIN_LEVEL, Math.min(level, MAX_LEVEL));
  return Math.round(maxMs - ((clampedLevel - 1) / (MAX_LEVEL - 1)) * (maxMs - minMs));
};

export const updateStats = (
  stats: any,
  skill: SkillKey,
  correct: boolean,
  ms: number
): any => {
  if (!stats || typeof stats !== "object") {
    throw new Error("Invalid stats object");
  }

  if (!isValidSkill(skill)) {
    throw new InvalidSkillError(skill);
  }

  const skillStats = stats[skill];
  if (!skillStats) {
    throw new Error(`No stats found for skill: ${skill}`);
  }

  let newStats = { ...stats };
  let newSkillStats = { ...skillStats };
  let newHistory = Array.isArray(skillStats.history) ? [...skillStats.history] : [];

  // Add to history with timestamp
  newHistory.push({
    correct,
    ms: typeof ms === "number" ? ms : 0,
    timestamp: Date.now(),
  });

  // Keep only last MAX_HISTORY_LENGTH attempts
  if (newHistory.length > MAX_HISTORY_LENGTH) {
    newHistory = newHistory.slice(-MAX_HISTORY_LENGTH);
  }

  if (correct) {
    // Correct answer: increase streak, reset mistake streak
    newSkillStats.streak = (newSkillStats.streak || 0) + 1;
    newSkillStats.mistakeStreak = 0;

    // Level up: after LEVEL_UP_STREAK correct in a row
    if (newSkillStats.streak >= LEVEL_UP_STREAK) {
      newSkillStats.level = Math.min(
        (newSkillStats.level || MIN_LEVEL) + 1,
        MAX_LEVEL
      );
      newSkillStats.streak = 0; // Reset streak after leveling up
    }
  } else {
    // Wrong answer: increase mistake streak, reset correct streak
    newSkillStats.mistakeStreak = (newSkillStats.mistakeStreak || 0) + 1;
    newSkillStats.streak = 0;

    // Level down: after LEVEL_DOWN_STREAK mistakes in a row
    if (newSkillStats.mistakeStreak >= LEVEL_DOWN_STREAK) {
      newSkillStats.level = Math.max(
        (newSkillStats.level || MIN_LEVEL) - 1,
        MIN_LEVEL
      );
      newSkillStats.mistakeStreak = 0; // Reset mistake streak after leveling down
    }
  }

  newSkillStats.history = newHistory;
  newStats[skill] = newSkillStats;

  return newStats;
};

