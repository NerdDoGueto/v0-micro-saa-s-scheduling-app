import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"
import Link from "next/link"

interface UserBookingPageProps {
  params: Promise<{ username: string }>
}

export default async function UserBookingPage({ params }: UserBookingPageProps) {
  const { username } = await params
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

  // Get user's active calendars
  const { data: calendars } = await supabase
    .from("calendars")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.full_name || profile.username}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">@{profile.username}</p>
              {profile.timezone && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Timezone: {profile.timezone}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Book an appointment</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Choose a calendar below to see available time slots and book your appointment.
            </p>
          </div>

          {calendars && calendars.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calendars.map((calendar) => (
                <Link key={calendar.id} href={`/u/${username}/${calendar.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center space-x-2 mb-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: calendar.color || "#3B82F6" }}
                        />
                        <CardTitle className="text-lg">{calendar.title}</CardTitle>
                      </div>
                      <CardDescription className="line-clamp-3">{calendar.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Available</span>
                        </div>
                        <Badge variant="secondary">Book Now</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No calendars available</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {profile.full_name || profile.username} doesn&apos;t have any active calendars for booking at the
                  moment.
                </p>
              </CardContent>
            </Card>
          )}
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
