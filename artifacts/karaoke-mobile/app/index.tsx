import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAuth, useLogin } from "@/hooks/use-auth";
import { Job, useDeleteJob, useJobs } from "@/hooks/use-jobs";

const isWeb = Platform.OS === "web";

const C = Colors.dark;

const STATUS_META: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  pending:        { label: "Pending",        color: C.textSecondary, icon: "clock" },
  queued:         { label: "Queued",          color: C.secondary,     icon: "loader" },
  separating:     { label: "Separating vocals", color: C.secondary,  icon: "sliders" },
  transcribing:   { label: "Transcribing",    color: C.secondary,     icon: "mic" },
  awaiting_review:{ label: "Ready for review",color: C.accent,        icon: "edit-2" },
  rendering:      { label: "Rendering video", color: C.secondary,     icon: "film" },
  done:           { label: "Complete",         color: C.success,       icon: "check-circle" },
  error:          { label: "Failed",           color: C.error,         icon: "alert-circle" },
};

const LANG_NAMES: Record<string, string> = {
  en: "English", he: "Hebrew", ar: "Arabic", fr: "French", de: "German",
  es: "Spanish", pt: "Portuguese", it: "Italian", ru: "Russian", ja: "Japanese",
  ko: "Korean", zh: "Chinese", tr: "Turkish", nl: "Dutch", pl: "Polish",
  sv: "Swedish", fa: "Persian", ur: "Urdu", hi: "Hindi",
};

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressFill,
          { width: `${Math.min(100, progress)}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

function JobCard({ job, index }: { job: Job; index: number }) {
  const deleteJob = useDeleteJob();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const statusMeta = STATUS_META[job.status] ?? STATUS_META.pending;
  const isActive =
    job.status !== "done" &&
    job.status !== "error" &&
    job.status !== "awaiting_review";
  const langName = job.language ? (LANG_NAMES[job.language] ?? job.language.toUpperCase()) : null;

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/job/[id]", params: { id: job.id } });
  }, [job.id]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Job",
      `Delete "${job.filename}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteJob.mutate(job.id),
        },
      ]
    );
  }, [job.id, job.filename, deleteJob]);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View entering={isWeb ? undefined : FadeInDown.delay(index * 60).springify()}>
      <Animated.View style={animStyle}>
        <Pressable
          onPress={handlePress}
          onLongPress={handleLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.card}
        >
          <LinearGradient
            colors={["rgba(147,51,234,0.12)", "rgba(59,130,246,0.06)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.cardInner}>
            <View style={styles.cardLeft}>
              <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
              <View style={styles.cardTextGroup}>
                <Text style={styles.cardFilename} numberOfLines={1}>
                  {job.filename}
                </Text>
                <View style={styles.cardMeta}>
                  <Feather
                    name={statusMeta.icon as any}
                    size={11}
                    color={statusMeta.color}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.cardStatus, { color: statusMeta.color }]}>
                    {statusMeta.label}
                  </Text>
                  {langName && (
                    <>
                      <Text style={styles.cardMetaSep}>·</Text>
                      <Text style={styles.cardLang}>{langName}</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={C.textTertiary} />
          </View>

          {isActive && (
            <ProgressBar progress={job.progress} color={statusMeta.color} />
          )}
          {job.status === "awaiting_review" && (
            <View style={styles.reviewBadge}>
              <Feather name="edit-2" size={11} color={C.background} />
              <Text style={styles.reviewBadgeText}>Tap to review</Text>
            </View>
          )}
          {job.status === "done" && (
            <View style={[styles.reviewBadge, { backgroundColor: C.success }]}>
              <Feather name="download" size={11} color={C.background} />
              <Text style={styles.reviewBadgeText}>Video ready</Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const FEATURES = [
  { icon: "cut-outline" as const,           title: "פירוק ערוצי שמע",       desc: "AI מפריד ווקאל מפלייבק לתוצאה נקייה" },
  { icon: "document-text-outline" as const, title: "תמלול וסנכרון",          desc: "מילים מסונכרנות בדיוק לקצב המוזיקה" },
  { icon: "globe-outline" as const,         title: "+100 שפות",              desc: "קריוקי בכל שפה בעולם" },
  { icon: "images-outline" as const,        title: "הנפשת תמונה אישית",      desc: "ה-AI מנפיש את התמונה שלך כרקע לסרטון" },
];

function EmptyState() {
  return (
    <Animated.View entering={isWeb ? undefined : FadeIn.delay(200)} style={styles.emptyContainer}>
      {/* Full-bleed singer photo as background */}
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&h=740&fit=crop&q=80" }}
        style={styles.emptyBgPhoto}
        resizeMode="cover"
      />
      {/* Dark gradient so text stays readable */}
      <LinearGradient
        colors={["rgba(6,6,20,0.45)", "rgba(6,6,20,0.82)", "rgba(6,6,20,0.97)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Purple atmospheric tint */}
      <LinearGradient
        colors={["rgba(147,51,234,0.18)", "transparent"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Icon + text */}
      <View style={styles.emptyIconRing}>
        <Ionicons name="musical-notes" size={36} color={C.primary} />
      </View>
      <Text style={styles.emptyTitle}>אין שירים עדיין</Text>
      <Text style={styles.emptySubtitle}>
        העלה כל שיר בכל שפה{"\n"}וקבל סרטון קריוקי בדקות
      </Text>

      {/* Feature cards grid */}
      <View style={styles.featureGrid}>
        {FEATURES.map(({ icon, title, desc }) => (
          <View key={title} style={styles.featureCard}>
            <View style={styles.featureIconWrap}>
              <Ionicons name={icon} size={18} color={C.accent} />
            </View>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDesc}>{desc}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data: jobs, isLoading, refetch, isRefetching } = useJobs();
  const { data: authData } = useAuth();
  const user = authData?.user ?? null;
  const login = useLogin();

  const sortedJobs = React.useMemo(
    () =>
      [...(jobs ?? [])].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [jobs]
  );

  const handleNewJob = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/upload");
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={isWeb ? undefined : FadeInDown.springify()} style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.appName}>MYOUKEE</Text>
          <Text style={styles.appTagline}>כל שיר שאוהבים — עכשיו לקריוקי</Text>
        </View>

        {/* Credits chip */}
        {user ? (
          <Pressable
            style={styles.creditsChip}
            onPress={() => router.push("/credits")}
          >
            <Feather name="zap" size={13} color={C.primary} />
            <Text style={styles.creditsChipText}>{user.credits}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.loginChip} onPress={login}>
            <Feather name="log-in" size={13} color={C.textSecondary} />
            <Text style={styles.loginChipText}>Login</Text>
          </Pressable>
        )}

        {/* Avatar → credits/account | fallback → new job */}
        {user?.picture ? (
          <Pressable onPress={() => router.push("/credits")} style={styles.headerAvatarBtn}>
            <Image source={{ uri: user.picture }} style={styles.headerAvatar} />
          </Pressable>
        ) : (
          <Pressable style={styles.headerIconBtn} onPress={handleNewJob}>
            <LinearGradient
              colors={[C.primary, C.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIconGradient}
            >
              <Feather name="plus" size={22} color="#fff" />
            </LinearGradient>
          </Pressable>
        )}
      </Animated.View>

      {/* Job list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={sortedJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <JobCard job={item} index={index} />}
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={C.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <Animated.View
        entering={isWeb ? undefined : FadeInDown.delay(300).springify()}
        style={[styles.fab, { bottom: insets.bottom + 32 }]}
      >
        <Pressable
          onPress={handleNewJob}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        >
          <LinearGradient
            colors={[C.primary, "#6D28D9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Feather name="upload" size={20} color="#fff" />
            <Text style={styles.fabText}>New Song</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  appName: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: 3,
    color: C.text,
  },
  appTagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 3,
  },
  headerIconBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  headerIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  creditsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  creditsChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: C.primary,
  },
  loginChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  loginChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: C.textSecondary,
  },
  headerAvatarBtn: {
    position: "relative",
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: C.cardBorder,
  },
  headerAvatarPlus: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 10,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    overflow: "hidden",
    backgroundColor: C.card,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    paddingHorizontal: 16,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTextGroup: {
    flex: 1,
    gap: 4,
  },
  cardFilename: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: C.text,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  cardStatus: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  cardMetaSep: {
    color: C.textTertiary,
    fontSize: 12,
    marginHorizontal: 4,
  },
  cardLang: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textTertiary,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  reviewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    position: "absolute",
    bottom: 14,
    right: 14,
  },
  reviewBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: C.background,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 16,
    gap: 16,
    overflow: "hidden",
    borderRadius: 24,
    marginHorizontal: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  emptyBgPhoto: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%" as any,
    height: "100%" as any,
  },
  emptyGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: 40,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
    width: "100%" as any,
  },
  featureCard: {
    flex: 1,
    minWidth: "44%" as any,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 12,
    gap: 5,
  },
  featureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(96,165,250,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: C.text,
  },
  featureDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: C.textSecondary,
    lineHeight: 15,
  },
  emptyIconRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.primaryLight,
    borderWidth: 1.5,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 22,
    color: C.text,
  },
  emptySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    alignSelf: "center",
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  fabGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 32,
  },
  fabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
});
