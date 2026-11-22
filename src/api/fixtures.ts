import type {
  Achievement,
  Leaderboard,
  Portfolio,
  Quote,
  Trade,
  UserProfile,
} from './contracts';

const CREATED_AT = '2026-11-01T09:00:00.000Z';

export const mockUser: UserProfile = {
  id: 'user-mock-1',
  email: 'learner@hodlo.app',
  displayName: 'Robin',
  characterId: 'hodlo',
  experienceLevel: 'beginner',
  interests: ['basics'],
  dailyGoalXp: 30,
  xp: 0,
  gems: 50,
  hearts: 5,
  maxHearts: 5,
  timezone: 'UTC',
  streak: {
    current: 0,
    longest: 0,
    lastLessonDate: null,
    freezesEquipped: 0,
    restDay: null,
  },
  onboardingCompleted: false,
  createdAt: CREATED_AT,
};

const names = [
  'Robin',
  'Sam',
  'Alex',
  'Priya',
  'Noah',
  'Lena',
  'Mateo',
  'Ada',
  'Kai',
  'Iris',
  'Omar',
  'Nina',
  'Theo',
  'Zara',
  'Leo',
  'Maya',
  'Jonas',
  'Aria',
  'Finn',
  'Rosa',
  'Eli',
  'Tara',
  'Hugo',
  'Sana',
  'Milo',
  'Ivy',
  'Rex',
  'Dana',
  'Cole',
  'Vera',
];

export const mockLeaderboard: Leaderboard = {
  tier: 'bronze',
  endsAt: '2026-11-30T00:00:00.000Z',
  currentUserId: mockUser.id,
  promotionZone: 5,
  demotionZone: 5,
  entries: Array.from({ length: 30 }, (_, index) => ({
    userId: index === 11 ? mockUser.id : `user-${index + 2}`,
    displayName: index === 11 ? mockUser.displayName : names[index],
    xp: 400 - index * 10,
    rank: index + 1,
    tier: 'bronze' as const,
  })),
};

const achievementTitles = [
  'First steps',
  'Seven-day streak',
  'Perfect lesson',
  'Risk aware',
  'Scam spotter',
  'Chart reader',
  'Compounder',
  'Key keeper',
  'Daily goal',
  'Unit cleared',
  'Comeback',
  'Team player',
];

export const mockAchievements: Achievement[] = achievementTitles.map(
  (title, index) => ({
    id: `achievement-${index + 1}`,
    title,
    description: `${title}: keep going to unlock it.`,
    icon: 'star',
    earnedAt: index === 0 ? CREATED_AT : null,
    progress: index === 0 ? 1 : 0,
    target: 1,
  }),
);

export const mockPortfolio: Portfolio = {
  cash: 5000,
  totalValue: 6500,
  totalPnl: 500,
  holdings: [
    {
      symbol: 'BTC',
      quantity: 0.05,
      averageCost: 60000,
      currentPrice: 65000,
      value: 3250,
      pnl: 250,
    },
  ],
  updatedAt: '2026-11-22T12:00:00.000Z',
};

export const mockQuotes: Quote[] = [
  {
    symbol: 'BTC',
    price: 65000,
    change24h: 2.5,
    updatedAt: '2026-11-22T12:00:00.000Z',
  },
  {
    symbol: 'ETH',
    price: 3200,
    change24h: -1.2,
    updatedAt: '2026-11-22T12:00:00.000Z',
  },
  {
    symbol: 'SOL',
    price: 150,
    change24h: 4.1,
    updatedAt: '2026-11-22T12:00:00.000Z',
  },
];

export const mockTrades: Trade[] = [
  {
    id: 'trade-seed-1',
    symbol: 'BTC',
    side: 'buy',
    quantity: 0.05,
    price: 60000,
    executedAt: '2026-11-10T12:00:00.000Z',
  },
];
