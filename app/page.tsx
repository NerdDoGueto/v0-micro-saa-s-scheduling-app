import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookly-lite</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 text-balance">
            Simple Scheduling for Everyone
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-pretty">
            Create your personalized booking page in minutes. Let clients schedule appointments with you without the
            back-and-forth emails.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to manage bookings
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Powerful features in a simple, easy-to-use interface
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Custom Calendars</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create multiple calendars for different services with custom availability
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Time Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Set your available hours, duration, and buffer time between appointments
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Public Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Share your personalized booking link - no account required for clients</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Automatic confirmations and reminders with easy cancellation links</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 dark:bg-blue-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to streamline your scheduling?</h3>
          <p className="text-xl text-blue-100 mb-8">Join thousands of professionals who trust Bookly-lite</p>
          <Link href="/auth/sign-up">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="h-6 w-6" />
            <span className="text-lg font-semibold">Bookly-lite</span>
          </div>
          <p className="text-gray-400">Simple scheduling made easy. Built with Next.js and Supabase.</p>
        </div>
      </footer>
    </div>
  )
}
