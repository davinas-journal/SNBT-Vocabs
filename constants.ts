export const DEFAULT_INTERVALS = [1, 3, 7, 14, 30];

export const MOTIVATIONAL_MESSAGES = [
  "You're doing amazing!",
  "One step closer to mastery!",
  "Keep shining!",
  "Fantastic progress!",
  "Learning looks good on you!",
  "Small steps, big results!"
];

export const SAMPLE_DATA_SEED = [
  {
    id: 'seed-1',
    word: 'Serendipity',
    translation: 'Ketidaksengajaan yang menyenangkan',
    synonyms: ['Chance', 'Fate', 'Luck'],
    example: 'Finding this coffee shop was pure serendipity.',
    level: 1,
    nextReviewDate: Date.now() - 86400000, // Due yesterday
    createdAt: Date.now() - 100000000,
    phonetic: "/ˌser.ənˈdɪp.ə.t̬i/"
  },
  {
    id: 'seed-2',
    word: 'Ephemeral',
    translation: 'Sesaat / Tidak kekal',
    synonyms: ['Transitory', 'Fleeting', 'Short-lived'],
    example: 'Fashions are ephemeral, changing with every season.',
    level: 2,
    nextReviewDate: Date.now(), // Due today
    createdAt: Date.now() - 200000000,
    phonetic: "/əˈfem.ər.əl/"
  }
];
