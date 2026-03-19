const GA_ID = "G-M06Y8DLJGH";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

function gtag(...args: any[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

export function trackPageView(path: string, title?: string) {
  gtag("event", "page_view", {
    page_path: path,
    page_title: title || document.title,
  });
}

export function trackEvent(
  eventName: string,
  params?: Record<string, any>,
) {
  gtag("event", eventName, params);
}

export function setUserId(userId: string | null) {
  if (userId) {
    gtag("set", { user_id: userId });
  } else {
    gtag("set", { user_id: null });
  }
}

export function setUserProperties(props: Record<string, any>) {
  gtag("set", "user_properties", props);
}

export function clearUserIdentity() {
  gtag("set", { user_id: null });
  gtag("set", "user_properties", {
    credits: null,
    has_email: null,
  });
}

export function trackLogin(method: string) {
  trackEvent("login", { method });
}

export function trackSignUp(method: string) {
  trackEvent("sign_up", { method });
}

export function trackSongProcessed(params: {
  songDuration?: number;
  creditsUsed?: number;
  source?: string;
}) {
  trackEvent("song_processed", {
    song_duration: params.songDuration,
    credits_used: params.creditsUsed,
    source: params.source,
  });
}

export function trackSongPlayed(params: {
  jobId?: string;
}) {
  trackEvent("song_played", {
    job_id: params.jobId,
  });
}

export function trackPerformanceCompleted(params: {
  score?: number;
  timingScore?: number;
  pitchScore?: number;
}) {
  trackEvent("performance_completed", {
    score: params.score,
    timing_score: params.timingScore,
    pitch_score: params.pitchScore,
  });
}

export function trackCreditPurchase(params: {
  gateway: string;
  credits: number;
  transactionId?: string;
}) {
  trackEvent("credit_purchase", {
    gateway: params.gateway,
    credits: params.credits,
    transaction_id: params.transactionId,
  });
}

export function trackPartyCreated() {
  trackEvent("party_created");
}

export function trackPartyJoined() {
  trackEvent("party_joined");
}

export function trackReferralShared() {
  trackEvent("referral_shared");
}

export function trackReferralApplied() {
  trackEvent("referral_applied");
}

export function trackBadgeEarned(badgeId: string) {
  trackEvent("badge_earned", { badge_id: badgeId });
}

export function trackLevelUp(level: number) {
  trackEvent("level_up", { level });
}

export function trackFileUpload(params: {
  fileType?: string;
  fileSizeMb?: number;
}) {
  trackEvent("file_upload", {
    file_type: params.fileType,
    file_size_mb: params.fileSizeMb,
  });
}

export function trackShare(params: {
  contentType: string;
  method?: string;
}) {
  trackEvent("share", {
    content_type: params.contentType,
    method: params.method,
  });
}

export function trackError(params: {
  description: string;
  fatal?: boolean;
}) {
  trackEvent("exception", {
    description: params.description,
    fatal: params.fatal ?? false,
  });
}
