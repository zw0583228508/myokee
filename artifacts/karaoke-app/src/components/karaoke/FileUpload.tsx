import React, { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Music, Film, FileVideo, X, Loader2, User, Camera, Youtube, Link2, AlertCircle, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiUrl, authFetchOptions, getAuthToken } from "@/lib/api";
import { useCreateJob, useCreateJobFromYouTube } from "@/hooks/use-karaoke";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { LoginModal } from "./LoginModal";
import { ConsentModal, useConsent } from "./ConsentModal";
import { useLang } from "@/contexts/LanguageContext";

const CONSENT_KEY = "myoukee-consent-v1";

type Tab = "file" | "youtube";

function isValidYouTubeUrl(url: string): boolean {
  return (
    (url.includes("youtube.com") || url.includes("youtu.be")) &&
    (url.startsWith("http://") || url.startsWith("https://"))
  );
}

async function uploadAvatarToJob(jobId: string, avatarFile: File | string) {
  if (typeof avatarFile === "string") {
    const response = await fetch(avatarFile);
    const blob = await response.blob();
    avatarFile = new File([blob], "avatar.jpg", { type: blob.type || "image/jpeg" });
  }
  const formData = new FormData();
  formData.append("file", avatarFile);
  await fetch(apiUrl(`/api/processor/jobs/${jobId}/avatar`), authFetchOptions({
    method: "POST",
    body: formData,
  }));
}

const LANGUAGE_OPTIONS = [
  { value: "auto",       label: "זיהוי אוטומטי",     flag: "🌐" },
  { value: "sacred_he",  label: "לשון הקודש / פיוטים", flag: "🕍" },
  { value: "yi",         label: "יידיש",              flag: "🪡" },
  { value: "he",         label: "עברית",              flag: "🇮🇱" },
  { value: "en",         label: "English",            flag: "🇺🇸" },
  { value: "ja",         label: "日本語",              flag: "🇯🇵" },
  { value: "zh",         label: "中文",                flag: "🇨🇳" },
  { value: "ko",         label: "한국어",              flag: "🇰🇷" },
  { value: "th",         label: "ไทย",                flag: "🇹🇭" },
  { value: "vi",         label: "Tiếng Việt",         flag: "🇻🇳" },
  { value: "tl",         label: "Filipino",           flag: "🇵🇭" },
  { value: "id",         label: "Indonesia",          flag: "🇮🇩" },
  { value: "ar",         label: "عربي",               flag: "🇸🇦" },
  { value: "ru",         label: "Русский",            flag: "🇷🇺" },
  { value: "es",         label: "Español",            flag: "🇪🇸" },
  { value: "fr",         label: "Français",           flag: "🇫🇷" },
] as const;

export function FileUpload() {
  const [tab, setTab] = useState<Tab>("file");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [languageHint, setLanguageHint] = useState<string>("auto");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const createJob = useCreateJob();
  const createYouTubeJob = useCreateJobFromYouTube();
  const [, setLocation] = useLocation();
  const { data: authData } = useAuth();
  const user = authData?.user ?? null;

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const { accept: acceptConsent } = useConsent();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copyrightChecked, setCopyrightChecked] = useState(false);
  const { t } = useLang();
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'connecting' | 'uploading'>('idle');
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSubmitting = createJob.isPending || createYouTubeJob.isPending || uploadPhase !== 'idle';

  useEffect(() => {
    if (isSubmitting) {
      setElapsedSecs(0);
      elapsedRef.current = setInterval(() => setElapsedSecs(s => s + 1), 1000);
    } else {
      if (elapsedRef.current) { clearInterval(elapsedRef.current); elapsedRef.current = null; }
      setElapsedSecs(0);
    }
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, [isSubmitting]);

  useEffect(() => {
    let cancelled = false;
    async function prewarm() {
      try {
        const token = getAuthToken();
        if (!token) return;
        const cfgRes = await fetch(apiUrl('/api/processor-config'), {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (!cfgRes.ok || cancelled) return;
        setIsWarmingUp(true);
        await cfgRes.json();
        const pingUrl = apiUrl('/api/processor/health');
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 90_000);
        try {
          await fetch(pingUrl, { signal: ctrl.signal });
        } catch {
        } finally {
          clearTimeout(tid);
        }
      } catch {
      } finally {
        if (!cancelled) setIsWarmingUp(false);
      }
    }
    prewarm();
    return () => { cancelled = true; };
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".ogg", ".flac", ".m4a"],
      "video/*": [".mp4", ".mkv", ".mov", ".avi", ".webm"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value);
    setUrlError("");
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (localStorage.getItem(CONSENT_KEY) !== "accepted") {
      setShowConsentModal(true);
      return;
    }
    setSubmitError(null);
    setUploadPhase('connecting');
    try {
      let job;
      if (tab === "file") {
        if (!file) return;
        setUploadPhase('uploading');
        job = await createJob.mutateAsync({ file, languageHint });
      } else {
        if (!youtubeUrl.trim()) {
          setUrlError(t.upload.youtubeRequired);
          return;
        }
        if (!isValidYouTubeUrl(youtubeUrl.trim())) {
          setUrlError(t.upload.youtubeInvalidUrl);
          return;
        }
        setUploadPhase('uploading');
        job = await createYouTubeJob.mutateAsync({ url: youtubeUrl.trim(), languageHint });
      }

      const avatarSource = avatarFile || (user?.picture ?? null);
      if (avatarSource) {
        try {
          await uploadAvatarToJob(job.id, avatarSource);
        } catch (e) {
          console.warn("Failed to upload avatar:", e);
        }
      }

      setLocation(`/job/${job.id}`);
    } catch (error: any) {
      console.error("Submission failed", error);
      const msg = error?.message ?? String(error);
      if (msg.includes("401") || msg.toLowerCase().includes("auth") || msg.includes("Authentication")) {
        setSubmitError(t.upload.errorReauth);
      } else if (msg.includes("cold start") || msg.includes("90 שניות") || msg.includes("AbortError")) {
        setSubmitError(t.upload.errorColdStart);
      } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("שגיאת רשת")) {
        setSubmitError(t.upload.errorNetwork);
      } else {
        setSubmitError(msg || t.upload.errorGeneric);
      }
    } finally {
      setUploadPhase('idle');
    }
  };

  const effectiveAvatarPreview = avatarPreview || user?.picture || null;
  const effectiveAvatarLabel = avatarFile
    ? avatarFile.name
    : user
    ? `${user.displayName} ${t.upload.googleLabel}`
    : null;

  const canSubmit =
    !isSubmitting &&
    copyrightChecked &&
    (tab === "file" ? !!file : youtubeUrl.trim().length > 0);

  return (
    <>
    <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    <ConsentModal
      open={showConsentModal}
      onAccept={() => { acceptConsent(); setShowConsentModal(false); handleSubmit(); }}
      onClose={() => setShowConsentModal(false)}
    />
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {submitError && (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {submitError}
          <button className={`${t.dir === "rtl" ? "mr-auto" : "ml-auto"} text-xs underline`} onClick={() => setSubmitError(null)}>{t.upload.close}</button>
        </div>
      )}
      <div className="flex rounded-2xl bg-white/5 border border-white/10 p-1 gap-1">
        <button
          onClick={() => { setTab("file"); setUrlError(""); }}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200
            ${tab === "file"
              ? "bg-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
            }
          `}
        >
          <UploadCloud className="w-4 h-4" />
          {t.upload.fileTab}
        </button>
        <button
          onClick={() => { setTab("youtube"); setFile(null); setUrlError(""); }}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200
            ${tab === "youtube"
              ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
            }
          `}
        >
          <Youtube className="w-4 h-4" />
          {t.upload.youtubeTab}
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="opacity-60">🌐</span>
          {t.upload.transcriptionLang}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLanguageHint(opt.value)}
              className={`
                flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150
                ${languageHint === opt.value
                  ? "bg-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.35)]"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/10"
                }
              `}
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "file" ? (
          <motion.div
            key="file-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="animated-gradient-border rounded-3xl"
                >
                  <div
                    {...getRootProps()}
                    className={`
                      relative flex flex-col items-center justify-center w-full p-6 sm:p-12 text-center
                      border-2 border-dashed rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-300
                      ${isDragActive
                        ? "border-primary bg-primary/5 shadow-[0_0_40px_rgba(139,92,246,0.15)]"
                        : isDragReject
                        ? "border-destructive bg-destructive/5"
                        : "border-white/20 bg-card/40 hover:bg-card/60 hover:border-primary/50"
                      }
                    `}
                  >
                    <input {...getInputProps()} />
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl opacity-0 transition-opacity duration-300 pointer-events-none data-[active=true]:opacity-100" data-active={isDragActive} />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`p-4 rounded-2xl mb-6 transition-all duration-300 ${isDragActive ? "bg-primary/20 scale-110" : "bg-white/5"}`}>
                        <UploadCloud className={`w-10 h-10 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-display font-semibold mb-2">
                        {isDragActive ? t.upload.dropzoneActive : t.upload.dropzone}
                      </h3>
                      <p className="text-muted-foreground max-w-[300px] text-sm mb-4 sm:mb-8">
                        {t.upload.dropzoneHint}
                      </p>
                      <div className="flex gap-4 items-center opacity-60">
                        <div className="flex items-center gap-1.5 text-xs bg-white/5 px-3 py-1.5 rounded-full">
                          <Music className="w-3.5 h-3.5" /> {t.upload.audioLabel}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <div className="flex items-center gap-1.5 text-xs bg-white/5 px-3 py-1.5 rounded-full">
                          <Film className="w-3.5 h-3.5" /> {t.upload.videoLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="file-preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel p-6 rounded-3xl flex flex-col items-center text-center relative overflow-hidden space-y-6"
                >
                  {isSubmitting && (
                    <UploadingOverlay elapsedSecs={elapsedSecs} isYoutube={false} t={t} />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-white rounded-full bg-white/5"
                    onClick={() => setFile(null)}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="flex flex-col items-center">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 mb-5">
                      {file.type.startsWith("video") ? (
                        <FileVideo className="w-12 h-12 text-accent" />
                      ) : (
                        <Music className="w-12 h-12 text-primary" />
                      )}
                    </div>
                    <h4 className="font-display text-xl font-semibold mb-1 truncate max-w-full px-8" dir="auto">
                      {file.name}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <AvatarSection
                    effectiveAvatarPreview={effectiveAvatarPreview}
                    effectiveAvatarLabel={effectiveAvatarLabel}
                    user={user}
                    avatarInputRef={avatarInputRef}
                    onClear={clearAvatar}
                    onChange={handleAvatarChange}
                    t={t}
                  />
                  <label className="flex items-start gap-3 cursor-pointer select-none w-full bg-white/5 rounded-xl p-3 border border-white/10 hover:border-primary/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={copyrightChecked}
                      onChange={(e) => setCopyrightChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-white/20 accent-primary shrink-0"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">{t.upload.copyrightConfirm}</span>
                  </label>
                  <Button
                    size="lg"
                    variant="gradient"
                    className="w-full sm:w-auto min-w-[200px]"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                  >
                    {t.upload.submit}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="youtube-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="glass-panel p-6 rounded-3xl flex flex-col items-center text-center relative overflow-hidden space-y-6"
          >
            {isSubmitting && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-4" />
                <p className="font-medium animate-pulse text-primary-foreground">{t.upload.uploadingYoutube}</p>
              </div>
            )}

            <div className="p-5 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-400/10 border border-red-500/20">
              <Youtube className="w-12 h-12 text-red-500" />
            </div>

            <div className="w-full space-y-2">
              <p className="text-sm text-muted-foreground">{t.upload.youtubeLabel}</p>
              <div className="relative">
                <Link2 className={`absolute ${t.dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
                <input
                  type="url"
                  dir="ltr"
                  value={youtubeUrl}
                  onChange={handleUrlChange}
                  placeholder={t.upload.youtubePlaceholder}
                  className={`
                    w-full bg-white/5 border rounded-xl ${t.dir === "rtl" ? "pr-10 pl-4" : "pl-10 pr-4"} py-3 text-sm text-left
                    placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2
                    transition-all duration-200
                    ${urlError
                      ? "border-destructive focus:ring-destructive/30"
                      : youtubeUrl && isValidYouTubeUrl(youtubeUrl)
                      ? "border-green-500/50 focus:ring-green-500/30"
                      : "border-white/10 focus:ring-primary/30"
                    }
                  `}
                  disabled={isSubmitting}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                />
              </div>
              {urlError && (
                <p className="text-xs text-destructive">{urlError}</p>
              )}
              {!urlError && youtubeUrl && isValidYouTubeUrl(youtubeUrl) && (
                <p className="text-xs text-green-500">{t.upload.youtubeValid}</p>
              )}
            </div>

            <AvatarSection
              effectiveAvatarPreview={effectiveAvatarPreview}
              effectiveAvatarLabel={effectiveAvatarLabel}
              user={user}
              avatarInputRef={avatarInputRef}
              onClear={clearAvatar}
              onChange={handleAvatarChange}
              t={t}
            />

            <label className="flex items-start gap-3 cursor-pointer select-none w-full bg-white/5 rounded-xl p-3 border border-white/10 hover:border-primary/30 transition-colors">
              <input
                type="checkbox"
                checked={copyrightChecked}
                onChange={(e) => setCopyrightChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 accent-primary shrink-0"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">{t.upload.copyrightConfirm}</span>
            </label>
            <Button
              size="lg"
              className="w-full sm:w-auto min-w-[200px] bg-red-600 hover:bg-red-700 text-white border-0 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              <Youtube className="w-4 h-4 mr-2" />
              {t.upload.submitYoutube}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}

function UploadingOverlay({ elapsedSecs, isYoutube, t }: { elapsedSecs: number; isYoutube: boolean; t: any }) {
  const message = isYoutube
    ? t.upload.uploadingYoutube
    : elapsedSecs < 5
    ? t.upload.uploadingConnecting
    : elapsedSecs < 20
    ? t.upload.uploadingTrack
    : elapsedSecs < 60
    ? t.upload.uploadingWarmup
    : t.upload.uploadingWait;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-3xl">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      <p className="font-medium animate-pulse text-primary-foreground">{message}</p>
      {elapsedSecs > 0 && (
        <p className="text-xs text-muted-foreground mt-2">{elapsedSecs}s</p>
      )}
    </div>
  );
}

function AvatarSection({
  effectiveAvatarPreview,
  effectiveAvatarLabel,
  user,
  avatarInputRef,
  onClear,
  onChange,
  t,
}: {
  effectiveAvatarPreview: string | null;
  effectiveAvatarLabel: string | null;
  user: { displayName: string; provider: string } | null;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  onClear: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: any;
}) {
  return (
    <div className="w-full border-t border-white/5 pt-5">
      <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
        <User className="w-4 h-4" />
        {t.upload.avatarLabel}
      </p>

      {effectiveAvatarPreview ? (
        <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
          <img
            src={effectiveAvatarPreview}
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/40"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{effectiveAvatarLabel}</p>
            <p className="text-xs text-muted-foreground">{t.upload.avatarAppears}</p>
          </div>
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="text-muted-foreground hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title={t.upload.changeAvatar}
          >
            <Camera className="w-4 h-4" />
          </button>
          <button onClick={onClear} className="text-muted-foreground hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors" title={t.upload.removeAvatar}>
            <X className="w-4 h-4" />
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <Camera className="w-4 h-4" />
            {t.upload.avatarUpload}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
}
