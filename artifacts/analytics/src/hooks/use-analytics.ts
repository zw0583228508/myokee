import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics } from "@/lib/api";

export interface OverviewData {
  users: { total: number; last7d: number; last30d: number };
  jobs: { total: number; last7d: number; last30d: number; avgDuration: number };
  revenue: {
    totalStripeCredits: number;
    stripeTransactions: number;
    totalPaypalCredits: number;
    paypalTransactions: number;
  };
  activeUsersToday: number;
  performances: { total: number; avgScore: number };
  parties: { total: number };
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface RevenuePoint {
  date: string;
  stripe: number;
  paypal: number;
  total: number;
}

export interface TopUser {
  id: string;
  displayName: string;
  email: string;
  credits: number;
  createdAt: string;
  jobCount: number;
  totalCreditsUsed: number;
}

export interface RecentJob {
  jobId: string;
  userId: string;
  userName: string;
  durationSeconds: number;
  creditsCharged: number;
  createdAt: string;
}

export interface GamificationData {
  xp: {
    totalUsers: number;
    avgXp: number;
    maxXp: number;
    avgLevel: number;
    maxLevel: number;
    avgStreak: number;
    maxStreak: number;
  };
  badges: { badgeId: string; count: number }[];
  achievements: { achievementId: string; total: number; completed: number }[];
  xpActions: { reason: string; count: number; totalXp: number }[];
}

export interface PerformancesData {
  distribution: { range: string; count: number }[];
  topScores: { score: number; userName: string; createdAt: string }[];
  overTime: { date: string; count: number; avgScore: number }[];
}

export interface ReferralsData {
  totalReferrals: number;
  totalCreditsAwarded: number;
  topReferrers: {
    userId: string;
    name: string;
    referralCount: number;
    totalCredits: number;
  }[];
}

export interface PartiesData {
  totalRooms: number;
  activeRooms: number;
  roomsLast7d: number;
  recentRooms: {
    id: string;
    name: string;
    code: string;
    status: string;
    hostName: string;
    memberCount: number;
    queueSize: number;
    createdAt: string;
  }[];
}

export interface CreditRange {
  range: string;
  count: number;
}

export function useOverview() {
  return useQuery<OverviewData>({
    queryKey: ["analytics", "overview"],
    queryFn: () => fetchAnalytics<OverviewData>("overview"),
  });
}

export function useUsersOverTime() {
  return useQuery<TimeSeriesPoint[]>({
    queryKey: ["analytics", "users-over-time"],
    queryFn: () => fetchAnalytics<TimeSeriesPoint[]>("users-over-time"),
  });
}

export function useJobsOverTime() {
  return useQuery<TimeSeriesPoint[]>({
    queryKey: ["analytics", "jobs-over-time"],
    queryFn: () => fetchAnalytics<TimeSeriesPoint[]>("jobs-over-time"),
  });
}

export function useTopUsers() {
  return useQuery<TopUser[]>({
    queryKey: ["analytics", "top-users"],
    queryFn: () => fetchAnalytics<TopUser[]>("top-users"),
  });
}

export function useRecentJobs() {
  return useQuery<RecentJob[]>({
    queryKey: ["analytics", "recent-jobs"],
    queryFn: () => fetchAnalytics<RecentJob[]>("recent-jobs"),
  });
}

export function useRevenueOverTime() {
  return useQuery<RevenuePoint[]>({
    queryKey: ["analytics", "revenue-over-time"],
    queryFn: () => fetchAnalytics<RevenuePoint[]>("revenue-over-time"),
  });
}

export function useGamification() {
  return useQuery<GamificationData>({
    queryKey: ["analytics", "gamification"],
    queryFn: () => fetchAnalytics<GamificationData>("gamification"),
  });
}

export function usePerformances() {
  return useQuery<PerformancesData>({
    queryKey: ["analytics", "performances"],
    queryFn: () => fetchAnalytics<PerformancesData>("performances"),
  });
}

export function useReferrals() {
  return useQuery<ReferralsData>({
    queryKey: ["analytics", "referrals"],
    queryFn: () => fetchAnalytics<ReferralsData>("referrals"),
  });
}

export function useParties() {
  return useQuery<PartiesData>({
    queryKey: ["analytics", "parties"],
    queryFn: () => fetchAnalytics<PartiesData>("parties"),
  });
}

export function useCreditsDistribution() {
  return useQuery<CreditRange[]>({
    queryKey: ["analytics", "credits-distribution"],
    queryFn: () => fetchAnalytics<CreditRange[]>("credits-distribution"),
  });
}
