import type { SupportedLang } from "./LanguageContext";

export interface PartyTranslations {
  hub: {
    title: string;
    subtitle: string;
    createParty: string;
    joinParty: string;
    partyName: string;
    partyNamePlaceholder: string;
    selectTheme: string;
    enterCode: string;
    codePlaceholder: string;
    join: string;
    create: string;
    yourDisplayName: string;
    recentParties: string;
    noParties: string;
    active: string;
    closed: string;
    rejoin: string;
  };
  room: {
    partyCode: string;
    shareCode: string;
    copied: string;
    scanQr: string;
    guests: string;
    queue: string;
    leaderboard: string;
    settings: string;
    addSong: string;
    addToQueue: string;
    songName: string;
    songNamePlaceholder: string;
    nowSinging: string;
    upNext: string;
    emptyQueue: string;
    emptyQueueHint: string;
    nextSong: string;
    endParty: string;
    endPartyConfirm: string;
    yes: string;
    no: string;
    host: string;
    guest: string;
    waiting: string;
    singing: string;
    done: string;
    remove: string;
    you: string;
    members: string;
    noMembers: string;
    changeTheme: string;
    solo: string;
    duet: string;
    battle: string;
    selectMode: string;
    duetPartner: string;
    selectPartner: string;
    liveDisplay: string;
    openDisplay: string;
    shareParty: string;
    shareMessage: string;
    noSongs: string;
    noResults: string;
  };
  display: {
    nextUp: string;
    noOneSinging: string;
    waitingForHost: string;
    queueEmpty: string;
    addSongsHint: string;
    partyLeaderboard: string;
    totalScore: string;
    songsSung: string;
    bestScore: string;
  };
  battle: {
    title: string;
    vs: string;
    ready: string;
    winner: string;
    draw: string;
    score: string;
    timing: string;
    pitch: string;
    battleResult: string;
    playAgain: string;
    challenger: string;
    defender: string;
  };
  duet: {
    title: string;
    singerA: string;
    singerB: string;
    yourTurn: string;
    partnerTurn: string;
    together: string;
  };
  social: {
    shareClip: string;
    shareScore: string;
    download: string;
    shareWhatsApp: string;
    shareTwitter: string;
    copyLink: string;
    copied: string;
    myScore: string;
    atParty: string;
    singWith: string;
  };
  themes: {
    neon: string;
    birthday: string;
    retro: string;
    elegant: string;
    ocean: string;
  };
}

export const PARTY_LANGS: Record<SupportedLang, PartyTranslations> = {
  he: {
    hub: {
      title: "מסיבת קריוקי",
      subtitle: "צרו מסיבה או הצטרפו לאחת קיימת",
      createParty: "צור מסיבה חדשה",
      joinParty: "הצטרף למסיבה",
      partyName: "שם המסיבה",
      partyNamePlaceholder: "מסיבת הקריוקי שלי",
      selectTheme: "בחר ערכת עיצוב",
      enterCode: "הכנס קוד מסיבה",
      codePlaceholder: "ABC123",
      join: "הצטרף",
      create: "צור מסיבה",
      yourDisplayName: "השם שלך במסיבה",
      recentParties: "המסיבות שלי",
      noParties: "עדיין לא יצרת מסיבות",
      active: "פעילה",
      closed: "נסגרה",
      rejoin: "חזור למסיבה",
    },
    room: {
      partyCode: "קוד המסיבה",
      shareCode: "שתף קוד",
      copied: "הועתק!",
      scanQr: "סרקו QR להצטרפות",
      guests: "אורחים",
      queue: "תור שירים",
      leaderboard: "טבלת ניקוד",
      settings: "הגדרות",
      addSong: "הוסף שיר",
      addToQueue: "הוסף לתור",
      songName: "שם השיר",
      songNamePlaceholder: "הכנס שם שיר...",
      nowSinging: "שרים עכשיו",
      upNext: "הבא בתור",
      emptyQueue: "התור ריק",
      emptyQueueHint: "הוסיפו שירים כדי להתחיל!",
      nextSong: "שיר הבא",
      endParty: "סיים מסיבה",
      endPartyConfirm: "בטוח שרוצה לסיים את המסיבה?",
      yes: "כן",
      no: "לא",
      host: "מארגן",
      guest: "אורח",
      waiting: "ממתין",
      singing: "שר",
      done: "הושלם",
      remove: "הסר",
      you: "אתה",
      members: "משתתפים",
      noMembers: "אין משתתפים עדיין",
      changeTheme: "שנה עיצוב",
      solo: "סולו",
      duet: "דואט",
      battle: "באטל",
      selectMode: "בחר מצב",
      duetPartner: "שותף לדואט",
      selectPartner: "בחר שותף",
      liveDisplay: "מסך תצוגה",
      openDisplay: "פתח תצוגה למסך גדול",
      shareParty: "שתף מסיבה",
      shareMessage: "הצטרפו למסיבת הקריוקי שלי ב-MYOUKEE! קוד: {code}",
      noSongs: "עדיין אין שירים מוכנים. צרו קריוקי קודם!",
      noResults: "לא נמצאו שירים",
    },
    display: {
      nextUp: "הבא בתור",
      noOneSinging: "אף אחד לא שר כרגע",
      waitingForHost: "ממתין למארגן...",
      queueEmpty: "התור ריק",
      addSongsHint: "הוסיפו שירים לתור מהטלפון",
      partyLeaderboard: "טבלת ניקוד",
      totalScore: "ניקוד כולל",
      songsSung: "שירים שהושרו",
      bestScore: "ניקוד הכי גבוה",
    },
    battle: {
      title: "באטל קריוקי",
      vs: "נגד",
      ready: "מוכנים?",
      winner: "מנצח!",
      draw: "תיקו!",
      score: "ניקוד",
      timing: "תזמון",
      pitch: "גובה צליל",
      battleResult: "תוצאת הבאטל",
      playAgain: "שחק שוב",
      challenger: "מתחרה",
      defender: "מגן",
    },
    duet: {
      title: "דואט",
      singerA: "זמר א׳",
      singerB: "זמר ב׳",
      yourTurn: "התור שלך!",
      partnerTurn: "התור של השותף",
      together: "ביחד!",
    },
    social: {
      shareClip: "שתף קליפ",
      shareScore: "שתף ניקוד",
      download: "הורד",
      shareWhatsApp: "שתף בוואטסאפ",
      shareTwitter: "שתף בטוויטר",
      copyLink: "העתק קישור",
      copied: "הועתק!",
      myScore: "הניקוד שלי",
      atParty: "במסיבת קריוקי",
      singWith: "בואו לשיר איתי ב-MYOUKEE!",
    },
    themes: {
      neon: "לילה ניאון",
      birthday: "מסיבת יומולדת",
      retro: "רטרו",
      elegant: "אלגנטי זהב",
      ocean: "גלי ים",
    },
  },

  en: {
    hub: {
      title: "Karaoke Party",
      subtitle: "Create a party or join an existing one",
      createParty: "Create New Party",
      joinParty: "Join a Party",
      partyName: "Party Name",
      partyNamePlaceholder: "My Karaoke Party",
      selectTheme: "Select Theme",
      enterCode: "Enter Party Code",
      codePlaceholder: "ABC123",
      join: "Join",
      create: "Create Party",
      yourDisplayName: "Your Display Name",
      recentParties: "My Parties",
      noParties: "You haven't created any parties yet",
      active: "Active",
      closed: "Closed",
      rejoin: "Rejoin",
    },
    room: {
      partyCode: "Party Code",
      shareCode: "Share Code",
      copied: "Copied!",
      scanQr: "Scan QR to join",
      guests: "Guests",
      queue: "Song Queue",
      leaderboard: "Leaderboard",
      settings: "Settings",
      addSong: "Add Song",
      addToQueue: "Add to Queue",
      songName: "Song Name",
      songNamePlaceholder: "Enter song name...",
      nowSinging: "Now Singing",
      upNext: "Up Next",
      emptyQueue: "Queue is empty",
      emptyQueueHint: "Add songs to get started!",
      nextSong: "Next Song",
      endParty: "End Party",
      endPartyConfirm: "Are you sure you want to end the party?",
      yes: "Yes",
      no: "No",
      host: "Host",
      guest: "Guest",
      waiting: "Waiting",
      singing: "Singing",
      done: "Done",
      remove: "Remove",
      you: "You",
      members: "Members",
      noMembers: "No members yet",
      changeTheme: "Change Theme",
      solo: "Solo",
      duet: "Duet",
      battle: "Battle",
      selectMode: "Select Mode",
      duetPartner: "Duet Partner",
      selectPartner: "Select Partner",
      liveDisplay: "Live Display",
      openDisplay: "Open display for big screen",
      shareParty: "Share Party",
      shareMessage: "Join my karaoke party on MYOUKEE! Code: {code}",
      noSongs: "No songs ready yet. Create a karaoke first!",
      noResults: "No songs found",
    },
    display: {
      nextUp: "Next Up",
      noOneSinging: "No one is singing right now",
      waitingForHost: "Waiting for host...",
      queueEmpty: "Queue is empty",
      addSongsHint: "Add songs from your phone",
      partyLeaderboard: "Party Leaderboard",
      totalScore: "Total Score",
      songsSung: "Songs Sung",
      bestScore: "Best Score",
    },
    battle: {
      title: "Karaoke Battle",
      vs: "VS",
      ready: "Ready?",
      winner: "Winner!",
      draw: "It's a draw!",
      score: "Score",
      timing: "Timing",
      pitch: "Pitch",
      battleResult: "Battle Result",
      playAgain: "Play Again",
      challenger: "Challenger",
      defender: "Defender",
    },
    duet: {
      title: "Duet",
      singerA: "Singer A",
      singerB: "Singer B",
      yourTurn: "Your turn!",
      partnerTurn: "Partner's turn",
      together: "Together!",
    },
    social: {
      shareClip: "Share Clip",
      shareScore: "Share Score",
      download: "Download",
      shareWhatsApp: "Share on WhatsApp",
      shareTwitter: "Share on Twitter",
      copyLink: "Copy Link",
      copied: "Copied!",
      myScore: "My Score",
      atParty: "at Karaoke Party",
      singWith: "Come sing with me on MYOUKEE!",
    },
    themes: {
      neon: "Neon Night",
      birthday: "Birthday Bash",
      retro: "Retro Vibes",
      elegant: "Elegant Gold",
      ocean: "Ocean Wave",
    },
  },

  ar: {
    hub: {
      title: "حفلة كاريوكي",
      subtitle: "أنشئ حفلة أو انضم إلى واحدة",
      createParty: "إنشاء حفلة جديدة",
      joinParty: "الانضمام لحفلة",
      partyName: "اسم الحفلة",
      partyNamePlaceholder: "حفلة الكاريوكي الخاصة بي",
      selectTheme: "اختر السمة",
      enterCode: "أدخل رمز الحفلة",
      codePlaceholder: "ABC123",
      join: "انضم",
      create: "إنشاء حفلة",
      yourDisplayName: "اسمك في الحفلة",
      recentParties: "حفلاتي",
      noParties: "لم تنشئ أي حفلات بعد",
      active: "نشطة",
      closed: "مغلقة",
      rejoin: "إعادة الانضمام",
    },
    room: {
      partyCode: "رمز الحفلة",
      shareCode: "مشاركة الرمز",
      copied: "تم النسخ!",
      scanQr: "امسح QR للانضمام",
      guests: "الضيوف",
      queue: "قائمة الأغاني",
      leaderboard: "لوحة النتائج",
      settings: "الإعدادات",
      addSong: "إضافة أغنية",
      addToQueue: "إضافة للقائمة",
      songName: "اسم الأغنية",
      songNamePlaceholder: "أدخل اسم الأغنية...",
      nowSinging: "يغني الآن",
      upNext: "التالي",
      emptyQueue: "القائمة فارغة",
      emptyQueueHint: "أضف أغاني للبدء!",
      nextSong: "الأغنية التالية",
      endParty: "إنهاء الحفلة",
      endPartyConfirm: "هل أنت متأكد من إنهاء الحفلة?",
      yes: "نعم",
      no: "لا",
      host: "المضيف",
      guest: "ضيف",
      waiting: "بالانتظار",
      singing: "يغني",
      done: "انتهى",
      remove: "إزالة",
      you: "أنت",
      members: "الأعضاء",
      noMembers: "لا يوجد أعضاء بعد",
      changeTheme: "تغيير السمة",
      solo: "منفرد",
      duet: "ثنائي",
      battle: "مبارزة",
      selectMode: "اختر الوضع",
      duetPartner: "شريك الثنائي",
      selectPartner: "اختر شريك",
      liveDisplay: "شاشة العرض",
      openDisplay: "فتح العرض للشاشة الكبيرة",
      shareParty: "مشاركة الحفلة",
      shareMessage: "انضموا لحفلة الكاريوكي على MYOUKEE! الرمز: {code}",
      noSongs: "لا توجد أغاني جاهزة بعد. أنشئ كاريوكي أولاً!",
      noResults: "لم يتم العثور على أغاني",
    },
    display: {
      nextUp: "التالي",
      noOneSinging: "لا أحد يغني الآن",
      waitingForHost: "بانتظار المضيف...",
      queueEmpty: "القائمة فارغة",
      addSongsHint: "أضف أغاني من هاتفك",
      partyLeaderboard: "لوحة نتائج الحفلة",
      totalScore: "النتيجة الكلية",
      songsSung: "الأغاني المغناة",
      bestScore: "أفضل نتيجة",
    },
    battle: { title: "مبارزة كاريوكي", vs: "ضد", ready: "مستعد؟", winner: "فائز!", draw: "تعادل!", score: "النتيجة", timing: "التوقيت", pitch: "النغمة", battleResult: "نتيجة المبارزة", playAgain: "العب مرة أخرى", challenger: "المتحدي", defender: "المدافع" },
    duet: { title: "ثنائي", singerA: "المغني أ", singerB: "المغني ب", yourTurn: "دورك!", partnerTurn: "دور الشريك", together: "معاً!" },
    social: { shareClip: "مشاركة مقطع", shareScore: "مشاركة النتيجة", download: "تحميل", shareWhatsApp: "مشاركة واتساب", shareTwitter: "مشاركة تويتر", copyLink: "نسخ الرابط", copied: "تم النسخ!", myScore: "نتيجتي", atParty: "في حفلة كاريوكي", singWith: "تعالوا غنوا معي على MYOUKEE!" },
    themes: { neon: "ليل نيون", birthday: "حفلة عيد ميلاد", retro: "ريترو", elegant: "ذهبي أنيق", ocean: "موجة المحيط" },
  },

  ru: {
    hub: {
      title: "Караоке-вечеринка",
      subtitle: "Создайте вечеринку или присоединитесь",
      createParty: "Создать вечеринку",
      joinParty: "Присоединиться",
      partyName: "Название вечеринки",
      partyNamePlaceholder: "Моя караоке-вечеринка",
      selectTheme: "Выбрать тему",
      enterCode: "Введите код вечеринки",
      codePlaceholder: "ABC123",
      join: "Войти",
      create: "Создать",
      yourDisplayName: "Ваше имя на вечеринке",
      recentParties: "Мои вечеринки",
      noParties: "Вы ещё не создавали вечеринок",
      active: "Активная",
      closed: "Закрыта",
      rejoin: "Вернуться",
    },
    room: {
      partyCode: "Код вечеринки", shareCode: "Поделиться кодом", copied: "Скопировано!", scanQr: "Сканируйте QR", guests: "Гости", queue: "Очередь песен", leaderboard: "Таблица лидеров", settings: "Настройки", addSong: "Добавить песню", addToQueue: "Добавить в очередь", songName: "Название песни", songNamePlaceholder: "Введите название...", nowSinging: "Сейчас поёт", upNext: "Следующий", emptyQueue: "Очередь пуста", emptyQueueHint: "Добавьте песни!", nextSong: "Следующая песня", endParty: "Завершить", endPartyConfirm: "Вы уверены?", yes: "Да", no: "Нет", host: "Хост", guest: "Гость", waiting: "Ожидание", singing: "Поёт", done: "Готово", remove: "Удалить", you: "Вы", members: "Участники", noMembers: "Пока нет участников", changeTheme: "Сменить тему", solo: "Соло", duet: "Дуэт", battle: "Баттл", selectMode: "Выбрать режим", duetPartner: "Партнёр для дуэта", selectPartner: "Выбрать партнёра", liveDisplay: "Экран", openDisplay: "Открыть на большом экране", shareParty: "Поделиться", shareMessage: "Присоединяйтесь к моей караоке-вечеринке на MYOUKEE! Код: {code}", noSongs: "Нет готовых песен. Сначала создайте караоке!", noResults: "Песни не найдены",
    },
    display: { nextUp: "Следующий", noOneSinging: "Никто не поёт", waitingForHost: "Ожидание хоста...", queueEmpty: "Очередь пуста", addSongsHint: "Добавьте песни с телефона", partyLeaderboard: "Таблица лидеров", totalScore: "Общий счёт", songsSung: "Спето песен", bestScore: "Лучший результат" },
    battle: { title: "Караоке-баттл", vs: "VS", ready: "Готовы?", winner: "Победитель!", draw: "Ничья!", score: "Счёт", timing: "Тайминг", pitch: "Высота", battleResult: "Результат баттла", playAgain: "Играть снова", challenger: "Претендент", defender: "Защитник" },
    duet: { title: "Дуэт", singerA: "Певец А", singerB: "Певец Б", yourTurn: "Ваш ход!", partnerTurn: "Ход партнёра", together: "Вместе!" },
    social: { shareClip: "Поделиться клипом", shareScore: "Поделиться счётом", download: "Скачать", shareWhatsApp: "WhatsApp", shareTwitter: "Twitter", copyLink: "Копировать ссылку", copied: "Скопировано!", myScore: "Мой счёт", atParty: "на караоке-вечеринке", singWith: "Пойте со мной на MYOUKEE!" },
    themes: { neon: "Неоновая ночь", birthday: "День рождения", retro: "Ретро", elegant: "Золотая элегантность", ocean: "Океанская волна" },
  },

  es: {
    hub: {
      title: "Fiesta de Karaoke",
      subtitle: "Crea una fiesta o únete a una",
      createParty: "Crear Fiesta",
      joinParty: "Unirse a Fiesta",
      partyName: "Nombre de la Fiesta",
      partyNamePlaceholder: "Mi Fiesta de Karaoke",
      selectTheme: "Seleccionar Tema",
      enterCode: "Ingresar Código",
      codePlaceholder: "ABC123",
      join: "Unirse",
      create: "Crear",
      yourDisplayName: "Tu nombre en la fiesta",
      recentParties: "Mis Fiestas",
      noParties: "Aún no has creado fiestas",
      active: "Activa",
      closed: "Cerrada",
      rejoin: "Volver",
    },
    room: {
      partyCode: "Código de Fiesta", shareCode: "Compartir Código", copied: "¡Copiado!", scanQr: "Escanea QR para unirte", guests: "Invitados", queue: "Cola de Canciones", leaderboard: "Clasificación", settings: "Ajustes", addSong: "Agregar Canción", addToQueue: "Agregar a la Cola", songName: "Nombre de la Canción", songNamePlaceholder: "Ingresa nombre...", nowSinging: "Cantando Ahora", upNext: "Siguiente", emptyQueue: "Cola vacía", emptyQueueHint: "¡Agrega canciones!", nextSong: "Siguiente Canción", endParty: "Terminar Fiesta", endPartyConfirm: "¿Seguro que quieres terminar?", yes: "Sí", no: "No", host: "Anfitrión", guest: "Invitado", waiting: "Esperando", singing: "Cantando", done: "Listo", remove: "Eliminar", you: "Tú", members: "Miembros", noMembers: "Sin miembros aún", changeTheme: "Cambiar Tema", solo: "Solo", duet: "Dúo", battle: "Batalla", selectMode: "Seleccionar Modo", duetPartner: "Compañero de Dúo", selectPartner: "Seleccionar Compañero", liveDisplay: "Pantalla en Vivo", openDisplay: "Abrir en pantalla grande", shareParty: "Compartir Fiesta", shareMessage: "¡Únete a mi fiesta de karaoke en MYOUKEE! Código: {code}", noSongs: "No hay canciones listas. ¡Crea un karaoke primero!", noResults: "No se encontraron canciones",
    },
    display: { nextUp: "Siguiente", noOneSinging: "Nadie está cantando", waitingForHost: "Esperando al anfitrión...", queueEmpty: "Cola vacía", addSongsHint: "Agrega canciones desde tu teléfono", partyLeaderboard: "Clasificación de la Fiesta", totalScore: "Puntuación Total", songsSung: "Canciones Cantadas", bestScore: "Mejor Puntuación" },
    battle: { title: "Batalla de Karaoke", vs: "VS", ready: "¿Listos?", winner: "¡Ganador!", draw: "¡Empate!", score: "Puntuación", timing: "Tiempo", pitch: "Tono", battleResult: "Resultado", playAgain: "Jugar de Nuevo", challenger: "Retador", defender: "Defensor" },
    duet: { title: "Dúo", singerA: "Cantante A", singerB: "Cantante B", yourTurn: "¡Tu turno!", partnerTurn: "Turno del compañero", together: "¡Juntos!" },
    social: { shareClip: "Compartir Clip", shareScore: "Compartir Puntuación", download: "Descargar", shareWhatsApp: "WhatsApp", shareTwitter: "Twitter", copyLink: "Copiar Enlace", copied: "¡Copiado!", myScore: "Mi Puntuación", atParty: "en fiesta de karaoke", singWith: "¡Ven a cantar conmigo en MYOUKEE!" },
    themes: { neon: "Noche Neón", birthday: "Fiesta de Cumpleaños", retro: "Retro", elegant: "Dorado Elegante", ocean: "Ola del Mar" },
  },

  fr: {
    hub: {
      title: "Soirée Karaoké",
      subtitle: "Créez une soirée ou rejoignez-en une",
      createParty: "Créer une Soirée",
      joinParty: "Rejoindre",
      partyName: "Nom de la Soirée",
      partyNamePlaceholder: "Ma Soirée Karaoké",
      selectTheme: "Choisir un Thème",
      enterCode: "Entrer le Code",
      codePlaceholder: "ABC123",
      join: "Rejoindre",
      create: "Créer",
      yourDisplayName: "Votre nom",
      recentParties: "Mes Soirées",
      noParties: "Vous n'avez pas encore créé de soirée",
      active: "Active",
      closed: "Fermée",
      rejoin: "Revenir",
    },
    room: {
      partyCode: "Code de Soirée", shareCode: "Partager le Code", copied: "Copié !", scanQr: "Scannez le QR", guests: "Invités", queue: "File d'attente", leaderboard: "Classement", settings: "Paramètres", addSong: "Ajouter une Chanson", addToQueue: "Ajouter à la File", songName: "Nom de la Chanson", songNamePlaceholder: "Entrez le nom...", nowSinging: "Chante Maintenant", upNext: "Suivant", emptyQueue: "File vide", emptyQueueHint: "Ajoutez des chansons !", nextSong: "Chanson Suivante", endParty: "Terminer", endPartyConfirm: "Êtes-vous sûr ?", yes: "Oui", no: "Non", host: "Hôte", guest: "Invité", waiting: "En attente", singing: "Chante", done: "Terminé", remove: "Supprimer", you: "Vous", members: "Membres", noMembers: "Pas encore de membres", changeTheme: "Changer le Thème", solo: "Solo", duet: "Duo", battle: "Battle", selectMode: "Choisir le Mode", duetPartner: "Partenaire de Duo", selectPartner: "Choisir un Partenaire", liveDisplay: "Écran en Direct", openDisplay: "Ouvrir sur grand écran", shareParty: "Partager", shareMessage: "Rejoignez ma soirée karaoké sur MYOUKEE ! Code : {code}", noSongs: "Pas de chansons prêtes. Créez un karaoké d'abord !", noResults: "Aucune chanson trouvée",
    },
    display: { nextUp: "Suivant", noOneSinging: "Personne ne chante", waitingForHost: "En attente de l'hôte...", queueEmpty: "File vide", addSongsHint: "Ajoutez des chansons depuis votre téléphone", partyLeaderboard: "Classement de la Soirée", totalScore: "Score Total", songsSung: "Chansons Chantées", bestScore: "Meilleur Score" },
    battle: { title: "Battle Karaoké", vs: "VS", ready: "Prêts ?", winner: "Gagnant !", draw: "Égalité !", score: "Score", timing: "Timing", pitch: "Tonalité", battleResult: "Résultat", playAgain: "Rejouer", challenger: "Challenger", defender: "Défenseur" },
    duet: { title: "Duo", singerA: "Chanteur A", singerB: "Chanteur B", yourTurn: "À vous !", partnerTurn: "Tour du partenaire", together: "Ensemble !" },
    social: { shareClip: "Partager le Clip", shareScore: "Partager le Score", download: "Télécharger", shareWhatsApp: "WhatsApp", shareTwitter: "Twitter", copyLink: "Copier le Lien", copied: "Copié !", myScore: "Mon Score", atParty: "en soirée karaoké", singWith: "Venez chanter avec moi sur MYOUKEE !" },
    themes: { neon: "Nuit Néon", birthday: "Fête d'Anniversaire", retro: "Rétro", elegant: "Or Élégant", ocean: "Vague Océan" },
  },

  de: {
    hub: {
      title: "Karaoke-Party",
      subtitle: "Erstelle eine Party oder tritt einer bei",
      createParty: "Party erstellen",
      joinParty: "Party beitreten",
      partyName: "Party-Name",
      partyNamePlaceholder: "Meine Karaoke-Party",
      selectTheme: "Thema wählen",
      enterCode: "Code eingeben",
      codePlaceholder: "ABC123",
      join: "Beitreten",
      create: "Erstellen",
      yourDisplayName: "Dein Name",
      recentParties: "Meine Partys",
      noParties: "Du hast noch keine Partys erstellt",
      active: "Aktiv",
      closed: "Geschlossen",
      rejoin: "Zurückkehren",
    },
    room: {
      partyCode: "Party-Code", shareCode: "Code teilen", copied: "Kopiert!", scanQr: "QR scannen", guests: "Gäste", queue: "Warteschlange", leaderboard: "Bestenliste", settings: "Einstellungen", addSong: "Lied hinzufügen", addToQueue: "Zur Warteschlange", songName: "Liedname", songNamePlaceholder: "Name eingeben...", nowSinging: "Singt gerade", upNext: "Als Nächstes", emptyQueue: "Warteschlange leer", emptyQueueHint: "Füge Lieder hinzu!", nextSong: "Nächstes Lied", endParty: "Party beenden", endPartyConfirm: "Bist du sicher?", yes: "Ja", no: "Nein", host: "Gastgeber", guest: "Gast", waiting: "Wartet", singing: "Singt", done: "Fertig", remove: "Entfernen", you: "Du", members: "Mitglieder", noMembers: "Noch keine Mitglieder", changeTheme: "Thema ändern", solo: "Solo", duet: "Duett", battle: "Battle", selectMode: "Modus wählen", duetPartner: "Duett-Partner", selectPartner: "Partner wählen", liveDisplay: "Live-Anzeige", openDisplay: "Auf großem Bildschirm", shareParty: "Teilen", shareMessage: "Komm zu meiner Karaoke-Party auf MYOUKEE! Code: {code}", noSongs: "Noch keine Songs bereit. Erstelle zuerst ein Karaoke!", noResults: "Keine Songs gefunden",
    },
    display: { nextUp: "Als Nächstes", noOneSinging: "Niemand singt gerade", waitingForHost: "Warte auf Gastgeber...", queueEmpty: "Warteschlange leer", addSongsHint: "Füge Lieder vom Handy hinzu", partyLeaderboard: "Party-Bestenliste", totalScore: "Gesamtpunktzahl", songsSung: "Lieder gesungen", bestScore: "Beste Punktzahl" },
    battle: { title: "Karaoke-Battle", vs: "VS", ready: "Bereit?", winner: "Gewinner!", draw: "Unentschieden!", score: "Punktzahl", timing: "Timing", pitch: "Tonhöhe", battleResult: "Ergebnis", playAgain: "Nochmal", challenger: "Herausforderer", defender: "Verteidiger" },
    duet: { title: "Duett", singerA: "Sänger A", singerB: "Sänger B", yourTurn: "Du bist dran!", partnerTurn: "Partner ist dran", together: "Zusammen!" },
    social: { shareClip: "Clip teilen", shareScore: "Punktzahl teilen", download: "Herunterladen", shareWhatsApp: "WhatsApp", shareTwitter: "Twitter", copyLink: "Link kopieren", copied: "Kopiert!", myScore: "Meine Punktzahl", atParty: "bei Karaoke-Party", singWith: "Sing mit mir auf MYOUKEE!" },
    themes: { neon: "Neon-Nacht", birthday: "Geburtstagsparty", retro: "Retro", elegant: "Elegantes Gold", ocean: "Ozeanwelle" },
  },

  ja: {
    hub: {
      title: "カラオケパーティー",
      subtitle: "パーティーを作成または参加",
      createParty: "パーティーを作成",
      joinParty: "パーティーに参加",
      partyName: "パーティー名",
      partyNamePlaceholder: "マイカラオケパーティー",
      selectTheme: "テーマを選択",
      enterCode: "コードを入力",
      codePlaceholder: "ABC123",
      join: "参加",
      create: "作成",
      yourDisplayName: "表示名",
      recentParties: "マイパーティー",
      noParties: "まだパーティーを作成していません",
      active: "アクティブ",
      closed: "終了",
      rejoin: "再参加",
    },
    room: {
      partyCode: "パーティーコード", shareCode: "コードを共有", copied: "コピー完了！", scanQr: "QRをスキャン", guests: "ゲスト", queue: "曲順", leaderboard: "ランキング", settings: "設定", addSong: "曲を追加", addToQueue: "キューに追加", songName: "曲名", songNamePlaceholder: "曲名を入力...", nowSinging: "現在歌唱中", upNext: "次の曲", emptyQueue: "キューが空です", emptyQueueHint: "曲を追加しましょう！", nextSong: "次の曲へ", endParty: "パーティー終了", endPartyConfirm: "本当に終了しますか？", yes: "はい", no: "いいえ", host: "ホスト", guest: "ゲスト", waiting: "待機中", singing: "歌唱中", done: "完了", remove: "削除", you: "あなた", members: "メンバー", noMembers: "まだメンバーがいません", changeTheme: "テーマ変更", solo: "ソロ", duet: "デュエット", battle: "バトル", selectMode: "モード選択", duetPartner: "デュエットパートナー", selectPartner: "パートナーを選択", liveDisplay: "ライブディスプレイ", openDisplay: "大画面で表示", shareParty: "共有", shareMessage: "MYOUKEEのカラオケパーティーに参加しよう！コード：{code}", noSongs: "Nenhuma música pronta. Crie um karaokê primeiro!", noResults: "Nenhuma música encontrada",
    },
    display: { nextUp: "次の曲", noOneSinging: "誰も歌っていません", waitingForHost: "ホストを待っています...", queueEmpty: "キューが空です", addSongsHint: "スマホから曲を追加", partyLeaderboard: "パーティーランキング", totalScore: "合計スコア", songsSung: "歌った曲数", bestScore: "最高スコア" },
    battle: { title: "カラオケバトル", vs: "VS", ready: "準備はいい？", winner: "勝者！", draw: "引き分け！", score: "スコア", timing: "タイミング", pitch: "音程", battleResult: "バトル結果", playAgain: "もう一度", challenger: "挑戦者", defender: "防衛者" },
    duet: { title: "デュエット", singerA: "歌手A", singerB: "歌手B", yourTurn: "あなたの番！", partnerTurn: "パートナーの番", together: "一緒に！" },
    social: { shareClip: "クリップを共有", shareScore: "スコアを共有", download: "ダウンロード", shareWhatsApp: "WhatsApp", shareTwitter: "Twitter", copyLink: "リンクをコピー", copied: "コピー完了！", myScore: "マイスコア", atParty: "カラオケパーティーで", singWith: "MYOUKEEで一緒に歌おう！" },
    themes: { neon: "ネオンナイト", birthday: "バースデーパーティー", retro: "レトロ", elegant: "エレガントゴールド", ocean: "オーシャンウェーブ" },
  },

  zh: {
    hub: {
      title: "卡拉OK派对",
      subtitle: "创建或加入一个派对",
      createParty: "创建派对",
      joinParty: "加入派对",
      partyName: "派对名称",
      partyNamePlaceholder: "我的卡拉OK派对",
      selectTheme: "选择主题",
      enterCode: "输入派对代码",
      codePlaceholder: "ABC123",
      join: "加入",
      create: "创建",
      yourDisplayName: "你的显示名",
      recentParties: "我的派对",
      noParties: "你还没有创建过派对",
      active: "活跃",
      closed: "已结束",
      rejoin: "重新加入",
    },
    room: {
      partyCode: "派对代码", shareCode: "分享代码", copied: "已复制！", scanQr: "扫描QR加入", guests: "来宾", queue: "歌曲队列", leaderboard: "排行榜", settings: "设置", addSong: "添加歌曲", addToQueue: "加入队列", songName: "歌曲名称", songNamePlaceholder: "输入歌曲名...", nowSinging: "正在演唱", upNext: "下一首", emptyQueue: "队列为空", emptyQueueHint: "添加歌曲开始吧！", nextSong: "下一首歌", endParty: "结束派对", endPartyConfirm: "确定要结束派对吗？", yes: "是", no: "否", host: "主持人", guest: "来宾", waiting: "等待中", singing: "演唱中", done: "完成", remove: "删除", you: "你", members: "成员", noMembers: "暂无成员", changeTheme: "更换主题", solo: "独唱", duet: "二重唱", battle: "对战", selectMode: "选择模式", duetPartner: "二重唱搭档", selectPartner: "选择搭档", liveDisplay: "实时显示", openDisplay: "在大屏幕上显示", shareParty: "分享派对", shareMessage: "来MYOUKEE参加我的卡拉OK派对！代码：{code}", noSongs: "Nessuna canzone pronta. Crea prima un karaoke!", noResults: "Nessuna canzone trovata",
    },
    display: { nextUp: "下一首", noOneSinging: "暂无人演唱", waitingForHost: "等待主持人...", queueEmpty: "队列为空", addSongsHint: "从手机添加歌曲", partyLeaderboard: "派对排行榜", totalScore: "总分", songsSung: "演唱歌曲数", bestScore: "最佳成绩" },
    battle: { title: "卡拉OK对战", vs: "VS", ready: "准备好了吗？", winner: "赢家！", draw: "平局！", score: "分数", timing: "节拍", pitch: "音准", battleResult: "对战结果", playAgain: "再来一次", challenger: "挑战者", defender: "守方" },
    duet: { title: "二重唱", singerA: "歌手A", singerB: "歌手B", yourTurn: "轮到你了！", partnerTurn: "搭档的回合", together: "一起！" },
    social: { shareClip: "分享片段", shareScore: "分享成绩", download: "下载", shareWhatsApp: "WhatsApp分享", shareTwitter: "Twitter分享", copyLink: "复制链接", copied: "已复制！", myScore: "我的成绩", atParty: "在卡拉OK派对", singWith: "来MYOUKEE和我一起唱歌吧！" },
    themes: { neon: "霓虹之夜", birthday: "生日派对", retro: "复古风", elegant: "典雅金", ocean: "海浪" },
  },

  ko: {
    hub: {
      title: "노래방 파티",
      subtitle: "파티를 만들거나 참가하세요",
      createParty: "파티 만들기",
      joinParty: "파티 참가",
      partyName: "파티 이름",
      partyNamePlaceholder: "내 노래방 파티",
      selectTheme: "테마 선택",
      enterCode: "파티 코드 입력",
      codePlaceholder: "ABC123",
      join: "참가",
      create: "만들기",
      yourDisplayName: "표시 이름",
      recentParties: "내 파티",
      noParties: "아직 파티를 만들지 않았습니다",
      active: "활성",
      closed: "종료",
      rejoin: "다시 참가",
    },
    room: {
      partyCode: "파티 코드", shareCode: "코드 공유", copied: "복사됨!", scanQr: "QR 스캔하여 참가", guests: "게스트", queue: "노래 순서", leaderboard: "순위표", settings: "설정", addSong: "노래 추가", addToQueue: "순서에 추가", songName: "노래 제목", songNamePlaceholder: "노래 제목 입력...", nowSinging: "현재 노래 중", upNext: "다음 순서", emptyQueue: "순서가 비어있습니다", emptyQueueHint: "노래를 추가하세요!", nextSong: "다음 노래", endParty: "파티 종료", endPartyConfirm: "정말 종료하시겠습니까?", yes: "예", no: "아니오", host: "호스트", guest: "게스트", waiting: "대기 중", singing: "노래 중", done: "완료", remove: "삭제", you: "나", members: "멤버", noMembers: "아직 멤버가 없습니다", changeTheme: "테마 변경", solo: "솔로", duet: "듀엣", battle: "배틀", selectMode: "모드 선택", duetPartner: "듀엣 파트너", selectPartner: "파트너 선택", liveDisplay: "라이브 디스플레이", openDisplay: "큰 화면에서 보기", shareParty: "파티 공유", shareMessage: "MYOUKEE에서 노래방 파티에 참가하세요! 코드: {code}", noSongs: "準備できた曲がありません。まずカラオケを作成してください！", noResults: "曲が見つかりません",
    },
    display: { nextUp: "다음 순서", noOneSinging: "아무도 노래하지 않습니다", waitingForHost: "호스트를 기다리는 중...", queueEmpty: "순서가 비어있습니다", addSongsHint: "휴대폰에서 노래를 추가하세요", partyLeaderboard: "파티 순위표", totalScore: "총점", songsSung: "부른 노래 수", bestScore: "최고 점수" },
    battle: { title: "노래방 배틀", vs: "VS", ready: "준비됐나요?", winner: "승자!", draw: "무승부!", score: "점수", timing: "타이밍", pitch: "음정", battleResult: "배틀 결과", playAgain: "다시 하기", challenger: "도전자", defender: "수비자" },
    duet: { title: "듀엣", singerA: "가수 A", singerB: "가수 B", yourTurn: "당신 차례!", partnerTurn: "파트너 차례", together: "함께!" },
    social: { shareClip: "클립 공유", shareScore: "점수 공유", download: "다운로드", shareWhatsApp: "WhatsApp 공유", shareTwitter: "Twitter 공유", copyLink: "링크 복사", copied: "복사됨!", myScore: "내 점수", atParty: "노래방 파티에서", singWith: "MYOUKEE에서 함께 노래해요!" },
    themes: { neon: "네온 나이트", birthday: "생일 파티", retro: "레트로", elegant: "엘레강트 골드", ocean: "오션 웨이브" },
  },

  th: {
    hub: { title: "ปาร์ตี้คาราโอเกะ", subtitle: "สร้างปาร์ตี้หรือเข้าร่วม", createParty: "สร้างปาร์ตี้", joinParty: "เข้าร่วมปาร์ตี้", partyName: "ชื่อปาร์ตี้", partyNamePlaceholder: "ปาร์ตี้คาราโอเกะของฉัน", selectTheme: "เลือกธีม", enterCode: "ใส่รหัสปาร์ตี้", codePlaceholder: "ABC123", join: "เข้าร่วม", create: "สร้าง", yourDisplayName: "ชื่อแสดง", recentParties: "ปาร์ตี้ของฉัน", noParties: "ยังไม่ได้สร้างปาร์ตี้", active: "ใช้งานอยู่", closed: "ปิดแล้ว", rejoin: "เข้าร่วมอีกครั้ง" },
    room: { partyCode: "รหัสปาร์ตี้", shareCode: "แชร์รหัส", copied: "คัดลอกแล้ว!", scanQr: "สแกน QR เพื่อเข้าร่วม", guests: "แขก", queue: "คิวเพลง", leaderboard: "อันดับ", settings: "ตั้งค่า", addSong: "เพิ่มเพลง", addToQueue: "เพิ่มในคิว", songName: "ชื่อเพลง", songNamePlaceholder: "ใส่ชื่อเพลง...", nowSinging: "กำลังร้อง", upNext: "ถัดไป", emptyQueue: "คิวว่าง", emptyQueueHint: "เพิ่มเพลงเลย!", nextSong: "เพลงถัดไป", endParty: "จบปาร์ตี้", endPartyConfirm: "แน่ใจหรือไม่?", yes: "ใช่", no: "ไม่", host: "เจ้าภาพ", guest: "แขก", waiting: "รอ", singing: "กำลังร้อง", done: "เสร็จ", remove: "ลบ", you: "คุณ", members: "สมาชิก", noMembers: "ยังไม่มีสมาชิก", changeTheme: "เปลี่ยนธีม", solo: "เดี่ยว", duet: "คู่", battle: "แบทเทิล", selectMode: "เลือกโหมด", duetPartner: "คู่ดูเอ็ต", selectPartner: "เลือกคู่", liveDisplay: "หน้าจอสด", openDisplay: "เปิดบนจอใหญ่", shareParty: "แชร์ปาร์ตี้", shareMessage: "เข้าร่วมปาร์ตี้คาราโอเกะบน MYOUKEE! รหัส: {code}", noSongs: "준비된 노래가 없습니다. 먼저 노래방을 만드세요!", noResults: "노래를 찾을 수 없습니다" },
    display: { nextUp: "ถัดไป", noOneSinging: "ไม่มีใครกำลังร้อง", waitingForHost: "รอเจ้าภาพ...", queueEmpty: "คิวว่าง", addSongsHint: "เพิ่มเพลงจากโทรศัพท์", partyLeaderboard: "อันดับปาร์ตี้", totalScore: "คะแนนรวม", songsSung: "เพลงที่ร้อง", bestScore: "คะแนนดีที่สุด" },
    battle: { title: "แบทเทิลคาราโอเกะ", vs: "VS", ready: "พร้อมหรือยัง?", winner: "ผู้ชนะ!", draw: "เสมอ!", score: "คะแนน", timing: "จังหวะ", pitch: "เสียง", battleResult: "ผลการแข่ง", playAgain: "เล่นอีกครั้ง", challenger: "ผู้ท้าชิง", defender: "ผู้ป้องกัน" },
    duet: { title: "ดูเอ็ต", singerA: "นักร้อง A", singerB: "นักร้อง B", yourTurn: "ตาคุณ!", partnerTurn: "ตาคู่", together: "ด้วยกัน!" },
    social: { shareClip: "แชร์คลิป", shareScore: "แชร์คะแนน", download: "ดาวน์โหลด", shareWhatsApp: "WhatsApp", shareTwitter: "Twitter", copyLink: "คัดลอกลิงก์", copied: "คัดลอกแล้ว!", myScore: "คะแนนของฉัน", atParty: "ในปาร์ตี้คาราโอเกะ", singWith: "มาร้องเพลงกับฉันบน MYOUKEE!" },
    themes: { neon: "คืนนีออน", birthday: "ปาร์ตี้วันเกิด", retro: "เรโทร", elegant: "ทองหรู", ocean: "คลื่นทะเล" },
  },

  vi: {
    hub: { title: "Tiệc Karaoke", subtitle: "Tạo hoặc tham gia một bữa tiệc", createParty: "Tạo Tiệc", joinParty: "Tham Gia", partyName: "Tên Tiệc", partyNamePlaceholder: "Tiệc Karaoke của tôi", selectTheme: "Chọn Chủ Đề", enterCode: "Nhập Mã", codePlaceholder: "ABC123", join: "Tham Gia", create: "Tạo", yourDisplayName: "Tên hiển thị", recentParties: "Tiệc của tôi", noParties: "Bạn chưa tạo tiệc nào", active: "Hoạt động", closed: "Đã đóng", rejoin: "Quay lại" },
    room: { partyCode: "Mã Tiệc", shareCode: "Chia Sẻ Mã", copied: "Đã sao chép!", scanQr: "Quét QR để tham gia", guests: "Khách", queue: "Hàng đợi", leaderboard: "Bảng xếp hạng", settings: "Cài đặt", addSong: "Thêm Bài", addToQueue: "Thêm vào hàng đợi", songName: "Tên Bài Hát", songNamePlaceholder: "Nhập tên bài...", nowSinging: "Đang Hát", upNext: "Tiếp Theo", emptyQueue: "Hàng đợi trống", emptyQueueHint: "Thêm bài hát nào!", nextSong: "Bài Tiếp", endParty: "Kết Thúc", endPartyConfirm: "Bạn chắc chắn?", yes: "Có", no: "Không", host: "Chủ tiệc", guest: "Khách", waiting: "Đang đợi", singing: "Đang hát", done: "Xong", remove: "Xóa", you: "Bạn", members: "Thành viên", noMembers: "Chưa có thành viên", changeTheme: "Đổi Chủ Đề", solo: "Solo", duet: "Song ca", battle: "Đấu", selectMode: "Chọn Chế Độ", duetPartner: "Bạn song ca", selectPartner: "Chọn bạn hát", liveDisplay: "Màn hình trực tiếp", openDisplay: "Mở trên màn lớn", shareParty: "Chia sẻ tiệc", shareMessage: "Tham gia tiệc karaoke trên MYOUKEE! Mã: {code}", noSongs: "还没有准备好的歌曲。先创建卡拉OK吧！", noResults: "未找到歌曲" },
    display: { nextUp: "Tiếp theo", noOneSinging: "Không ai đang hát", waitingForHost: "Đang đợi chủ tiệc...", queueEmpty: "Hàng đợi trống", addSongsHint: "Thêm bài từ điện thoại", partyLeaderboard: "Bảng xếp hạng tiệc", totalScore: "Tổng điểm", songsSung: "Bài đã hát", bestScore: "Điểm cao nhất" },
    battle: { title: "Đấu Karaoke", vs: "VS", ready: "Sẵn sàng?", winner: "Người thắng!", draw: "Hòa!", score: "Điểm", timing: "Nhịp", pitch: "Cao độ", battleResult: "Kết quả", playAgain: "Chơi lại", challenger: "Thách đấu", defender: "Phòng thủ" },
    duet: { title: "Song Ca", singerA: "Ca sĩ A", singerB: "Ca sĩ B", yourTurn: "Lượt bạn!", partnerTurn: "Lượt bạn hát", together: "Cùng nhau!" },
    social: { shareClip: "Chia sẻ clip", shareScore: "Chia sẻ điểm", download: "Tải xuống", shareWhatsApp: "WhatsApp", shareTwitter: "Twitter", copyLink: "Sao chép link", copied: "Đã sao chép!", myScore: "Điểm của tôi", atParty: "tại tiệc karaoke", singWith: "Hát cùng tôi trên MYOUKEE!" },
    themes: { neon: "Đêm Neon", birthday: "Tiệc Sinh Nhật", retro: "Retro", elegant: "Vàng Sang Trọng", ocean: "Sóng Biển" },
  },

  tl: {
    hub: { title: "Karaoke Party", subtitle: "Gumawa o sumali sa isang party", createParty: "Gumawa ng Party", joinParty: "Sumali sa Party", partyName: "Pangalan ng Party", partyNamePlaceholder: "Aking Karaoke Party", selectTheme: "Pumili ng Tema", enterCode: "Ilagay ang Code", codePlaceholder: "ABC123", join: "Sumali", create: "Gumawa", yourDisplayName: "Display name mo", recentParties: "Mga Party Ko", noParties: "Wala ka pang party", active: "Aktibo", closed: "Sarado", rejoin: "Bumalik" },
    room: { partyCode: "Party Code", shareCode: "I-share ang Code", copied: "Na-copy!", scanQr: "I-scan ang QR", guests: "Mga Bisita", queue: "Pila ng Kanta", leaderboard: "Ranggo", settings: "Settings", addSong: "Magdagdag ng Kanta", addToQueue: "Idagdag sa Pila", songName: "Pangalan ng Kanta", songNamePlaceholder: "Ilagay ang pangalan...", nowSinging: "Kumakanta Ngayon", upNext: "Susunod", emptyQueue: "Walang laman ang pila", emptyQueueHint: "Magdagdag ng kanta!", nextSong: "Susunod na Kanta", endParty: "Tapusin ang Party", endPartyConfirm: "Sigurado ka ba?", yes: "Oo", no: "Hindi", host: "Host", guest: "Bisita", waiting: "Naghihintay", singing: "Kumakanta", done: "Tapos", remove: "Alisin", you: "Ikaw", members: "Mga Miyembro", noMembers: "Wala pang miyembro", changeTheme: "Palitan ang Tema", solo: "Solo", duet: "Duet", battle: "Battle", selectMode: "Pumili ng Mode", duetPartner: "Kasama sa Duet", selectPartner: "Pumili ng Kasama", liveDisplay: "Live Display", openDisplay: "Buksan sa malaking screen", shareParty: "I-share ang Party", shareMessage: "Sumali sa karaoke party ko sa MYOUKEE! Code: {code}", noSongs: "Hazır şarkı yok. Önce bir karaoke oluşturun!", noResults: "Şarkı bulunamadı" },
    display: { nextUp: "Susunod", noOneSinging: "Walang kumakanta", waitingForHost: "Naghihintay sa host...", queueEmpty: "Walang laman ang pila", addSongsHint: "Magdagdag ng kanta mula sa phone", partyLeaderboard: "Party Ranggo", totalScore: "Kabuuang Score", songsSung: "Mga Kantang Naaawit", bestScore: "Pinakamataas na Score" },
    battle: { title: "Karaoke Battle", vs: "VS", ready: "Handa na ba?", winner: "Panalo!", draw: "Tablas!", score: "Score", timing: "Timing", pitch: "Pitch", battleResult: "Resulta ng Battle", playAgain: "Ulitin", challenger: "Challenger", defender: "Defender" },
    duet: { title: "Duet", singerA: "Mang-aawit A", singerB: "Mang-aawit B", yourTurn: "Ikaw na!", partnerTurn: "Turn ng kasama", together: "Sabay!" },
    social: { shareClip: "I-share ang Clip", shareScore: "I-share ang Score", download: "I-download", shareWhatsApp: "WhatsApp", shareTwitter: "Twitter", copyLink: "Kopyahin ang Link", copied: "Na-copy!", myScore: "Score Ko", atParty: "sa karaoke party", singWith: "Kumanta kasama ko sa MYOUKEE!" },
    themes: { neon: "Neon Night", birthday: "Birthday Party", retro: "Retro", elegant: "Elegant Gold", ocean: "Ocean Wave" },
  },

  id: {
    hub: { title: "Pesta Karaoke", subtitle: "Buat atau bergabung ke pesta", createParty: "Buat Pesta", joinParty: "Gabung Pesta", partyName: "Nama Pesta", partyNamePlaceholder: "Pesta Karaoke Saya", selectTheme: "Pilih Tema", enterCode: "Masukkan Kode", codePlaceholder: "ABC123", join: "Gabung", create: "Buat", yourDisplayName: "Nama tampilan", recentParties: "Pesta Saya", noParties: "Anda belum membuat pesta", active: "Aktif", closed: "Ditutup", rejoin: "Kembali" },
    room: { partyCode: "Kode Pesta", shareCode: "Bagikan Kode", copied: "Disalin!", scanQr: "Scan QR untuk bergabung", guests: "Tamu", queue: "Antrian Lagu", leaderboard: "Papan Peringkat", settings: "Pengaturan", addSong: "Tambah Lagu", addToQueue: "Tambah ke Antrian", songName: "Nama Lagu", songNamePlaceholder: "Masukkan nama lagu...", nowSinging: "Sedang Menyanyi", upNext: "Selanjutnya", emptyQueue: "Antrian kosong", emptyQueueHint: "Tambahkan lagu!", nextSong: "Lagu Berikutnya", endParty: "Akhiri Pesta", endPartyConfirm: "Yakin ingin mengakhiri?", yes: "Ya", no: "Tidak", host: "Tuan rumah", guest: "Tamu", waiting: "Menunggu", singing: "Menyanyi", done: "Selesai", remove: "Hapus", you: "Kamu", members: "Anggota", noMembers: "Belum ada anggota", changeTheme: "Ganti Tema", solo: "Solo", duet: "Duet", battle: "Battle", selectMode: "Pilih Mode", duetPartner: "Pasangan Duet", selectPartner: "Pilih Pasangan", liveDisplay: "Layar Langsung", openDisplay: "Buka di layar besar", shareParty: "Bagikan Pesta", shareMessage: "Gabung pesta karaoke saya di MYOUKEE! Kode: {code}", noSongs: "Chưa có bài hát nào sẵn sàng. Hãy tạo karaoke trước!", noResults: "Không tìm thấy bài hát" },
    display: { nextUp: "Selanjutnya", noOneSinging: "Tidak ada yang menyanyi", waitingForHost: "Menunggu tuan rumah...", queueEmpty: "Antrian kosong", addSongsHint: "Tambah lagu dari HP", partyLeaderboard: "Peringkat Pesta", totalScore: "Total Skor", songsSung: "Lagu Dinyanyikan", bestScore: "Skor Terbaik" },
    battle: { title: "Battle Karaoke", vs: "VS", ready: "Siap?", winner: "Pemenang!", draw: "Seri!", score: "Skor", timing: "Timing", pitch: "Nada", battleResult: "Hasil Battle", playAgain: "Main Lagi", challenger: "Penantang", defender: "Bertahan" },
    duet: { title: "Duet", singerA: "Penyanyi A", singerB: "Penyanyi B", yourTurn: "Giliranmu!", partnerTurn: "Giliran pasangan", together: "Bersama!" },
    social: { shareClip: "Bagikan Klip", shareScore: "Bagikan Skor", download: "Unduh", shareWhatsApp: "WhatsApp", shareTwitter: "Twitter", copyLink: "Salin Link", copied: "Disalin!", myScore: "Skor Saya", atParty: "di pesta karaoke", singWith: "Ayo nyanyi bareng di MYOUKEE!" },
    themes: { neon: "Malam Neon", birthday: "Pesta Ulang Tahun", retro: "Retro", elegant: "Emas Elegan", ocean: "Ombak Laut" },
  },
};
