"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, Clock, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

interface BookingFormProps {
  calendar: any
  date: Date
  timeSlot: any
  onBookingComplete: () => void
  onBack: () => void
}

export function BookingForm({ calendar, date, timeSlot, onBookingComplete, onBack }: BookingFormProps) {
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName.trim() || !guestEmail.trim()) return

    setIsLoading(true)
    setValidationErrors([])
    const supabase = createClient()

    try {
      const validationResponse = await fetch("/api/validate-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calendarId: calendar.id,
          timeSlotId: timeSlot.id,
          bookingDate: format(date, "yyyy-MM-dd"),
          startTime: timeSlot.selectedTime.time,
          endTime: timeSlot.selectedTime.endTime,
        }),
      })

      const validation = await validationResponse.json()

      if (!validation.isValid) {
        setValidationErrors(validation.conflicts.map((conflict: any) => conflict.message))
        return
      }

      // Generate cancellation token
      const cancellationToken = crypto.randomUUID()

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          calendar_id: calendar.id,
          time_slot_id: timeSlot.id,
          guest_name: guestName.trim(),
          guest_email: guestEmail.trim(),
          booking_date: format(date, "yyyy-MM-dd"),
          start_time: timeSlot.selectedTime.time,
          end_time: timeSlot.selectedTime.endTime,
          notes: notes.trim() || null,
          cancellation_token: cancellationToken,
          status: "confirmed",
        })
        .select()
        .single()

      if (error) throw error

      try {
        await fetch("/api/send-booking-confirmation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: data.id,
          }),
        })
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError)
        // Don't fail the booking if email fails
      }

      setIsSuccess(true)
      toast({
        title: "Booking confirmed!",
        description: "You'll receive a confirmation email shortly.",
      })
    } catch (error) {
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            Your appointment has been successfully booked. You'll receive a confirmation email with all the details and
            a cancellation link.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 w-full max-w-md">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Service:</span>
                <span className="font-medium">{calendar.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Date:</span>
                <span className="font-medium">{format(date, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Time:</span>
                <span className="font-medium">
                  {timeSlot.selectedTime.display} - {timeSlot.selectedTime.endDisplay}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Name:</span>
                <span className="font-medium">{guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Email:</span>
                <span className="font-medium">{guestEmail}</span>
              </div>
            </div>
          </div>
          <Button onClick={onBookingComplete} className="mt-6">
            Book Another Appointment
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to time selection
        </Button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete your booking</h2>
        <div className="w-32" /> {/* Spacer */}
      </div>

      {validationErrors.length > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="font-medium mb-2">Unable to complete booking:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
            <CardDescription>Please review your appointment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">{calendar.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {calendar.description || "No description"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">{format(date, "EEEE, MMMM d, yyyy")}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {timeSlot.selectedTime.display} - {timeSlot.selectedTime.endDisplay}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">Duration: {timeSlot.duration_minutes} minutes</p>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Please provide your contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
                <p className="text-xs text-gray-500">You'll receive a confirmation email with cancellation link</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information or special requests..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Confirming Booking..." : "Confirm Booking"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
