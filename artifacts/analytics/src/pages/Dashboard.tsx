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
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
const ADMIN_PASSWORD = "8013929";

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
  if (mins < 60) return `לפני ${mins} דק'`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שע'`;
  const days = Math.floor(hours / 24);
  return `לפני ${days} ימים`;
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

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("analytics_auth", "true");
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="p-4 rounded-full bg-primary/10">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold">MYOUKEE Analytics</h1>
                <p className="text-sm text-muted-foreground mt-1">הזן סיסמה כדי לגשת לדשבורד</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="סיסמה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`text-center text-lg pr-4 pl-10 ${error ? "border-red-500 shake" : ""}`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-red-500 text-sm text-center">סיסמה שגויה</p>}
              <Button type="submit" className="w-full">
                כניסה
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
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
          title="סה״כ משתמשים"
          value={overview?.users.total ?? 0}
          icon={Users}
          subtitle={`${overview?.users.last7d ?? 0} השבוע`}
        />
        <KPICard
          title="שירים שעובדו"
          value={overview?.jobs.total ?? 0}
          icon={Music}
          subtitle={`${overview?.jobs.last7d ?? 0} השבוע`}
        />
        <KPICard
          title="קרדיטים שנרכשו"
          value={
            (overview?.revenue.totalStripeCredits ?? 0) +
            (overview?.revenue.totalPaypalCredits ?? 0)
          }
          icon={CreditCard}
          subtitle={`${overview?.revenue.stripeTransactions ?? 0} Stripe + ${overview?.revenue.paypalTransactions ?? 0} PayPal`}
        />
        <KPICard
          title="משתמשים פעילים היום"
          value={overview?.activeUsersToday ?? 0}
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="אורך שיר ממוצע"
          value={formatDuration(overview?.jobs.avgDuration ?? 0)}
          icon={Music}
        />
        <KPICard
          title="סה״כ ביצועים"
          value={overview?.performances.total ?? 0}
          icon={Trophy}
          subtitle={`ציון ממוצע: ${(overview?.performances.avgScore ?? 0).toFixed(1)}`}
        />
        <KPICard
          title="חדרי מסיבה"
          value={overview?.parties.total ?? 0}
          icon={PartyPopper}
        />
        <KPICard
          title="עבודות (30 יום)"
          value={overview?.jobs.last30d ?? 0}
          icon={Music}
          subtitle={`משתמשים: ${overview?.users.last30d ?? 0}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">הרשמות משתמשים (90 יום)</CardTitle>
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
                    name="משתמשים חדשים"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">שירים שעובדו (90 יום)</CardTitle>
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
                    name="שירים"
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
            <CardTitle className="text-base">הכנסות לאורך זמן (קרדיטים)</CardTitle>
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
            <CardTitle className="text-base">התפלגות יתרת קרדיטים</CardTitle>
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
          <CardTitle className="text-base">משתמשים מובילים לפי פעילות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">#</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">משתמש</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">אימייל</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">שירים</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">קרדיטים בשימוש</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">יתרה</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">הצטרף</th>
                </tr>
              </thead>
              <tbody>
                {topUsers?.map((u, i) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-3 px-2 font-medium">{u.displayName}</td>
                    <td className="py-3 px-2 text-muted-foreground">{u.email || "-"}</td>
                    <td className="py-3 px-2 text-left" style={{ color: "#0079F2" }}>
                      {u.jobCount}
                    </td>
                    <td className="py-3 px-2 text-left">{u.totalCreditsUsed}</td>
                    <td className="py-3 px-2 text-left">{u.credits}</td>
                    <td className="py-3 px-2 text-left text-muted-foreground">
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
          <CardTitle className="text-base">שירים אחרונים שעובדו</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">#</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">משתמש</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">מזהה עבודה</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">אורך</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">קרדיטים</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">מתי</th>
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
                    <td className="py-3 px-2 text-left">
                      {j.durationSeconds ? formatDuration(j.durationSeconds) : "-"}
                    </td>
                    <td className="py-3 px-2 text-left" style={{ color: j.creditsCharged > 0 ? "#009118" : undefined }}>
                      {j.creditsCharged || "חינם"}
                    </td>
                    <td className="py-3 px-2 text-left text-muted-foreground">
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
            <CardTitle className="text-base">התפלגות ציונים</CardTitle>
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
                <Bar dataKey="count" fill="#795EFF" name="ביצועים" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ביצועים לאורך זמן</CardTitle>
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
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#0079F2" name="כמות" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#009118" name="ציון ממוצע" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ציונים מובילים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">#</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">משתמש</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">ציון</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">מתי</th>
                </tr>
              </thead>
              <tbody>
                {perf?.topScores.map((s, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-3 px-2 font-medium">{s.userName}</td>
                    <td className="py-3 px-2 text-left font-bold" style={{ color: s.score >= 80 ? "#009118" : s.score >= 60 ? "#0079F2" : "#A60808" }}>
                      {s.score}
                    </td>
                    <td className="py-3 px-2 text-left text-muted-foreground">
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
        <KPICard title="משתמשים עם XP" value={gam?.xp.totalUsers ?? 0} icon={Trophy} />
        <KPICard title="XP ממוצע" value={Math.round(gam?.xp.avgXp ?? 0)} icon={Trophy} subtitle={`מקסימום: ${gam?.xp.maxXp ?? 0}`} />
        <KPICard title="רמה ממוצעת" value={(gam?.xp.avgLevel ?? 0).toFixed(1)} icon={Trophy} subtitle={`מקסימום: ${gam?.xp.maxLevel ?? 0}`} />
        <KPICard title="רצף ממוצע" value={(gam?.xp.avgStreak ?? 0).toFixed(1)} icon={Activity} subtitle={`מקסימום: ${gam?.xp.maxStreak ?? 0} ימים`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">מקורות XP (30 יום)</CardTitle>
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
                  <Bar dataKey="totalXp" fill="#0079F2" name="סה״כ XP" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">אין נתוני XP ב-30 הימים האחרונים</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">תגים שהושגו</CardTitle>
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
              <p className="text-muted-foreground text-center py-8">עדיין לא הושגו תגים</p>
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
        <KPICard title="סה״כ הפניות" value={ref?.totalReferrals ?? 0} icon={Gift} />
        <KPICard title="קרדיטים שחולקו" value={ref?.totalCreditsAwarded ?? 0} icon={CreditCard} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">מפנים מובילים</CardTitle>
        </CardHeader>
        <CardContent>
          {ref?.topReferrers && ref.topReferrers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">#</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">משתמש</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">הפניות</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">קרדיטים שהושגו</th>
                  </tr>
                </thead>
                <tbody>
                  {ref.topReferrers.map((r, i) => (
                    <tr key={r.userId} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                      <td className="py-3 px-2 font-medium">{r.name}</td>
                      <td className="py-3 px-2 text-left" style={{ color: "#0079F2" }}>
                        {r.referralCount}
                      </td>
                      <td className="py-3 px-2 text-left">{r.totalCredits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">עדיין אין הפניות</p>
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
        <KPICard title="סה״כ חדרים" value={parties?.totalRooms ?? 0} icon={PartyPopper} />
        <KPICard title="חדרים פעילים" value={parties?.activeRooms ?? 0} icon={Activity} />
        <KPICard title="חדרים (7 ימים)" value={parties?.roomsLast7d ?? 0} icon={PartyPopper} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">חדרי מסיבה אחרונים</CardTitle>
        </CardHeader>
        <CardContent>
          {parties?.recentRooms && parties.recentRooms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">חדר</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">קוד</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">מארח</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">סטטוס</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">חברים</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">תור</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">נוצר</th>
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
                          {r.status === "active" ? "פעיל" : "לא פעיל"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-left">{r.memberCount}</td>
                      <td className="py-3 px-2 text-left">{r.queueSize}</td>
                      <td className="py-3 px-2 text-left text-muted-foreground">
                        {formatTimeAgo(r.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">עדיין אין חדרי מסיבה</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const [dark, setDark] = useState(true);
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("analytics_auth") === "true"
  );
  const queryClient = useQueryClient();

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark", !dark);
  };

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("analytics_auth");
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <PasswordGate onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground px-5 py-4 pt-8 pb-8" dir="rtl">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">MYOUKEE Analytics</h1>
              <p className="text-sm text-muted-foreground mt-1">
                תובנות בזמן אמת על פלטפורמת הקריוקי
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={refreshAll} title="רענן">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={toggleTheme} title="מצב תצוגה">
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} title="יציאה">
                <Lock className="w-4 h-4 ml-1" />
                יציאה
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview">סקירה</TabsTrigger>
              <TabsTrigger value="users">משתמשים</TabsTrigger>
              <TabsTrigger value="songs">שירים</TabsTrigger>
              <TabsTrigger value="performances">ביצועים</TabsTrigger>
              <TabsTrigger value="gamification">גיימיפיקציה</TabsTrigger>
              <TabsTrigger value="referrals">הפניות</TabsTrigger>
              <TabsTrigger value="parties">מסיבות</TabsTrigger>
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
