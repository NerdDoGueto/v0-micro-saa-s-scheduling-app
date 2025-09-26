"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { format, addDays, startOfWeek, isSameDay, isBefore } from "date-fns"

interface TimeSlotPickerProps {
  calendar: any
  existingBookings: any[]
  onTimeSlotSelect: (date: Date, timeSlot: any) => void
  onBack: () => void
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function TimeSlotPicker({ calendar, existingBookings, onTimeSlotSelect, onBack }: TimeSlotPickerProps) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()))

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))
  }, [currentWeek])

  const getAvailableSlots = (date: Date) => {
    const dayOfWeek = date.getDay()
    const timeSlots = calendar.time_slots?.filter((slot: any) => slot.day_of_week === dayOfWeek && slot.is_active) || []

    // Filter out slots that are already booked
    const dateString = format(date, "yyyy-MM-dd")
    const bookedSlots = existingBookings
      .filter((booking: any) => booking.booking_date === dateString)
      .map((booking: any) => booking.start_time)

    return timeSlots.filter((slot: any) => {
      // Generate all possible booking times for this slot
      const slotStart = new Date(`2000-01-01T${slot.start_time}`)
      const slotEnd = new Date(`2000-01-01T${slot.end_time}`)
      const duration = slot.duration_minutes
      const buffer = slot.buffer_minutes

      const possibleTimes = []
      let currentTime = slotStart

      while (currentTime < slotEnd) {
        const endTime = new Date(currentTime.getTime() + duration * 60000)
        if (endTime <= slotEnd) {
          possibleTimes.push(format(currentTime, "HH:mm:ss"))
        }
        currentTime = new Date(currentTime.getTime() + (duration + buffer) * 60000)
      }

      // Check if any possible time is available
      return possibleTimes.some((time) => !bookedSlots.includes(time))
    })
  }

  const generateBookingTimes = (date: Date, timeSlot: any) => {
    const slotStart = new Date(`2000-01-01T${timeSlot.start_time}`)
    const slotEnd = new Date(`2000-01-01T${timeSlot.end_time}`)
    const duration = timeSlot.duration_minutes
    const buffer = timeSlot.buffer_minutes

    const times = []
    let currentTime = slotStart

    const dateString = format(date, "yyyy-MM-dd")
    const bookedSlots = existingBookings
      .filter((booking: any) => booking.booking_date === dateString)
      .map((booking: any) => booking.start_time)

    while (currentTime < slotEnd) {
      const endTime = new Date(currentTime.getTime() + duration * 60000)
      if (endTime <= slotEnd) {
        const timeString = format(currentTime, "HH:mm:ss")
        const isBooked = bookedSlots.includes(timeString)

        // Check if it's in the past
        const bookingDateTime = new Date(`${dateString}T${timeString}`)
        const isPast = isBefore(bookingDateTime, new Date())

        if (!isBooked && !isPast) {
          times.push({
            time: format(currentTime, "HH:mm:ss"),
            display: format(currentTime, "h:mm a"),
            endTime: format(endTime, "HH:mm:ss"),
            endDisplay: format(endTime, "h:mm a"),
          })
        }
      }
      currentTime = new Date(currentTime.getTime() + (duration + buffer) * 60000)
    }

    return times
  }

  const isDateInPast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return isBefore(date, today)
  }

  const goToPreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7))
  }

  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to services
        </Button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select date and time</h2>
        <div className="w-24" /> {/* Spacer */}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: calendar.color }} />
            {calendar.title}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
        </h3>
        <Button variant="outline" onClick={goToNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((date, index) => {
          const availableSlots = getAvailableSlots(date)
          const isPast = isDateInPast(date)
          const isToday = isSameDay(date, new Date())

          return (
            <Card key={index} className={`${isPast ? "opacity-50" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-center">
                  <div className="font-medium">{DAYS_OF_WEEK[index]}</div>
                  <div className={`text-lg ${isToday ? "text-blue-600 font-bold" : ""}`}>{format(date, "d")}</div>
                  {isToday && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      Today
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {isPast ? (
                  <p className="text-xs text-gray-500 text-center">Past date</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center">No availability</p>
                ) : (
                  <div className="space-y-2">
                    {availableSlots.map((slot: any) => {
                      const bookingTimes = generateBookingTimes(date, slot)
                      return bookingTimes.map((time) => (
                        <Button
                          key={`${slot.id}-${time.time}`}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs bg-transparent"
                          onClick={() => onTimeSlotSelect(date, { ...slot, selectedTime: time })}
                        >
                          {time.display}
                        </Button>
                      ))
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
