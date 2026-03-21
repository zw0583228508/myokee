import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useLang, SupportedLang } from "@/contexts/LanguageContext";

const VALID_LANGS: SupportedLang[] = [
  "he", "en", "ar", "ru", "es", "fr", "de", "ja", "zh", "ko", "th", "vi", "tl", "id",
];

export default function LangLanding() {
  const [, params] = useRoute("/lang/:lang");
  const [, navigate] = useLocation();
  const { setLang } = useLang();

  useEffect(() => {
    const lang = params?.lang as SupportedLang;
    if (lang && VALID_LANGS.includes(lang)) {
      setLang(lang);
    }
    navigate("/", { replace: true });
  }, [params?.lang]);

  return null;
}
