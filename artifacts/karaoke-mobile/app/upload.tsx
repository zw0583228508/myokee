import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAuth, useLogin } from "@/hooks/use-auth";
import { uploadAvatar, useCreateJob, useCreateJobFromYouTube } from "@/hooks/use-jobs";

const isWeb = Platform.OS === "web";
const C = Colors.dark;

type Tab = "file" | "youtube";

interface FileInfo {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
  webFile?: File;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isValidYouTubeUrl(url: string): boolean {
  return (url.includes("youtube.com") || url.includes("youtu.be")) &&
    (url.startsWith("http://") || url.startsWith("https://"));
}

function PickerCard({
  icon,
  label,
  sublabel,
  selected,
  onPress,
  optional,
}: {
  icon: string;
  label: string;
  sublabel: string;
  selected?: string;
  onPress: () => void;
  optional?: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.pickerCard, selected ? styles.pickerCardSelected : null]}
      >
        {selected ? (
          <LinearGradient
            colors={["rgba(147,51,234,0.18)", "rgba(59,130,246,0.1)"]}
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        <View style={[styles.pickerIcon, selected ? { backgroundColor: C.primaryLight } : null]}>
          <Feather
            name={icon as any}
            size={22}
            color={selected ? C.primary : C.textSecondary}
          />
        </View>

        <View style={styles.pickerText}>
          <Text style={[styles.pickerLabel, selected ? { color: C.primary } : null]}>
            {selected
              ? selected.length > 30
                ? "…" + selected.slice(-28)
                : selected
              : label}
          </Text>
          <Text style={styles.pickerSublabel}>
            {selected ? "Tap to change" : sublabel}
          </Text>
        </View>

        {optional && !selected ? (
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalText}>optional</Text>
          </View>
        ) : null}

        {selected ? (
          <View style={styles.checkIcon}>
            <Feather name="check-circle" size={18} color={C.primary} />
          </View>
        ) : (
          <Feather name="plus-circle" size={18} color={C.textTertiary} />
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const createJob = useCreateJob();
  const createYouTubeJob = useCreateJobFromYouTube();
  const { data: authData } = useAuth();
  const user = authData?.user ?? null;
  const login = useLogin();

  const [tab, setTab] = useState<Tab>("file");
  const [audioFile, setAudioFile] = useState<FileInfo | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarWebFile, setAvatarWebFile] = useState<File | null>(null);

  const urlInputRef = useRef<TextInput>(null);

  const pickAudio = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*", "video/*"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setAudioFile({
          name: asset.name,
          uri: asset.uri,
          mimeType: asset.mimeType ?? "audio/mpeg",
          size: asset.size,
          webFile: (asset as any).file ?? undefined,
        });
      }
    } catch {
      Alert.alert("Error", "Could not pick audio file.");
    }
  }, []);

  const pickAvatar = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets.length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setAvatarUri(result.assets[0].uri);
        setAvatarWebFile((result.assets[0] as any).file ?? null);
      }
    } catch {
      Alert.alert("Error", "Could not pick photo.");
    }
  }, []);

  const handleUploadFile = useCallback(async () => {
    if (!audioFile) return;
    if (!user) {
      Alert.alert("התחברות נדרשת", "יש להתחבר כדי להעלות שירים.", [
        { text: "ביטול", style: "cancel" },
        { text: "התחבר עם Google", onPress: login },
      ]);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const form = new FormData();
    if (audioFile.webFile) {
      form.append("file", audioFile.webFile);
    } else {
      form.append("file", {
        uri: audioFile.uri,
        name: audioFile.name,
        type: audioFile.mimeType ?? "audio/mpeg",
      } as any);
    }
    try {
      const job = await createJob.mutateAsync(form);
      if (avatarUri) {
        uploadAvatar(job.id, avatarUri, avatarWebFile ?? undefined).catch(() => {});
      }
      router.replace({ pathname: "/job/[id]", params: { id: job.id } });
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Upload Failed", err.message ?? "Please try again.");
    }
  }, [audioFile, avatarUri, avatarWebFile, createJob, user, login]);

  const handleUploadYouTube = useCallback(async () => {
    const url = youtubeUrl.trim();
    if (!isValidYouTubeUrl(url)) {
      Alert.alert("קישור לא תקין", "הדבק קישור מיוטיוב שמתחיל ב-https://");
      return;
    }
    if (!user) {
      Alert.alert("התחברות נדרשת", "יש להתחבר כדי לעבד שירים.", [
        { text: "ביטול", style: "cancel" },
        { text: "התחבר עם Google", onPress: login },
      ]);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const job = await createYouTubeJob.mutateAsync(url);
      if (avatarUri) {
        uploadAvatar(job.id, avatarUri, avatarWebFile ?? undefined).catch(() => {});
      }
      router.replace({ pathname: "/job/[id]", params: { id: job.id } });
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("שגיאה", err.message ?? "Please try again.");
    }
  }, [youtubeUrl, avatarUri, avatarWebFile, createYouTubeJob, user, login]);

  const isPending = createJob.isPending || createYouTubeJob.isPending;
  const canSubmitFile = !!audioFile && !isPending;
  const canSubmitYouTube = isValidYouTubeUrl(youtubeUrl.trim()) && !isPending;
  const canSubmit = tab === "file" ? canSubmitFile : canSubmitYouTube;
  const handleSubmit = tab === "file" ? handleUploadFile : handleUploadYouTube;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "transparent" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View
          entering={isWeb ? undefined : FadeInDown.springify()}
          style={styles.header}
        >
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Feather name="x" size={20} color={C.textSecondary} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>New Song</Text>
            <Text style={styles.subtitle}>
              Upload a file or paste a YouTube link
            </Text>
          </View>
        </Animated.View>

        {/* Language + free tier pills */}
        <Animated.View
          entering={isWeb ? undefined : FadeInDown.delay(80).springify()}
          style={styles.languageBadgeRow}
        >
          <View style={styles.languageBadge}>
            <Feather name="globe" size={12} color={C.primary} />
            <Text style={styles.languageBadgeText}>
              Auto-detects 99 languages
            </Text>
          </View>
          <View style={styles.freeBadge}>
            <Feather name="zap" size={12} color="#22C55E" />
            <Text style={styles.freeBadgeText}>
              40 שניות ראשונות חינם
            </Text>
          </View>
        </Animated.View>

        {/* Tab switcher */}
        <Animated.View
          entering={isWeb ? undefined : FadeInDown.delay(140).springify()}
          style={styles.tabRow}
        >
          <Pressable
            style={[styles.tab, tab === "file" && styles.tabActive]}
            onPress={() => setTab("file")}
          >
            <Feather
              name="upload"
              size={14}
              color={tab === "file" ? C.primary : C.textSecondary}
            />
            <Text style={[styles.tabText, tab === "file" && styles.tabTextActive]}>
              File
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === "youtube" && styles.tabActive]}
            onPress={() => {
              setTab("youtube");
              setTimeout(() => urlInputRef.current?.focus(), 150);
            }}
          >
            <Feather
              name="youtube"
              size={14}
              color={tab === "youtube" ? "#FF0000" : C.textSecondary}
            />
            <Text style={[styles.tabText, tab === "youtube" && styles.tabTextYT]}>
              YouTube
            </Text>
          </Pressable>
        </Animated.View>

        {/* Source section */}
        <Animated.View
          entering={isWeb ? undefined : FadeInDown.delay(200).springify()}
          style={styles.section}
        >
          {tab === "file" ? (
            <>
              <Text style={styles.sectionLabel}>AUDIO / VIDEO FILE</Text>
              <PickerCard
                icon="music"
                label="Choose audio or video"
                sublabel="MP3, WAV, M4A, MP4, AAC…"
                selected={audioFile ? `${audioFile.name}  ${formatBytes(audioFile.size)}` : undefined}
                onPress={pickAudio}
              />
            </>
          ) : (
            <>
              <Text style={styles.sectionLabel}>YOUTUBE LINK</Text>
              <View style={styles.urlCard}>
                <View style={[styles.pickerIcon, { backgroundColor: "rgba(255,0,0,0.12)" }]}>
                  <Feather name="youtube" size={22} color="#FF4444" />
                </View>
                <TextInput
                  ref={urlInputRef}
                  style={styles.urlInput}
                  placeholder="https://youtube.com/watch?v=…"
                  placeholderTextColor={C.textTertiary}
                  value={youtubeUrl}
                  onChangeText={setYoutubeUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="go"
                  onSubmitEditing={canSubmit ? handleSubmit : undefined}
                  selectionColor={C.primary}
                />
                {youtubeUrl.length > 0 ? (
                  <Pressable onPress={() => setYoutubeUrl("")}>
                    <Feather name="x-circle" size={18} color={C.textTertiary} />
                  </Pressable>
                ) : null}
              </View>
              {youtubeUrl.length > 0 && !isValidYouTubeUrl(youtubeUrl) ? (
                <Text style={styles.urlError}>
                  ✕  Not a valid YouTube link
                </Text>
              ) : null}
            </>
          )}
        </Animated.View>

        {/* Singer photo */}
        <Animated.View
          entering={isWeb ? undefined : FadeInDown.delay(260).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>SINGER PHOTO</Text>
          <PickerCard
            icon="camera"
            label="Add a singer photo"
            sublabel="Appears in the video corner"
            selected={avatarUri ? "Photo selected" : undefined}
            onPress={pickAvatar}
            optional
          />
          {avatarUri ? (
            <Animated.View entering={isWeb ? undefined : FadeIn} style={styles.avatarPreviewRow}>
              <Image source={{ uri: avatarUri }} style={styles.avatarThumb} />
              <Pressable
                onPress={() => { setAvatarUri(null); setAvatarWebFile(null); }}
                style={styles.removeAvatar}
              >
                <Feather name="x" size={14} color={C.error} />
                <Text style={styles.removeAvatarText}>Remove</Text>
              </Pressable>
            </Animated.View>
          ) : null}
        </Animated.View>

        {/* How it works */}
        <Animated.View
          entering={isWeb ? undefined : FadeInDown.delay(320).springify()}
          style={styles.stepsCard}
        >
          {[
            { icon: "scissors", text: "Vocal separation via AI" },
            { icon: "type", text: "Whisper auto-transcription" },
            { icon: "film", text: "Cinematic karaoke render" },
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Feather name={step.icon as any} size={14} color={C.textSecondary} style={{ marginRight: 8 }} />
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Submit button */}
        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(380).springify()}>
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [{ opacity: pressed || !canSubmit ? 0.7 : 1 }]}
          >
            <LinearGradient
              colors={canSubmit ? [C.primary, "#6D28D9"] : ["#333", "#222"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.uploadBtn}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather
                    name={tab === "youtube" ? "youtube" : "upload-cloud"}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.uploadBtnText}>
                    {tab === "youtube" ? "Download & Process" : "Start Processing"}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: C.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.textSecondary,
    marginTop: 4,
  },
  languageBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  languageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  languageBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: C.primary,
  },
  freeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(34,197,94,0.12)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  freeBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#22C55E",
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  tabText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: C.textSecondary,
  },
  tabTextActive: {
    color: C.primary,
  },
  tabTextYT: {
    color: "#FF4444",
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: C.textTertiary,
    letterSpacing: 1,
  },
  pickerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    borderStyle: "dashed",
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.02)",
    overflow: "hidden",
  },
  pickerCardSelected: {
    borderStyle: "solid",
    borderColor: C.cardBorder,
  },
  pickerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerText: {
    flex: 1,
    gap: 3,
  },
  pickerLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: C.text,
  },
  pickerSublabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
  },
  optionalBadge: {
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  optionalText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: C.textTertiary,
  },
  checkIcon: {
    marginLeft: 4,
  },
  urlCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    borderStyle: "solid",
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  urlInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.text,
    padding: 0,
    margin: 0,
  },
  urlError: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.error,
    paddingLeft: 4,
  },
  avatarPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingLeft: 4,
  },
  avatarThumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: C.cardBorder,
  },
  removeAvatar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
  },
  removeAvatarText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.error,
  },
  stepsCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 16,
    gap: 12,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  stepNumText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: C.primary,
  },
  stepText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  uploadBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
});
