import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { storage } from "@/lib/storage";
import type {
  SettingControl,
  TrainingMode,
  TrainingProvider,
  TrainingQuestion,
  TrainingSettingsBase,
} from "./types";

type Screen = "menu" | "drill" | "settings" | "summary" | "stats" | "learn";

type Feedback<SkillKey extends string> = {
  correct: boolean;
  expected: string;
  ms: number;
  skill: SkillKey;
  level: number;
  timedOut?: boolean;
};

type SessionCounts = {
  correct: number;
  wrong: number;
};

type UseTrainingSessionOptions<
  SkillKey extends string,
  Question extends TrainingQuestion<SkillKey>,
  Settings extends TrainingSettingsBase,
  AnswerValue
> = {
  provider: TrainingProvider<SkillKey, Question, Settings, AnswerValue>;
  storageKeys: {
    session: string;
    settings: string;
  };
  onSessionComplete?: () => void;
};

/**
 * Normalizes settings by clamping all control values within their min/max bounds.
 * Ensures settings are always valid before use.
 */
const normalizeSettings = <Settings,>(
  settings: Settings | null | undefined,
  controls: SettingControl<Settings>[]
): Settings => {
  // Validate inputs
  if (!settings || !controls) {
    throw new Error("Settings and controls are required for normalization");
  }

  try {
    let next = { ...settings } as Settings;
    controls.forEach((control) => {
      if (!control || typeof control.getValue !== "function") {
        console.warn("Invalid control:", control);
        return;
      }
      const value = control.getValue(next);
      const clamped = Math.min(
        Math.max(value, control.min),
        control.max
      );
      if (value !== clamped) {
        next = control.setValue(next, clamped);
      }
    });
    return next;
  } catch (error) {
    console.error("Settings normalization failed:", error);
    throw new Error("Failed to normalize settings");
  }
};

export const useTrainingSession = <
  SkillKey extends string,
  Question extends TrainingQuestion<SkillKey>,
  Settings extends TrainingSettingsBase,
  AnswerValue
>({
  provider,
  storageKeys,
  onSessionComplete,
}: UseTrainingSessionOptions<
  SkillKey,
  Question,
  Settings,
  AnswerValue
>) => {
  type Mode = TrainingMode<SkillKey>;

  // Create default initial state that matches both server and client
  const defaultInitialState = useMemo(() => {
    const merged = {
      ...provider.settings.defaultValue,
    } as Settings;
    const normalizedSettings = normalizeSettings(
      merged,
      provider.settings.controls
    );
    return {
      stats: provider.createDefaultStats(),
      mode: "mix" as Mode,
      settings: normalizedSettings,
      timeLeft: normalizedSettings.timeLimitSeconds,
    };
  }, [provider]);

  const [stats, setStats] = useState(defaultInitialState.stats);
  const [mode, setMode] = useState<Mode>(defaultInitialState.mode);
  const [screen, setScreen] = useState<Screen>("menu");
  const [settings, setSettings] = useState<Settings>(defaultInitialState.settings);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback<SkillKey> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionCounts>({
    correct: 0,
    wrong: 0,
  });
  const [questionIndex, setQuestionIndex] = useState(1);
  const [timeLeft, setTimeLeft] = useState(defaultInitialState.timeLeft);

  // Only load settings from localStorage on first mount
  const didLoadFromStorage = useRef(false);

  /**
   * Load persisted session and settings from localStorage.
   * Validates data structure before applying to ensure corrupted data doesn't crash the app.
   */
  useEffect(() => {
    if (didLoadFromStorage.current) return;
    didLoadFromStorage.current = true;

    try {
      const savedSession = storage.readJSON<{
        stats?: ReturnType<typeof provider.createDefaultStats>;
        mode?: Mode;
      }>(storageKeys.session);

      // Validate and load session stats
      if (savedSession?.stats && typeof savedSession.stats === "object") {
        try {
          setStats(savedSession.stats);
        } catch (error) {
          console.error("[Session] Failed to load stats:", error);
          // Silently fall back to default stats
        }
      }

      // Validate and load mode
      if (savedSession?.mode && typeof savedSession.mode === "string") {
        setMode(savedSession.mode);
      }

      // Load and validate settings
      const savedSettings = storage.readJSON<Partial<Settings>>(
        storageKeys.settings
      );

      if (savedSettings && typeof savedSettings === "object") {
        try {
          const merged = {
            ...provider.settings.defaultValue,
            ...savedSettings,
          } as Settings;
          const normalizedSettings = normalizeSettings(
            merged,
            provider.settings.controls
          );
          setSettings(normalizedSettings);
          setTimeLeft(normalizedSettings.timeLimitSeconds);
        } catch (error) {
          console.error("[Session] Failed to load settings:", error);
          // Silently fall back to default settings
        }
      }
    } catch (error) {
      console.error("[Session] Failed to load from storage:", error);
      // App continues with defaults
    }
  }, [provider, storageKeys]);
  const [answered, setAnswered] = useState(false);

  const startTimeRef = useRef<number>(0);
  const advanceTimerRef = useRef<number | null>(null);
  const statsRef = useRef(stats);
  const modeRef = useRef(mode);

  useEffect(() => {
    storage.writeJSON(storageKeys.session, { stats, mode });
  }, [stats, mode, storageKeys]);

  useEffect(() => {
    try {
      storage.writeJSON(storageKeys.settings, settings);
    } catch (error) {
      console.error("[Session] Failed to save settings:", error);
      // Storage failure is non-fatal; continue with in-memory state
    }
  }, [settings, storageKeys]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const allowNegativeAnswer = useMemo(() => {
    if (!question || !provider.answer.allowNegative) {
      return false;
    }
    return provider.answer.allowNegative(question, settings);
  }, [provider.answer, question, settings]);

  const keypadRows = useMemo(() => {
    if (!provider.answer.keypad?.enabled) {
      return null;
    }
    return provider.answer.keypad.rows({ allowNegative: allowNegativeAnswer });
  }, [provider.answer.keypad, allowNegativeAnswer]);

  const beginQuestion = useCallback(
    (nextQuestion: Question) => {
      setQuestion(nextQuestion);
      setAnswer("");
      setError(null);
      setFeedback(null);
      setAnswered(false);
      startTimeRef.current = Date.now();
      setTimeLeft(settings.timeLimitSeconds);
    },
    [settings.timeLimitSeconds]
  );

  const createQuestion = useCallback(
    (selectedMode: Mode) => {
      try {
        const skill: SkillKey =
          selectedMode === "mix"
            ? provider.pickSkill(statsRef.current)
            : selectedMode;

        if (!skill) {
          throw new Error("Failed to pick a skill");
        }

        const level = statsRef.current[skill]?.level;

        if (level === undefined) {
          throw new Error(`Invalid level for skill: ${skill}`);
        }

        return provider.createQuestion({
          skill,
          level,
          settings,
          stats: statsRef.current,
        });
      } catch (error) {
        console.error("[Session] Question creation failed:", error);
        setError("Failed to generate question. Please try again.");
        throw error;
      }
    },
    [provider, settings]
  );

  const startSession = useCallback(
    (nextMode: Mode) => {
      try {
        clearAdvanceTimer();
        setMode(nextMode);
        modeRef.current = nextMode;
        setSession({ correct: 0, wrong: 0 });
        setQuestionIndex(1);
        setScreen("drill");
        setError(null);
        const nextQuestion = createQuestion(nextMode);
        beginQuestion(nextQuestion);
      } catch (error) {
        console.error("[Session] Failed to start session:", error);
        setError("Failed to start training session. Please try again.");
        setScreen("menu");
      }
    },
    [beginQuestion, clearAdvanceTimer, createQuestion]
  );

  const goToMenu = useCallback(() => {
    clearAdvanceTimer();
    setScreen("menu");
    setQuestion(null);
    setFeedback(null);
    setError(null);
    setAnswer("");
    setAnswered(false);
  }, [clearAdvanceTimer]);

  const applyResult = useCallback(
    (correct: boolean, elapsed: number, timedOut = false) => {
      if (!question) {
        console.warn("[Session] Attempted to apply result without a question");
        return;
      }

      try {
        const nextStats = provider.updateStats(statsRef.current, {
          skill: question.skill,
          correct,
          elapsedMs: elapsed,
        });

        if (!nextStats) {
          throw new Error("Stats update returned null");
        }

        statsRef.current = nextStats;
        setStats(nextStats);
        setFeedback({
          correct,
          expected: provider.answer.formatExpected(question),
          ms: elapsed,
          skill: question.skill,
          level: question.level,
          timedOut,
        });
        setSession((prev) => ({
          correct: prev.correct + (correct ? 1 : 0),
          wrong: prev.wrong + (correct ? 0 : 1),
        }));
        setError(null);
        setAnswered(true);
      } catch (error) {
        console.error("[Session] Failed to apply result:", error);
        setError("Failed to record response. Please try again.");
      }
    },
    [provider, question]
  );

  const handleSubmit = useCallback(
    (options?: { useKeypad?: boolean; answer?: string }) => {
      if (!question || answered) {
        return;
      }
      const finalAnswer = options?.answer ?? answer;
      const prefersKeypadErrors = Boolean(options?.useKeypad);
      const allowNegative = allowNegativeAnswer;
      const cleaned = provider.answer.sanitizeInput(finalAnswer.trim(), {
        allowNegative,
      });
      const parsed = provider.answer.parseInput(cleaned, { allowNegative });
      if (parsed.error) {
        if (parsed.error === "empty") {
          setError(
            prefersKeypadErrors
              ? provider.answer.errors.emptyKeypad ??
                  provider.answer.errors.empty
              : provider.answer.errors.empty
          );
          return;
        }
        if (parsed.error === "incomplete") {
          setError(provider.answer.errors.incomplete);
          return;
        }
        setError(provider.answer.errors.invalid);
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const correct = provider.answer.isCorrect(
        parsed.value as AnswerValue,
        question
      );

      clearAdvanceTimer();
      applyResult(correct, elapsed);
    },
    [
      allowNegativeAnswer,
      answer,
      answered,
      applyResult,
      clearAdvanceTimer,
      provider.answer,
      question,
    ]
  );

  const handleAnswerChange = useCallback(
    (rawValue: string) => {
      const cleaned = provider.answer.sanitizeInput(rawValue, {
        allowNegative: allowNegativeAnswer,
      });
      setAnswer(cleaned);
      setError(null);
    },
    [allowNegativeAnswer, provider.answer]
  );

  const handleKeypadPress = useCallback(
    (key: string) => {
      if (answered) {
        return;
      }
      setError(null);
      if (key === "CLR") {
        setAnswer("");
        return;
      }
      if (key === "DEL") {
        setAnswer((prev) => prev.slice(0, -1));
        return;
      }
      if (key === "-") {
        if (!allowNegativeAnswer) {
          return;
        }
        setAnswer((prev) => {
          if (prev.startsWith("-")) {
            return prev.slice(1);
          }
          if (prev.length === 0) {
            return "-";
          }
          if (prev === "0") {
            return "-0";
          }
          return `-${prev}`;
        });
        return;
      }
      setAnswer((prev) => {
        if (prev === "0") {
          return key;
        }
        if (prev === "-0") {
          return `-${key}`;
        }
        return prev + key;
      });
    },
    [allowNegativeAnswer, answered]
  );

  const handleNext = useCallback(() => {
    if (!question || !answered) {
      return;
    }

    try {
      clearAdvanceTimer();
      const nextIndex = questionIndex + 1;

      if (nextIndex > settings.questionCount) {
        setScreen("summary");
        setQuestion(null);
        setAnswered(false);
        if (onSessionComplete) {
          onSessionComplete();
        }
        return;
      }

      setQuestionIndex(nextIndex);
      const nextQuestion = createQuestion(modeRef.current);
      beginQuestion(nextQuestion);
    } catch (error) {
      console.error("[Session] Failed to advance to next question:", error);
      setError("Failed to load next question. Please try again.");
    }
  }, [
    answered,
    beginQuestion,
    clearAdvanceTimer,
    createQuestion,
    onSessionComplete,
    question,
    questionIndex,
    settings.questionCount,
  ]);

  const handleTimeout = useCallback(() => {
    if (!question || answered) {
      return;
    }
    const elapsed = Date.now() - startTimeRef.current;
    applyResult(false, elapsed, true);
  }, [answered, applyResult, question]);

  const resetStats = useCallback(() => {
    const fresh = provider.createDefaultStats();
    statsRef.current = fresh;
    setStats(fresh);
  }, [provider]);

  const adjustSetting = useCallback(
    (controlId: string, delta: number) => {
      const control = provider.settings.controls.find(
        (item) => item.id === controlId
      );
      if (!control) {
        return;
      }
      setSettings((prev) => {
        const current = control.getValue(prev);
        const nextValue = Math.min(
          Math.max(current + control.step * delta, control.min),
          control.max
        );
        return control.setValue(prev, nextValue);
      });
    },
    [provider.settings.controls]
  );

  useEffect(() => {
    if (screen !== "drill" || !question || answered) {
      return;
    }
    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [answered, handleTimeout, question, screen, settings.timeLimitSeconds]);

  useEffect(() => {
    if (!feedback || (!feedback.correct && !feedback.timedOut)) {
      return;
    }
    clearAdvanceTimer();
    advanceTimerRef.current = window.setTimeout(() => {
      handleNext();
    }, 700);
    return () => {
      clearAdvanceTimer();
    };
  }, [feedback, clearAdvanceTimer, handleNext]);

  return {
    screen,
    setScreen,
    stats,
    mode,
    settings,
    question,
    answer,
    feedback,
    error,
    session,
    questionIndex,
    timeLeft,
    answered,
    allowNegativeAnswer,
    keypadRows,
    startSession,
    goToMenu,
    handleSubmit,
    handleNext,
    handleTimeout,
    handleAnswerChange,
    handleKeypadPress,
    resetStats,
    adjustSetting,
  };
};

export type TrainingScreen = Screen;
