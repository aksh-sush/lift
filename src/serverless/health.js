export function getHealth() {
  return {
    ok: true,
    uptime: typeof process?.uptime === 'function' ? process.uptime() : null,
    node: typeof process?.version === 'string' ? process.version : null,
    timestamp: new Date().toISOString(),
  };
}

