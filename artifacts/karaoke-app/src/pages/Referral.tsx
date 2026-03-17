import { ReferralPanel } from "@/components/ReferralPanel";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Referral() {
  const { data: authData } = useAuth();

  if (!authData?.user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-display font-bold mb-4">
          התחבר כדי לגשת לתוכנית ההפניות
        </h2>
        <Link href="/">
          <button className="text-primary hover:underline">חזרה לדף הבית</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> חזרה
      </Link>

      <h1 className="text-2xl font-display font-bold mb-6">
        תוכנית הפניות
      </h1>

      <ReferralPanel />
    </div>
  );
}
