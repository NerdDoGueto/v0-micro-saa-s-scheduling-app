import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicBookingPage } from "@/components/public/public-booking-page"

interface PublicUserPageProps {
  params: Promise<{ username: string }>
}

export default async function PublicUserPage({ params }: PublicUserPageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Get user profile by username
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Get user's active calendars with time slots
  const { data: calendars, error: calendarsError } = await supabase
    .from("calendars")
    .select(`
      *,
      time_slots (*)
    `)
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (calendarsError) {
    console.error("Error fetching calendars:", calendarsError)
    return <div>Error loading calendars</div>
  }

  // Get existing bookings for the next 30 days to show availability
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  const { data: existingBookings } = await supabase
    .from("bookings")
    .select(`
      *,
      calendars!inner (user_id)
    `)
    .eq("calendars.user_id", profile.id)
    .eq("status", "confirmed")
    .gte("booking_date", today.toISOString().split("T")[0])
    .lte("booking_date", thirtyDaysFromNow.toISOString().split("T")[0])

  return <PublicBookingPage profile={profile} calendars={calendars || []} existingBookings={existingBookings || []} />
}

export async function generateMetadata({ params }: PublicUserPageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("username", username)
    .single()

  if (!profile) {
    return {
      title: "User not found - Bookly-lite",
    }
  }

  return {
    title: `Book with ${profile.full_name || profile.username} - Bookly-lite`,
    description: `Schedule an appointment with ${profile.full_name || profile.username} using Bookly-lite`,
  }
}
