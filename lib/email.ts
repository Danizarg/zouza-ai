import nodemailer from "nodemailer";

/**
 * Server-only. Sends operational notifications (contact form, waitlist) to
 * the team inbox over SMTP — Namecheap Private Email in production.
 *
 * Follows the same additive pattern as Supabase and the AI layer: if SMTP
 * isn't configured, or a send fails for any reason, the caller's flow still
 * succeeds. A submission is never lost because the mail server was down —
 * it's already persisted by the time this runs.
 */

function isEmailConfigured(): boolean {
  return Boolean(
    process.env.EMAIL_SMTP_HOST &&
      process.env.EMAIL_SMTP_USER &&
      process.env.EMAIL_SMTP_PASS &&
      process.env.EMAIL_NOTIFY_TO,
  );
}

let transporter: nodemailer.Transporter | null | undefined;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter !== undefined) return transporter;
  if (!isEmailConfigured()) {
    transporter = null;
    return transporter;
  }
  const port = Number(process.env.EMAIL_SMTP_PORT ?? 587);
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port,
    // 587 uses STARTTLS (secure:false + upgrade); 465 is implicit TLS.
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_SMTP_USER!,
      pass: process.env.EMAIL_SMTP_PASS!,
    },
  });
  return transporter;
}

/**
 * Fire-and-forget notification to the team inbox. Never throws — returns
 * false if it couldn't send so the caller can log, but callers should not
 * surface this to the visitor or fail their submission because of it.
 */
export async function sendTeamNotification(subject: string, body: string): Promise<boolean> {
  const mailer = getTransporter();
  if (!mailer) return false;

  try {
    await mailer.sendMail({
      from: `"Zouza" <${process.env.EMAIL_SMTP_USER}>`,
      to: process.env.EMAIL_NOTIFY_TO!,
      subject,
      text: body,
    });
    return true;
  } catch (err) {
    console.error("[email] notification failed to send:", err);
    return false;
  }
}
