"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { User } from "@supabase/supabase-js"

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
]

interface Profile {
  id: string
  username: string | null
  full_name: string | null
  email: string
  timezone: string | null
  avatar_url: string | null
}

interface ProfileSettingsProps {
  user: User
  profile: Profile | null
}

export function ProfileSettings({ user, profile }: ProfileSettingsProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [username, setUsername] = useState(profile?.username || "")
  const [timezone, setTimezone] = useState(profile?.timezone || "UTC")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Check if username is already taken (if changed)
      if (username !== profile?.username && username) {
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username.toLowerCase())
          .neq("id", user.id)
          .single()

        if (existingUser) {
          throw new Error("Username is already taken")
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName || null,
          username: username.toLowerCase() || null,
          timezone,
        })
        .eq("id", user.id)

      if (error) throw error

      setSuccess(true)
      router.refresh()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your personal information and preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input
              id="full-name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
            />
            <p className="text-xs text-muted-foreground">
              Your booking page: {typeof window !== "undefined" ? window.location.origin : "bookly-lite.com"}/u/
              {username || "username"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600 dark:text-green-400">Profile updated successfully!</p>}

          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
