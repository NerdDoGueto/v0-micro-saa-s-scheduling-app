import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CancelBookingPage } from "@/components/cancel/cancel-booking-page"

interface CancelBookingPageProps {
  params: Promise<{ token: string }>
}

export default async function CancelBooking({ params }: CancelBookingPageProps) {
  const { token } = await params
  const supabase = await createClient()

  // Get booking by cancellation token
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      calendars (
        title,
        profiles (
          full_name,
          username
        )
      ),
      time_slots (
        duration_minutes
      )
    `)
    .eq("cancellation_token", token)
    .single()

  if (error || !booking) {
    notFound()
  }

  return <CancelBookingPage booking={booking} />
}

export async function generateMetadata({ params }: CancelBookingPageProps) {
  const { token } = await params

  return {
    title: "Cancel Booking - Bookly-lite",
    description: "Cancel your appointment",
  }
}
