// src/lib/email.ts
import nodemailer from "nodemailer";

type BookingEmailData = {
  guestName: string;
  guestEmail: string;
  calendarTitle: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  hostName: string;
  hostEmail: string;
  notes?: string;
  cancellationToken: string;
  bookingId: string;
};

type CancellationEmailData = {
  guestName: string;
  guestEmail: string;
  calendarTitle: string;
  bookingDate: string;
  startTime: string;
  hostName: string;
  hostEmail: string;
};

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function ensureSmtpEnv() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Missing SMTP env vars: SMTP_HOST, SMTP_USER, SMTP_PASS");
  }
}

function getTransporter() {
  if (transporter) return transporter;
  ensureSmtpEnv();
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE) === "true", // true for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(time: string) {
  // Accepts ISO timestamp or HH:MM[:SS]
  const d = time.includes("T") ? new Date(time) : new Date(`2000-01-01T${time}`);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  try {
    const t = getTransporter();

    const {
      guestName,
      guestEmail,
      calendarTitle,
      bookingDate,
      startTime,
      endTime,
      duration,
      hostName,
      hostEmail,
      notes,
      cancellationToken,
    } = data;

    const cancellationUrl =
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/cancel/${cancellationToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#333;margin:0;padding:0;background:#f8fafc}
        .container{max-width:600px;margin:0 auto;background:#fff}
        .header{background:#3b82f6;color:#fff;padding:32px 24px;text-align:center}
        .content{padding:32px 24px}
        .booking-card{background:#f1f5f9;border-radius:8px;padding:24px;margin:24px 0}
        .button{display:inline-block;background:#ef4444;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:500}
        .footer{background:#f8fafc;padding:24px;text-align:center;color:#64748b;font-size:14px}
      </style>
      </head>
      <body>
      <div class="container">
        <div class="header"><h1>🗓️ Booking Confirmed</h1></div>
        <div class="content">
          <p>Hi ${guestName},</p>
          <p>Your appointment has been successfully booked! Here are the details:</p>
          <div class="booking-card">
            <h2 style="margin-top:0;color:#1e293b">${calendarTitle}</h2>
            <dl>
              <dt>Date</dt><dd>${formatDate(bookingDate)}</dd>
              <dt>Time</dt><dd>${formatTime(startTime)} - ${formatTime(endTime)} (${duration} minutes)</dd>
              <dt>With</dt><dd>${hostName}</dd>
              ${notes ? `<dt>Notes</dt><dd>${notes}</dd>` : ""}
            </dl>
          </div>
          <p style="text-align:center"><a href="${cancellationUrl}" class="button">Cancel Appointment</a></p>
          <p><strong>Important:</strong> Save this email for your records.</p>
          <p>Best regards,<br>${hostName}</p>
        </div>
        <div class="footer">
          <p>This email was sent by <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}">Bookly-lite</a></p>
          <p>If you have questions, contact ${hostEmail}</p>
        </div>
      </div>
      </body>
      </html>
    `;

    const textContent = `
Booking Confirmation

Hi ${guestName},

Your appointment has been successfully booked!

${calendarTitle}
Date: ${formatDate(bookingDate)}
Time: ${formatTime(startTime)} - ${formatTime(endTime)} (${duration} minutes)
With: ${hostName}
${notes ? `Notes: ${notes}` : ""}

Cancel: ${cancellationUrl}

Best regards,
${hostName}

This email was sent by Bookly-lite. Contact: ${hostEmail}
    `;

    await t.sendMail({
      from: `"${hostName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: guestEmail,
      subject: `Booking Confirmed: ${calendarTitle} on ${formatDate(bookingDate)}`,
      text: textContent,
      html: htmlContent,
    });

    // notify host (non-blocking could be separated, but kept sequential here)
    await t.sendMail({
      from: `"Bookly-lite" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: hostEmail,
      subject: `New Booking: ${calendarTitle} on ${formatDate(bookingDate)}`,
      text: `New booking received!\nGuest: ${guestName} (${guestEmail})\nDate: ${formatDate(bookingDate)}\nTime: ${formatTime(startTime)} - ${formatTime(endTime)}\n${notes ? `Notes: ${notes}` : ""}`,
      html: `<h2>New Booking Received!</h2><p><strong>Guest:</strong> ${guestName} (${guestEmail})</p><p><strong>Service:</strong> ${calendarTitle}</p><p><strong>Date:</strong> ${formatDate(bookingDate)}</p><p><strong>Time:</strong> ${formatTime(startTime)} - ${formatTime(endTime)}</p>${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}`,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
    return { success: false, error };
  }
}

export async function sendCancellationConfirmation(data: CancellationEmailData) {
  try {
    const t = getTransporter();

    const { guestName, guestEmail, calendarTitle, bookingDate, startTime, hostName, hostEmail } = data;

    const html = `
      <p>Hi ${guestName},</p>
      <p>Your booking for <strong>${calendarTitle}</strong> on <strong>${formatDate(bookingDate)}</strong> at <strong>${formatTime(
      startTime,
    )}</strong> has been cancelled.</p>
      <p>Best regards,<br/>${hostName}</p>
    `;

    const text = `Hi ${guestName},\n\nYour booking for ${calendarTitle} on ${formatDate(bookingDate)} at ${formatTime(
      startTime,
    )} has been cancelled.\n\nBest regards,\n${hostName}`;

    await t.sendMail({
      from: `"Bookly-lite" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: guestEmail,
      subject: `Booking Cancelled: ${calendarTitle} on ${formatDate(bookingDate)}`,
      text,
      html,
    });

    // notify host
    await t.sendMail({
      from: `"Bookly-lite" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: hostEmail,
      subject: `Booking Cancelled: ${calendarTitle} on ${formatDate(bookingDate)}`,
      text: `Booking cancelled: Guest ${guestName} (${guestEmail}) on ${formatDate(bookingDate)} at ${formatTime(startTime)}`,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending cancellation confirmation:", error);
    return { success: false, error };
  }
}