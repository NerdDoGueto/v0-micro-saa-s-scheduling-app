import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Calendar } from "lucide-react"
import Link from "next/link"

interface CancelBookingPageProps {
  params: Promise<{ token: string }>
}

export default async function CancelBookingPage({ params }: CancelBookingPageProps) {
  const { token } = await params
  const supabase = await createClient()

  // Find booking by cancellation token
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*, calendars(title, user_id), profiles(full_name, email, username)")
    .eq("cancellation_token", token)
    .single()

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Invalid Cancellation Link</h2>
            <p className="text-gray-600 dark:text-gray-300">
              This cancellation link is invalid or has expired. Please contact the booking provider if you need to
              cancel your appointment.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAlreadyCancelled = booking.status === "cancelled"

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl">
            {isAlreadyCancelled ? "Booking Already Cancelled" : "Cancel Booking"}
          </CardTitle>
          <CardDescription>
            {isAlreadyCancelled
              ? "This booking has already been cancelled."
              : "Are you sure you want to cancel this booking?"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Booking Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">{booking.calendars.title}</h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <p>
                <strong>Guest:</strong> {booking.guest_name}
              </p>
              <p>
                <strong>Date:</strong> {formatDate(booking.booking_date)}
              </p>
              <p>
                <strong>Time:</strong> {formatTime(booking.start_time)}
              </p>
              <p>
                <strong>With:</strong> {booking.profiles.full_name || booking.profiles.username}
              </p>
            </div>
          </div>

          {isAlreadyCancelled ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This booking was cancelled successfully. No further action is needed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <form action={`/api/bookings/cancel/${token}`} method="GET">
                <Button type="submit" variant="destructive" className="w-full">
                  Yes, Cancel This Booking
                </Button>
              </form>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                This action cannot be undone. You&apos;ll need to book a new appointment if you change your mind.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href={`/u/${booking.profiles.username}`}>
              <Button variant="outline" size="sm" className="bg-transparent">
                Book Another Appointment
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
