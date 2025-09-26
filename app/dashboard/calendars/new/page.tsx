"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime
]

export default function NewCalendarPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("calendars")
        .insert({
          title,
          description,
          color,
          is_active: isActive,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/dashboard/calendars/${data.id}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/calendars">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calendars
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Calendar</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Set up a new booking calendar for your services.</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar Details</CardTitle>
          <CardDescription>Configure your calendar settings and availability.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Calendar Title</Label>
              <Input
                id="title"
                placeholder="e.g., Consultation Calls, Team Meetings"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this calendar is for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Calendar Color</Label>
              <div className="flex space-x-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === presetColor ? "border-gray-900 dark:border-white" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => setColor(presetColor)}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="is-active">Active (visible to clients)</Label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex space-x-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Creating..." : "Create Calendar"}
              </Button>
              <Link href="/dashboard/calendars">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
