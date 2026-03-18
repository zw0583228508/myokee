import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Users,
  Music,
  CreditCard,
  Activity,
  Trophy,
  Gift,
  PartyPopper,
  RefreshCw,
  Moon,
  Sun,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useOverview,
  useUsersOverTime,
  useJobsOverTime,
  useTopUsers,
  useRecentJobs,
  useRevenueOverTime,
  useGamification,
  usePerformances,
  useReferrals,
  useParties,
  useCreditsDistribution,
} from "@/hooks/use-analytics";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useQueryClient } from "@tanstack/react-query";

const COLORS = ["#0079F2", "#795EFF", "#009118", "#A60808", "#ec4899", "#f59e0b"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" });
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatTimeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: { value: string; up: boolean };
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: "#0079F2" }}>
              {value}
            </p>
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                {trend.up ? (
                  <ArrowUpIcon className="w-3 h-3 text-green-600" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3 text-red-600" />
                )}
                <span className={`text-xs ${trend.up ? "text-green-600" : "text-red-600"}`}>
                  {trend.value}
                </span>
              </div>
            )}
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function OverviewTab() {
  const { data: overview, isLoading: overviewLoading } = useOverview();
  const { data: usersOT, isLoading: usersLoading } = useUsersOverTime();
  const { data: jobsOT, isLoading: jobsLoading } = useJobsOverTime();
  const { data: revenueOT, isLoading: revenueLoading } = useRevenueOverTime();
  const { data: creditsDist, isLoading: creditsLoading } = useCreditsDistribution();

  if (overviewLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Users"
          value={overview?.users.total ?? 0}
          icon={Users}
          subtitle={`${overview?.users.last7d ?? 0} this week`}
        />
        <KPICard
          title="Total Songs Processed"
          value={overview?.jobs.total ?? 0}
          icon={Music}
          subtitle={`${overview?.jobs.last7d ?? 0} this week`}
        />
        <KPICard
          title="Credits Purchased"
          value={
            (overview?.revenue.totalStripeCredits ?? 0) +
            (overview?.revenue.totalPaypalCredits ?? 0)
          }
          icon={CreditCard}
          subtitle={`${overview?.revenue.stripeTransactions ?? 0} Stripe + ${overview?.revenue.paypalTransactions ?? 0} PayPal`}
        />
        <KPICard
          title="Active Users Today"
          value={overview?.activeUsersToday ?? 0}
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Avg Song Duration"
          value={formatDuration(overview?.jobs.avgDuration ?? 0)}
          icon={Music}
        />
        <KPICard
          title="Total Performances"
          value={overview?.performances.total ?? 0}
          icon={Trophy}
          subtitle={`Avg score: ${(overview?.performances.avgScore ?? 0).toFixed(1)}`}
        />
        <KPICard
          title="Party Rooms"
          value={overview?.parties.total ?? 0}
          icon={PartyPopper}
        />
        <KPICard
          title="Jobs (30 days)"
          value={overview?.jobs.last30d ?? 0}
          icon={Music}
          subtitle={`Users: ${overview?.users.last30d ?? 0}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Registrations (90 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <LoadingSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={usersOT}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    labelFormatter={(l) => new Date(l).toLocaleDateString("he-IL")}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#0079F2"
                    fill="#0079F2"
                    fillOpacity={0.15}
                    name="New Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Songs Processed (90 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <LoadingSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={jobsOT}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    labelFormatter={(l) => new Date(l).toLocaleDateString("he-IL")}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#795EFF"
                    fill="#795EFF"
                    fillOpacity={0.15}
                    name="Songs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Over Time (Credits)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <LoadingSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueOT}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    labelFormatter={(l) => new Date(l).toLocaleDateString("he-IL")}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Bar dataKey="stripe" fill="#0079F2" name="Stripe" />
                  <Bar dataKey="paypal" fill="#795EFF" name="PayPal" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Credits Balance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {creditsLoading ? (
              <LoadingSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={creditsDist}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ range, count }) => `${range}: ${count}`}
                  >
                    {creditsDist?.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UsersTab() {
  const { data: topUsers, isLoading } = useTopUsers();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Users by Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">#</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">User</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Email</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Songs</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Credits Used</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Balance</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {topUsers?.map((u, i) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-3 px-2 font-medium">{u.displayName}</td>
                    <td className="py-3 px-2 text-muted-foreground">{u.email || "-"}</td>
                    <td className="py-3 px-2 text-right" style={{ color: "#0079F2" }}>
                      {u.jobCount}
                    </td>
                    <td className="py-3 px-2 text-right">{u.totalCreditsUsed}</td>
                    <td className="py-3 px-2 text-right">{u.credits}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">
                      {formatTimeAgo(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SongsTab() {
  const { data: recentJobs, isLoading } = useRecentJobs();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Songs Processed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">#</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">User</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Job ID</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Duration</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Credits</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs?.map((j, i) => (
                  <tr key={j.jobId} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-3 px-2 font-medium">{j.userName}</td>
                    <td className="py-3 px-2 text-muted-foreground font-mono text-xs">
                      {j.jobId.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-2 text-right">
                      {j.durationSeconds ? formatDuration(j.durationSeconds) : "-"}
                    </td>
                    <td className="py-3 px-2 text-right" style={{ color: j.creditsCharged > 0 ? "#009118" : undefined }}>
                      {j.creditsCharged || "Free"}
                    </td>
                    <td className="py-3 px-2 text-right text-muted-foreground">
                      {formatTimeAgo(j.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PerformancesTab() {
  const { data: perf, isLoading } = usePerformances();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={perf?.distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="count" fill="#795EFF" name="Performances" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performances Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={perf?.overTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
                <YAxis yAxisId="left" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                <Tooltip
                  labelFormatter={(l) => new Date(l).toLocaleDateString("he-IL")}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#0079F2" name="Count" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#009118" name="Avg Score" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">#</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">User</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Score</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {perf?.topScores.map((s, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-3 px-2 font-medium">{s.userName}</td>
                    <td className="py-3 px-2 text-right font-bold" style={{ color: s.score >= 80 ? "#009118" : s.score >= 60 ? "#0079F2" : "#A60808" }}>
                      {s.score}
                    </td>
                    <td className="py-3 px-2 text-right text-muted-foreground">
                      {formatTimeAgo(s.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GamificationTab() {
  const { data: gam, isLoading } = useGamification();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Users with XP" value={gam?.xp.totalUsers ?? 0} icon={Trophy} />
        <KPICard title="Avg XP" value={Math.round(gam?.xp.avgXp ?? 0)} icon={Trophy} subtitle={`Max: ${gam?.xp.maxXp ?? 0}`} />
        <KPICard title="Avg Level" value={(gam?.xp.avgLevel ?? 0).toFixed(1)} icon={Trophy} subtitle={`Max: ${gam?.xp.maxLevel ?? 0}`} />
        <KPICard title="Avg Streak" value={(gam?.xp.avgStreak ?? 0).toFixed(1)} icon={Activity} subtitle={`Max: ${gam?.xp.maxStreak ?? 0} days`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">XP Sources (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {gam?.xpActions && gam.xpActions.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={gam.xpActions} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="reason" fontSize={11} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="totalXp" fill="#0079F2" name="Total XP" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No XP data in last 30 days</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Badges Earned</CardTitle>
          </CardHeader>
          <CardContent>
            {gam?.badges && gam.badges.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={gam.badges}
                    dataKey="count"
                    nameKey="badgeId"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ badgeId, count }) => `${badgeId}: ${count}`}
                  >
                    {gam.badges.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No badges earned yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReferralsTab() {
  const { data: ref, isLoading } = useReferrals();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KPICard title="Total Referrals" value={ref?.totalReferrals ?? 0} icon={Gift} />
        <KPICard title="Credits Awarded" value={ref?.totalCreditsAwarded ?? 0} icon={CreditCard} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Referrers</CardTitle>
        </CardHeader>
        <CardContent>
          {ref?.topReferrers && ref.topReferrers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">#</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">User</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Referrals</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Credits Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {ref.topReferrers.map((r, i) => (
                    <tr key={r.userId} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                      <td className="py-3 px-2 font-medium">{r.name}</td>
                      <td className="py-3 px-2 text-right" style={{ color: "#0079F2" }}>
                        {r.referralCount}
                      </td>
                      <td className="py-3 px-2 text-right">{r.totalCredits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No referrals yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PartiesTab() {
  const { data: parties, isLoading } = useParties();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Total Rooms" value={parties?.totalRooms ?? 0} icon={PartyPopper} />
        <KPICard title="Active Rooms" value={parties?.activeRooms ?? 0} icon={Activity} />
        <KPICard title="Rooms (7 days)" value={parties?.roomsLast7d ?? 0} icon={PartyPopper} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Party Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          {parties?.recentRooms && parties.recentRooms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Room</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Code</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Host</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Members</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Queue</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {parties.recentRooms.map((r) => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{r.name}</td>
                      <td className="py-3 px-2 font-mono">{r.code}</td>
                      <td className="py-3 px-2">{r.hostName}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">{r.memberCount}</td>
                      <td className="py-3 px-2 text-right">{r.queueSize}</td>
                      <td className="py-3 px-2 text-right text-muted-foreground">
                        {formatTimeAgo(r.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No party rooms yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const [dark, setDark] = useState(true);
  const queryClient = useQueryClient();

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark", !dark);
  };

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground px-5 py-4 pt-8 pb-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">MYOUKEE Analytics</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time insights into your karaoke platform
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={refreshAll}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="songs">Songs</TabsTrigger>
              <TabsTrigger value="performances">Performances</TabsTrigger>
              <TabsTrigger value="gamification">Gamification</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
              <TabsTrigger value="parties">Parties</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="users">
              <UsersTab />
            </TabsContent>
            <TabsContent value="songs">
              <SongsTab />
            </TabsContent>
            <TabsContent value="performances">
              <PerformancesTab />
            </TabsContent>
            <TabsContent value="gamification">
              <GamificationTab />
            </TabsContent>
            <TabsContent value="referrals">
              <ReferralsTab />
            </TabsContent>
            <TabsContent value="parties">
              <PartiesTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
