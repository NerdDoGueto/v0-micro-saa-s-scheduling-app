import { createClient } from "@/lib/supabase/server"
import { CalendarBooking } from "@/components/booking/calendar-booking"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User } from "lucide-react"
import Link from "next/link"

interface CalendarBookingPageProps {
  params: Promise<{ username: string; calendarId: string }>
}

export default async function CalendarBookingPage({ params }: CalendarBookingPageProps) {
  const { username, calendarId } = await params
  const supabase = await createClient()

  // Get user profile by username
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">User not found</h2>
            <p className="text-gray-600 dark:text-gray-300">
              The user &quot;{username}&quot; does not exist or is not available for booking.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get calendar details
  const { data: calendar } = await supabase
    .from("calendars")
    .select("*")
    .eq("id", calendarId)
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .single()

  if (!calendar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Calendar not found</h2>
            <p className="text-gray-600 dark:text-gray-300">
              This calendar is not available for booking or does not exist.
            </p>
            <Link href={`/u/${username}`} className="mt-4 inline-block">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {profile.full_name || username}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get time slots for this calendar
  const { data: timeSlots } = await supabase
    .from("time_slots")
    .select("*")
    .eq("calendar_id", calendarId)
    .eq("is_active", true)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/u/${username}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || profile.username} />
                <AvatarFallback>
                  {profile.full_name
                    ? profile.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : profile.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {profile.full_name || profile.username}
                </h1>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: calendar.color || "#3B82F6" }} />
                  <span className="text-gray-600 dark:text-gray-300">{calendar.title}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <CalendarBooking
            profile={profile}
            calendar={calendar}
            timeSlots={timeSlots || []}
            username={username}
            calendarId={calendarId}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Powered by Bookly-lite</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
