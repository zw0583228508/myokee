import app from "./app";
import { runMigrations } from "./migrate";

// Default to port 3001 for development
const rawPort = process.env["PORT"] || "3001";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

runMigrations()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("[migrate] FATAL: migrations failed:", err);
    process.exit(1);
  });
