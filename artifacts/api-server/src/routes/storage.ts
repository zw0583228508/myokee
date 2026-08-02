import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";
import { query } from "../db";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

// NOTE: the `recordings` table is created by runMigrations() at server startup
// (src/migrate.ts) — no per-request table creation needed here.

router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });

  const { name, size, contentType, songName, jobId } = req.body || {};
  if (!name || !contentType) {
    res.status(400).json({ error: "Missing required fields: name, contentType" });
    return;
  }

  try {
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

    const user = req.user as any;
    await query(
      `INSERT INTO recordings (user_id, song_name, job_id, object_path, file_name, content_type, size_bytes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [user.id, songName || name || "", jobId || "", objectPath, name, contentType, size || 0]
    );

    res.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

router.get("/storage/recordings", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  const user = req.user as any;

  try {
    const result = await query(
      `SELECT * FROM recordings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching recordings:", error);
    res.status(500).json({ error: "Failed to fetch recordings" });
  }
});

router.delete("/storage/recordings/:id", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  const user = req.user as any;

  try {
    const result = await query(
      `DELETE FROM recordings WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Recording not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting recording:", error);
    res.status(500).json({ error: "Failed to delete recording" });
  }
});

router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const response = await objectStorageService.downloadObject(file);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Error serving public object:", error);
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

router.get("/storage/objects/*path", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  const user = req.user as any;

  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;

    const ownerCheck = await query(
      `SELECT id FROM recordings WHERE object_path = $1 AND user_id = $2 LIMIT 1`,
      [objectPath, user.id]
    );
    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);

    const response = await objectStorageService.downloadObject(objectFile);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Error serving object:", error);
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
