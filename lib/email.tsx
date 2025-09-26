interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailData) {
  // For demo purposes, we'll use a simple email service
  // In production, you would integrate with services like:
  // - Resend
  // - SendGrid
  // - AWS SES
  // - Nodemailer with SMTP

  try {
    // Simulate email sending
    console.log(`[EMAIL] Sending to: ${to}`)
    console.log(`[EMAIL] Subject: ${subject}`)
    console.log(`[EMAIL] HTML: ${html}`)

    // In a real implementation, you would make an API call here
    // For now, we'll just log and return success
    return { success: true }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export function generateBookingConfirmationEmail({
  guestName,
  calendarTitle,
  date,
  time,
  duration,
  ownerName,
  cancellationUrl,
  notes,
}: {
  guestName: string
  calendarTitle: string
  date: string
  time: string
  duration: number
  ownerName: string
  cancellationUrl: string
  notes?: string
}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background-color: white;
          border-radius: 8px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo {
          color: #3b82f6;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .title {
          color: #1f2937;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .subtitle {
          color: #6b7280;
          font-size: 16px;
        }
        .booking-details {
          background-color: #f3f4f6;
          border-radius: 8px;
          padding: 24px;
          margin: 24px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }
        .detail-value {
          color: #1f2937;
          font-weight: 600;
        }
        .notes {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 16px;
          margin: 24px 0;
          border-radius: 0 8px 8px 0;
        }
        .notes-title {
          font-weight: 600;
          color: #92400e;
          margin-bottom: 8px;
        }
        .notes-content {
          color: #78350f;
        }
        .actions {
          text-align: center;
          margin: 32px 0;
        }
        .button {
          display: inline-block;
          background-color: #ef4444;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 0 8px;
        }
        .button:hover {
          background-color: #dc2626;
        }
        .footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .success-icon {
          width: 64px;
          height: 64px;
          background-color: #10b981;
          border-radius: 50%;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📅 Bookly-lite</div>
          <div class="success-icon">✓</div>
          <h1 class="title">Booking Confirmed!</h1>
          <p class="subtitle">Your appointment has been successfully scheduled</p>
        </div>

        <div class="booking-details">
          <div class="detail-row">
            <span class="detail-label">Service:</span>
            <span class="detail-value">${calendarTitle}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${time}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">${duration} minutes</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">With:</span>
            <span class="detail-value">${ownerName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Attendee:</span>
            <span class="detail-value">${guestName}</span>
          </div>
        </div>

        ${
          notes
            ? `
          <div class="notes">
            <div class="notes-title">Additional Notes:</div>
            <div class="notes-content">${notes}</div>
          </div>
        `
            : ""
        }

        <div class="actions">
          <a href="${cancellationUrl}" class="button">Cancel Appointment</a>
        </div>

        <div class="footer">
          <p>Need to make changes? Use the cancellation link above to cancel this appointment.</p>
          <p>This email was sent by Bookly-lite. If you didn't book this appointment, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateCancellationConfirmationEmail({
  guestName,
  calendarTitle,
  date,
  time,
  ownerName,
}: {
  guestName: string
  calendarTitle: string
  date: string
  time: string
  ownerName: string
}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Cancelled</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background-color: white;
          border-radius: 8px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo {
          color: #3b82f6;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .title {
          color: #1f2937;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .subtitle {
          color: #6b7280;
          font-size: 16px;
        }
        .booking-details {
          background-color: #fef2f2;
          border-radius: 8px;
          padding: 24px;
          margin: 24px 0;
          border-left: 4px solid #ef4444;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #fecaca;
        }
        .detail-row:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        .detail-label {
          color: #991b1b;
          font-weight: 500;
        }
        .detail-value {
          color: #7f1d1d;
          font-weight: 600;
        }
        .footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .cancel-icon {
          width: 64px;
          height: 64px;
          background-color: #ef4444;
          border-radius: 50%;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📅 Bookly-lite</div>
          <div class="cancel-icon">✕</div>
          <h1 class="title">Booking Cancelled</h1>
          <p class="subtitle">Your appointment has been successfully cancelled</p>
        </div>

        <div class="booking-details">
          <div class="detail-row">
            <span class="detail-label">Service:</span>
            <span class="detail-value">${calendarTitle}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${time}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">With:</span>
            <span class="detail-value">${ownerName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Attendee:</span>
            <span class="detail-value">${guestName}</span>
          </div>
        </div>

        <div class="footer">
          <p>This appointment has been removed from the calendar and the time slot is now available for others to book.</p>
          <p>This email was sent by Bookly-lite.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
