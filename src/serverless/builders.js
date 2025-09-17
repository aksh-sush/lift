import { escapeHtml } from "@/serverless/mailer";

export function buildContactMail({ name, email, phone, message }) {
  return {
    from: process.env.FROM_ADDRESS || `SVS Website <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email ? { name: name?.slice(0, 120) || "Website User", address: String(email) } : undefined,
    subject: "New Contact Form Submission",
    html: `
      <h2>Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace">${escapeHtml(message)}</pre>
    `,
  };
}

export function buildBrochureMail({ name, email, phone, lookingFor }) {
  return {
    from: process.env.FROM_ADDRESS || `SVS Website <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email ? { name: name?.slice(0, 120) || "Website User", address: String(email) } : undefined,
    subject: "New Brochure Request",
    html: `
      <h2>Brochure Request</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      ${email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : ""}
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Looking For:</strong></p>
      <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace">${escapeHtml(lookingFor)}</pre>
    `,
  };
}

export function buildPopupLeadMail({ name, phone, type, productName, lookingFor, email }) {
  const subject =
    type === "quick-quote" ? "Quick Quote Request" :
    type === "brochure" ? "Brochure Request" :
    "Popup Lead";

  const html = `
    <h2>${escapeHtml(subject)}</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    ${email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : ""}
    ${productName ? `<p><strong>Product:</strong> ${escapeHtml(productName)}</p>` : ""}
    ${lookingFor ? `<p><strong>Looking For:</strong> ${escapeHtml(lookingFor)}</p>` : ""}
  `;

  return {
    from: process.env.FROM_ADDRESS || `SVS Website <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email ? { name: name?.slice(0, 120) || "Website User", address: String(email) } : undefined,
    subject,
    html,
  };
}
