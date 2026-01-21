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

export const generateQuestion = (skill: SkillKey, level: number, language: string = "en"): Question => {
  const questionsEn: Question[] = [
    {
      id: "1",
      skill: "syllogism",
      level: 1,
      text: "All men are mortal. Socrates is a man. Therefore, Socrates is mortal.",
      options: ["Valid", "Invalid"],
      answer: "Valid",
    },
    {
      id: "5",
      skill: "syllogism",
      level: 1,
      text: "All dogs are animals. Max is a dog. Therefore, Max is an animal.",
      options: ["Valid", "Invalid"],
      answer: "Valid",
    },
    {
      id: "9",
      skill: "syllogism",
      level: 1,
      text: "Some birds can fly. Penguins are birds. Therefore, penguins can fly.",
      options: ["Valid", "Invalid"],
      answer: "Invalid",
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
      id: "6",
      skill: "fallacy",
      level: 1,
      text: "If you don't vote for this candidate, you hate your country.",
      options: ["False Dilemma", "Appeal to Fear", "Straw Man"],
      answer: "False Dilemma",
    },
    {
      id: "10",
      skill: "fallacy",
      level: 1,
      text: "Everyone believes in climate change, so it must be true.",
      options: ["Appeal to Majority", "False Cause", "Ad Hominem"],
      answer: "Appeal to Majority",
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
      id: "7",
      skill: "deduction",
      level: 1,
      text: "All students study hard. John is a student. Therefore...",
      options: ["John studies hard", "John does not study", "John is smart"],
      answer: "John studies hard",
    },
    {
      id: "11",
      skill: "deduction",
      level: 1,
      text: "If a number is even, it is divisible by 2. 8 is even. Therefore...",
      options: ["8 is divisible by 2", "8 is divisible by 3", "8 is odd"],
      answer: "8 is divisible by 2",
    },
    {
      id: "4",
      skill: "induction",
      level: 1,
      text: "The sun has risen every day so far. Therefore...",
      options: ["The sun will rise tomorrow", "The sun will not rise tomorrow", "The sun is a star"],
      answer: "The sun will rise tomorrow",
    },
    {
      id: "8",
      skill: "induction",
      level: 1,
      text: "Every swan we've observed is white. Therefore...",
      options: ["All swans are white", "Most swans are white", "No swans are white"],
      answer: "All swans are white",
    },
    {
      id: "12",
      skill: "induction",
      level: 1,
      text: "The first 5 numbers are 2, 4, 6, 8, 10. Therefore the next number is...",
      options: ["12", "11", "15"],
      answer: "12",
    },
  ];

  const questionsId: Question[] = [
    {
      id: "1",
      skill: "syllogism",
      level: 1,
      text: "Semua manusia adalah makhluk hidup. Sokrates adalah manusia. Oleh karena itu, Sokrates adalah makhluk hidup.",
      options: ["Valid", "Invalid"],
      answer: "Valid",
    },
    {
      id: "5",
      skill: "syllogism",
      level: 1,
      text: "Semua anjing adalah hewan. Max adalah anjing. Oleh karena itu, Max adalah hewan.",
      options: ["Valid", "Invalid"],
      answer: "Valid",
    },
    {
      id: "9",
      skill: "syllogism",
      level: 1,
      text: "Beberapa burung dapat terbang. Penguin adalah burung. Oleh karena itu, penguin dapat terbang.",
      options: ["Valid", "Invalid"],
      answer: "Invalid",
    },
    {
      id: "2",
      skill: "fallacy",
      level: 1,
      text: "Anda harus setuju dengan saya atau tidak peduli dengan negara ini.",
      options: ["Dilema Palsu", "Ad Hominem", "Strawman"],
      answer: "Dilema Palsu",
    },
    {
      id: "6",
      skill: "fallacy",
      level: 1,
      text: "Jika Anda tidak memilih kandidat ini, Anda membenci negara Anda.",
      options: ["Dilema Palsu", "Banding kepada Ketakutan", "Strawman"],
      answer: "Dilema Palsu",
    },
    {
      id: "10",
      skill: "fallacy",
      level: 1,
      text: "Semua orang percaya pada perubahan iklim, jadi itu pasti benar.",
      options: ["Banding kepada Mayoritas", "Sebab Palsu", "Ad Hominem"],
      answer: "Banding kepada Mayoritas",
    },
    {
      id: "3",
      skill: "deduction",
      level: 1,
      text: "Jika hujan, tanah akan basah. Sedang hujan. Oleh karena itu...",
      options: ["Tanah basah", "Tanah kering", "Cuaca cerah"],
      answer: "Tanah basah",
    },
    {
      id: "7",
      skill: "deduction",
      level: 1,
      text: "Semua siswa belajar keras. John adalah siswa. Oleh karena itu...",
      options: ["John belajar keras", "John tidak belajar", "John cerdas"],
      answer: "John belajar keras",
    },
    {
      id: "11",
      skill: "deduction",
      level: 1,
      text: "Jika suatu bilangan genap, maka habis dibagi 2. 8 adalah genap. Oleh karena itu...",
      options: ["8 habis dibagi 2", "8 habis dibagi 3", "8 adalah ganjil"],
      answer: "8 habis dibagi 2",
    },
    {
      id: "4",
      skill: "induction",
      level: 1,
      text: "Matahari terbit setiap hari sejauh ini. Oleh karena itu...",
      options: ["Matahari akan terbit besok", "Matahari tidak akan terbit besok", "Matahari adalah bintang"],
      answer: "Matahari akan terbit besok",
    },
    {
      id: "8",
      skill: "induction",
      level: 1,
      text: "Setiap angsa yang kami amati berwarna putih. Oleh karena itu...",
      options: ["Semua angsa putih", "Kebanyakan angsa putih", "Tidak ada angsa yang putih"],
      answer: "Semua angsa putih",
    },
    {
      id: "12",
      skill: "induction",
      level: 1,
      text: "5 angka pertama adalah 2, 4, 6, 8, 10. Oleh karena itu angka berikutnya adalah...",
      options: ["12", "11", "15"],
      answer: "12",
    },
  ];

  const questions = language === "id" ? questionsId : questionsEn;
  
  // Get all questions for this skill and pick a random one
  const skillQuestions = questions.filter(q => q.skill === skill);
  if (skillQuestions.length === 0) return questions[0];
  
  // Pick a random question from the skill
  const randomIndex = Math.floor(Math.random() * skillQuestions.length);
  return skillQuestions[randomIndex];
};

export const getAccuracy = (stats: any) => 0;
export const getAverageMs = (stats: any) => 0;
export const getTargetMs = (level: number) => 5000;
export const getWeakestSkill = (stats: any): SkillKey => "syllogism";
export const pickSkill = (stats: any): SkillKey => "syllogism";

export const updateStats = (stats: any, skill: SkillKey, correct: boolean, ms: number) => {
  return stats;
};

