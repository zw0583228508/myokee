import { useState, useEffect } from "react";
import { Copy, Check, Users, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiUrl, authFetchOptions } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ReferralStats {
  referralCode: string;
  referralCount: number;
  creditsEarned: number;
}

export function ReferralPanel() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState("");
  const [applying, setApplying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(apiUrl("/api/referral/stats"), authFetchOptions())
      .then((r) => { if (!r.ok) throw new Error("fetch failed"); return r.json(); })
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const referralLink = stats
    ? `${window.location.origin}/?ref=${stats.referralCode}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleApply = async () => {
    if (!applyCode.trim()) return;
    setApplying(true);
    try {
      const res = await fetch(
        apiUrl("/api/referral/apply"),
        authFetchOptions({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: applyCode.trim() }),
        })
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast({
          title: "שגיאה",
          description: errData.error || "קוד לא תקין",
          variant: "destructive",
        });
        setApplying(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        toast({
          title: "🎉 קוד הפניה הופעל!",
          description: `קיבלת ${data.creditsAwarded} קרדיטים!`,
        });
        setApplyCode("");
        const statsRes = await fetch(
          apiUrl("/api/referral/stats"),
          authFetchOptions()
        );
        if (statsRes.ok) {
          const updated = await statsRes.json();
          setStats(updated);
        }
      } else {
        toast({
          title: "שגיאה",
          description: data.error || "קוד לא תקין",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "שגיאה",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
    setApplying(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4">
      <Card className="p-5 bg-gradient-to-br from-violet-500/10 to-purple-600/5 border-violet-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-violet-300" />
          </div>
          <div>
            <h3 className="font-bold text-white">הזמן חברים וקבל קרדיטים</h3>
            <p className="text-xs text-white/50">
              כל חבר שנרשם — שניכם מקבלים 2 קרדיטים!
            </p>
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-3 flex items-center gap-2 mb-4">
          <code className="flex-1 text-sm text-primary font-mono truncate">
            {stats.referralCode}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className={`shrink-0 gap-1.5 text-xs ${copied ? "text-green-400 border-green-500/30" : "border-white/10"}`}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "הועתק!" : "העתק לינק"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 text-violet-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">
              {stats.referralCount}
            </div>
            <div className="text-xs text-white/40">חברים הוזמנו</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Gift className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">
              {stats.creditsEarned}
            </div>
            <div className="text-xs text-white/40">קרדיטים שהרווחת</div>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-white/10">
        <h4 className="text-sm font-semibold text-white/70 mb-2">
          יש לך קוד הפניה?
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={applyCode}
            onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
            placeholder="הכנס קוד"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            variant="gradient"
            size="sm"
            onClick={handleApply}
            disabled={applying || !applyCode.trim()}
          >
            {applying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "הפעל"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
