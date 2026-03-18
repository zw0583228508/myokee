import { Router } from "express";
import type { Request, Response } from "express";
import { storage } from "../storage";
import crypto from "crypto";

const router = Router();

function generateRoomId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function authRequired(req: Request, res: Response): any | null {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return user;
}

router.post("/party/rooms", async (req: Request, res: Response) => {
  const user = authRequired(req, res);
  if (!user) return;
  try {
    const { name, theme, settings } = req.body;
    const room = await storage.createPartyRoom({
      id: generateRoomId(),
      code: generateRoomCode(),
      hostUserId: user.id,
      name: name || "Karaoke Party",
      theme: theme || "neon",
      settings: settings || {},
    });
    await storage.joinPartyRoom(room.id, user.id, user.display_name || "Host", "host");
    res.json(room);
  } catch (err) {
    console.error("Error creating party room:", err);
    res.status(500).json({ error: "Failed to create party room" });
  }
});

router.get("/party/rooms/mine", async (req: Request, res: Response) => {
  const user = authRequired(req, res);
  if (!user) return;
  try {
    const rooms = await storage.getHostPartyRooms(user.id);
    res.json(rooms);
  } catch (err) {
    console.error("Error fetching party rooms:", err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

router.get("/party/rooms/:id", async (req: Request, res: Response) => {
  const user = authRequired(req, res);
  if (!user) return;
  try {
    const room = await storage.getPartyRoom(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    const members = await storage.getPartyMembers(room.id);
    const queue = await storage.getQueue(room.id);
    const isHost = room.host_user_id === user.id;
    res.json({ ...room, members, queue, isHost });
  } catch (err) {
    console.error("Error fetching party room:", err);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

router.post("/party/join", async (req: Request, res: Response) => {
  const user = authRequired(req, res);
  if (!user) return;
  try {
    const { code, displayName } = req.body;
    if (!code) return res.status(400).json({ error: "Room code required" });
    const room = await storage.getPartyRoomByCode(code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Room not found or inactive" });
    const role = room.host_user_id === user.id ? "host" : "guest";
    await storage.joinPartyRoom(room.id, user.id, displayName || user.display_name || "Guest", role);
    res.json(room);
  } catch (err) {
    console.error("Error joining party room:", err);
    res.status(500).json({ error: "Failed to join room" });
  }
});

router.get("/party/rooms/:id/members", async (req: Request, res: Response) => {
  const user = authRequired(req, res);
  if (!user) return;
  try {
    const members = await storage.getPartyMembers(req.params.id);
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

router.patch("/party/rooms/:id", async (req: Request, res: Response) => {
  const user = authRequired(req, res);
  if (!user) return;
  try {
    const room = await storage.getPartyRoom(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    if (room.host_user_id !== user.id) return res.status(403).json({ error: "Only host can update room" });
    const updated = await storage.updatePartyRoom(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update room" });
  }
});

router.delete("/party/rooms/:id", async (req: Request, res: Response) => {
  const user = authRequired(req, res);
  if (!user) return;
  try {
    const room = await storage.getPartyRoom(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    if (room.host_user_id !== user.id) return res.status(403).json({ error: "Only host can close room" });
    await storage.updatePartyRoom(req.params.id, { status: "closed" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to close room" });
  }
});

router.post("/party/rooms/:id/queue", async (req: Request, res: Response) => {
  const user = authRequired(req, res);
  if (!user) return;
  try {
    const { jobId, songName, mode, duetPartner, displayName } = req.body;
    if (!songName) return res.status(400).json({ error: "Song name required" });
    const item = await storage.addToQueue({
      roomId: req.params.id,
      jobId,
      userId: user.id,
      displayName: displayName || user.display_name || "Guest",
      songName,
      mode: mode || "solo",
      duetPartner,
    });
    res.json(item);
  } catch (err) {
    console.error("Error adding to queue:", err);
    res.status(500).json({ error: "Failed to add to queue" });
  }
});

router.get("/party/rooms/:id/queue", async (req: Request, res: Response) => {
  const user = authRequired(req, res);
  if (!user) return;
  try {
    const queue = await storage.getQueue(req.params.id);
    res.json(queue);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch queue" });
  }
});

router.delete("/party/rooms/:id/queue/:itemId", async (req: Request, res: Response) => {
  const user = authRequired(req, res);
  if (!user) return;
  try {
    const room = await storage.getPartyRoom(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    const isHost = room.host_user_id === user.id;
    if (!isHost) return res.status(403).json({ error: "Only host can remove items" });
    await storage.removeFromQueue(parseInt(req.params.itemId));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove from queue" });
  }
});

router.put("/party/rooms/:id/queue/:itemId/reorder", async (req: Request, res: Response) => {
  const user = authRequired(req, res);
  if (!user) return;
  try {
    const { direction } = req.body;
    if (direction !== "up" && direction !== "down") return res.status(400).json({ error: "Invalid direction" });
    const room = await storage.getPartyRoom(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    if (room.host_user_id !== user.id) return res.status(403).json({ error: "Only host can reorder" });
    const moved = await storage.reorderQueueItem(req.params.id, parseInt(req.params.itemId), direction);
    if (!moved) return res.status(400).json({ error: "Cannot move item in that direction" });
    const queue = await storage.getQueue(req.params.id);
    res.json(queue);
  } catch (err) {
    console.error("Error reordering queue:", err);
    res.status(500).json({ error: "Failed to reorder queue" });
  }
});

router.post("/party/rooms/:id/next", async (req: Request, res: Response) => {
  const user = authRequired(req, res);
  if (!user) return;
  try {
    const room = await storage.getPartyRoom(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    if (room.host_user_id !== user.id) return res.status(403).json({ error: "Only host can advance queue" });
    const nextId = await storage.advanceQueue(req.params.id);
    const queue = await storage.getQueue(req.params.id);
    res.json({ currentItemId: nextId, queue });
  } catch (err) {
    res.status(500).json({ error: "Failed to advance queue" });
  }
});

router.post("/party/rooms/:id/scores", async (req: Request, res: Response) => {
  const user = authRequired(req, res);
  if (!user) return;
  try {
    const { queueItemId, score, timingScore, pitchScore } = req.body;
    const saved = await storage.savePartyScore({
      roomId: req.params.id,
      queueItemId,
      userId: user.id,
      score: score || 0,
      timingScore: timingScore || 0,
      pitchScore: pitchScore || 0,
    });
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: "Failed to save score" });
  }
});

router.get("/party/rooms/:id/leaderboard", async (req: Request, res: Response) => {
  const user = authRequired(req, res);
  if (!user) return;
  try {
    const leaderboard = await storage.getPartyLeaderboard(req.params.id);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
