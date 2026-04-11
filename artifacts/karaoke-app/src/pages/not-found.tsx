import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h1 className="text-3xl font-display font-bold text-white mb-3">404</h1>
      <p className="text-white/30 text-sm mb-8">
        This page doesn't exist or has been moved.
      </p>
      <Link href="/">
        <button className="btn-primary px-6 py-2.5 rounded-xl text-sm text-white">
          <span className="relative z-10">Back to Home</span>
        </button>
      </Link>
    </div>
  );
}
