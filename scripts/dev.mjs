/**
 * Dev-server launcher.
 *
 * `next dev` resolves its port from the shell environment before it loads any
 * env file, so a plain `PORT=` in `.env.local` is ignored — Next falls through
 * to 3000 and hunts for the next free port. This loads the env files first and
 * then passes the port to Next explicitly.
 *
 * Precedence: an explicit `--port` / `-p` on the command line wins, then `PORT`
 * from the env files, then Next's own "first available port from 3000".
 *
 * Local only — `build` and `start` don't go through here, so nothing about
 * this affects Vercel.
 */
import { spawn } from "node:child_process";
// `@next/env` is CommonJS, so it has no named ESM exports.
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

// Quiet loader: Next logs the same "Environments:" line once it boots, and
// printing it twice reads like the env was loaded twice.
loadEnvConfig(process.cwd(), true, { info: () => {}, error: console.error });

const forwarded = process.argv.slice(2);
const hasExplicitPort = forwarded.some(
  (arg) => arg === "--port" || arg === "-p" || arg.startsWith("--port="),
);

const port = process.env.PORT?.trim();
const portArgs = port && !hasExplicitPort ? ["--port", port] : [];

const child = spawn(
  "next",
  ["dev", "--webpack", ...portArgs, ...forwarded],
  { stdio: "inherit", shell: process.platform === "win32" },
);

child.on("exit", (code, signal) => {
  // Re-raise the signal rather than exiting 0, so Ctrl-C is reported honestly
  // to whatever launched this.
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
