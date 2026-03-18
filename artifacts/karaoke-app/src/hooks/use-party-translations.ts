import { useLang } from "@/contexts/LanguageContext";
import { PARTY_LANGS, type PartyTranslations } from "@/contexts/partyTranslations";

export function usePartyTranslations(): PartyTranslations {
  const { lang } = useLang();
  return PARTY_LANGS[lang] || PARTY_LANGS.en;
}
