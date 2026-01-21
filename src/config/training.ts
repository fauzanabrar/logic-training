import { appConfig } from "./app";
import { logicTrainingProvider } from "@/features/training/providers/logicTrainingProvider";

type ProviderSkillKey = keyof typeof logicTrainingProvider.skills;
type TrainingModeKey = ProviderSkillKey | "mix";

const storagePrefix = appConfig.storagePrefix;

const mixMode: {
  key: TrainingModeKey;
  label: string;
  subtitle: string;
  icon: string;
} = {
  key: "mix" as const,
  label: "Random mix",
  subtitle: "Adaptive blend",
  icon: "M",
};

const skillModes: Array<{
  key: ProviderSkillKey;
  label: string;
  subtitle: string;
  icon: string;
}> = logicTrainingProvider.skillOrder.map((skill) => ({
  key: skill,
  label: logicTrainingProvider.skills[skill].label,
  subtitle: logicTrainingProvider.skills[skill].subtitle,
  icon: logicTrainingProvider.skills[skill].symbol,
}));

export const trainingConfig = {
  provider: logicTrainingProvider,
  storageKeys: {
    session: `${storagePrefix}:session:${logicTrainingProvider.id}`,
    settings: `${storagePrefix}:settings`,
    theme: `${storagePrefix}:theme`,
  },
  modes: [mixMode, ...skillModes] as Array<{
    key: TrainingModeKey;
    label: string;
    subtitle: string;
    icon: string;
  }>,
  copy: {
    brand: {
      name: appConfig.name,
      shortName: appConfig.shortName,
    },
    menu: {
      title: "Choose a drill",
      description:
        "Pick a focus or use Random mix to adapt to your weakest skill.",
      statsAction: "Statistics",
      settingsAction: "Settings",
      learnAction: "Learn",
      questionsSuffix: "questions",
      timeSuffix: "s per question",
      weakestPrefix: "Weakest:",
      negativesLabel: "Negatives:",
      negativesOff: "Off",
      negativesFormat: (value: number) => `Lvl ${value}+`,
    },
    drill: {
      subtitle: "Answer fast and correct to level up.",
      questionLabel: "Question",
      timeLabel: "Time",
      skillLabel: "Category",
      levelLabel: "Level",
      targetLabel: "Target",
      answerPlaceholder: "Type your answer",
      answerPlaceholderKeypad: "Tap to answer",
      checkAction: "Check",
      nextAction: "Next",
      loading: "Loading your prompt...",
      sessionScoreLabel: "Session score",
      sessionHint: "Stay focused and keep moving.",
    },
    stats: {
      title: "Statistics",
      intro:
        "Recent performance across your drills (last 12 attempts per skill).",
      overallTitle: "Overall",
      overallIntro: "Based on your recent attempts across all skills.",
      accuracyLabel: "Accuracy",
      attemptsLabel: "Attempts",
      avgTimeLabel: "Avg time",
      noData: "No data yet",
      noAttempts: "No attempts yet",
    },
    summary: {
      title: "Session complete",
      accuracyLabel: "Accuracy",
      correctLabel: "Correct",
      wrongLabel: "Wrong",
      practiceAgain: "Practice again",
      backToMenu: "Back to menu",
    },
    settings: {
      title: "Settings",
      intro: "Tune the session size and time per question.",
      themeLabel: "Theme",
      themeLight: "Light",
      themeDark: "Dark",
      resetStats: "Reset all stats",
      backToMenu: "Back to menu",
    },
    appBar: {
      menu: appConfig.name,
      drillSuffix: "drill",
      summary: "Session summary",
      stats: "Statistics",
      settings: "Settings",
      learn: "Learn",
    },
    feedback: {
      correctPrefix: "Correct.",
      wrongPrefix: "Not yet. Answer:",
      timeoutPrefix: "Time's up. Answer:",
    },
    study: {
      syllogism: {
        title: "Syllogism",
        description: "A form of deductive reasoning consisting of a major premise, minor premise, and conclusion.",
        content: `
          <h3>What is a Syllogism?</h3>
          <p>A syllogism is a logical argument where a conclusion is drawn from two given or assumed propositions (premises).</p>
          
          <h3>Structure</h3>
          <ul>
            <li><strong>Major Premise:</strong> A general statement (All X are Y)</li>
            <li><strong>Minor Premise:</strong> A specific statement (Z is X)</li>
            <li><strong>Conclusion:</strong> The logical result (Therefore, Z is Y)</li>
          </ul>
          
          <h3>Example</h3>
          <p><strong>Major Premise:</strong> All humans are mortal</p>
          <p><strong>Minor Premise:</strong> Socrates is human</p>
          <p><strong>Conclusion:</strong> Therefore, Socrates is mortal</p>
          
          <h3>Key Points</h3>
          <ul>
            <li>Valid syllogisms follow the rules of logic</li>
            <li>Invalid syllogisms violate logical rules</li>
            <li>The middle term must be distributed in at least one premise</li>
          </ul>
        `,
      },
      fallacy: {
        title: "Logical Fallacies",
        description: "Common errors in reasoning that make arguments invalid or misleading.",
        content: `
          <h3>Common Fallacies</h3>
          
          <h4>False Dilemma</h4>
          <p>Presents only two options when more exist. Example: "You're either with us or against us."</p>
          
          <h4>Ad Hominem</h4>
          <p>Attacks the person rather than the argument. Example: "You're stupid, so your idea is wrong."</p>
          
          <h4>Straw Man</h4>
          <p>Misrepresents someone's argument to make it easier to attack.</p>
          
          <h4>Appeal to Authority</h4>
          <p>Uses an authority figure's opinion as proof without evidence.</p>
          
          <h4>Appeal to Majority</h4>
          <p>Assumes something is true because many people believe it.</p>
          
          <h3>Why Identify Fallacies?</h3>
          <ul>
            <li>Recognizes weak arguments</li>
            <li>Improves critical thinking</li>
            <li>Prevents being misled</li>
          </ul>
        `,
      },
      deduction: {
        title: "Deductive Reasoning",
        description: "Drawing specific conclusions from general principles or premises.",
        content: `
          <h3>What is Deductive Reasoning?</h3>
          <p>Deduction moves from general knowledge to specific conclusions. If the premises are true and the reasoning is valid, the conclusion must be true.</p>
          
          <h3>Structure</h3>
          <p><strong>Premise 1:</strong> If A, then B</p>
          <p><strong>Premise 2:</strong> A is true</p>
          <p><strong>Conclusion:</strong> Therefore, B is true</p>
          
          <h3>Example</h3>
          <p><strong>Premise 1:</strong> If it rains, the ground is wet</p>
          <p><strong>Premise 2:</strong> It is raining</p>
          <p><strong>Conclusion:</strong> Therefore, the ground is wet</p>
          
          <h3>Key Points</h3>
          <ul>
            <li>Deduction is reliable when premises are true</li>
            <li>The conclusion is certain, not just probable</li>
            <li>Used in mathematics and formal logic</li>
          </ul>
        `,
      },
      induction: {
        title: "Inductive Reasoning",
        description: "Drawing general conclusions from specific observations or examples.",
        content: `
          <h3>What is Inductive Reasoning?</h3>
          <p>Induction moves from specific observations to general conclusions. The conclusion is probable but not certain.</p>
          
          <h3>Structure</h3>
          <p><strong>Observation 1:</strong> The sun rose today</p>
          <p><strong>Observation 2:</strong> The sun rose yesterday</p>
          <p><strong>Pattern:</strong> The sun rises every day</p>
          <p><strong>Conclusion:</strong> The sun will rise tomorrow</p>
          
          <h3>Example</h3>
          <p>Every swan we've seen is white → All swans are white (This is a common inductive leap that is actually false!)</p>
          
          <h3>Key Points</h3>
          <ul>
            <li>Conclusions are probable, not certain</li>
            <li>Based on patterns and observations</li>
            <li>Used in science and statistics</li>
            <li>More observations strengthen the conclusion</li>
          </ul>
        `,
      },
    },
  },
};
