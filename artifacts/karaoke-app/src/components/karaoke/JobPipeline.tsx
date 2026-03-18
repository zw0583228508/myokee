import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Music, Mic, Film, CheckCircle2, AlertCircle, Clock, Eye, RotateCcw, Loader2, Download } from "lucide-react";
import type { JobStatus } from "@workspace/api-client-react/src/generated/api.schemas";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LanguageContext";

interface JobPipelineProps {
  status: JobStatus;
  progress: number;
  onRetry?: () => void;
  isRetrying?: boolean;
  canRetry?: boolean;
  isConfirming?: boolean;
}

type Lang = "he" | "en" | "ar" | "ru" | "es" | "fr" | "de" | "ja" | "zh" | "ko" | "th" | "vi" | "tl" | "id";

type PipelineT = {
  stages: { downloading: string; separating: string; transcribing: string; review: string; rendering: string; done: string };
  stageDesc: { downloading: string; separating: string; transcribing: string; review: string; rendering: string; done: string };
  pending: string;
  downloading: { main: string; sub: string };
  queued: { main: string; sub: string };
  queueBanner: string;
  separating: { main: string; sub1: string; sub2: string; sub3: string };
  transcribing: { main: string; sub: string };
  awaitingReview: { main: string; sub: string };
  reviewBanner: string;
  rendering: { main: string; sub: string };
  errorTitle: string;
  errorSub: string;
  retrying: string;
  retryBtn: string;
};

const T: Record<Lang, PipelineT> = {
  he: {
    stages: { downloading: "הורדה", separating: "הפרדת קול", transcribing: "תמלול", review: "בדיקת תמלול", rendering: "יצירת וידאו", done: "מוכן!" },
    stageDesc: { downloading: "מוריד אודיו מ-YouTube", separating: "AI מפריד ווקאל מהמוזיקה", transcribing: "Whisper AI מתמלל מילים", review: "ממתין לאישורך", rendering: "FFmpeg מרנדר את הוידאו", done: "הוידאו שלך מוכן!" },
    pending: "מכין את הקובץ שלך…",
    downloading: { main: "מוריד אודיו מ-YouTube…", sub: "yt-dlp מוריד ומפצח את האודיו באיכות הטובה ביותר." },
    queued: { main: "ממתין לסיום הטראק הקודם — אתה הבא!", sub: "העיבוד יתחיל אוטומטית." },
    queueBanner: "טראק אחר בעיבוד. שלך יתחיל אוטומטית כשיסתיים.",
    separating: { main: "Demucs AI מפריד ווקאל מהמוזיקה על גבי GPU בענן.", sub1: "ממיר ומתכונן להפרדה…", sub2: "מפריד ווקאל מליווי — זה לוקח 1-3 דקות…", sub3: "כמעט סיים את הפרדת הקול!" },
    transcribing: { main: "Whisper AI מתמלל כל מילה עם תזמון מדויק.", sub: "בדרך כלל 30-90 שניות…" },
    awaitingReview: { main: "התמלול מוכן! גלול למטה לבדיקה.", sub: "תוכל לתקן מילים לפני יצירת הוידאו." },
    reviewBanner: "התמלול מוכן! גלול למטה כדי לבדוק ולתקן את המילים, ואז אשר כדי ליצור את הוידאו.",
    rendering: { main: "FFmpeg מרנדר את הוידאו הקריוקי.", sub: "שלב זה לוקח 1-3 דקות. כמעט שם!" },
    errorTitle: "העיבוד נכשל",
    errorSub: "משהו השתבש בזמן עיבוד הטראק.",
    retrying: "מנסה שוב...",
    retryBtn: "נסה שוב ללא העלאה מחדש",
  },
  en: {
    stages: { downloading: "Download", separating: "Vocal Separation", transcribing: "Transcription", review: "Review", rendering: "Video", done: "Done!" },
    stageDesc: { downloading: "Downloading audio from YouTube", separating: "AI separates vocal from music", transcribing: "Whisper AI transcribing lyrics", review: "Waiting for your approval", rendering: "FFmpeg rendering karaoke video", done: "Your video is ready!" },
    pending: "Preparing your file…",
    downloading: { main: "Downloading audio from YouTube…", sub: "yt-dlp is fetching and extracting the best quality audio." },
    queued: { main: "Waiting for the previous track to finish — you're next!", sub: "Processing will start automatically." },
    queueBanner: "Another track is processing. Yours will start automatically when it finishes.",
    separating: { main: "Demucs AI separating vocal from music on cloud GPU.", sub1: "Converting and preparing for separation…", sub2: "Separating vocal from backing — this takes 1-3 minutes…", sub3: "Almost done separating vocals!" },
    transcribing: { main: "Whisper AI transcribing every word with precise timing.", sub: "Usually takes 30-90 seconds…" },
    awaitingReview: { main: "Transcription ready! Scroll down to review.", sub: "You can fix words before generating the video." },
    reviewBanner: "Transcription ready! Scroll down to review and fix words, then confirm to generate the video.",
    rendering: { main: "FFmpeg rendering cinematic karaoke video.", sub: "This step takes 1-3 minutes. Almost there!" },
    errorTitle: "Processing Failed",
    errorSub: "Something went wrong while processing the track.",
    retrying: "Retrying...",
    retryBtn: "Retry without re-uploading",
  },
  ar: {
    stages: { downloading: "تحميل", separating: "فصل الصوت", transcribing: "نسخ", review: "مراجعة", rendering: "فيديو", done: "جاهز!" },
    stageDesc: { downloading: "تحميل الصوت من YouTube", separating: "AI يفصل الصوت عن الموسيقى", transcribing: "Whisper AI ينسخ الكلمات", review: "في انتظار موافقتك", rendering: "FFmpeg يُنشئ الفيديو", done: "الفيديو جاهز!" },
    pending: "جارٍ تحضير الملف…",
    downloading: { main: "جارٍ تحميل الصوت من YouTube…", sub: "yt-dlp يحمّل ويستخرج أفضل جودة صوت." },
    queued: { main: "في انتظار انتهاء المقطع السابق — أنت التالي!", sub: "ستبدأ المعالجة تلقائياً." },
    queueBanner: "مقطع آخر قيد المعالجة. سيبدأ مقطعك تلقائياً عند الانتهاء.",
    separating: { main: "Demucs AI يفصل الصوت عن الموسيقى على GPU سحابي.", sub1: "تحويل وتحضير للفصل…", sub2: "فصل الصوت عن المرافقة — يستغرق 1-3 دقائق…", sub3: "اوشك على الانتهاء من فصل الصوت!" },
    transcribing: { main: "Whisper AI ينسخ كل كلمة بتوقيت دقيق.", sub: "عادة 30-90 ثانية…" },
    awaitingReview: { main: "النسخ جاهز! مرر للأسفل للمراجعة.", sub: "يمكنك تصحيح الكلمات قبل إنشاء الفيديو." },
    reviewBanner: "النسخ جاهز! مرر للأسفل لمراجعة وتصحيح الكلمات، ثم أكد لإنشاء الفيديو.",
    rendering: { main: "FFmpeg ينشئ فيديو الكاريوكي.", sub: "هذه الخطوة تستغرق 1-3 دقائق. أوشكنا!" },
    errorTitle: "فشلت المعالجة",
    errorSub: "حدث خطأ أثناء معالجة المقطع.",
    retrying: "إعادة المحاولة...",
    retryBtn: "أعد المحاولة بدون إعادة رفع",
  },
  ru: {
    stages: { downloading: "Загрузка", separating: "Разделение", transcribing: "Транскрипция", review: "Проверка", rendering: "Видео", done: "Готово!" },
    stageDesc: { downloading: "Загрузка аудио с YouTube", separating: "AI разделяет вокал и музыку", transcribing: "Whisper AI транскрибирует слова", review: "Ожидание вашего подтверждения", rendering: "FFmpeg рендерит видео", done: "Ваше видео готово!" },
    pending: "Подготовка файла…",
    downloading: { main: "Загрузка аудио с YouTube…", sub: "yt-dlp загружает аудио в лучшем качестве." },
    queued: { main: "Ожидание завершения предыдущего трека — вы следующий!", sub: "Обработка начнётся автоматически." },
    queueBanner: "Другой трек обрабатывается. Ваш начнётся автоматически.",
    separating: { main: "Demucs AI разделяет вокал и музыку на облачном GPU.", sub1: "Конвертация и подготовка к разделению…", sub2: "Разделение вокала и аккомпанемента — 1-3 минуты…", sub3: "Почти закончили разделение вокала!" },
    transcribing: { main: "Whisper AI транскрибирует каждое слово с точным таймингом.", sub: "Обычно 30-90 секунд…" },
    awaitingReview: { main: "Транскрипция готова! Прокрутите вниз для проверки.", sub: "Вы можете исправить слова перед созданием видео." },
    reviewBanner: "Транскрипция готова! Прокрутите вниз, проверьте слова и подтвердите для создания видео.",
    rendering: { main: "FFmpeg рендерит караоке-видео.", sub: "Этот этап занимает 1-3 минуты. Почти готово!" },
    errorTitle: "Обработка не удалась",
    errorSub: "Что-то пошло не так при обработке трека.",
    retrying: "Повторная попытка...",
    retryBtn: "Повторить без загрузки",
  },
  es: {
    stages: { downloading: "Descarga", separating: "Separación", transcribing: "Transcripción", review: "Revisión", rendering: "Video", done: "¡Listo!" },
    stageDesc: { downloading: "Descargando audio de YouTube", separating: "AI separa la voz de la música", transcribing: "Whisper AI transcribe letras", review: "Esperando tu aprobación", rendering: "FFmpeg renderizando video", done: "¡Tu video está listo!" },
    pending: "Preparando tu archivo…",
    downloading: { main: "Descargando audio de YouTube…", sub: "yt-dlp descarga y extrae el audio de mejor calidad." },
    queued: { main: "Esperando a que termine la pista anterior — ¡eres el siguiente!", sub: "El procesamiento comenzará automáticamente." },
    queueBanner: "Otra pista se está procesando. La tuya comenzará automáticamente.",
    separating: { main: "Demucs AI separando la voz de la música en GPU en la nube.", sub1: "Convirtiendo y preparando para separación…", sub2: "Separando voz del acompañamiento — toma 1-3 minutos…", sub3: "¡Casi termina la separación de la voz!" },
    transcribing: { main: "Whisper AI transcribiendo cada palabra con timing preciso.", sub: "Generalmente 30-90 segundos…" },
    awaitingReview: { main: "¡Transcripción lista! Desplázate para revisar.", sub: "Puedes corregir palabras antes de generar el video." },
    reviewBanner: "¡Transcripción lista! Desplázate para revisar y corregir palabras, luego confirma para generar el video.",
    rendering: { main: "FFmpeg renderizando video de karaoke.", sub: "Este paso toma 1-3 minutos. ¡Casi listo!" },
    errorTitle: "Procesamiento fallido",
    errorSub: "Algo salió mal al procesar la pista.",
    retrying: "Reintentando...",
    retryBtn: "Reintentar sin re-subir",
  },
  fr: {
    stages: { downloading: "Téléchargement", separating: "Séparation", transcribing: "Transcription", review: "Vérification", rendering: "Vidéo", done: "Prêt !" },
    stageDesc: { downloading: "Téléchargement de l'audio depuis YouTube", separating: "L'IA sépare la voix de la musique", transcribing: "Whisper IA transcrit les paroles", review: "En attente de votre validation", rendering: "FFmpeg rend la vidéo", done: "Votre vidéo est prête !" },
    pending: "Préparation de votre fichier…",
    downloading: { main: "Téléchargement de l'audio depuis YouTube…", sub: "yt-dlp télécharge et extrait l'audio en meilleure qualité." },
    queued: { main: "En attente de la piste précédente — vous êtes le prochain !", sub: "Le traitement démarrera automatiquement." },
    queueBanner: "Une autre piste est en cours de traitement. La vôtre démarrera automatiquement.",
    separating: { main: "Demucs IA sépare la voix de la musique sur GPU cloud.", sub1: "Conversion et préparation à la séparation…", sub2: "Séparation de la voix et de l'accompagnement — 1 à 3 minutes…", sub3: "Presque fini de séparer la voix !" },
    transcribing: { main: "Whisper IA transcrit chaque mot avec un timing précis.", sub: "Généralement 30 à 90 secondes…" },
    awaitingReview: { main: "Transcription prête ! Faites défiler pour vérifier.", sub: "Vous pouvez corriger les mots avant de générer la vidéo." },
    reviewBanner: "Transcription prête ! Faites défiler pour vérifier et corriger les mots, puis confirmez pour générer la vidéo.",
    rendering: { main: "FFmpeg rend la vidéo karaoké.", sub: "Cette étape prend 1 à 3 minutes. Presque fini !" },
    errorTitle: "Échec du traitement",
    errorSub: "Quelque chose s'est mal passé lors du traitement de la piste.",
    retrying: "Nouvelle tentative...",
    retryBtn: "Réessayer sans re-téléverser",
  },
  de: {
    stages: { downloading: "Download", separating: "Trennung", transcribing: "Transkription", review: "Überprüfung", rendering: "Video", done: "Fertig!" },
    stageDesc: { downloading: "Audio von YouTube herunterladen", separating: "KI trennt Gesang von Musik", transcribing: "Whisper KI transkribiert Texte", review: "Wartet auf deine Bestätigung", rendering: "FFmpeg rendert das Video", done: "Dein Video ist fertig!" },
    pending: "Datei wird vorbereitet…",
    downloading: { main: "Audio von YouTube wird heruntergeladen…", sub: "yt-dlp lädt Audio in bester Qualität herunter." },
    queued: { main: "Warten auf den vorherigen Track — du bist als Nächstes dran!", sub: "Die Verarbeitung startet automatisch." },
    queueBanner: "Ein anderer Track wird verarbeitet. Deiner startet automatisch danach.",
    separating: { main: "Demucs KI trennt Gesang von Musik auf Cloud-GPU.", sub1: "Konvertierung und Vorbereitung zur Trennung…", sub2: "Trennung von Gesang und Begleitung — dauert 1-3 Minuten…", sub3: "Fast fertig mit der Stimmtrennung!" },
    transcribing: { main: "Whisper KI transkribiert jedes Wort mit präzisem Timing.", sub: "Normalerweise 30-90 Sekunden…" },
    awaitingReview: { main: "Transkription fertig! Scrolle nach unten zum Überprüfen.", sub: "Du kannst Wörter korrigieren bevor das Video erstellt wird." },
    reviewBanner: "Transkription fertig! Scrolle nach unten, überprüfe die Wörter und bestätige zur Videoerstellung.",
    rendering: { main: "FFmpeg rendert das Karaoke-Video.", sub: "Dieser Schritt dauert 1-3 Minuten. Fast geschafft!" },
    errorTitle: "Verarbeitung fehlgeschlagen",
    errorSub: "Beim Verarbeiten des Tracks ist ein Fehler aufgetreten.",
    retrying: "Wird wiederholt...",
    retryBtn: "Ohne erneutes Hochladen wiederholen",
  },
  ja: {
    stages: { downloading: "ダウンロード", separating: "ボーカル分離", transcribing: "文字起こし", review: "レビュー", rendering: "動画生成", done: "完了！" },
    stageDesc: { downloading: "YouTubeから音声をダウンロード中", separating: "AIがボーカルと音楽を分離中", transcribing: "Whisper AIが歌詞を文字起こし中", review: "確認をお待ちしています", rendering: "FFmpegが動画をレンダリング中", done: "動画の準備ができました！" },
    pending: "ファイルを準備中…",
    downloading: { main: "YouTubeから音声をダウンロード中…", sub: "yt-dlpが最高品質の音声を取得・抽出しています。" },
    queued: { main: "前のトラックの完了を待っています — 次はあなたです！", sub: "処理は自動的に開始されます。" },
    queueBanner: "別のトラックを処理中です。完了後、自動的に開始されます。",
    separating: { main: "Demucs AIがクラウドGPUでボーカルと音楽を分離中。", sub1: "変換と分離の準備中…", sub2: "ボーカルとバッキングを分離中 — 1〜3分かかります…", sub3: "ボーカル分離がもうすぐ完了！" },
    transcribing: { main: "Whisper AIが正確なタイミングで全単語を文字起こし中。", sub: "通常30〜90秒…" },
    awaitingReview: { main: "文字起こし完了！下にスクロールしてレビューしてください。", sub: "動画生成前に歌詞を修正できます。" },
    reviewBanner: "文字起こし完了！下にスクロールして歌詞を確認・修正し、確定して動画を生成してください。",
    rendering: { main: "FFmpegがカラオケ動画をレンダリング中。", sub: "このステップは1〜3分かかります。もうすぐです！" },
    errorTitle: "処理に失敗しました",
    errorSub: "トラックの処理中にエラーが発生しました。",
    retrying: "再試行中...",
    retryBtn: "再アップロードせずに再試行",
  },
  zh: {
    stages: { downloading: "下载", separating: "人声分离", transcribing: "转录", review: "审核", rendering: "视频", done: "完成！" },
    stageDesc: { downloading: "从YouTube下载音频", separating: "AI正在分离人声和音乐", transcribing: "Whisper AI正在转录歌词", review: "等待您的确认", rendering: "FFmpeg正在渲染视频", done: "您的视频已准备好！" },
    pending: "正在准备您的文件…",
    downloading: { main: "正在从YouTube下载音频…", sub: "yt-dlp正在获取和提取最佳质量的音频。" },
    queued: { main: "等待前一个音轨完成 — 下一个就是您！", sub: "处理将自动开始。" },
    queueBanner: "另一个音轨正在处理中。您的将在完成后自动开始。",
    separating: { main: "Demucs AI在云GPU上分离人声和音乐。", sub1: "转换和准备分离中…", sub2: "分离人声和伴奏 — 需要1-3分钟…", sub3: "人声分离即将完成！" },
    transcribing: { main: "Whisper AI正在精确计时地转录每个词。", sub: "通常需要30-90秒…" },
    awaitingReview: { main: "转录完成！向下滚动查看。", sub: "您可以在生成视频前修改歌词。" },
    reviewBanner: "转录完成！向下滚动查看和修改歌词，然后确认生成视频。",
    rendering: { main: "FFmpeg正在渲染卡拉OK视频。", sub: "此步骤需要1-3分钟。快完成了！" },
    errorTitle: "处理失败",
    errorSub: "处理音轨时出现问题。",
    retrying: "正在重试...",
    retryBtn: "无需重新上传即可重试",
  },
  ko: {
    stages: { downloading: "다운로드", separating: "보컬 분리", transcribing: "가사 인식", review: "검토", rendering: "영상 생성", done: "완료!" },
    stageDesc: { downloading: "YouTube에서 오디오 다운로드 중", separating: "AI가 보컬과 음악을 분리 중", transcribing: "Whisper AI가 가사를 인식 중", review: "확인을 기다리는 중", rendering: "FFmpeg가 영상을 렌더링 중", done: "영상이 준비되었습니다!" },
    pending: "파일을 준비하는 중…",
    downloading: { main: "YouTube에서 오디오를 다운로드하는 중…", sub: "yt-dlp가 최고 품질의 오디오를 가져오고 있습니다." },
    queued: { main: "이전 트랙 완료를 기다리는 중 — 다음은 당신입니다!", sub: "처리가 자동으로 시작됩니다." },
    queueBanner: "다른 트랙이 처리 중입니다. 완료되면 자동으로 시작됩니다.",
    separating: { main: "Demucs AI가 클라우드 GPU에서 보컬과 음악을 분리 중.", sub1: "변환 및 분리 준비 중…", sub2: "보컬과 반주를 분리 중 — 1~3분 소요…", sub3: "보컬 분리가 거의 완료되었습니다!" },
    transcribing: { main: "Whisper AI가 정확한 타이밍으로 모든 단어를 인식 중.", sub: "보통 30~90초 소요…" },
    awaitingReview: { main: "가사 인식 완료! 아래로 스크롤하여 확인하세요.", sub: "영상 생성 전에 가사를 수정할 수 있습니다." },
    reviewBanner: "가사 인식 완료! 아래로 스크롤하여 가사를 확인하고 수정한 후, 확인하여 영상을 생성하세요.",
    rendering: { main: "FFmpeg가 노래방 영상을 렌더링 중.", sub: "이 단계는 1~3분 소요됩니다. 거의 다 되었습니다!" },
    errorTitle: "처리 실패",
    errorSub: "트랙 처리 중 문제가 발생했습니다.",
    retrying: "재시도 중...",
    retryBtn: "재업로드 없이 재시도",
  },
  th: {
    stages: { downloading: "ดาวน์โหลด", separating: "แยกเสียงร้อง", transcribing: "ถอดเนื้อเพลง", review: "ตรวจสอบ", rendering: "สร้างวิดีโอ", done: "เสร็จแล้ว!" },
    stageDesc: { downloading: "กำลังดาวน์โหลดเสียงจาก YouTube", separating: "AI กำลังแยกเสียงร้องจากดนตรี", transcribing: "Whisper AI กำลังถอดเนื้อเพลง", review: "รอการยืนยันจากคุณ", rendering: "FFmpeg กำลังเรนเดอร์วิดีโอ", done: "วิดีโอของคุณพร้อมแล้ว!" },
    pending: "กำลังเตรียมไฟล์ของคุณ…",
    downloading: { main: "กำลังดาวน์โหลดเสียงจาก YouTube…", sub: "yt-dlp กำลังดาวน์โหลดและแยกเสียงคุณภาพสูงสุด" },
    queued: { main: "รอแทร็กก่อนหน้าเสร็จ — คุณเป็นคนถัดไป!", sub: "การประมวลผลจะเริ่มอัตโนมัติ" },
    queueBanner: "แทร็กอื่นกำลังประมวลผล แทร็กของคุณจะเริ่มอัตโนมัติเมื่อเสร็จ",
    separating: { main: "Demucs AI กำลังแยกเสียงร้องจากดนตรีบน Cloud GPU", sub1: "กำลังแปลงและเตรียมการแยก…", sub2: "กำลังแยกเสียงร้องจากเสียงประกอบ — ใช้เวลา 1-3 นาที…", sub3: "การแยกเสียงร้องใกล้จะเสร็จแล้ว!" },
    transcribing: { main: "Whisper AI กำลังถอดเนื้อเพลงทุกคำอย่างแม่นยำ", sub: "โดยปกติ 30-90 วินาที…" },
    awaitingReview: { main: "ถอดเนื้อเพลงเสร็จแล้ว! เลื่อนลงเพื่อตรวจสอบ", sub: "คุณสามารถแก้ไขเนื้อเพลงก่อนสร้างวิดีโอ" },
    reviewBanner: "ถอดเนื้อเพลงเสร็จแล้ว! เลื่อนลงเพื่อตรวจสอบและแก้ไขเนื้อเพลง จากนั้นยืนยันเพื่อสร้างวิดีโอ",
    rendering: { main: "FFmpeg กำลังเรนเดอร์วิดีโอคาราโอเกะ", sub: "ขั้นตอนนี้ใช้เวลา 1-3 นาที เกือบเสร็จแล้ว!" },
    errorTitle: "การประมวลผลล้มเหลว",
    errorSub: "เกิดข้อผิดพลาดระหว่างการประมวลผลแทร็ก",
    retrying: "กำลังลองใหม่...",
    retryBtn: "ลองใหม่โดยไม่ต้องอัปโหลดซ้ำ",
  },
  vi: {
    stages: { downloading: "Tải xuống", separating: "Tách giọng", transcribing: "Chuyển lời", review: "Xem lại", rendering: "Tạo video", done: "Hoàn tất!" },
    stageDesc: { downloading: "Đang tải âm thanh từ YouTube", separating: "AI đang tách giọng hát khỏi nhạc", transcribing: "Whisper AI đang chuyển lời bài hát", review: "Đang chờ xác nhận của bạn", rendering: "FFmpeg đang render video", done: "Video của bạn đã sẵn sàng!" },
    pending: "Đang chuẩn bị tệp của bạn…",
    downloading: { main: "Đang tải âm thanh từ YouTube…", sub: "yt-dlp đang tải và trích xuất âm thanh chất lượng cao nhất." },
    queued: { main: "Đang chờ bản nhạc trước hoàn tất — bạn là người tiếp theo!", sub: "Xử lý sẽ tự động bắt đầu." },
    queueBanner: "Một bản nhạc khác đang xử lý. Bản của bạn sẽ tự động bắt đầu khi hoàn tất.",
    separating: { main: "Demucs AI đang tách giọng hát khỏi nhạc trên GPU đám mây.", sub1: "Đang chuyển đổi và chuẩn bị tách…", sub2: "Đang tách giọng hát khỏi nhạc nền — mất 1-3 phút…", sub3: "Sắp hoàn tất tách giọng hát!" },
    transcribing: { main: "Whisper AI đang chuyển từng từ với thời gian chính xác.", sub: "Thường mất 30-90 giây…" },
    awaitingReview: { main: "Chuyển lời hoàn tất! Cuộn xuống để xem lại.", sub: "Bạn có thể sửa lời trước khi tạo video." },
    reviewBanner: "Chuyển lời hoàn tất! Cuộn xuống để xem lại và sửa lời, sau đó xác nhận để tạo video.",
    rendering: { main: "FFmpeg đang render video karaoke.", sub: "Bước này mất 1-3 phút. Sắp xong rồi!" },
    errorTitle: "Xử lý thất bại",
    errorSub: "Đã xảy ra lỗi khi xử lý bản nhạc.",
    retrying: "Đang thử lại...",
    retryBtn: "Thử lại mà không cần tải lên lại",
  },
  tl: {
    stages: { downloading: "Download", separating: "Paghiwalay ng Boses", transcribing: "Transcription", review: "Review", rendering: "Video", done: "Tapos na!" },
    stageDesc: { downloading: "Nagda-download ng audio mula sa YouTube", separating: "AI naghihiwalay ng boses sa musika", transcribing: "Whisper AI nagta-transcribe ng lyrics", review: "Naghihintay ng iyong kumpirmasyon", rendering: "FFmpeg nagre-render ng video", done: "Handa na ang video mo!" },
    pending: "Inihahanda ang iyong file…",
    downloading: { main: "Nagda-download ng audio mula sa YouTube…", sub: "yt-dlp nagda-download at kumukuha ng pinakamataas na kalidad ng audio." },
    queued: { main: "Naghihintay sa nakaraang track — ikaw ang susunod!", sub: "Awtomatikong magsisimula ang pagproseso." },
    queueBanner: "May ibang track na pinoproseso. Awtomatikong magsisimula ang sa iyo pagkatapos.",
    separating: { main: "Demucs AI naghihiwalay ng boses sa musika sa cloud GPU.", sub1: "Nagko-convert at naghahanda para sa paghiwalay…", sub2: "Naghihiwalay ng boses sa accompaniment — 1-3 minuto…", sub3: "Halos tapos na ang paghiwalay ng boses!" },
    transcribing: { main: "Whisper AI nagta-transcribe ng bawat salita na may tumpak na timing.", sub: "Karaniwang 30-90 segundo…" },
    awaitingReview: { main: "Tapos na ang transcription! Mag-scroll pababa para i-review.", sub: "Puwede mong ayusin ang mga salita bago gawin ang video." },
    reviewBanner: "Tapos na ang transcription! Mag-scroll pababa para i-review at ayusin ang mga salita, pagkatapos kumpirmahin para gawin ang video.",
    rendering: { main: "FFmpeg nagre-render ng karaoke video.", sub: "Ang hakbang na ito ay 1-3 minuto. Halos tapos na!" },
    errorTitle: "Nabigo ang pagproseso",
    errorSub: "May problema sa pagproseso ng track.",
    retrying: "Sinusubukan ulit...",
    retryBtn: "Subukan ulit nang hindi nag-a-upload muli",
  },
  id: {
    stages: { downloading: "Unduh", separating: "Pemisahan Vokal", transcribing: "Transkripsi", review: "Tinjau", rendering: "Video", done: "Selesai!" },
    stageDesc: { downloading: "Mengunduh audio dari YouTube", separating: "AI memisahkan vokal dari musik", transcribing: "Whisper AI mentranskripsikan lirik", review: "Menunggu konfirmasi Anda", rendering: "FFmpeg merender video", done: "Video Anda sudah siap!" },
    pending: "Menyiapkan file Anda…",
    downloading: { main: "Mengunduh audio dari YouTube…", sub: "yt-dlp mengunduh dan mengekstrak audio berkualitas terbaik." },
    queued: { main: "Menunggu trek sebelumnya selesai — Anda berikutnya!", sub: "Pemrosesan akan dimulai secara otomatis." },
    queueBanner: "Trek lain sedang diproses. Trek Anda akan dimulai otomatis setelah selesai.",
    separating: { main: "Demucs AI memisahkan vokal dari musik di GPU cloud.", sub1: "Mengonversi dan mempersiapkan pemisahan…", sub2: "Memisahkan vokal dari iringan — membutuhkan 1-3 menit…", sub3: "Pemisahan vokal hampir selesai!" },
    transcribing: { main: "Whisper AI mentranskripsikan setiap kata dengan waktu yang tepat.", sub: "Biasanya 30-90 detik…" },
    awaitingReview: { main: "Transkripsi selesai! Gulir ke bawah untuk meninjau.", sub: "Anda dapat memperbaiki kata sebelum membuat video." },
    reviewBanner: "Transkripsi selesai! Gulir ke bawah untuk meninjau dan memperbaiki kata, lalu konfirmasi untuk membuat video.",
    rendering: { main: "FFmpeg merender video karaoke.", sub: "Langkah ini membutuhkan 1-3 menit. Hampir selesai!" },
    errorTitle: "Pemrosesan gagal",
    errorSub: "Terjadi kesalahan saat memproses trek.",
    retrying: "Mencoba lagi...",
    retryBtn: "Coba lagi tanpa mengunggah ulang",
  },
};

const STAGE_IDS = ["downloading", "separating", "transcribing", "awaiting_review", "rendering", "done"] as const;

const STAGE_PROGRESS_TARGETS: Record<string, number> = {
  pending: 2,
  downloading: 5,
  queued: 5,
  separating: 48,
  transcribing: 68,
  awaiting_review: 70,
  rendering: 99,
  done: 100,
};

function getStageIndex(status: JobStatus | string): number {
  if (status === "pending" || status === "queued") return 0;
  if (status === "downloading") return 0;
  const idx = STAGE_IDS.indexOf(status as any);
  return idx === -1 ? 1 : idx;
}

function getSeparatingSub(t: typeof T["he"], progress: number): string {
  if (progress < 10) return t.separating.sub1;
  if (progress < 40) return t.separating.sub2;
  return t.separating.sub3;
}

export function JobPipeline({ status, progress, onRetry, isRetrying, canRetry, isConfirming }: JobPipelineProps) {
  const { lang } = useLang();
  const t = T[(lang as Lang)] || T.en;

  const [displayProgress, setDisplayProgress] = useState(progress);
  const prevStatusRef = useRef(status);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (status === "done" || status === "awaiting_review" || status === "error") {
      setDisplayProgress(progress);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (prevStatusRef.current !== status) {
      setDisplayProgress(progress);
      prevStatusRef.current = status;
    }

    if (progress > displayProgress) {
      setDisplayProgress(progress);
    }

    const target = STAGE_PROGRESS_TARGETS[status] ?? progress;
    if (displayProgress >= target) return;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDisplayProgress((prev) => {
        const remaining = target - prev;
        if (remaining <= 0.5) {
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        const step = Math.max(0.1, remaining * 0.02);
        return Math.min(prev + step, target - 0.5);
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, progress]);

  if (status === "error") {
    return (
      <div className="p-8 rounded-2xl bg-destructive/10 border border-destructive/20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h3 className="text-xl font-semibold text-destructive">{t.errorTitle}</h3>
        <p className="text-muted-foreground text-sm">{t.errorSub}</p>
        {canRetry && onRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            variant="outline"
            className="border-destructive/30 hover:bg-destructive/10 text-destructive"
          >
            {isRetrying ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.retrying}</>
            ) : (
              <><RotateCcw className="w-4 h-4 mr-2" />{t.retryBtn}</>
            )}
          </Button>
        )}
      </div>
    );
  }

  const effectiveStatus = isConfirming && status === "awaiting_review" ? "rendering" : status;
  const activeIndex = getStageIndex(effectiveStatus);
  const isQueued = effectiveStatus === "pending" || effectiveStatus === "queued";
  const isAwaitingReview = effectiveStatus === "awaiting_review";
  const isRtl = lang === "he" || lang === "ar";

  const STAGE_ICONS = [Music, Music, Mic, Eye, Film, CheckCircle2];
  const stageKeys = ["downloading", "separating", "transcribing", "review", "rendering", "done"] as const;

  let message = "";
  let subMessage = "";
  switch (effectiveStatus) {
    case "pending":
      message = t.pending;
      break;
    case "downloading":
      message = t.downloading.main;
      subMessage = t.downloading.sub;
      break;
    case "queued":
      message = t.queued.main;
      subMessage = t.queued.sub;
      break;
    case "separating":
      message = t.separating.main;
      subMessage = getSeparatingSub(t, displayProgress);
      break;
    case "transcribing":
      message = t.transcribing.main;
      subMessage = t.transcribing.sub;
      break;
    case "awaiting_review":
      message = t.awaitingReview.main;
      subMessage = t.awaitingReview.sub;
      break;
    case "rendering":
      message = t.rendering.main;
      subMessage = t.rendering.sub;
      break;
  }

  return (
    <div className="w-full space-y-10 max-w-3xl mx-auto">
      {isQueued && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm"
        >
          <Clock className="w-5 h-5 shrink-0 animate-pulse" />
          <span>{t.queueBanner}</span>
        </motion.div>
      )}

      {isAwaitingReview && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm"
        >
          <Eye className="w-5 h-5 shrink-0 animate-pulse" />
          <span>{t.reviewBanner}</span>
        </motion.div>
      )}

      <div className="flex justify-between items-center relative" dir={isRtl ? "rtl" : "ltr"}>
        <div className="absolute top-6 left-0 w-full h-0.5 bg-white/5 z-0" />
        <div
          className={`absolute top-6 h-0.5 z-0 transition-all duration-1000 ${isRtl ? "right-0 bg-gradient-to-l from-primary to-accent" : "left-0 bg-gradient-to-r from-primary to-accent"}`}
          style={{ width: `${(activeIndex / (STAGE_IDS.length - 1)) * 100}%` }}
        />

        {stageKeys.map((key, index) => {
          const isCompleted = index < activeIndex || status === "done";
          const isActive = index === activeIndex && !isQueued && status !== "done";
          const Icon = STAGE_ICONS[index];

          return (
            <div key={key} className="relative z-10 flex flex-col items-center gap-3 w-1/5">
              <motion.div
                initial={false}
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ duration: 0.3 }}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500
                  ${isCompleted ? "border-primary bg-primary/10" : isActive ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(59,130,246,0.4)]" : "border-white/10 bg-white/5"}
                `}
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-500
                    ${isCompleted ? "text-primary" : isActive ? "text-accent" : "text-muted-foreground"}
                    ${isActive ? "animate-pulse" : ""}
                  `}
                />
              </motion.div>
              <span className={`text-xs font-medium text-center leading-tight transition-colors duration-500
                ${isCompleted || isActive ? "text-foreground" : "text-muted-foreground"}
              `}>
                {t.stages[key]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-center space-y-3">
        {!isQueued && !isAwaitingReview && (
          <div className="max-w-md mx-auto space-y-2">
            <Progress value={displayProgress} className="h-2" />
            <p className="text-xs text-muted-foreground tabular-nums opacity-60" dir="ltr">
              {Math.round(displayProgress)}%
            </p>
          </div>
        )}
        {isQueued && (
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-yellow-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
        )}
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">{message}</p>
        {subMessage && (
          <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto">{subMessage}</p>
        )}
        {canRetry && onRetry && status !== "error" && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            variant="outline"
            size="sm"
            className="mt-2 border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400"
          >
            {isRetrying ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.retrying}</>
            ) : (
              <><RotateCcw className="w-4 h-4 mr-2" />{t.retryBtn}</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
