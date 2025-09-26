"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { formatTimeInTimezone } from "@/lib/timezone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, ChevronLeft, ChevronRight, Check, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

interface TimeSlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  duration_minutes: number
  buffer_minutes: number
  is_active: boolean
}

interface Profile {
  id: string
  username: string
  full_name: string | null
  email: string
  timezone: string | null
}

interface CalendarData {
  id: string
  title: string
  description: string | null
  color: string | null
}

interface CalendarBookingProps {
  profile: Profile
  calendar: CalendarData
  timeSlots: TimeSlot[]
  username: string
  calendarId: string
}

interface AvailableSlot {
  date: string
  time: string
  timeSlot: TimeSlot
}

export function CalendarBooking({ profile, calendar, timeSlots, username, calendarId }: CalendarBookingProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingBookings, setExistingBookings] = useState<string[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  const userTimezone = profile.timezone || "UTC"

  // Get available slots for the current month
  const getAvailableSlots = () => {
    const slots: AvailableSlot[] = []
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.getDay()

      // Skip past dates
      if (date < today) continue

      // Find time slots for this day of week
      const dayTimeSlots = timeSlots.filter((slot) => slot.day_of_week === dayOfWeek)

      dayTimeSlots.forEach((timeSlot) => {
        const dateStr = date.toISOString().split("T")[0]
        const timeStr = timeSlot.start_time.slice(0, 5)
        const slotKey = `${dateStr}_${timeStr}`

        // Skip if already booked
        if (existingBookings.includes(slotKey)) return

        const slotDateTime = new Date(`${dateStr}T${timeStr}`)
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000)
        if (slotDateTime <= oneHourFromNow) return

        slots.push({
          date: dateStr,
          time: timeStr,
          timeSlot,
        })
      })
    }

    return slots
  }

  // Load existing bookings for the current month
  useEffect(() => {
    const loadBookings = async () => {
      const supabase = createClient()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const startDate = new Date(year, month, 1).toISOString().split("T")[0]
      const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0]

      const { data } = await supabase
        .from("bookings")
        .select("booking_date, start_time")
        .eq("calendar_id", calendarId)
        .gte("booking_date", startDate)
        .lte("booking_date", endDate)
        .neq("status", "cancelled")

      if (data) {
        const bookingKeys = data.map((booking) => `${booking.booking_date}_${booking.start_time.slice(0, 5)}`)
        setExistingBookings(bookingKeys)
      }
    }

    loadBookings()
  }, [currentDate, calendarId])

  const formatTime = (time: string) => {
    return formatTimeInTimezone(time, userTimezone)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const validateForm = () => {
    setValidationError(null)

    if (!guestName.trim()) {
      setValidationError("Please enter your full name")
      return false
    }

    if (!guestEmail.trim()) {
      setValidationError("Please enter your email address")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(guestEmail.trim())) {
      setValidationError("Please enter a valid email address")
      return false
    }

    if (!selectedSlot) {
      setValidationError("Please select a time slot")
      return false
    }

    return true
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot || !validateForm()) return

    setIsLoading(true)
    setError(null)
    setValidationError(null)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calendarId,
          timeSlotId: selectedSlot.timeSlot.id,
          bookingDate: selectedSlot.date,
          startTime: selectedSlot.time,
          guestName: guestName.trim(),
          guestEmail: guestEmail.toLowerCase().trim(),
          notes: notes.trim() || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create booking")
      }

      setIsBooked(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const availableSlots = getAvailableSlots()

  // Group slots by date
  const slotsByDate = availableSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = []
      }
      acc[slot.date].push(slot)
      return acc
    },
    {} as Record<string, AvailableSlot[]>,
  )

  if (isBooked) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="pt-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your appointment has been successfully booked. You&apos;ll receive a confirmation email shortly with all the
            details.
          </p>
          {selectedSlot && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <p className="font-medium">{calendar.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.time)}
              </p>
              {userTimezone !== "UTC" && (
                <p className="text-xs text-muted-foreground mt-1">Time shown in {userTimezone}</p>
              )}
            </div>
          )}
          <Button onClick={() => window.location.reload()} variant="outline" className="bg-transparent">
            Book Another Appointment
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Calendar Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Select Date & Time</span>
              </CardTitle>
              <CardDescription>
                {calendar.description}
                {userTimezone !== "UTC" && <span className="block text-xs mt-1">Times shown in {userTimezone}</span>}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(slotsByDate).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(slotsByDate)
                .slice(0, 10)
                .map(([date, slots]) => (
                  <div key={date}>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                      {formatDate(date).split(",")[0]}
                      <span className="text-gray-500 dark:text-gray-400 ml-1">
                        {formatDate(date).split(",").slice(1).join(",")}
                      </span>
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={
                            selectedSlot?.date === slot.date && selectedSlot?.time === slot.time ? "default" : "outline"
                          }
                          size="sm"
                          className="text-xs bg-transparent"
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {formatTime(slot.time)}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No available slots</h3>
              <p className="text-gray-600 dark:text-gray-300">
                There are no available time slots for {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}. Try
                selecting a different month.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>Book Your Appointment</CardTitle>
          <CardDescription>Fill in your details to complete the booking.</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedSlot ? (
            <div className="space-y-6">
              {/* Selected Slot Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: calendar.color || "#3B82F6" }} />
                  <span className="font-medium">{calendar.title}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.time)}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">{selectedSlot.timeSlot.duration_minutes} minutes</Badge>
                  {selectedSlot.timeSlot.buffer_minutes > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {selectedSlot.timeSlot.buffer_minutes}min buffer
                    </Badge>
                  )}
                </div>
              </div>

              {/* Validation Errors */}
              {validationError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              {/* Booking Form */}
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guest-name">Full Name *</Label>
                  <Input
                    id="guest-name"
                    placeholder="Enter your full name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest-email">Email Address *</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information or special requests..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Booking..." : "Confirm Booking"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a time slot</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose an available date and time from the calendar to continue with your booking.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
