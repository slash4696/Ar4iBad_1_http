import { cp } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = process.cwd();
const standalone = resolve(root, ".next/standalone");
await cp(resolve(root, "public"), resolve(standalone, "public"), { recursive: true, force: true });
await cp(resolve(root, ".next/static"), resolve(standalone, ".next/static"), { recursive: true, force: true });

const server = spawn(process.execPath, ["server.js"], {
  cwd: standalone,
  env: { ...process.env, HOSTNAME: "127.0.0.1" },
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal));
}
server.on("error", (error) => {
  console.error("Could not start the standalone web server.", error);
  process.exitCode = 1;
});
server.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
