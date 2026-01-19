import {
  createDefaultStats,
  generateQuestion,
  getAccuracy,
  getAverageMs,
  getTargetMs,
  getWeakestSkill,
  MAX_LEVEL,
  pickSkill,
  SKILL_LABELS,
  SKILL_SYMBOLS,
  updateStats,
  type Question,
  type SkillKey,
} from "@/lib/logic";
import type {
  AnswerParseResult,
  SettingControl,
  TrainingProvider,
  TrainingSettingsBase,
} from "../types";

type LogicSettings = TrainingSettingsBase;

const clampValue = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const DEFAULT_SETTINGS: LogicSettings = {
  questionCount: 10,
  timeLimitSeconds: 20,
  language: "en",
};

const SKILL_ORDER: SkillKey[] = [
  "syllogism",
  "fallacy",
  "deduction",
  "induction",
];

const SKILL_DEFINITIONS = {
  syllogism: {
    label: SKILL_LABELS.syllogism,
    symbol: SKILL_SYMBOLS.syllogism,
    subtitle: "Valid or invalid?",
  },
  fallacy: {
    label: SKILL_LABELS.fallacy,
    symbol: SKILL_SYMBOLS.fallacy,
    subtitle: "Identify the fallacy",
  },
  deduction: {
    label: SKILL_LABELS.deduction,
    symbol: SKILL_SYMBOLS.deduction,
    subtitle: "Deductive reasoning",
  },
  induction: {
    label: SKILL_LABELS.induction,
    symbol: SKILL_SYMBOLS.induction,
    subtitle: "Inductive reasoning",
  },
} satisfies Record<
  SkillKey,
  { label: string; symbol: string; subtitle: string }
>;

const settingControls: SettingControl<LogicSettings>[] = [
  {
    id: "questionCount",
    label: "Questions per session",
    hint: "Default is 10",
    min: 5,
    max: 50,
    step: 1,
    getValue: (settings) => settings.questionCount,
    setValue: (settings, value) => ({
      ...settings,
      questionCount: clampValue(value, 5, 50),
    }),
  },
  {
    id: "timeLimitSeconds",
    label: "Time per question",
    hint: "Seconds allowed",
    min: 10,
    max: 120,
    step: 5,
    getValue: (settings) => settings.timeLimitSeconds,
    setValue: (settings, value) => ({
      ...settings,
      timeLimitSeconds: clampValue(value, 10, 120),
    }),
    formatValue: (value) => `${value}s`,
  },
  {
    id: "language",
    label: "Language",
    hint: "Select your preferred language",
    step: 1,
    min: 0,
    max: 1,
    getValue: (settings) => (settings.language === "en" ? 0 : 1),
    setValue: (settings, value) => ({
      ...settings,
      language: value === 0 ? "en" : "id",
    }),
    formatValue: (value) => (value === 0 ? "English" : "Indonesian"),
  },
];

const parseStringInput = (value: string): AnswerParseResult<string> => {
  if (!value) {
    return { error: "empty" };
  }
  return { value };
};

export const logicTrainingProvider: TrainingProvider<
  SkillKey,
  Question,
  LogicSettings,
  string
> = {
  id: "logic",
  title: "Logic Training",
  description: "Adaptive logic drills for critical thinking.",
  skillOrder: SKILL_ORDER,
  skills: SKILL_DEFINITIONS,
  maxLevel: MAX_LEVEL,
  createDefaultStats,
  createQuestion: ({ skill, level, settings }) => {
    return generateQuestion(skill, level);
  },
  getQuestionText: (question) => question.text,
  getQuestionOptions: (question) => question.options ?? [],
  updateStats: (stats, { skill, correct, elapsedMs }) =>
    updateStats(stats, skill, correct, elapsedMs),
  getAccuracy,
  getAverageMs,
  getTargetMs,
  getWeakestSkill,
  pickSkill,
  answer: {
    inputMode: "multiple-choice",
    placeholder: "Select an answer",
    sanitizeInput: (raw) => raw,
    parseInput: (value) => parseStringInput(value),
    isCorrect: (value, question) =>
      value.toLowerCase() === question.answer.toLowerCase(),
    formatExpected: (question) => question.answer,
    errors: {
      empty: "Please select an answer.",
      emptyKeypad: "Please select an answer.",
      incomplete: "Please select an answer.",
      invalid: "Invalid selection.",
    },
  },
  settings: {
    defaultValue: DEFAULT_SETTINGS,
    controls: settingControls,
  },
};
