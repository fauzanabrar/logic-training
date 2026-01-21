"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import styles from "./page.module.css";
import { adsConfig } from "@/config/ads";
import { trainingConfig } from "@/config/training";
import { InlineScriptAdSlot } from "@/components/ads/InlineScriptAdSlot";
import { popUnderAd } from "@/components/PopUnderAd";
import { useTrainingSession } from "@/features/training/useTrainingSession";
import { useThemeMode } from "@/hooks/useThemeMode";

const formatMs = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
const formatSeconds = (value: number) => `${String(value).padStart(2, "0")}s`;

const inlineAdConfig = {
  ...adsConfig.inline,
  enabled: adsConfig.enabled && adsConfig.inline.enabled,
};

const popUnderEnabled = adsConfig.enabled && adsConfig.popUnder.enabled;

// Custom hook to detect hydration
function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(true);
  }, []);
  return hasHydrated;
}

export default function Home() {
  const { provider, modes, storageKeys, copy } = trainingConfig;
  const inputRef = useRef<HTMLInputElement>(null);
  const [useKeypad] = useState(() => {
    if (typeof navigator === "undefined") {
      return false;
    }
    return /android/i.test(navigator.userAgent);
  });

  const { theme, toggleTheme } = useThemeMode(storageKeys.theme);

  const handleSessionComplete = useCallback(() => {
    if (popUnderEnabled) {
      popUnderAd.show();
    }
  }, []);

  const {
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
    keypadRows,
    startSession,
    goToMenu,
    handleSubmit,
    handleNext,
    handleAnswerChange,
    handleKeypadPress,
    resetStats,
    adjustSetting,
  } = useTrainingSession({
    provider,
    storageKeys,
    onSessionComplete: handleSessionComplete,
  });

  const hasHydrated = useHasHydrated();

  useEffect(() => {
    if (screen !== "drill" || useKeypad || answered) {
      return;
    }
    inputRef.current?.focus();
  }, [answered, question?.id, screen, useKeypad]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.history.replaceState({ screen: "menu" }, "");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (screen === "menu") {
      window.history.replaceState({ screen: "menu" }, "");
      return;
    }
    window.history.pushState({ screen }, "");
  }, [screen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handlePopState = () => {
      if (screen !== "menu") {
        goToMenu();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [goToMenu, screen]);

  const skillKeys = provider.skillOrder;

  const hasAttempts = useMemo(
    () => Object.values(stats).some((entry) => entry.history.length > 0),
    [stats]
  );
  const weakestSkill = useMemo(
    () => provider.getWeakestSkill(stats),
    [provider, stats]
  );

  const weaknessText = hasAttempts
    ? provider.skills[weakestSkill].label
    : copy.stats.noData;

  const negativeControl = provider.settings.controls.find(
    (control) => control.id === "negativeLevel"
  );
  const negativeValue = negativeControl
    ? negativeControl.getValue(settings)
    : null;
  const negativeText =
    negativeControl && typeof negativeValue === "number"
      ? negativeControl.formatValue
        ? negativeControl.formatValue(negativeValue, settings)
        : negativeValue === 0
          ? copy.menu.negativesOff
          : copy.menu.negativesFormat(negativeValue)
      : null;

  const mixModeLabel =
    modes.find((item) => item.key === "mix")?.label ?? "Mix";
  const modeLabel = mode === "mix" ? mixModeLabel : provider.skills[mode].label;
  const timeLeftLabel = formatSeconds(timeLeft);

  const totalAnswered = session.correct + session.wrong;
  const accuracy = totalAnswered
    ? Math.round((session.correct / totalAnswered) * 100)
    : 0;
  const allHistory = skillKeys.flatMap((skill) => stats[skill].history);
  const allCorrect = allHistory.filter((item) => item.correct).length;
  const allAttempts = allHistory.length;
  const overallAccuracy = allAttempts
    ? Math.round((allCorrect / allAttempts) * 100)
    : 0;
  const totalMs = allHistory.reduce((sum, item) => sum + item.ms, 0);
  const overallAvgMs = allAttempts ? totalMs / allAttempts : 0;
  const feedbackText = feedback
    ? feedback.correct
      ? `${copy.feedback.correctPrefix} ${formatMs(feedback.ms)}.`
      : feedback.timedOut
        ? `${copy.feedback.timeoutPrefix} ${feedback.expected}.`
        : `${copy.feedback.wrongPrefix} ${feedback.expected}.`
    : "";

  let content: ReactElement | null = null;

  const [useEmojiIcons, setUseEmojiIcons] = useState(false);
  const [learnSkill, setLearnSkill] = useState<string | null>(null);
  useEffect(() => {
    setUseEmojiIcons(true);
  }, []);

  // Emoji map for client-only rendering
  const emojiSkillIcons = {
    syllogism: "📜",
    fallacy: "🤔",
    deduction: "🧐",
    induction: "🤯",
    mix: "🔀",
  };

  // Language copy map
  const copyMap = {
    en: trainingConfig.copy,
    id: {
      brand: {
        name: "Logic Training",
        shortName: "Training",
      },
      menu: {
        title: "Pilih Latihan",
        description: "Pilih fokus atau gunakan Campuran untuk beradaptasi dengan keterampilan terlemah Anda.",
        statsAction: "Statistik",
        settingsAction: "Pengaturan",
        learnAction: "Pelajari",
        questionsSuffix: "soal",
        timeSuffix: "d/s",
        weakestPrefix: "Terlemah:",
        negativesLabel: "Negatif:",
        negativesOff: "Mati",
        negativesFormat: (value: number) => `Lvl ${value}+`,
      },
      drill: {
        subtitle: "Jawab dengan cepat dan benar untuk naik level.",
        questionLabel: "Soal",
        timeLabel: "Waktu",
        skillLabel: "Kategori",
        levelLabel: "Level",
        targetLabel: "Target",
        answerPlaceholder: "Ketik jawaban Anda",
        answerPlaceholderKeypad: "Ketuk untuk menjawab",
        checkAction: "Periksa",
        nextAction: "Selanjutnya",
        loading: "Memuat soal Anda...",
        sessionScoreLabel: "Skor sesi",
        sessionHint: "Tetap fokus dan terus bergerak maju.",
      },
      stats: {
        title: "Statistik",
        intro: "Kinerja terbaru Anda di seluruh latihan (12 usaha terakhir per keterampilan).",
        overallTitle: "Keseluruhan",
        overallIntro: "Berdasarkan usaha terbaru Anda di semua keterampilan.",
        accuracyLabel: "Akurasi",
        attemptsLabel: "Usaha",
        avgTimeLabel: "Waktu rata-rata",
        noData: "Belum ada data",
        noAttempts: "Belum ada usaha",
      },
      summary: {
        title: "Sesi selesai",
        accuracyLabel: "Akurasi",
        correctLabel: "Benar",
        wrongLabel: "Salah",
        practiceAgain: "Latihan lagi",
        backToMenu: "Kembali ke menu",
      },
      settings: {
        title: "Pengaturan",
        intro: "Sesuaikan pengalaman latihan Anda.",
        themeLabel: "Tema",
        themeDark: "Gelap",
        themeLight: "Terang",
        resetStats: "Reset Statistik",
        backToMenu: "Kembali ke menu",
      },
      appBar: {
        menu: "Menu Utama",
        drillSuffix: "Latihan",
        summary: "Ringkasan",
        stats: "Statistik",
        settings: "Pengaturan",
        learn: "Pelajari",
      },
      feedback: {
        correctPrefix: "Benar!",
        wrongPrefix: "Jawaban Anda salah. Yang benar adalah:",
        timeoutPrefix: "Waktu habis. Jawaban yang benar adalah:",
      },
      study: {
        syllogism: {
          title: "Silogisme",
          description: "Bentuk penalaran deduktif yang terdiri dari premis mayor, premis minor, dan kesimpulan.",
          content: `
            <h3>Apa itu Silogisme?</h3>
            <p>Silogisme adalah argumen logis di mana kesimpulan ditarik dari dua proposisi atau premis yang diberikan atau diasumsikan.</p>
            
            <h3>Struktur</h3>
            <ul>
              <li><strong>Premis Mayor:</strong> Pernyataan umum (Semua X adalah Y)</li>
              <li><strong>Premis Minor:</strong> Pernyataan khusus (Z adalah X)</li>
              <li><strong>Kesimpulan:</strong> Hasil logis (Oleh karena itu, Z adalah Y)</li>
            </ul>
            
            <h3>Contoh</h3>
            <p><strong>Premis Mayor:</strong> Semua manusia adalah makhluk hidup</p>
            <p><strong>Premis Minor:</strong> Sokrates adalah manusia</p>
            <p><strong>Kesimpulan:</strong> Oleh karena itu, Sokrates adalah makhluk hidup</p>
            
            <h3>Poin Penting</h3>
            <ul>
              <li>Silogisme yang valid mengikuti aturan logika</li>
              <li>Silogisme yang tidak valid melanggar aturan logika</li>
              <li>Istilah tengah harus didistribusikan dalam setidaknya satu premis</li>
            </ul>
          `,
        },
        fallacy: {
          title: "Kekeliruan Logis",
          description: "Kesalahan umum dalam penalaran yang membuat argumen tidak valid atau menyesatkan.",
          content: `
            <h3>Kekeliruan Umum</h3>
            
            <h4>Dilema Palsu</h4>
            <p>Menyajikan hanya dua pilihan padahal ada lebih banyak. Contoh: "Anda harus setuju dengan saya atau tidak peduli."</p>
            
            <h4>Ad Hominem</h4>
            <p>Menyerang orang bukan argumennya. Contoh: "Anda bodoh, jadi idenya salah."</p>
            
            <h4>Strawman</h4>
            <p>Merepresentasikan ulang argumen seseorang untuk membuatnya lebih mudah diserang.</p>
            
            <h4>Banding kepada Otoritas</h4>
            <p>Menggunakan pendapat tokoh terkenal sebagai bukti tanpa bukti lain.</p>
            
            <h4>Banding kepada Mayoritas</h4>
            <p>Menganggap sesuatu benar karena banyak orang percayanya.</p>
            
            <h3>Mengapa Mengidentifikasi Kekeliruan?</h3>
            <ul>
              <li>Mengenali argumen yang lemah</li>
              <li>Meningkatkan pemikiran kritis</li>
              <li>Mencegah terjadi dibohongi</li>
            </ul>
          `,
        },
        deduction: {
          title: "Penalaran Deduktif",
          description: "Menarik kesimpulan khusus dari prinsip atau premis umum.",
          content: `
            <h3>Apa itu Penalaran Deduktif?</h3>
            <p>Deduksi bergerak dari pengetahuan umum ke kesimpulan spesifik. Jika premis benar dan penalaran valid, kesimpulannya harus benar.</p>
            
            <h3>Struktur</h3>
            <p><strong>Premis 1:</strong> Jika A, maka B</p>
            <p><strong>Premis 2:</strong> A benar</p>
            <p><strong>Kesimpulan:</strong> Oleh karena itu, B benar</p>
            
            <h3>Contoh</h3>
            <p><strong>Premis 1:</strong> Jika hujan, maka tanah basah</p>
            <p><strong>Premis 2:</strong> Sedang hujan</p>
            <p><strong>Kesimpulan:</strong> Oleh karena itu, tanah basah</p>
            
            <h3>Poin Penting</h3>
            <ul>
              <li>Deduksi dapat diandalkan ketika premis benar</li>
              <li>Kesimpulannya pasti, bukan hanya kemungkinan</li>
              <li>Digunakan dalam matematika dan logika formal</li>
            </ul>
          `,
        },
        induction: {
          title: "Penalaran Induktif",
          description: "Menarik kesimpulan umum dari pengamatan atau contoh spesifik.",
          content: `
            <h3>Apa itu Penalaran Induktif?</h3>
            <p>Induksi bergerak dari pengamatan spesifik ke kesimpulan umum. Kesimpulannya kemungkinan besar namun tidak pasti.</p>
            
            <h3>Struktur</h3>
            <p><strong>Pengamatan 1:</strong> Matahari terbit hari ini</p>
            <p><strong>Pengamatan 2:</strong> Matahari terbit kemarin</p>
            <p><strong>Pola:</strong> Matahari terbit setiap hari</p>
            <p><strong>Kesimpulan:</strong> Matahari akan terbit besok</p>
            
            <h3>Contoh</h3>
            <p>Setiap angsa yang kami lihat putih → Semua angsa putih (Ini adalah lompatan induktif umum yang sebenarnya salah!)</p>
            
            <h3>Poin Penting</h3>
            <ul>
              <li>Kesimpulan kemungkinan besar, bukan pasti</li>
              <li>Berdasarkan pola dan pengamatan</li>
              <li>Digunakan dalam sains dan statistik</li>
              <li>Lebih banyak pengamatan memperkuat kesimpulan</li>
            </ul>
          `,
        },
      },
    },
  };
  const currentCopy = copyMap[settings.language] || trainingConfig.copy;

  const appBarTitle =
    screen === "menu"
      ? copy.appBar.menu
      : screen === "learn"
        ? currentCopy.menu.learnAction
        : screen === "drill"
          ? `${modeLabel} ${copy.appBar.drillSuffix}`
          : screen === "summary"
            ? copy.appBar.summary
            : screen === "stats"
              ? copy.appBar.stats
              : copy.appBar.settings;

  if (screen === "menu") {
    content = (
      <>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>{currentCopy.menu.title}</h1>
          <p className={styles.heroText}>{currentCopy.menu.description}</p>
          <div className={styles.menuMetaRow}>
            <div className={styles.metaBadge}>
              <span className={styles.metaBadgeText}>
                {settings.questionCount} {currentCopy.menu.questionsSuffix}
              </span>
            </div>
            <div className={styles.metaBadge}>
              <span className={styles.metaBadgeText}>
                {settings.timeLimitSeconds}
                {currentCopy.menu.timeSuffix}
              </span>
            </div>
            <div className={styles.metaBadge}>
              <span className={styles.metaBadgeText}>
                {currentCopy.menu.weakestPrefix} {hasHydrated ? (weaknessText ?? '-') : '-'}
              </span>
            </div>
            <div className={styles.metaBadge}>
              <span className={styles.metaBadgeText}>
                {currentCopy.menu.negativesLabel} {hasHydrated ? (negativeText ?? '-') : '-'}
              </span>
            </div>
          </div>
        </section>

        {hasHydrated ? (
          <div className={styles.menuGrid}>
            {modes.map((item) => (
              <button
                key={item.key}
                onClick={() => startSession(item.key)}
                type="button"
                className={styles.menuButton}
              >
                <span className={styles.menuIcon}>
                  {useEmojiIcons && emojiSkillIcons[item.key] ? emojiSkillIcons[item.key] : item.icon}
                </span>
                <span>
                  <span className={styles.menuLabel}>{item.label}</span>
                  <span className={styles.menuSub}>{item.subtitle}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.menuGrid} />
        )}

        <div className={styles.menuActions}>
          <button
            type="button"
            onClick={() => setScreen("learn")}
            className={`${styles.settingsButton} ${styles.menuActionButton}`}
          >
            {currentCopy.menu.learnAction}
          </button>
          <button
            type="button"
            onClick={() => setScreen("stats")}
            className={`${styles.settingsButton} ${styles.menuActionButton}`}
          >
            {currentCopy.menu.statsAction}
          </button>
          <button
            type="button"
            onClick={() => setScreen("settings")}
            className={`${styles.settingsButton} ${styles.menuActionButton}`}
          >
            {currentCopy.menu.settingsAction}
          </button>
        </div>
      </>
    );
  }

  if (screen === "learn") {
    content = (
      <>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>{currentCopy.menu.learnAction}</h2>
          <p className={styles.sectionSub}>Learn the fundamentals before practicing</p>

          {!learnSkill ? (
            <div className={styles.skillSelectionGrid}>
              {skillKeys.map((skill) => {
                const skillDef = provider.skills[skill];
                return (
                  <button
                    key={skill}
                    onClick={() => setLearnSkill(skill)}
                    type="button"
                    className={styles.skillCard}
                  >
                    <span className={styles.skillCardIcon}>
                      {useEmojiIcons && emojiSkillIcons[skill] ? emojiSkillIcons[skill] : skillDef.symbol}
                    </span>
                    <span className={styles.skillCardLabel}>{skillDef.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={styles.studyContent}>
              {currentCopy.study && learnSkill && currentCopy.study[learnSkill as keyof typeof currentCopy.study] && (
                <>
                  {(() => {
                    const studyMaterial = currentCopy.study[learnSkill as keyof typeof currentCopy.study];
                    return (
                      <>
                        <h3 className={styles.studyTitle}>{studyMaterial.title}</h3>
                        <p className={styles.studyDescription}>{studyMaterial.description}</p>
                        <div
                          className={styles.studyHtml}
                          dangerouslySetInnerHTML={{
                            __html: studyMaterial.content,
                          }}
                        />
                      </>
                    );
                  })()}
                  <button
                    type="button"
                    onClick={() => setLearnSkill(null)}
                    className={`${styles.settingsButton} ${styles.backButton}`}
                  >
                    ← {currentCopy.menu.title}
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        <div className={styles.learnActions}>
          <button
            type="button"
            onClick={() => setScreen("menu")}
            className={`${styles.settingsButton} ${styles.menuActionButton}`}
          >
            {currentCopy.settings.backToMenu}
          </button>
        </div>
      </>
    );
  }

  if (screen === "drill") {
    content = (
      <>
        <div className={styles.statusRow} suppressHydrationWarning>
          <div className={styles.statusPill}>
            <span className={styles.statusText}>
              {currentCopy.drill.questionLabel} {questionIndex}/
              {settings.questionCount}
            </span>
          </div>
          <div
            className={`${styles.statusPill} ${
              timeLeft <= 3 ? styles.statusPillWarning : ""
            }`}
          >
            <span className={styles.statusText}>
              {currentCopy.drill.timeLabel} {timeLeftLabel}
            </span>
          </div>
        </div>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>
            {modeLabel} {copy.appBar.drillSuffix}
          </h2>
          <p className={styles.sectionSub}>{currentCopy.drill.subtitle}</p>

          {question ? (
            <div className={styles.questionCard}>
              <div className={styles.metaRow}>
                <span className={styles.metaPill}>
                  {currentCopy.drill.skillLabel}: {provider.skills[question.skill].label}
                </span>
                <span className={styles.metaPill}>
                  {currentCopy.drill.levelLabel} {question.level}
                </span>
                <span className={styles.metaPill}>
                  {currentCopy.drill.targetLabel} {formatMs(provider.getTargetMs(question.level))}
                </span>
              </div>

              <div className={styles.questionText}>
                {provider.getQuestionText(question)}
              </div>

              <div className={styles.answerBlock}>
                {useKeypad && keypadRows ? (
                  <>
                    <div className={styles.answerDisplay}>
                      <span
                        className={
                          answer.length === 0
                            ? styles.answerPlaceholder
                            : styles.answerDisplayText
                        }
                      >
                        {answer.length === 0
                          ? currentCopy.drill.answerPlaceholderKeypad
                          : answer}
                      </span>
                    </div>
                    <div className={styles.keypad}>
                      {keypadRows.map((row, rowIndex) => (
                        <div key={`row-${rowIndex}`} className={styles.keypadRow}>
                          {row.map((key) => {
                            const isActionKey = key === "CLR" || key === "DEL";
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => handleKeypadPress(key)}
                                disabled={answered}
                                className={`${styles.keypadButton} ${
                                  isActionKey ? styles.keypadButtonAlt : ""
                                } ${answered ? styles.keypadButtonDisabled : ""}`}
                              >
                                <span
                                  className={`${styles.keypadButtonText} ${
                                    isActionKey ? styles.keypadButtonAltText : ""
                                  } ${
                                    answered ? styles.keypadButtonTextDisabled : ""
                                  }`}
                                >
                                  {key}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={styles.answerAreaWrapper}>
                    {/* Answer Row */}
                    <div className={styles.answerRow}>
                      {provider.answer.inputMode === "multiple-choice" && question && provider.getQuestionOptions ? (
                        <div className={styles.answerButtonsRow}>
                          {provider.getQuestionOptions(question).map((option) => {
                            let btnClass = styles.answerOptionButton;
                            if (answered) {
                              if (option === answer) {
                                btnClass += feedback && feedback.correct && option === feedback.expected ? ` ${styles.answerCorrect}` : ` ${styles.answerWrong}`;
                              }
                            } else if (option === answer) {
                              btnClass += ` ${styles.answerSelected}`;
                            }
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  if (!answered) {
                                    handleAnswerChange(option);
                                    handleSubmit({ answer: option });
                                  }
                                }}
                                disabled={answered}
                                className={btnClass}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <input
                          ref={inputRef}
                          className={styles.answerInput}
                          type="text"
                          inputMode={provider.answer.inputMode === "numeric" ? "numeric" : "text"}
                          pattern={provider.answer.inputMode === "numeric" ? "[-0-g]*" : undefined}
                          value={answer}
                          onChange={(event) => {
                            handleAnswerChange(event.target.value);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleSubmit();
                            }
                          }}
                          placeholder={provider.answer.placeholder}
                          autoComplete="off"
                          disabled={answered}
                          aria-label="Answer input"
                        />
                      )}
                    </div>
                    {/* Action Row */}
                    <div className={styles.actionRow}>
                      {provider.answer.inputMode === "multiple-choice" && question && provider.getQuestionOptions ? (
                        answered ? (
                          <button
                            type="button"
                            onClick={handleNext}
                            className={styles.primaryButton}
                          >
                            {currentCopy.drill.nextAction}
                          </button>
                        ) : null
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSubmit({ useKeypad: Boolean(useKeypad && keypadRows) })}
                            disabled={answered}
                            className={`${styles.primaryButton} ${answered ? styles.buttonDisabled : ""}`}
                          >
                            {currentCopy.drill.checkAction}
                          </button>
                          <button
                            type="button"
                            onClick={handleNext}
                            disabled={!answered}
                            className={`${styles.secondaryButton} ${!answered ? styles.buttonDisabled : ""}`}
                          >
                            {currentCopy.drill.nextAction}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {error ? <p className={styles.errorText}>{error}</p> : null}
                {feedback ? (
                  <div
                    className={`${styles.feedback} ${
                      feedback.correct
                        ? styles.feedbackCorrect
                        : styles.feedbackWrong
                    }`}
                  >
                    <span className={styles.feedbackText}>{feedbackText}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <p className={styles.sectionSub}>{currentCopy.drill.loading}</p>
          )}

          <div className={styles.sessionRow}>
            <div>
              <p className={styles.sessionLabel}>{currentCopy.drill.sessionScoreLabel}</p>
              <p className={styles.sessionValue}>
                {session.correct} correct / {session.wrong} wrong
              </p>
            </div>
            <p className={styles.sessionHint}>{currentCopy.drill.sessionHint}</p>
          </div>
        </section>
      </>
    );
  }

  if (screen === "stats") {
    content = (
      <>
        <section className={styles.hero} suppressHydrationWarning>
          <h1 className={styles.heroTitle}>{currentCopy.stats.title}</h1>
          <p className={styles.heroText}>{currentCopy.stats.intro}</p>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>{currentCopy.stats.overallTitle}</h2>
          <p className={styles.sectionSub}>{currentCopy.stats.overallIntro}</p>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>{currentCopy.stats.accuracyLabel}</p>
              <p className={styles.summaryValue}>{overallAccuracy}%</p>
            </div>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>{currentCopy.stats.attemptsLabel}</p>
              <p className={styles.summaryValue}>{allAttempts}</p>
            </div>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>{currentCopy.stats.avgTimeLabel}</p>
              <p className={styles.summaryValue}>
                {allAttempts ? formatMs(overallAvgMs) : "-"}
              </p>
            </div>
          </div>
          <div className={styles.statBar}>
            <div
              className={styles.statBarFill}
              style={{ width: `${overallAccuracy}%` }}
            />
          </div>
        </section>

        <div className={styles.statGrid}>
          {skillKeys.map((skill) => {
            const history = stats[skill].history;
            const accuracy = provider.getAccuracy(stats[skill]);
            const avgMs = provider.getAverageMs(stats[skill]);
            const accuracyText =
              history.length === 0
                ? currentCopy.stats.noData
                : `${Math.round(accuracy * 100)}%`;
            const speedText = history.length === 0 ? "-" : formatMs(avgMs);
            const barWidth =
              history.length === 0 ? "0%" : `${Math.round(accuracy * 100)}%`;

            return (
              <section key={skill} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <h3 className={styles.statTitle}>
                    {provider.skills[skill].label}
                  </h3>
                  <span className={styles.levelBadge}>
                    {currentCopy.drill.levelLabel} {stats[skill].level}
                  </span>
                </div>
                <div className={styles.statBar}>
                  <div
                    className={styles.statBarFill}
                    style={{ width: barWidth }}
                  />
                </div>
                <div className={styles.statMetrics}>
                  <div>
                    <p className={styles.metricLabel}>
                      {currentCopy.stats.accuracyLabel}
                    </p>
                    <p className={styles.metricValue}>{accuracyText}</p>
                  </div>
                  <div className={styles.metricDivider} />
                  <div>
                    <p className={styles.metricLabel}>{currentCopy.stats.avgTimeLabel}</p>
                    <p className={styles.metricValue}>{speedText}</p>
                  </div>
                </div>
                <div className={styles.dotRow}>
                  {history.length === 0 ? (
                    <span className={styles.dotEmpty}>
                      {currentCopy.stats.noAttempts}
                    </span>
                  ) : (
                    history.map((item, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className={`${styles.dot} ${
                          item.correct ? styles.dotCorrect : styles.dotWrong
                        }`}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </>
    );
  }

  if (screen === "summary") {
    content = (
      <section className={styles.card} suppressHydrationWarning>
        <h2 className={styles.sectionTitle}>{currentCopy.summary.title}</h2>
        <p className={styles.sectionSub}>
          {modeLabel} {copy.appBar.drillSuffix}
        </p>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>{currentCopy.summary.accuracyLabel}</p>
            <p className={styles.summaryValue}>{accuracy}%</p>
          </div>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>{currentCopy.summary.correctLabel}</p>
            <p className={styles.summaryValue}>{session.correct}</p>
          </div>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>{currentCopy.summary.wrongLabel}</p>
            <p className={styles.summaryValue}>{session.wrong}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => startSession(mode)}
          className={styles.primaryButton}
        >
          {currentCopy.summary.practiceAgain}
        </button>
        <button
          type="button"
          onClick={goToMenu}
          className={styles.secondaryButton}
        >
          {currentCopy.summary.backToMenu}
        </button>
      </section>
    );
  }

  if (screen === "settings") {
    content = (
      <section className={styles.card} suppressHydrationWarning>
        <h2 className={styles.sectionTitle}>{currentCopy.settings.title}</h2>
        <p className={styles.sectionSub}>{currentCopy.settings.intro}</p>

        {provider.settings.controls.map((control) => {
          if (control.id === "language") {
            return (
              <div key={control.id} className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <p className={styles.settingLabel}>{control.label}</p>
                  {control.hint ? (
                    <p className={styles.settingHint}>{control.hint}</p>
                  ) : null}
                </div>
                <select
                  className={styles.languageSelect}
                  value={settings.language}
                  onChange={e => {
                    // Get current language value (0 = en, 1 = id)
                    const currentValue = settings.language === "en" ? 0 : 1;
                    // Get target value
                    const targetValue = e.target.value === "en" ? 0 : 1;
                    // Calculate delta for adjustSetting
                    const delta = targetValue - currentValue;
                    adjustSetting("language", delta);
                  }}
                >
                  <option value="en">English</option>
                  <option value="id">Indonesian</option>
                </select>
              </div>
            );
          }
          const value = control.getValue(settings);
          const displayValue = control.formatValue
            ? control.formatValue(value, settings)
            : String(value);
          return (
            <div key={control.id} className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <p className={styles.settingLabel}>{control.label}</p>
                {control.hint ? (
                  <p className={styles.settingHint}>{control.hint}</p>
                ) : null}
              </div>
              <div className={styles.stepper}>
                <button
                  type="button"
                  onClick={() => adjustSetting(control.id, -1)}
                  className={styles.stepperButton}
                >
                  <span className={styles.stepperButtonText}>-</span>
                </button>
                <span className={styles.stepperValue}>{displayValue}</span>
                <button
                  type="button"
                  onClick={() => adjustSetting(control.id, 1)}
                  className={styles.stepperButton}
                >
                  <span className={styles.stepperButtonText}>+</span>
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={toggleTheme}
          aria-pressed={theme === "dark"}
          aria-label={currentCopy.settings.themeLabel}
          className={`${styles.themeToggle} ${
            theme === "dark" ? styles.themeToggleDark : ""
          }`}
        >
          <span className={styles.themeIcon} aria-hidden="true">
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" role="img">
                <path
                  d="M21 14.5A8.5 8.5 0 0 1 9.5 3a9 9 0 1 0 11.5 11.5Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" role="img">
                <circle cx="12" cy="12" r="4.5" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="1.6">
                  <line x1="12" y1="2" x2="12" y2="5" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="5" y2="12" />
                  <line x1="19" y1="12" x2="22" y2="12" />
                  <line x1="4.6" y1="4.6" x2="6.8" y2="6.8" />
                  <line x1="17.2" y1="17.2" x2="19.4" y2="19.4" />
                  <line x1="4.6" y1="19.4" x2="6.8" y2="17.2" />
                  <line x1="17.2" y1="6.8" x2="19.4" y2="4.6" />
                </g>
              </svg>
            )}
          </span>
          <span className={styles.themeText}>
            <span className={styles.themeLabel}>{currentCopy.settings.themeLabel}</span>
            <span className={styles.themeName}>
              {theme === "dark" ? currentCopy.settings.themeDark : currentCopy.settings.themeLight}
            </span>
          </span>
          <span className={styles.themeSwitch} aria-hidden="true">
            <span className={styles.themeKnob} />
          </span>
        </button>

        <button
          type="button"
          onClick={resetStats}
          className={styles.dangerButton}
        >
          {currentCopy.settings.resetStats}
        </button>

        <button
          type="button"
          onClick={goToMenu}
          className={`${styles.secondaryButton} ${styles.fullWidthButton}`}
        >
          {currentCopy.settings.backToMenu}
        </button>
      </section>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.appBar}>
        <div className={styles.appBarInner}>
          <div className={styles.appBarLeft}>
            {screen === "menu" ? (
              <div className={styles.brandMark}>
                <span className={styles.brandMarkText}>
                  {currentCopy.brand.shortName}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={goToMenu}
                className={styles.appBarBack}
                aria-label={currentCopy.summary.backToMenu}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M15 6L9 12l6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <span className={styles.appBarTitle}>{appBarTitle}</span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {content}
        {inlineAdConfig.enabled ? (
          <InlineScriptAdSlot
            config={inlineAdConfig}
            className={styles.adSlot}
          />
        ) : null}
      </main>
    </div>
  );
}
