"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, AlertTriangle, CheckCircle } from "lucide-react"
import { format } from "date-fns"

interface CancelBookingPageProps {
  booking: any
}

export function CancelBookingPage({ booking }: CancelBookingPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCancelled, setIsCancelled] = useState(booking.status === "cancelled")
  const [error, setError] = useState<string | null>(null)

  const handleCancel = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/cancel-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancellationToken: booking.cancellation_token,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to cancel booking")
      }

      setIsCancelled(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to cancel booking")
    } finally {
      setIsLoading(false)
    }
  }

  // Format date and time
  const bookingDate = new Date(`${booking.booking_date}T${booking.start_time}`)
  const endTime = new Date(`${booking.booking_date}T${booking.end_time}`)

  const formattedDate = format(bookingDate, "EEEE, MMMM d, yyyy")
  const formattedTime = `${format(bookingDate, "h:mm a")} - ${format(endTime, "h:mm a")}`

  const isPastBooking = bookingDate < new Date()

  if (isCancelled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Cancelled</h1>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Your appointment has been successfully cancelled. You'll receive a confirmation email shortly.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 w-full">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Service:</span>
                  <span className="font-medium">{booking.calendars.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Date:</span>
                  <span className="font-medium">{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Time:</span>
                  <span className="font-medium">{formattedTime}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Bookly-lite</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cancel Appointment</h1>
          <p className="text-gray-600 dark:text-gray-300">Review your booking details before cancelling</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Booking Details
            </CardTitle>
            <CardDescription>Your scheduled appointment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">{booking.calendars.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Service</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">{formattedDate}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{formattedTime}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">
                    {booking.calendars.profiles.full_name || booking.calendars.profiles.username}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Host</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium">{booking.guest_name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Attendee</div>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Notes:</div>
                <div className="text-yellow-700 dark:text-yellow-300">{booking.notes}</div>
              </div>
            )}

            <div className="flex items-center justify-center">
              <Badge variant={isPastBooking ? "secondary" : "default"}>
                {isPastBooking ? "Past Appointment" : "Upcoming Appointment"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {isPastBooking ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Cannot Cancel Past Appointment
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                This appointment has already occurred and cannot be cancelled.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Cancel Appointment
              </CardTitle>
              <CardDescription>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <div className="text-red-800 dark:text-red-200">{error}</div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => window.history.back()}>
                  Keep Appointment
                </Button>
                <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
                  {isLoading ? "Cancelling..." : "Cancel Appointment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
