import { useLang } from "@/contexts/LanguageContext";
import { GAMIFICATION_LANGS, type GamificationTranslations } from "@/contexts/gamificationTranslations";

export function useGamificationTranslations(): GamificationTranslations {
  const { lang } = useLang();
  return GAMIFICATION_LANGS[lang] || GAMIFICATION_LANGS.en;
}
