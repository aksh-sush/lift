export function getRequestId(headers) {
  const reqId =
    headers.get("x-request-id") ||
    headers.get("x-vercel-id") ||
    headers.get("x-amzn-trace-id") ||
    headers.get("cf-ray") ||
    null;
  if (reqId) return reqId;
  const rand = Math.random().toString(36).slice(2, 10);
  return `svs-${Date.now().toString(36)}-${rand}`;
}

export function logInfo(event, data = {}) {
  try {
    // Ensure safe logging without sensitive body fields
    console.log(JSON.stringify({ t: new Date().toISOString(), level: "info", event, ...data }));
  } catch {}
}

export function logError(event, data = {}) {
  try {
    const safe = { ...data };
    if (safe.error instanceof Error) safe.error = safe.error.message;
    console.error(JSON.stringify({ t: new Date().toISOString(), level: "error", event, ...safe }));
  } catch {}
}

