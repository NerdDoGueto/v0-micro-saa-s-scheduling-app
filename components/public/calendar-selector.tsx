"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"

interface CalendarSelectorProps {
  calendars: any[]
  onCalendarSelect: (calendar: any) => void
}

export function CalendarSelector({ calendars, onCalendarSelect }: CalendarSelectorProps) {
  if (calendars.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No services available</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            This user hasn't set up any booking calendars yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Choose a service to book</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {calendars.map((calendar) => (
          <Card key={calendar.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: calendar.color }} />
                {calendar.title}
              </CardTitle>
              <CardDescription>{calendar.description || "No description available"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{calendar.time_slots?.length || 0} time slots available</span>
                </div>
              </div>
              <Button onClick={() => onCalendarSelect(calendar)} className="w-full">
                Select this service
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
