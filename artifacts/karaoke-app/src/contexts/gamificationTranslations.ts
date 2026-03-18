export interface GamificationTranslations {
  xp: {
    title: string;
    level: string;
    weekly: string;
    streak: string;
    day: string;
    days: string;
    totalXP: string;
    progress: string;
  };
  badges: {
    title: string;
    earned: string;
    locked: string;
    first_song: string;
    song_5: string;
    song_10: string;
    song_25: string;
    song_50: string;
    song_100: string;
    battle_winner: string;
    battle_5_wins: string;
    battle_champ: string;
    duet_star: string;
    party_host: string;
    party_regular: string;
    streak_3: string;
    streak_7: string;
    streak_30: string;
    level_5: string;
    level_10: string;
    level_20: string;
    social_butterfly: string;
    xp_1000: string;
    xp_10000: string;
    xp_50000: string;
  };
  achievements: {
    title: string;
    songs_created: string;
    battles_won: string;
    duets_sung: string;
    parties_hosted: string;
    parties_joined: string;
    clips_shared: string;
    login_streak: string;
    total_xp: string;
  };
  leaderboard: {
    title: string;
    allTime: string;
    thisWeek: string;
    rank: string;
    yourRank: string;
    empty: string;
  };
  levels: {
    [key: string]: string;
  };
}

const en: GamificationTranslations = {
  xp: { title: "Your Progress", level: "Level", weekly: "This Week", streak: "Streak", day: "day", days: "days", totalXP: "Total XP", progress: "Progress" },
  badges: { title: "Badges", earned: "Earned", locked: "Locked", first_song: "First Song", song_5: "5 Songs", song_10: "10 Songs", song_25: "25 Songs", song_50: "50 Songs", song_100: "100 Songs", battle_winner: "Battle Winner", battle_5_wins: "5 Battle Wins", battle_champ: "Battle Champion", duet_star: "Duet Star", party_host: "Party Host", party_regular: "Party Regular", streak_3: "3-Day Streak", streak_7: "7-Day Streak", streak_30: "30-Day Streak", level_5: "Level 5", level_10: "Level 10", level_20: "Level 20", social_butterfly: "Social Butterfly", xp_1000: "1K XP Club", xp_10000: "10K XP Club", xp_50000: "50K XP Club" },
  achievements: { title: "Achievements", songs_created: "Create 100 karaoke songs", battles_won: "Win 50 battles", duets_sung: "Sing 25 duets", parties_hosted: "Host 20 parties", parties_joined: "Join 50 parties", clips_shared: "Share 30 clips", login_streak: "30-day login streak", total_xp: "Earn 10,000 XP" },
  leaderboard: { title: "XP Leaderboard", allTime: "All Time", thisWeek: "This Week", rank: "Rank", yourRank: "Your Rank", empty: "No one on the leaderboard yet. Be the first!" },
  levels: { "1": "Beginner", "2": "Novice", "3": "Singer", "4": "Vocalist", "5": "Performer", "6": "Artist", "7": "Star", "8": "Rising Star", "9": "Sensation", "10": "Superstar", "15": "Champion", "20": "Grand Master", "25": "Celestial", "30": "GOAT" },
};

const he: GamificationTranslations = {
  xp: { title: "ההתקדמות שלך", level: "רמה", weekly: "השבוע", streak: "רצף", day: "יום", days: "ימים", totalXP: "סה\"כ XP", progress: "התקדמות" },
  badges: { title: "תגים", earned: "הושג", locked: "נעול", first_song: "שיר ראשון", song_5: "5 שירים", song_10: "10 שירים", song_25: "25 שירים", song_50: "50 שירים", song_100: "100 שירים", battle_winner: "מנצח באטל", battle_5_wins: "5 ניצחונות", battle_champ: "אלוף באטלים", duet_star: "כוכב דואט", party_host: "מארגן מסיבות", party_regular: "מסיבן קבוע", streak_3: "רצף 3 ימים", streak_7: "רצף 7 ימים", streak_30: "רצף 30 יום", level_5: "רמה 5", level_10: "רמה 10", level_20: "רמה 20", social_butterfly: "פרפר חברתי", xp_1000: "מועדון 1K", xp_10000: "מועדון 10K", xp_50000: "מועדון 50K" },
  achievements: { title: "הישגים", songs_created: "צור 100 שירי קריוקי", battles_won: "נצח ב-50 באטלים", duets_sung: "שיר 25 דואטים", parties_hosted: "ארגן 20 מסיבות", parties_joined: "הצטרף ל-50 מסיבות", clips_shared: "שתף 30 קליפים", login_streak: "רצף התחברות 30 יום", total_xp: "צבור 10,000 XP" },
  leaderboard: { title: "טבלת XP", allTime: "כל הזמנים", thisWeek: "השבוע", rank: "דירוג", yourRank: "הדירוג שלך", empty: "עדיין אין אף אחד בטבלה. היה הראשון!" },
  levels: { "1": "מתחיל", "2": "טירון", "3": "זמר", "4": "ווקליסט", "5": "מבצע", "6": "אמן", "7": "כוכב", "8": "כוכב עולה", "9": "סנסציה", "10": "סופרסטאר", "15": "אלוף", "20": "גרנד מאסטר", "25": "שמימי", "30": "הכי טוב" },
};

const ar: GamificationTranslations = {
  xp: { title: "تقدمك", level: "المستوى", weekly: "هذا الأسبوع", streak: "سلسلة", day: "يوم", days: "أيام", totalXP: "إجمالي XP", progress: "التقدم" },
  badges: { title: "الشارات", earned: "مكتسبة", locked: "مقفلة", first_song: "أول أغنية", song_5: "5 أغاني", song_10: "10 أغاني", song_25: "25 أغنية", song_50: "50 أغنية", song_100: "100 أغنية", battle_winner: "فائز بالمعركة", battle_5_wins: "5 انتصارات", battle_champ: "بطل المعارك", duet_star: "نجم الثنائي", party_host: "مضيف الحفلة", party_regular: "مشارك دائم", streak_3: "سلسلة 3 أيام", streak_7: "سلسلة 7 أيام", streak_30: "سلسلة 30 يوم", level_5: "المستوى 5", level_10: "المستوى 10", level_20: "المستوى 20", social_butterfly: "فراشة اجتماعية", xp_1000: "نادي 1K", xp_10000: "نادي 10K", xp_50000: "نادي 50K" },
  achievements: { title: "الإنجازات", songs_created: "أنشئ 100 كاريوكي", battles_won: "افز بـ 50 معركة", duets_sung: "غنِّ 25 ثنائي", parties_hosted: "استضف 20 حفلة", parties_joined: "انضم لـ 50 حفلة", clips_shared: "شارك 30 مقطع", login_streak: "سلسلة تسجيل 30 يوم", total_xp: "اكسب 10,000 XP" },
  leaderboard: { title: "لوحة XP", allTime: "كل الوقت", thisWeek: "هذا الأسبوع", rank: "المرتبة", yourRank: "مرتبتك", empty: "لا أحد في اللوحة بعد. كن الأول!" },
  levels: { "1": "مبتدئ", "2": "مبتدئ+", "3": "مغني", "4": "مؤدي", "5": "فنان", "6": "نجم", "10": "سوبرستار", "15": "بطل", "20": "أسطورة", "30": "الأعظم" },
};

const ru: GamificationTranslations = {
  xp: { title: "Ваш прогресс", level: "Уровень", weekly: "За неделю", streak: "Серия", day: "день", days: "дней", totalXP: "Всего XP", progress: "Прогресс" },
  badges: { title: "Значки", earned: "Получен", locked: "Закрыт", first_song: "Первая песня", song_5: "5 песен", song_10: "10 песен", song_25: "25 песен", song_50: "50 песен", song_100: "100 песен", battle_winner: "Победитель", battle_5_wins: "5 побед", battle_champ: "Чемпион", duet_star: "Звезда дуэта", party_host: "Хост вечеринки", party_regular: "Завсегдатай", streak_3: "Серия 3 дня", streak_7: "Серия 7 дней", streak_30: "Серия 30 дней", level_5: "Уровень 5", level_10: "Уровень 10", level_20: "Уровень 20", social_butterfly: "Социальная бабочка", xp_1000: "Клуб 1K", xp_10000: "Клуб 10K", xp_50000: "Клуб 50K" },
  achievements: { title: "Достижения", songs_created: "Создать 100 караоке", battles_won: "Выиграть 50 баттлов", duets_sung: "Спеть 25 дуэтов", parties_hosted: "Провести 20 вечеринок", parties_joined: "Присоединиться к 50", clips_shared: "Поделиться 30 клипами", login_streak: "Серия входов 30 дней", total_xp: "Набрать 10,000 XP" },
  leaderboard: { title: "Таблица XP", allTime: "За всё время", thisWeek: "Эта неделя", rank: "Ранг", yourRank: "Ваш ранг", empty: "Пока никого. Будьте первым!" },
  levels: { "1": "Новичок", "2": "Ученик", "3": "Певец", "4": "Вокалист", "5": "Артист", "6": "Звезда", "10": "Суперзвезда", "15": "Чемпион", "20": "Гранд Мастер", "30": "Легенда" },
};

const es: GamificationTranslations = {
  xp: { title: "Tu Progreso", level: "Nivel", weekly: "Esta Semana", streak: "Racha", day: "día", days: "días", totalXP: "XP Total", progress: "Progreso" },
  badges: { title: "Insignias", earned: "Obtenida", locked: "Bloqueada", first_song: "Primera Canción", song_5: "5 Canciones", song_10: "10 Canciones", song_25: "25 Canciones", song_50: "50 Canciones", song_100: "100 Canciones", battle_winner: "Ganador", battle_5_wins: "5 Victorias", battle_champ: "Campeón", duet_star: "Estrella Dúo", party_host: "Anfitrión", party_regular: "Habitual", streak_3: "Racha 3 días", streak_7: "Racha 7 días", streak_30: "Racha 30 días", level_5: "Nivel 5", level_10: "Nivel 10", level_20: "Nivel 20", social_butterfly: "Mariposa Social", xp_1000: "Club 1K", xp_10000: "Club 10K", xp_50000: "Club 50K" },
  achievements: { title: "Logros", songs_created: "Crear 100 karaokes", battles_won: "Ganar 50 batallas", duets_sung: "Cantar 25 dúos", parties_hosted: "Organizar 20 fiestas", parties_joined: "Unirse a 50 fiestas", clips_shared: "Compartir 30 clips", login_streak: "Racha de 30 días", total_xp: "Ganar 10,000 XP" },
  leaderboard: { title: "Tabla de XP", allTime: "Todo el Tiempo", thisWeek: "Esta Semana", rank: "Rango", yourRank: "Tu Rango", empty: "Nadie en la tabla aún. ¡Sé el primero!" },
  levels: { "1": "Principiante", "2": "Novato", "3": "Cantante", "4": "Vocalista", "5": "Artista", "6": "Estrella", "10": "Superestrella", "15": "Campeón", "20": "Gran Maestro", "30": "GOAT" },
};

const fr: GamificationTranslations = {
  xp: { title: "Votre Progression", level: "Niveau", weekly: "Cette Semaine", streak: "Série", day: "jour", days: "jours", totalXP: "XP Total", progress: "Progression" },
  badges: { title: "Badges", earned: "Obtenu", locked: "Verrouillé", first_song: "1ère Chanson", song_5: "5 Chansons", song_10: "10 Chansons", song_25: "25 Chansons", song_50: "50 Chansons", song_100: "100 Chansons", battle_winner: "Vainqueur", battle_5_wins: "5 Victoires", battle_champ: "Champion", duet_star: "Star Duo", party_host: "Hôte", party_regular: "Habitué", streak_3: "Série 3 jours", streak_7: "Série 7 jours", streak_30: "Série 30 jours", level_5: "Niveau 5", level_10: "Niveau 10", level_20: "Niveau 20", social_butterfly: "Papillon Social", xp_1000: "Club 1K", xp_10000: "Club 10K", xp_50000: "Club 50K" },
  achievements: { title: "Succès", songs_created: "Créer 100 karaokés", battles_won: "Gagner 50 combats", duets_sung: "Chanter 25 duos", parties_hosted: "Organiser 20 soirées", parties_joined: "Rejoindre 50 soirées", clips_shared: "Partager 30 clips", login_streak: "Série de 30 jours", total_xp: "Gagner 10 000 XP" },
  leaderboard: { title: "Classement XP", allTime: "Tout le Temps", thisWeek: "Cette Semaine", rank: "Rang", yourRank: "Votre Rang", empty: "Personne au classement. Soyez le premier !" },
  levels: { "1": "Débutant", "2": "Novice", "3": "Chanteur", "4": "Vocaliste", "5": "Artiste", "6": "Étoile", "10": "Superstar", "15": "Champion", "20": "Grand Maître", "30": "Légende" },
};

const de: GamificationTranslations = {
  xp: { title: "Dein Fortschritt", level: "Level", weekly: "Diese Woche", streak: "Serie", day: "Tag", days: "Tage", totalXP: "Gesamt XP", progress: "Fortschritt" },
  badges: { title: "Abzeichen", earned: "Erhalten", locked: "Gesperrt", first_song: "Erster Song", song_5: "5 Songs", song_10: "10 Songs", song_25: "25 Songs", song_50: "50 Songs", song_100: "100 Songs", battle_winner: "Sieger", battle_5_wins: "5 Siege", battle_champ: "Champion", duet_star: "Duett Star", party_host: "Gastgeber", party_regular: "Stammgast", streak_3: "3-Tage-Serie", streak_7: "7-Tage-Serie", streak_30: "30-Tage-Serie", level_5: "Level 5", level_10: "Level 10", level_20: "Level 20", social_butterfly: "Social Butterfly", xp_1000: "1K Club", xp_10000: "10K Club", xp_50000: "50K Club" },
  achievements: { title: "Erfolge", songs_created: "100 Karaokes erstellen", battles_won: "50 Kämpfe gewinnen", duets_sung: "25 Duette singen", parties_hosted: "20 Partys veranstalten", parties_joined: "50 Partys beitreten", clips_shared: "30 Clips teilen", login_streak: "30-Tage-Login-Serie", total_xp: "10.000 XP sammeln" },
  leaderboard: { title: "XP Rangliste", allTime: "Gesamt", thisWeek: "Diese Woche", rank: "Rang", yourRank: "Dein Rang", empty: "Noch niemand in der Rangliste. Sei der Erste!" },
  levels: { "1": "Anfänger", "2": "Neuling", "3": "Sänger", "4": "Vokalist", "5": "Künstler", "6": "Star", "10": "Superstar", "15": "Champion", "20": "Großmeister", "30": "Legende" },
};

const pt: GamificationTranslations = {
  xp: { title: "Seu Progresso", level: "Nível", weekly: "Esta Semana", streak: "Sequência", day: "dia", days: "dias", totalXP: "XP Total", progress: "Progresso" },
  badges: { title: "Medalhas", earned: "Obtida", locked: "Bloqueada", first_song: "1ª Música", song_5: "5 Músicas", song_10: "10 Músicas", song_25: "25 Músicas", song_50: "50 Músicas", song_100: "100 Músicas", battle_winner: "Vencedor", battle_5_wins: "5 Vitórias", battle_champ: "Campeão", duet_star: "Estrela Dueto", party_host: "Anfitrião", party_regular: "Frequentador", streak_3: "Sequência 3 dias", streak_7: "Sequência 7 dias", streak_30: "Sequência 30 dias", level_5: "Nível 5", level_10: "Nível 10", level_20: "Nível 20", social_butterfly: "Borboleta Social", xp_1000: "Clube 1K", xp_10000: "Clube 10K", xp_50000: "Clube 50K" },
  achievements: { title: "Conquistas", songs_created: "Criar 100 karaokês", battles_won: "Vencer 50 batalhas", duets_sung: "Cantar 25 duetos", parties_hosted: "Hospedar 20 festas", parties_joined: "Participar de 50 festas", clips_shared: "Compartilhar 30 clipes", login_streak: "Sequência de 30 dias", total_xp: "Ganhar 10.000 XP" },
  leaderboard: { title: "Ranking XP", allTime: "Todos os Tempos", thisWeek: "Esta Semana", rank: "Posição", yourRank: "Sua Posição", empty: "Ninguém no ranking ainda. Seja o primeiro!" },
  levels: { "1": "Iniciante", "2": "Novato", "3": "Cantor", "4": "Vocalista", "5": "Artista", "6": "Estrela", "10": "Superestrela", "15": "Campeão", "20": "Grão-Mestre", "30": "Lenda" },
};

const it: GamificationTranslations = {
  xp: { title: "Il Tuo Progresso", level: "Livello", weekly: "Questa Settimana", streak: "Serie", day: "giorno", days: "giorni", totalXP: "XP Totale", progress: "Progresso" },
  badges: { title: "Badge", earned: "Ottenuto", locked: "Bloccato", first_song: "Prima Canzone", song_5: "5 Canzoni", song_10: "10 Canzoni", song_25: "25 Canzoni", song_50: "50 Canzoni", song_100: "100 Canzoni", battle_winner: "Vincitore", battle_5_wins: "5 Vittorie", battle_champ: "Campione", duet_star: "Stella Duetto", party_host: "Host", party_regular: "Habitué", streak_3: "Serie 3 giorni", streak_7: "Serie 7 giorni", streak_30: "Serie 30 giorni", level_5: "Livello 5", level_10: "Livello 10", level_20: "Livello 20", social_butterfly: "Farfalla Sociale", xp_1000: "Club 1K", xp_10000: "Club 10K", xp_50000: "Club 50K" },
  achievements: { title: "Traguardi", songs_created: "Crea 100 karaoke", battles_won: "Vinci 50 battaglie", duets_sung: "Canta 25 duetti", parties_hosted: "Organizza 20 feste", parties_joined: "Partecipa a 50 feste", clips_shared: "Condividi 30 clip", login_streak: "Serie login 30 giorni", total_xp: "Guadagna 10.000 XP" },
  leaderboard: { title: "Classifica XP", allTime: "Di Sempre", thisWeek: "Questa Settimana", rank: "Posizione", yourRank: "La Tua Posizione", empty: "Nessuno in classifica. Sii il primo!" },
  levels: { "1": "Principiante", "2": "Novizio", "3": "Cantante", "4": "Vocalist", "5": "Artista", "6": "Stella", "10": "Superstar", "15": "Campione", "20": "Gran Maestro", "30": "Leggenda" },
};

const ja: GamificationTranslations = {
  xp: { title: "あなたの進捗", level: "レベル", weekly: "今週", streak: "連続", day: "日", days: "日間", totalXP: "合計XP", progress: "進捗" },
  badges: { title: "バッジ", earned: "取得済み", locked: "未取得", first_song: "初めての曲", song_5: "5曲", song_10: "10曲", song_25: "25曲", song_50: "50曲", song_100: "100曲", battle_winner: "バトル勝者", battle_5_wins: "5勝", battle_champ: "バトルチャンピオン", duet_star: "デュエットスター", party_host: "パーティーホスト", party_regular: "常連", streak_3: "3日連続", streak_7: "7日連続", streak_30: "30日連続", level_5: "レベル5", level_10: "レベル10", level_20: "レベル20", social_butterfly: "ソーシャルバタフライ", xp_1000: "1Kクラブ", xp_10000: "10Kクラブ", xp_50000: "50Kクラブ" },
  achievements: { title: "アチーブメント", songs_created: "カラオケ100曲作成", battles_won: "バトル50勝", duets_sung: "デュエット25回", parties_hosted: "パーティー20回主催", parties_joined: "パーティー50回参加", clips_shared: "クリップ30回共有", login_streak: "30日連続ログイン", total_xp: "10,000 XP獲得" },
  leaderboard: { title: "XPランキング", allTime: "全期間", thisWeek: "今週", rank: "順位", yourRank: "あなたの順位", empty: "まだ誰もいません。最初になりましょう！" },
  levels: { "1": "初心者", "2": "見習い", "3": "歌手", "4": "ボーカリスト", "5": "パフォーマー", "6": "スター", "10": "スーパースター", "15": "チャンピオン", "20": "グランドマスター", "30": "レジェンド" },
};

const ko: GamificationTranslations = {
  xp: { title: "내 진행 상황", level: "레벨", weekly: "이번 주", streak: "연속", day: "일", days: "일", totalXP: "총 XP", progress: "진행률" },
  badges: { title: "뱃지", earned: "획득", locked: "잠김", first_song: "첫 노래", song_5: "5곡", song_10: "10곡", song_25: "25곡", song_50: "50곡", song_100: "100곡", battle_winner: "배틀 승자", battle_5_wins: "5승", battle_champ: "배틀 챔피언", duet_star: "듀엣 스타", party_host: "파티 호스트", party_regular: "단골", streak_3: "3일 연속", streak_7: "7일 연속", streak_30: "30일 연속", level_5: "레벨 5", level_10: "레벨 10", level_20: "레벨 20", social_butterfly: "소셜 버터플라이", xp_1000: "1K 클럽", xp_10000: "10K 클럽", xp_50000: "50K 클럽" },
  achievements: { title: "업적", songs_created: "노래방 100곡 만들기", battles_won: "배틀 50승", duets_sung: "듀엣 25회", parties_hosted: "파티 20회 주최", parties_joined: "파티 50회 참가", clips_shared: "클립 30회 공유", login_streak: "30일 연속 로그인", total_xp: "10,000 XP 획득" },
  leaderboard: { title: "XP 랭킹", allTime: "전체", thisWeek: "이번 주", rank: "순위", yourRank: "내 순위", empty: "아직 아무도 없습니다. 첫 번째가 되세요!" },
  levels: { "1": "초보자", "2": "신입", "3": "가수", "4": "보컬리스트", "5": "퍼포머", "6": "스타", "10": "슈퍼스타", "15": "챔피언", "20": "그랜드마스터", "30": "레전드" },
};

const zh: GamificationTranslations = {
  xp: { title: "你的进度", level: "等级", weekly: "本周", streak: "连续", day: "天", days: "天", totalXP: "总XP", progress: "进度" },
  badges: { title: "徽章", earned: "已获得", locked: "未解锁", first_song: "第一首歌", song_5: "5首歌", song_10: "10首歌", song_25: "25首歌", song_50: "50首歌", song_100: "100首歌", battle_winner: "对战胜者", battle_5_wins: "5次胜利", battle_champ: "对战冠军", duet_star: "二重唱之星", party_host: "派对主持", party_regular: "常客", streak_3: "连续3天", streak_7: "连续7天", streak_30: "连续30天", level_5: "5级", level_10: "10级", level_20: "20级", social_butterfly: "社交达人", xp_1000: "1K俱乐部", xp_10000: "10K俱乐部", xp_50000: "50K俱乐部" },
  achievements: { title: "成就", songs_created: "创建100首卡拉OK", battles_won: "赢得50场对战", duets_sung: "唱25首二重唱", parties_hosted: "举办20场派对", parties_joined: "参加50场派对", clips_shared: "分享30个片段", login_streak: "连续登录30天", total_xp: "获得10,000 XP" },
  leaderboard: { title: "XP排行榜", allTime: "总榜", thisWeek: "本周", rank: "排名", yourRank: "你的排名", empty: "还没有人上榜。成为第一个！" },
  levels: { "1": "初学者", "2": "新手", "3": "歌手", "4": "声乐家", "5": "表演者", "6": "明星", "10": "超级巨星", "15": "冠军", "20": "大师", "30": "传奇" },
};

const tr: GamificationTranslations = {
  xp: { title: "İlerlemeniz", level: "Seviye", weekly: "Bu Hafta", streak: "Seri", day: "gün", days: "gün", totalXP: "Toplam XP", progress: "İlerleme" },
  badges: { title: "Rozetler", earned: "Kazanıldı", locked: "Kilitli", first_song: "İlk Şarkı", song_5: "5 Şarkı", song_10: "10 Şarkı", song_25: "25 Şarkı", song_50: "50 Şarkı", song_100: "100 Şarkı", battle_winner: "Kazanan", battle_5_wins: "5 Zafer", battle_champ: "Şampiyon", duet_star: "Düet Yıldızı", party_host: "Parti Sahibi", party_regular: "Müdavim", streak_3: "3 Gün Seri", streak_7: "7 Gün Seri", streak_30: "30 Gün Seri", level_5: "Seviye 5", level_10: "Seviye 10", level_20: "Seviye 20", social_butterfly: "Sosyal Kelebek", xp_1000: "1K Kulüp", xp_10000: "10K Kulüp", xp_50000: "50K Kulüp" },
  achievements: { title: "Başarılar", songs_created: "100 karaoke oluştur", battles_won: "50 savaş kazan", duets_sung: "25 düet söyle", parties_hosted: "20 parti düzenle", parties_joined: "50 partiye katıl", clips_shared: "30 klip paylaş", login_streak: "30 gün giriş serisi", total_xp: "10.000 XP kazan" },
  leaderboard: { title: "XP Sıralaması", allTime: "Tüm Zamanlar", thisWeek: "Bu Hafta", rank: "Sıra", yourRank: "Sıranız", empty: "Henüz kimse yok. İlk siz olun!" },
  levels: { "1": "Başlangıç", "2": "Acemi", "3": "Şarkıcı", "4": "Vokalist", "5": "Sanatçı", "6": "Yıldız", "10": "Süperstar", "15": "Şampiyon", "20": "Usta", "30": "Efsane" },
};

const vi: GamificationTranslations = {
  xp: { title: "Tiến Trình", level: "Cấp", weekly: "Tuần Này", streak: "Chuỗi", day: "ngày", days: "ngày", totalXP: "Tổng XP", progress: "Tiến Trình" },
  badges: { title: "Huy Hiệu", earned: "Đã đạt", locked: "Chưa mở", first_song: "Bài Đầu Tiên", song_5: "5 Bài", song_10: "10 Bài", song_25: "25 Bài", song_50: "50 Bài", song_100: "100 Bài", battle_winner: "Người Thắng", battle_5_wins: "5 Chiến Thắng", battle_champ: "Nhà Vô Địch", duet_star: "Ngôi Sao Song Ca", party_host: "Chủ Tiệc", party_regular: "Khách Quen", streak_3: "Chuỗi 3 Ngày", streak_7: "Chuỗi 7 Ngày", streak_30: "Chuỗi 30 Ngày", level_5: "Cấp 5", level_10: "Cấp 10", level_20: "Cấp 20", social_butterfly: "Bướm Xã Hội", xp_1000: "CLB 1K", xp_10000: "CLB 10K", xp_50000: "CLB 50K" },
  achievements: { title: "Thành Tựu", songs_created: "Tạo 100 karaoke", battles_won: "Thắng 50 trận", duets_sung: "Hát 25 song ca", parties_hosted: "Tổ chức 20 tiệc", parties_joined: "Tham gia 50 tiệc", clips_shared: "Chia sẻ 30 clip", login_streak: "Đăng nhập 30 ngày liên tục", total_xp: "Đạt 10.000 XP" },
  leaderboard: { title: "Bảng Xếp Hạng XP", allTime: "Tất Cả", thisWeek: "Tuần Này", rank: "Hạng", yourRank: "Hạng Của Bạn", empty: "Chưa có ai. Hãy là người đầu tiên!" },
  levels: { "1": "Người Mới", "2": "Tập Sự", "3": "Ca Sĩ", "4": "Giọng Ca", "5": "Nghệ Sĩ", "6": "Ngôi Sao", "10": "Siêu Sao", "15": "Nhà Vô Địch", "20": "Bậc Thầy", "30": "Huyền Thoại" },
};

const tl: GamificationTranslations = {
  xp: { title: "Iyong Progress", level: "Level", weekly: "Ngayong Linggo", streak: "Streak", day: "araw", days: "araw", totalXP: "Kabuuang XP", progress: "Progress" },
  badges: { title: "Mga Badge", earned: "Nakuha", locked: "Naka-lock", first_song: "Unang Kanta", song_5: "5 Kanta", song_10: "10 Kanta", song_25: "25 Kanta", song_50: "50 Kanta", song_100: "100 Kanta", battle_winner: "Nanalo", battle_5_wins: "5 Panalo", battle_champ: "Champion", duet_star: "Duet Star", party_host: "Party Host", party_regular: "Suki", streak_3: "3-Araw Streak", streak_7: "7-Araw Streak", streak_30: "30-Araw Streak", level_5: "Level 5", level_10: "Level 10", level_20: "Level 20", social_butterfly: "Social Butterfly", xp_1000: "1K Club", xp_10000: "10K Club", xp_50000: "50K Club" },
  achievements: { title: "Achievements", songs_created: "Gumawa ng 100 karaoke", battles_won: "Manalo ng 50 laban", duets_sung: "Kumanta ng 25 duet", parties_hosted: "Mag-host ng 20 party", parties_joined: "Sumali sa 50 party", clips_shared: "Mag-share ng 30 clip", login_streak: "30-araw na login streak", total_xp: "Kumita ng 10,000 XP" },
  leaderboard: { title: "XP Ranking", allTime: "Lahat ng Oras", thisWeek: "Ngayong Linggo", rank: "Ranggo", yourRank: "Iyong Ranggo", empty: "Wala pang tao. Maging una!" },
  levels: { "1": "Baguhan", "2": "Bagong Salta", "3": "Mang-aawit", "4": "Vocalista", "5": "Performer", "6": "Bituin", "10": "Superstar", "15": "Champion", "20": "Grand Master", "30": "Alamat" },
};

const id: GamificationTranslations = {
  xp: { title: "Progresmu", level: "Level", weekly: "Minggu Ini", streak: "Seri", day: "hari", days: "hari", totalXP: "Total XP", progress: "Progres" },
  badges: { title: "Lencana", earned: "Didapat", locked: "Terkunci", first_song: "Lagu Pertama", song_5: "5 Lagu", song_10: "10 Lagu", song_25: "25 Lagu", song_50: "50 Lagu", song_100: "100 Lagu", battle_winner: "Pemenang", battle_5_wins: "5 Kemenangan", battle_champ: "Juara", duet_star: "Bintang Duet", party_host: "Tuan Rumah", party_regular: "Pelanggan Tetap", streak_3: "Seri 3 Hari", streak_7: "Seri 7 Hari", streak_30: "Seri 30 Hari", level_5: "Level 5", level_10: "Level 10", level_20: "Level 20", social_butterfly: "Kupu-kupu Sosial", xp_1000: "Klub 1K", xp_10000: "Klub 10K", xp_50000: "Klub 50K" },
  achievements: { title: "Pencapaian", songs_created: "Buat 100 karaoke", battles_won: "Menang 50 pertarungan", duets_sung: "Nyanyikan 25 duet", parties_hosted: "Adakan 20 pesta", parties_joined: "Ikuti 50 pesta", clips_shared: "Bagikan 30 klip", login_streak: "Login 30 hari berturut", total_xp: "Raih 10.000 XP" },
  leaderboard: { title: "Peringkat XP", allTime: "Sepanjang Waktu", thisWeek: "Minggu Ini", rank: "Peringkat", yourRank: "Peringkatmu", empty: "Belum ada siapa pun. Jadilah yang pertama!" },
  levels: { "1": "Pemula", "2": "Baru", "3": "Penyanyi", "4": "Vokalis", "5": "Performer", "6": "Bintang", "10": "Superstar", "15": "Juara", "20": "Grand Master", "30": "Legenda" },
};

export const GAMIFICATION_LANGS: Record<string, GamificationTranslations> = {
  he, en, ar, ru, es, fr, de, pt, it, ja, ko, zh, tr, vi, tl, id,
};
