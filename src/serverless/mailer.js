import nodemailer from "nodemailer";

export function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function createTransporter() {
  if (globalThis.__MAILER_TRANSPORT__) return globalThis.__MAILER_TRANSPORT__;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) throw new Error("Missing SMTP/EMAIL credentials in environment");

  const commonPool = {
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
    // Timeouts to avoid long-hanging connections
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  };
  const transport = host
    ? nodemailer.createTransport({
        host,
        port: port || (secure ? 465 : 587),
        secure,
        auth: { user, pass },
        ...commonPool,
      })
    : nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
        ...commonPool,
      });

  // Cache across warm invocations
  globalThis.__MAILER_TRANSPORT__ = transport;
  return transport;
}

function withTimeout(promise, ms, onTimeout) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      try { onTimeout && onTimeout(); } catch {}
      reject(new Error(`Email send timed out after ${ms}ms`));
    }, ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }).catch((e) => { clearTimeout(t); reject(e); });
  });
}

// Unified send that can route via Resend API when RESEND_API_KEY is present.
export async function sendMail(mailOptions) {
  const fromAddress = process.env.FROM_ADDRESS || mailOptions.from;
  const toAddress = mailOptions.to;
  const subject = mailOptions.subject;
  const html = mailOptions.html;
  const replyTo = mailOptions.replyTo;

  if (process.env.RESEND_API_KEY) {
    try {
      const controller = new AbortController();
      const res = await withTimeout(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: Array.isArray(toAddress) ? toAddress : [toAddress],
            subject,
            html,
            reply_to: replyTo?.address || undefined,
          }),
          signal: controller.signal,
        }),
        15_000,
        () => controller.abort()
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Resend API error: ${res.status} ${res.statusText} ${text}`.trim());
      }
      return;
    } catch (err) {
      // Fallback to SMTP if Resend fails
      try {
        const transporter = createTransporter();
        await withTimeout(transporter.sendMail({ ...mailOptions, from: fromAddress }), 15_000);
        return;
      } catch (err2) {
        throw err2;
      }
    }
  }

  const transporter = createTransporter();
  await withTimeout(transporter.sendMail({ ...mailOptions, from: fromAddress }), 15_000);
}
