"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock, Settings, Eye } from "lucide-react"
import { CreateCalendarDialog } from "./create-calendar-dialog"
import { ManageTimeSlotsDialog } from "./manage-time-slots-dialog"
import Link from "next/link"

interface CalendarListProps {
  calendars: any[]
}

export function CalendarList({ calendars }: CalendarListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedCalendar, setSelectedCalendar] = useState<any>(null)
  const [showTimeSlotsDialog, setShowTimeSlotsDialog] = useState(false)

  const handleManageTimeSlots = (calendar: any) => {
    setSelectedCalendar(calendar)
    setShowTimeSlotsDialog(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Calendars</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Calendar
        </Button>
      </div>

      {calendars.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No calendars yet</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
              Create your first calendar to start accepting bookings
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Calendar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calendars.map((calendar) => (
            <Card key={calendar.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: calendar.color }} />
                      {calendar.title}
                    </CardTitle>
                    <CardDescription className="mt-1">{calendar.description || "No description"}</CardDescription>
                  </div>
                  <Badge variant={calendar.is_active ? "default" : "secondary"}>
                    {calendar.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{calendar.time_slots?.length || 0} time slots</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleManageTimeSlots(calendar)}>
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/calendars/${calendar.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateCalendarDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      {selectedCalendar && (
        <ManageTimeSlotsDialog
          open={showTimeSlotsDialog}
          onOpenChange={setShowTimeSlotsDialog}
          calendar={selectedCalendar}
        />
      )}
    </div>
  )
}
