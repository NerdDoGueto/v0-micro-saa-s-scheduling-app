import nodemailer from "nodemailer"

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface BookingEmailData {
  guestName: string
  guestEmail: string
  calendarTitle: string
  bookingDate: string
  startTime: string
  endTime: string
  duration: number
  hostName: string
  hostEmail: string
  notes?: string
  cancellationToken: string
  bookingId: string
}

export async function sendBookingConfirmation(data: BookingEmailData) {
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
  } = data

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const cancellationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/cancel/${cancellationToken}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #3b82f6; color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .booking-card { background-color: #f1f5f9; border-radius: 8px; padding: 24px; margin: 24px 0; }
        .booking-details { margin: 16px 0; }
        .booking-details dt { font-weight: 600; color: #475569; margin-top: 12px; }
        .booking-details dd { margin: 4px 0 0 0; color: #1e293b; }
        .button { display: inline-block; background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 16px 0; }
        .footer { background-color: #f8fafc; padding: 24px; text-align: center; color: #64748b; font-size: 14px; }
        .footer a { color: #3b82f6; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🗓️ Booking Confirmed</h1>
        </div>
        
        <div class="content">
          <p>Hi ${guestName},</p>
          
          <p>Your appointment has been successfully booked! Here are the details:</p>
          
          <div class="booking-card">
            <h2 style="margin-top: 0; color: #1e293b;">${calendarTitle}</h2>
            
            <dl class="booking-details">
              <dt>Date</dt>
              <dd>${formatDate(bookingDate)}</dd>
              
              <dt>Time</dt>
              <dd>${formatTime(startTime)} - ${formatTime(endTime)} (${duration} minutes)</dd>
              
              <dt>With</dt>
              <dd>${hostName}</dd>
              
              ${notes ? `<dt>Notes</dt><dd>${notes}</dd>` : ""}
            </dl>
          </div>
          
          <p>If you need to cancel or reschedule this appointment, please use the link below:</p>
          
          <p style="text-align: center;">
            <a href="${cancellationUrl}" class="button">Cancel Appointment</a>
          </p>
          
          <p><strong>Important:</strong> Please save this email for your records. You'll need the cancellation link if you need to cancel your appointment.</p>
          
          <p>We look forward to meeting with you!</p>
          
          <p>Best regards,<br>${hostName}</p>
        </div>
        
        <div class="footer">
          <p>This email was sent by <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}">Bookly-lite</a></p>
          <p>If you have any questions, please reply to this email or contact ${hostEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
Booking Confirmation

Hi ${guestName},

Your appointment has been successfully booked! Here are the details:

${calendarTitle}
Date: ${formatDate(bookingDate)}
Time: ${formatTime(startTime)} - ${formatTime(endTime)} (${duration} minutes)
With: ${hostName}
${notes ? `Notes: ${notes}` : ""}

If you need to cancel this appointment, please visit:
${cancellationUrl}

Important: Please save this email for your records. You'll need the cancellation link if you need to cancel your appointment.

We look forward to meeting with you!

Best regards,
${hostName}

---
This email was sent by Bookly-lite
If you have any questions, please contact ${hostEmail}
  `

  try {
    // Send email to guest
    await transporter.sendMail({
      from: `"${hostName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: guestEmail,
      subject: `Booking Confirmed: ${calendarTitle} on ${formatDate(bookingDate)}`,
      text: textContent,
      html: htmlContent,
    })

    // Send notification to host
    await transporter.sendMail({
      from: `"Bookly-lite" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: hostEmail,
      subject: `New Booking: ${calendarTitle} on ${formatDate(bookingDate)}`,
      text: `New booking received!\n\nGuest: ${guestName} (${guestEmail})\nService: ${calendarTitle}\nDate: ${formatDate(bookingDate)}\nTime: ${formatTime(startTime)} - ${formatTime(endTime)}\n${notes ? `Notes: ${notes}` : ""}`,
      html: `
        <h2>New Booking Received!</h2>
        <p><strong>Guest:</strong> ${guestName} (${guestEmail})</p>
        <p><strong>Service:</strong> ${calendarTitle}</p>
        <p><strong>Date:</strong> ${formatDate(bookingDate)}</p>
        <p><strong>Time:</strong> ${formatTime(startTime)} - ${formatTime(endTime)}</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending booking confirmation:", error)
    return { success: false, error }
  }
}

export async function sendCancellationConfirmation(data: {
  guestName: string
  guestEmail: string
  calendarTitle: string
  bookingDate: string
  startTime: string
  hostName: string
  hostEmail: string
}) {
  const { guestName, guestEmail, calendarTitle, bookingDate, startTime, hostName, hostEmail } = data

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Cancelled</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #ef4444; color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .booking-card { background-color: #fef2f2; border-radius: 8px; padding: 24px; margin: 24px 0; border-left: 4px solid #ef4444; }
        .booking-details { margin: 16px 0; }
        .booking-details dt { font-weight: 600; color: #475569; margin-top: 12px; }
        .booking-details dd { margin: 4px 0 0 0; color: #1e293b; }
        .footer { background-color: #f8fafc; padding: 24px; text-align: center; color: #64748b; font-size: 14px; }
        .footer a { color: #3b82f6; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Booking Cancelled</h1>
        </div>
        
        <div class="content">
          <p>Hi ${guestName},</p>
          
          <p>Your appointment has been successfully cancelled. Here are the details of the cancelled booking:</p>
          
          <div class="booking-card">
            <h2 style="margin-top: 0; color: #1e293b;">${calendarTitle}</h2>
            
            <dl class="booking-details">
              <dt>Date</dt>
              <dd>${formatDate(bookingDate)}</dd>
              
              <dt>Time</dt>
              <dd>${formatTime(startTime)}</dd>
              
              <dt>With</dt>
              <dd>${hostName}</dd>
            </dl>
          </div>
          
          <p>If you'd like to book a new appointment, you can visit our booking page anytime.</p>
          
          <p>Thank you for your understanding.</p>
          
          <p>Best regards,<br>${hostName}</p>
        </div>
        
        <div class="footer">
          <p>This email was sent by <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}">Bookly-lite</a></p>
          <p>If you have any questions, please contact ${hostEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
Booking Cancelled

Hi ${guestName},

Your appointment has been successfully cancelled. Here are the details of the cancelled booking:

${calendarTitle}
Date: ${formatDate(bookingDate)}
Time: ${formatTime(startTime)}
With: ${hostName}

If you'd like to book a new appointment, you can visit our booking page anytime.

Thank you for your understanding.

Best regards,
${hostName}

---
This email was sent by Bookly-lite
If you have any questions, please contact ${hostEmail}
  `

  try {
    // Send cancellation confirmation to guest
    await transporter.sendMail({
      from: `"${hostName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: guestEmail,
      subject: `Booking Cancelled: ${calendarTitle} on ${formatDate(bookingDate)}`,
      text: textContent,
      html: htmlContent,
    })

    // Notify host about cancellation
    await transporter.sendMail({
      from: `"Bookly-lite" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: hostEmail,
      subject: `Booking Cancelled: ${calendarTitle} on ${formatDate(bookingDate)}`,
      text: `A booking has been cancelled.\n\nGuest: ${guestName} (${guestEmail})\nService: ${calendarTitle}\nDate: ${formatDate(bookingDate)}\nTime: ${formatTime(startTime)}`,
      html: `
        <h2>Booking Cancelled</h2>
        <p><strong>Guest:</strong> ${guestName} (${guestEmail})</p>
        <p><strong>Service:</strong> ${calendarTitle}</p>
        <p><strong>Date:</strong> ${formatDate(bookingDate)}</p>
        <p><strong>Time:</strong> ${formatTime(startTime)}</p>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending cancellation confirmation:", error)
    return { success: false, error }
  }
}
