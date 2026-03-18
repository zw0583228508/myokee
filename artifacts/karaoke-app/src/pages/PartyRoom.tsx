import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import {
  Music, Users, Trophy, Settings, SkipForward, Plus, Trash2,
  Copy, Check, Monitor, Share2, QrCode, Crown, Mic2,
  Swords, Heart, ArrowLeft, X, Search, Play, Disc3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePartyTranslations } from "@/hooks/use-party-translations";
import {
  usePartyRoom, useAddToQueue, useRemoveFromQueue,
  useAdvanceQueue, useUpdatePartyRoom, useEndParty,
  usePartyLeaderboard,
} from "@/hooks/use-party";
import { getTheme, THEME_LIST } from "@/lib/party-themes";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/contexts/LanguageContext";
import { SocialClip } from "@/components/party/SocialClip";
import { useKaraokeJobs, getDownloadUrls } from "@/hooks/use-karaoke";
import { VideoPlayer } from "@/components/karaoke/VideoPlayer";

export default function PartyRoom() {
  const [, params] = useRoute("/party/:id");
  const [, navigate] = useLocation();
  const roomId = params?.id || null;
  const pt = usePartyTranslations();
  const { t: { dir } } = useLang();
  const { data: authData } = useAuth();
  const userId = authData?.user?.id;

  const { data: room, isLoading } = usePartyRoom(roomId);
  const { data: leaderboard } = usePartyLeaderboard(roomId);

  const addToQueue = useAddToQueue(roomId || "");
  const removeFromQueue = useRemoveFromQueue(roomId || "");
  const advanceQueue = useAdvanceQueue(roomId || "");
  const updateRoom = useUpdatePartyRoom(roomId || "");
  const endParty = useEndParty(roomId || "");

  const { data: myJobs } = useKaraokeJobs();
  const completedJobs = (myJobs || []).filter((j: any) => j.status === "done");

  const [activeTab, setActiveTab] = useState<"queue" | "members" | "leaderboard" | "settings">("queue");
  const [songMode, setSongMode] = useState<"solo" | "duet" | "battle">("solo");
  const [copied, setCopied] = useState(false);
  const [showAddSong, setShowAddSong] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [songSearch, setSongSearch] = useState("");

  const isHost = room?.isHost === true;
  const theme = getTheme(room?.theme || "neon");
  const queue = room?.queue || [];
  const members = room?.members || [];
  const currentItem = queue.find((q: any) => q.status === "singing");
  const waitingQueue = queue.filter((q: any) => q.status === "waiting");
  const doneQueue = queue.filter((q: any) => q.status === "done");

  const filteredJobs = completedJobs.filter((j: any) =>
    !songSearch || j.filename?.toLowerCase().includes(songSearch.toLowerCase())
  );

  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    const msg = pt.room.shareMessage.replace("{code}", room?.code || "");
    const url = `${window.location.origin}/party?code=${room?.code}`;
    if (navigator.share) {
      navigator.share({ title: room?.name, text: msg, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${msg}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddJobToQueue = async (job: any) => {
    await addToQueue.mutateAsync({
      songName: job.filename || "Unknown",
      jobId: job.id,
      mode: songMode,
      displayName: authData?.user?.displayName || "Guest",
    });
    setShowAddSong(false);
    setSongSearch("");
  };

  const handleNextSong = () => advanceQueue.mutate();

  const handleEndParty = async () => {
    await endParty.mutateAsync();
    navigate("/party");
  };

  const currentJobId = currentItem?.job_id;
  const currentVideoUrls = currentJobId ? getDownloadUrls(currentJobId) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-lg">Loading...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-white/60 text-lg">Room not found</p>
        <Button onClick={() => navigate("/party")} variant="outline">
          <ArrowLeft className="w-4 h-4 me-2" />
          {pt.hub.title}
        </Button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg}`} dir={dir}>
      <div className="absolute inset-0 -z-10" style={{ background: theme.bgPattern }} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/party")} className="text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                {theme.emoji} {room.name}
              </h1>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                <span className="font-mono tracking-wider">{room.code}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare} className="text-white/60 hover:text-white">
              <Share2 className="w-5 h-5" />
            </Button>
            {isHost && (
              <Button
                variant="ghost" size="icon"
                onClick={() => window.open(`/party/${roomId}/display`, "_blank")}
                className="text-white/60 hover:text-white"
                title={pt.room.openDisplay}
              >
                <Monitor className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Now Singing Card + Video Player */}
        {currentItem && (
          <Card className={`${theme.card} border ${theme.cardBorder} mb-6 overflow-hidden`}>
            {currentVideoUrls && (
              <div className="w-full aspect-video bg-black">
                <VideoPlayer
                  src={currentVideoUrls.videoUrl}
                  key={currentItem.id}
                  autoPlay
                  onEnded={() => { if (isHost) advanceQueue.mutate(); }}
                />
              </div>
            )}
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shrink-0`}>
                  {currentVideoUrls ? (
                    <Disc3 className="w-6 h-6 text-white animate-spin" style={{ animationDuration: "3s" }} />
                  ) : (
                    <Mic2 className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-primary uppercase tracking-wider mb-0.5">
                    {pt.room.nowSinging}
                  </div>
                  <div className="text-lg font-bold text-white truncate">{currentItem.song_name}</div>
                  <div className="text-sm text-white/50">{currentItem.display_name}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {currentItem.mode === "duet" && <Heart className="w-4 h-4 text-pink-400" />}
                  {currentItem.mode === "battle" && <Swords className="w-4 h-4 text-orange-400" />}
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 capitalize">
                    {pt.room[currentItem.mode as keyof typeof pt.room] || currentItem.mode}
                  </span>
                </div>
              </div>
              {isHost && (
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={handleNextSong}
                    disabled={advanceQueue.isPending}
                    className={`flex-1 gap-2 bg-gradient-to-r ${theme.gradient} hover:opacity-90`}
                  >
                    <SkipForward className="w-4 h-4" />
                    {pt.room.nextSong}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* If no current song and host — start button */}
        {!currentItem && isHost && waitingQueue.length > 0 && (
          <Card className={`${theme.card} border ${theme.cardBorder} mb-6`}>
            <CardContent className="p-5 text-center">
              <Button
                onClick={handleNextSong}
                disabled={advanceQueue.isPending}
                className={`gap-2 bg-gradient-to-r ${theme.gradient} hover:opacity-90 px-8 py-6 text-lg`}
                size="lg"
              >
                <Mic2 className="w-5 h-5" />
                {pt.room.nextSong}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1">
          {(["queue", "members", "leaderboard", ...(isHost ? ["settings" as const] : [])] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === t
                  ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg`
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              {t === "queue" && <Music className="w-4 h-4" />}
              {t === "members" && <Users className="w-4 h-4" />}
              {t === "leaderboard" && <Trophy className="w-4 h-4" />}
              {t === "settings" && <Settings className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {t === "queue" && pt.room.queue}
                {t === "members" && pt.room.members}
                {t === "leaderboard" && pt.room.leaderboard}
                {t === "settings" && pt.room.settings}
              </span>
            </button>
          ))}
        </div>

        {/* Queue Tab */}
        {activeTab === "queue" && (
          <div className="space-y-3">
            <Button
              onClick={() => setShowAddSong(true)}
              className={`w-full gap-2 bg-gradient-to-r ${theme.gradient} hover:opacity-90 py-5`}
            >
              <Plus className="w-5 h-5" />
              {pt.room.addSong}
            </Button>

            {showAddSong && (
              <Card className={`${theme.card} border ${theme.cardBorder}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{pt.room.addToQueue}</span>
                    <button onClick={() => { setShowAddSong(false); setSongSearch(""); }} className="text-white/40 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {(["solo", "duet", "battle"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSongMode(mode)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                          songMode === mode
                            ? `bg-gradient-to-r ${theme.gradient} text-white`
                            : "bg-white/5 text-white/50 hover:text-white/70"
                        }`}
                      >
                        {mode === "solo" && <Mic2 className="w-3.5 h-3.5" />}
                        {mode === "duet" && <Heart className="w-3.5 h-3.5" />}
                        {mode === "battle" && <Swords className="w-3.5 h-3.5" />}
                        {pt.room[mode]}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={songSearch}
                      onChange={(e) => setSongSearch(e.target.value)}
                      placeholder={pt.room.songNamePlaceholder}
                      className="w-full ps-10 pe-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      autoFocus
                    />
                  </div>

                  {completedJobs.length === 0 ? (
                    <div className="text-center py-6">
                      <Music className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-sm text-white/40">{pt.room.noSongs}</p>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-thin">
                      {filteredJobs.length === 0 ? (
                        <p className="text-sm text-white/30 text-center py-4">{pt.room.noResults}</p>
                      ) : (
                        filteredJobs.map((job: any) => (
                          <button
                            key={job.id}
                            onClick={() => handleAddJobToQueue(job)}
                            disabled={addToQueue.isPending}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-primary/30 transition-all text-start"
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center shrink-0`}>
                              <Play className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white truncate" dir="auto">
                                {job.filename}
                              </div>
                              <div className="text-xs text-white/30">
                                {job.duration_seconds
                                  ? `${Math.floor(job.duration_seconds / 60)}:${String(Math.floor(job.duration_seconds % 60)).padStart(2, "0")}`
                                  : ""}
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-white/30 shrink-0" />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {waitingQueue.length === 0 && !currentItem && (
              <div className="text-center py-12">
                <Music className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-lg">{pt.room.emptyQueue}</p>
                <p className="text-white/25 text-sm mt-1">{pt.room.emptyQueueHint}</p>
              </div>
            )}

            {waitingQueue.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 px-1">
                  {pt.room.upNext}
                </h3>
                <div className="space-y-2">
                  {waitingQueue.map((item: any, idx: number) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${theme.card} border ${theme.cardBorder}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-white/60">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{item.song_name}</div>
                        <div className="text-xs text-white/40 flex items-center gap-2">
                          <span>{item.display_name}</span>
                          {item.user_id === userId && (
                            <span className="text-primary text-[10px]">({pt.room.you})</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.job_id && (
                          <Disc3 className="w-3.5 h-3.5 text-green-400/60" />
                        )}
                        {item.mode !== "solo" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 capitalize">
                            {pt.room[item.mode as keyof typeof pt.room] || item.mode}
                          </span>
                        )}
                        {isHost && (
                          <button
                            onClick={() => removeFromQueue.mutate(item.id)}
                            className="text-white/30 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doneQueue.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-2 px-1">
                  {pt.room.done}
                </h3>
                <div className="space-y-1">
                  {doneQueue.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg opacity-40">
                      <Check className="w-4 h-4 text-green-400/60" />
                      <span className="text-sm text-white/50 truncate">{item.song_name}</span>
                      <span className="text-xs text-white/30 ms-auto">{item.display_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-2">
            {members.length === 0 ? (
              <div className="text-center py-12 text-white/40">{pt.room.noMembers}</div>
            ) : (
              members.map((member: any) => (
                <div
                  key={member.user_id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${theme.card} border ${theme.cardBorder}`}
                >
                  {member.picture ? (
                    <img src={member.picture} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      {member.display_name}
                      {member.user_id === userId && (
                        <span className="text-[10px] text-primary">({pt.room.you})</span>
                      )}
                    </div>
                    <div className="text-xs text-white/40 capitalize flex items-center gap-1">
                      {member.role === "host" && <Crown className="w-3 h-3 text-yellow-400" />}
                      {member.role === "host" ? pt.room.host : pt.room.guest}
                    </div>
                  </div>
                </div>
              ))
            )}

            <Card className={`${theme.card} border ${theme.cardBorder} mt-4`}>
              <CardContent className="p-4 text-center space-y-3">
                <QrCode className="w-16 h-16 text-white/20 mx-auto" />
                <p className="text-sm text-white/50">{pt.room.scanQr}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-bold text-white tracking-[0.3em]">{room.code}</span>
                  <button onClick={handleCopyCode} className="text-white/40 hover:text-white">
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div>
            {(!leaderboard || leaderboard.length === 0) ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">{pt.display.partyLeaderboard}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry: any, idx: number) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${theme.card} border ${theme.cardBorder} ${
                      idx === 0 ? "ring-2 ring-yellow-400/30" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      idx === 0 ? "bg-yellow-500/20 text-yellow-400" :
                      idx === 1 ? "bg-gray-400/20 text-gray-300" :
                      idx === 2 ? "bg-orange-500/20 text-orange-400" :
                      "bg-white/10 text-white/50"
                    }`}>
                      {idx + 1}
                    </div>
                    {entry.picture ? (
                      <img src={entry.picture} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                        {(entry.display_name || "?")[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{entry.display_name}</div>
                      <div className="text-xs text-white/40">
                        {entry.songs_sung} {pt.display.songsSung.toLowerCase()}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-lg font-bold text-white">{entry.total_score}</div>
                      <div className="text-[10px] text-white/30">{pt.display.bestScore}: {entry.best_score}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <SocialClip roomName={room.name} theme={theme} leaderboard={leaderboard || []} />
          </div>
        )}

        {/* Settings Tab (host only) */}
        {activeTab === "settings" && isHost && (
          <div className="space-y-4">
            <Card className={`${theme.card} border ${theme.cardBorder}`}>
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-medium text-white">{pt.room.changeTheme}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {THEME_LIST.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateRoom.mutate({ theme: t.id })}
                      className={`p-3 rounded-xl border-2 transition-all text-start ${
                        room.theme === t.id
                          ? "border-primary bg-primary/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <span className="text-xl">{t.emoji}</span>
                      <div className="text-xs font-medium text-white mt-1">
                        {pt.themes[t.id as keyof typeof pt.themes]}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-950/30 border border-red-500/20">
              <CardContent className="p-4">
                {showEndConfirm ? (
                  <div className="space-y-3">
                    <p className="text-sm text-red-300">{pt.room.endPartyConfirm}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleEndParty}
                        disabled={endParty.isPending}
                      >
                        {pt.room.yes}
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setShowEndConfirm(false)}>
                        {pt.room.no}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowEndConfirm(true)}
                  >
                    {pt.room.endParty}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
