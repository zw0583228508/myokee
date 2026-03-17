import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAuth, useLogin } from "@/hooks/use-auth";
import { usePackages, usePurchase } from "@/hooks/use-payments";

const isWeb = Platform.OS === "web";
const C = Colors.dark;

export default function CreditsScreen() {
  const insets = useSafeAreaInsets();
  const { data: authData } = useAuth();
  const user = authData?.user ?? null;
  const login = useLogin();
  const { data: packages, isLoading: loadingPackages } = usePackages();
  const purchase = usePurchase();
  const [buyingId, setBuyingId] = useState<string | null>(null);

  function handleBuy(packageId: string) {
    if (!user) {
      Alert.alert(
        "התחברות נדרשת",
        "יש להתחבר עם Google כדי לרכוש קרדיטים.",
        [
          { text: "ביטול", style: "cancel" },
          { text: "התחבר", onPress: login },
        ]
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBuyingId(packageId);
    purchase.mutate(packageId, {
      onSettled: () => setBuyingId(null),
      onError: (err) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("שגיאה", err.message ?? "לא ניתן לייצר סשן תשלום. נסה שוב.");
      },
    });
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "transparent" }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={isWeb ? undefined : FadeInDown.springify()} style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Feather name="x" size={20} color={C.textSecondary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>רכישת קרדיטים</Text>
          <Text style={styles.subtitle}>1 קרדיט = דקת שיר אחת · תשלום חד-פעמי</Text>
        </View>
      </Animated.View>

      {/* Balance / free tier info */}
      <Animated.View
        entering={isWeb ? undefined : FadeInDown.delay(80).springify()}
        style={styles.balanceCard}
      >
        <LinearGradient
          colors={["rgba(147,51,234,0.18)", "rgba(59,130,246,0.1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {user ? (
          <>
            <View style={styles.balanceRow}>
              <Feather name="zap" size={20} color={C.primary} />
              <Text style={styles.balanceLabel}>יתרה נוכחית</Text>
              <Text style={styles.balanceValue}>{user.credits}</Text>
              <Text style={styles.balanceUnit}>קרדיטים</Text>
            </View>
            {user.credits === 0 && (
              <Text style={styles.freeNote}>
                יש לך <Text style={{ color: "#22C55E", fontFamily: "Inter_600SemiBold" }}>40 שניות חינם</Text> לכל שיר — ללא כרטיס אשראי
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.freeNote}>
            השניות הראשונות <Text style={{ color: "#22C55E", fontFamily: "Inter_600SemiBold" }}>חינם</Text> — עד 40 שניות, ללא כרטיס אשראי
          </Text>
        )}
      </Animated.View>

      {/* Packages */}
      {loadingPackages ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} />
      ) : !packages || packages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: C.textSecondary }}>חבילות לא זמינות כרגע</Text>
        </View>
      ) : (
        <View style={styles.packagesGrid}>
          {packages.map((pkg, i) => {
            const isBuying = buyingId === pkg.id;
            const priceUSD = pkg.unitAmount / 100;
            return (
              <Animated.View
                key={pkg.id}
                entering={isWeb ? undefined : FadeInDown.delay(160 + i * 60).springify()}
                style={[styles.packageCard, pkg.popular && styles.packageCardPopular]}
              >
                {pkg.popular && (
                  <LinearGradient
                    colors={["rgba(147,51,234,0.25)", "rgba(59,130,246,0.12)"]}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                {pkg.popular && (
                  <View style={styles.popularBadge}>
                    <Feather name="star" size={10} color="#fff" />
                    <Text style={styles.popularBadgeText}>הכי פופולרי</Text>
                  </View>
                )}

                <Text style={styles.pkgName}>{pkg.name}</Text>
                <Text style={styles.pkgCredits}>{pkg.credits}</Text>
                <Text style={styles.pkgUnit}>קרדיטים</Text>
                {pkg.description ? (
                  <Text style={styles.pkgDesc}>{pkg.description}</Text>
                ) : null}
                <Text style={styles.pkgPrice}>${priceUSD}</Text>

                <Pressable
                  disabled={!!buyingId}
                  onPress={() => handleBuy(pkg.id)}
                  style={({ pressed }) => [
                    styles.buyBtn,
                    pkg.popular && styles.buyBtnPrimary,
                    (pressed || !!buyingId) && { opacity: 0.7 },
                  ]}
                >
                  {isBuying ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buyBtnText}>קנה עכשיו</Text>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      )}

      <Text style={styles.footer}>
        תשלום מאובטח דרך Stripe · קרדיטים לא פגים
      </Text>
    </ScrollView>
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
    fontSize: 24,
    color: C.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 4,
  },
  balanceCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 16,
    gap: 8,
    overflow: "hidden",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balanceLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.textSecondary,
    flex: 1,
  },
  balanceValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: C.primary,
  },
  balanceUnit: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
  },
  freeNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  packagesGrid: {
    gap: 12,
  },
  packageCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 16,
    gap: 4,
    overflow: "hidden",
  },
  packageCardPopular: {
    borderColor: C.cardBorder,
  },
  popularBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  popularBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#fff",
  },
  pkgName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: C.text,
  },
  pkgCredits: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: C.primary,
    lineHeight: 40,
  },
  pkgUnit: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
  },
  pkgDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 2,
  },
  pkgPrice: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: C.text,
    marginTop: 4,
  },
  buyBtn: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  buyBtnPrimary: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  buyBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#fff",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  footer: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textTertiary,
    textAlign: "center",
    marginTop: 8,
  },
});
