import { Feather, Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { API_BASE } from "@/hooks/use-auth";
import { WordTimestamp, useJob, useUpdateLyrics, videoUrl } from "@/hooks/use-jobs";
import { useQueryClient } from "@tanstack/react-query";

const isWeb = Platform.OS === "web";

const C = Colors.dark;

const RTL_LANGS = new Set([
  "he","ar","fa","ur","arc","dv","ha","khw","ks","ps","yi",
]);

const STATUS_LABELS: Record<string, string> = {
  pending:         "Preparing…",
  downloading:     "Downloading from YouTube…",
  queued:          "In queue…",
  separating:      "Separating vocals from music…",
  transcribing:    "Transcribing lyrics…",
  awaiting_review: "Ready! Review your lyrics below",
  rendering:       "Rendering karaoke video…",
  done:            "Your video is ready!",
  error:           "Something went wrong",
};

const LANG_NAMES: Record<string, string> = {
  en: "English", he: "Hebrew", ar: "Arabic", fr: "French", de: "German",
  es: "Spanish", pt: "Portuguese", it: "Italian", ru: "Russian", ja: "Japanese",
  ko: "Korean", zh: "Chinese", tr: "Turkish", nl: "Dutch", pl: "Polish",
  sv: "Swedish", fa: "Persian", ur: "Urdu", hi: "Hindi",
};

// ─── Pulsing circle animation ─────────────────────────────────────────────────
function PulseRing({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.5, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0, { duration: 900 }), withTiming(0.6, { duration: 900 })),
      -1
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        { backgroundColor: color, borderColor: color },
        style,
      ]}
    />
  );
}

// ─── Animated progress bar ────────────────────────────────────────────────────
function AnimatedProgressBar({ progress, color }: { progress: number; color: string }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 600 });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, barStyle, { backgroundColor: color }]} />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function JobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: job, isLoading } = useJob(id);
  const updateLyrics = useUpdateLyrics(id);
  const qc = useQueryClient();

  // Charge credits once when job reaches "done"
  const chargeCalledRef = useRef(false);
  useEffect(() => {
    if (job?.status !== "done" || chargeCalledRef.current || !id) return;
    chargeCalledRef.current = true;
    fetch(`${API_BASE}/jobs/${id}/charge`, { method: "POST", credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        // Update cached credits balance so header chip reflects the deduction instantly
        qc.setQueryData(["auth"], (old: any) => {
          if (!old?.user) return old;
          return { ...old, user: { ...old.user, credits: data.newBalance } };
        });
      })
      .catch(() => {});
  }, [job?.status, id, qc]);

  // Source-of-truth words (from server)
  const [words, setWords] = useState<WordTimestamp[]>([]);
  // Free-text editing state (mirrors words joined as a single string)
  const [editText, setEditText] = useState("");
  const [initialText, setInitialText] = useState("");
  const [reEditMode, setReEditMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const textRef = useRef<TextInput>(null);

  // Sync words + text whenever job.words changes (after transcription or re-render)
  useEffect(() => {
    if (job?.words && job.words.length > 0) {
      setWords(job.words);
      const joined = job.words.map((w: WordTimestamp) => w.word).join(" ");
      setEditText(joined);
      setInitialText(joined);
    }
  }, [job?.words]);

  // When job transitions from rendering → done, exit re-edit mode
  useEffect(() => {
    if (job?.status === "done") setReEditMode(false);
  }, [job?.status]);

  const isRtl = RTL_LANGS.has(job?.language ?? "");
  const wordCount = editText.trim().split(/\s+/).filter(Boolean).length;
  const isDirty = editText !== initialText;

  const handleReset = useCallback(() => {
    setEditText(initialText);
    Haptics.selectionAsync();
  }, [initialText]);

  const handleConfirm = useCallback(async () => {
    if (!editText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Split the edited text back into words and preserve original timestamps
    const newWordStrings = editText.trim().split(/\s+/).filter(Boolean);
    const mapped: WordTimestamp[] = newWordStrings.map((word, i) => {
      const original = words[Math.min(i, words.length - 1)];
      return {
        word,
        start:       original?.start       ?? 0,
        end:         original?.end         ?? 0,
        probability: original?.probability ?? 1.0,
      };
    });

    try {
      await updateLyrics.mutateAsync(mapped);
      setReEditMode(false);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", err.message ?? "Could not confirm lyrics.");
    }
  }, [editText, words, updateLyrics]);

  const handleDownload = useCallback(async () => {
    if (!job) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const url = videoUrl(job.id);

    if (Platform.OS === "web") {
      // On web: trigger a browser download via an anchor element
      const a = document.createElement("a");
      a.href = url;
      a.download = `${job.filename.replace(/\.[^.]+$/, "")}_karaoke.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    setIsDownloading(true);
    try {
      const fileUri = `${FileSystem.cacheDirectory}${job.id}_karaoke.mp4`;
      const { uri } = await FileSystem.downloadAsync(url, fileUri);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: "video/mp4", UTI: "public.mpeg-4" });
      } else {
        Alert.alert("Downloaded", `Saved to ${uri}`);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Download Failed", err.message ?? "Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [job]);

  // ── Derived display state ──
  const isProcessing =
    job &&
    job.status !== "done" &&
    job.status !== "error" &&
    job.status !== "awaiting_review";

  const statusColor =
    job?.status === "done"
      ? C.success
      : job?.status === "error"
      ? C.error
      : job?.status === "awaiting_review"
      ? C.accent
      : C.secondary;

  const langName = job?.language
    ? LANG_NAMES[job.language] ?? job.language.toUpperCase()
    : null;

  const showEditor = job?.status === "awaiting_review" || reEditMode;

  // ── Loading ──
  if (isLoading || !job) {
    return (
      <View style={[styles.root, styles.loadingContainer]}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={insets.top + 60}
    >
      {/* Nav bar */}
      <Animated.View entering={isWeb ? undefined : FadeInDown.springify()} style={styles.navBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={C.text} />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {job.filename}
        </Text>
        {langName ? (
          <View style={styles.langPill}>
            <Text style={styles.langPillText}>{langName}</Text>
          </View>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </Animated.View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Status card */}
        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(80).springify()} style={styles.statusCard}>
          <LinearGradient
            colors={["rgba(147,51,234,0.1)", "rgba(59,130,246,0.05)"]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.statusIconRow}>
            {isProcessing ? (
              <View style={styles.statusIconWrap}>
                <PulseRing color={statusColor} />
                <ActivityIndicator color={statusColor} size="small" />
              </View>
            ) : job.status === "done" ? (
              <View style={[styles.statusIconWrap, { backgroundColor: "rgba(34,197,94,0.15)" }]}>
                <Ionicons name="checkmark-circle" size={28} color={C.success} />
              </View>
            ) : job.status === "error" ? (
              <View style={[styles.statusIconWrap, { backgroundColor: "rgba(239,68,68,0.15)" }]}>
                <Ionicons name="alert-circle" size={28} color={C.error} />
              </View>
            ) : (
              <View style={[styles.statusIconWrap, { backgroundColor: "rgba(250,204,21,0.15)" }]}>
                <Feather name="edit-2" size={24} color={C.accent} />
              </View>
            )}

            <View style={styles.statusText}>
              <Text style={[styles.statusLabel, { color: statusColor }]}>
                {STATUS_LABELS[job.status] ?? job.status}
              </Text>
              {job.error ? (
                <Text style={styles.errorText}>{job.error}</Text>
              ) : null}
            </View>
          </View>

          {isProcessing && (
            <View style={styles.progressWrap}>
              <AnimatedProgressBar progress={job.progress} color={statusColor} />
              <Text style={styles.progressPct}>{job.progress}%</Text>
            </View>
          )}
        </Animated.View>

        {/* ── Lyrics editor ── */}
        {showEditor && words.length > 0 && (
          <Animated.View entering={isWeb ? undefined : FadeInDown.delay(160).springify()} style={styles.editorCard}>
            {/* Header row */}
            <View style={styles.editorHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.editorTitle}>
                  {reEditMode ? "עריכה מחדש" : "בדיקת תמלול"}
                </Text>
                <Text style={styles.editorSubtitle}>
                  {reEditMode
                    ? "ערוך את הטקסט ישירות ולחץ אישור להפקה מחדש"
                    : "ערוך את הטקסט ישירות. התזמון המקורי ישמר."}
                </Text>
              </View>
              {isDirty && (
                <Pressable onPress={handleReset} style={styles.resetBtn}>
                  <Feather name="rotate-ccw" size={13} color={C.textSecondary} />
                  <Text style={styles.resetBtnText}>איפוס</Text>
                </Pressable>
              )}
            </View>

            {/* Free-text textarea */}
            <TextInput
              ref={textRef}
              value={editText}
              onChangeText={setEditText}
              multiline
              textAlign={isRtl ? "right" : "left"}
              style={[styles.textArea, isRtl && styles.textAreaRtl]}
              autoCorrect={false}
              autoCapitalize="none"
              spellCheck={false}
              placeholder="לא זוהה ווקאל בקובץ…"
              placeholderTextColor={C.textTertiary}
              scrollEnabled={false}
            />

            {/* Footer */}
            <View style={styles.editorFooter}>
              <Text style={styles.wordCountText}>
                {wordCount} מילים{isDirty ? "  •  נערך" : ""}
              </Text>
            </View>

            {/* Confirm button */}
            <Pressable
              onPress={handleConfirm}
              disabled={updateLyrics.isPending || wordCount === 0}
              style={({ pressed }) => [{ opacity: pressed || updateLyrics.isPending ? 0.75 : 1 }]}
            >
              <LinearGradient
                colors={[C.primary, "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.confirmBtn}
              >
                {updateLyrics.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Feather name="film" size={18} color="#fff" />
                    <Text style={styles.confirmBtnText}>
                      {reEditMode ? "אישור ויצירה מחדש" : "אישור ויצירת וידאו"}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Cancel (re-edit mode only) */}
            {reEditMode && (
              <Pressable
                onPress={() => { setReEditMode(false); setEditText(initialText); }}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>ביטול</Text>
              </Pressable>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Download + Re-edit FABs (done state, not re-editing) */}
      {job.status === "done" && !reEditMode && (
        <Animated.View
          entering={isWeb ? undefined : FadeIn.delay(200)}
          style={[styles.fabContainer, { bottom: insets.bottom + 24 }]}
        >
          {words.length > 0 && (
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setReEditMode(true); }}
              style={styles.reEditBtn}
            >
              <Feather name="edit-2" size={15} color={C.accent} />
              <Text style={styles.reEditBtnText}>ערוך תמלול מחדש</Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleDownload}
            disabled={isDownloading}
            style={({ pressed }) => [{ opacity: pressed || isDownloading ? 0.8 : 1 }]}
          >
            <LinearGradient
              colors={[C.success, "#15803d"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.downloadBtn}
            >
              {isDownloading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.downloadBtnText}>מוריד…</Text>
                </>
              ) : (
                <>
                  <Feather name="download" size={20} color="#fff" />
                  <Text style={styles.downloadBtnText}>הורד ושתף וידאו</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: C.text,
  },
  langPill: {
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  langPillText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: C.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 16,
  },
  // ── Status card ──────────────────────────────────────────────────
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 18,
    overflow: "hidden",
    gap: 14,
  },
  statusIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statusIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  statusText: {
    flex: 1,
    gap: 4,
  },
  statusLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.error,
    lineHeight: 18,
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressPct: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: C.textSecondary,
    minWidth: 36,
    textAlign: "right",
  },
  // ── Lyrics editor card ───────────────────────────────────────────
  editorCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 18,
    gap: 14,
  },
  editorHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  editorTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: C.text,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  editorSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 19,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  resetBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: C.textSecondary,
  },
  textArea: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: C.text,
    lineHeight: 26,
    minHeight: 140,
    textAlignVertical: "top",
  },
  textAreaRtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  editorFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 10,
    marginTop: -4,
  },
  wordCountText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  confirmBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 6,
  },
  cancelBtnText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
    textDecorationLine: "underline",
  },
  // ── FABs ─────────────────────────────────────────────────────────
  fabContainer: {
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    gap: 10,
  },
  reEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "rgba(147,51,234,0.12)",
    borderWidth: 1,
    borderColor: "rgba(147,51,234,0.3)",
  },
  reEditBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: C.accent,
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 32,
  },
  downloadBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
});
