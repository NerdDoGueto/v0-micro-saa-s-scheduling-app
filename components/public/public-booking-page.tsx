"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { CalendarSelector } from "./calendar-selector"
import { TimeSlotPicker } from "./time-slot-picker"
import { BookingForm } from "./booking-form"

interface PublicBookingPageProps {
  profile: any
  calendars: any[]
  existingBookings: any[]
}

export function PublicBookingPage({ profile, calendars, existingBookings }: PublicBookingPageProps) {
  const [selectedCalendar, setSelectedCalendar] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null)
  const [step, setStep] = useState<"calendar" | "time" | "form">("calendar")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleCalendarSelect = (calendar: any) => {
    setSelectedCalendar(calendar)
    setSelectedDate(null)
    setSelectedTimeSlot(null)
    setStep("time")
  }

  const handleTimeSlotSelect = (date: Date, timeSlot: any) => {
    setSelectedDate(date)
    setSelectedTimeSlot(timeSlot)
    setStep("form")
  }

  const handleBookingComplete = () => {
    setSelectedCalendar(null)
    setSelectedDate(null)
    setSelectedTimeSlot(null)
    setStep("calendar")
  }

  const handleBack = () => {
    if (step === "form") {
      setStep("time")
      setSelectedDate(null)
      setSelectedTimeSlot(null)
    } else if (step === "time") {
      setStep("calendar")
      setSelectedCalendar(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Bookly-lite</span>
            </div>
            <Badge variant="outline">Public Booking Page</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Section */}
        <div className="text-center mb-8">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name || profile.username} />
            <AvatarFallback className="text-2xl">
              {profile.full_name ? getInitials(profile.full_name) : profile.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {profile.full_name || profile.username}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Book an appointment using the calendar below</p>
        </div>

        {/* Booking Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === "calendar" ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "calendar" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="font-medium">Choose Service</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className={`flex items-center space-x-2 ${step === "time" ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "time" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="font-medium">Pick Time</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className={`flex items-center space-x-2 ${step === "form" ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "form" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <span className="font-medium">Your Details</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {step === "calendar" && <CalendarSelector calendars={calendars} onCalendarSelect={handleCalendarSelect} />}

          {step === "time" && selectedCalendar && (
            <TimeSlotPicker
              calendar={selectedCalendar}
              existingBookings={existingBookings}
              onTimeSlotSelect={handleTimeSlotSelect}
              onBack={handleBack}
            />
          )}

          {step === "form" && selectedCalendar && selectedDate && selectedTimeSlot && (
            <BookingForm
              calendar={selectedCalendar}
              date={selectedDate}
              timeSlot={selectedTimeSlot}
              onBookingComplete={handleBookingComplete}
              onBack={handleBack}
            />
          )}
        </div>
      </main>
    </div>
  )
}
