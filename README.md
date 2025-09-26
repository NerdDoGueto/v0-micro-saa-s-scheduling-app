# Bookly-lite

A modern, lightweight scheduling application built with Next.js, Supabase, and TypeScript. Perfect for professionals, consultants, and service providers who need a simple yet powerful booking system.

## Features

- **🔐 Secure Authentication** - Powered by Supabase Auth with email/password
- **📅 Calendar Management** - Create multiple calendars with custom time slots
- **⏰ Smart Scheduling** - Conflict detection, buffer times, and timezone support
- **📧 Email Notifications** - Automatic booking confirmations and cancellations
- **📊 Admin Dashboard** - Comprehensive booking management and analytics
- **📱 Responsive Design** - Works perfectly on desktop and mobile
- **🌍 Timezone Aware** - Proper timezone handling for global users
- **📈 Export Data** - CSV export for booking data analysis

## Quick Start

### Prerequisites

- Node.js 18+ 
- A Supabase account
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

1. **Clone and install dependencies:**
   \`\`\`bash
   git clone <your-repo-url>
   cd bookly-lite
   npm install
   \`\`\`

2. **Set up environment variables:**
   Copy `.env.example` to `.env.local` and fill in your values:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

3. **Configure Supabase:**
   - Create a new Supabase project
   - Run the SQL scripts in the `scripts/` folder in order
   - Update your environment variables with Supabase credentials

4. **Configure email (optional but recommended):**
   - Set up SMTP credentials in your environment variables
   - Test email functionality

5. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Visit your app:**
   Open [http://localhost:3000](http://localhost:3000)

## Usage Guide

### For Service Providers

1. **Sign up** at `/auth/register`
2. **Create calendars** for different services
3. **Set up time slots** with duration and buffer times
4. **Share your booking link** (`/u/your-username`)
5. **Manage bookings** in the dashboard

### For Clients

1. **Visit the booking page** (`/u/username`)
2. **Select a calendar** and available time slot
3. **Fill in your details** and confirm booking
4. **Receive email confirmation** with booking details
5. **Use cancellation link** if needed

## Architecture

### Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **Email:** SMTP (configurable)
- **Styling:** Tailwind CSS, shadcn/ui components

### Database Schema

\`\`\`sql
-- Core tables
profiles          # User profiles and settings
calendars         # Service calendars
time_slots        # Available time slots
bookings          # Appointment bookings
\`\`\`

### Key Components

- **Authentication:** `/app/auth/` - Login, register, password reset
- **Dashboard:** `/app/dashboard/` - Calendar and booking management
- **Public Booking:** `/app/u/[username]/` - Client-facing booking pages
- **API Routes:** `/app/api/` - Backend logic and integrations

## Configuration

### Environment Variables

\`\`\`bash
# Database (Supabase)
POSTGRES_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
\`\`\`

### Customization

1. **Branding:** Update colors and fonts in `app/globals.css`
2. **Email Templates:** Modify templates in `lib/email.ts`
3. **Time Zones:** Add more zones in `components/dashboard/profile-settings.tsx`
4. **Validation Rules:** Adjust limits in `lib/booking-validation.ts`

## API Reference

### Bookings API

#### Create Booking
\`\`\`http
POST /api/bookings
Content-Type: application/json

{
  "calendarId": "uuid",
  "timeSlotId": "uuid", 
  "bookingDate": "2024-01-15",
  "startTime": "14:00",
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "notes": "Optional notes"
}
\`\`\`

#### Cancel Booking
\`\`\`http
POST /api/bookings/cancel
Content-Type: application/json

{
  "token": "cancellation-token"
}
\`\`\`

#### Export Bookings
\`\`\`http
GET /api/bookings/export?user_id=uuid
\`\`\`

### Calendars API

#### Get Available Slots
\`\`\`http
GET /api/calendars/[id]/availability?date=2024-01-15
\`\`\`

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will handle the build and deployment

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

Run the test suite:
\`\`\`bash
npm test
\`\`\`

Run tests in watch mode:
\`\`\`bash
npm run test:watch
\`\`\`

## Troubleshooting

### Common Issues

**Email not sending:**
- Check SMTP credentials
- Verify firewall settings
- Test with a different email provider

**Booking conflicts:**
- Check database constraints
- Verify timezone settings
- Review buffer time configuration

**Authentication issues:**
- Confirm Supabase configuration
- Check redirect URLs
- Verify environment variables

### Support

- **Documentation:** Check this README and code comments
- **Issues:** Open a GitHub issue for bugs
- **Discussions:** Use GitHub Discussions for questions

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
\`\`\`

```json file="" isHidden
