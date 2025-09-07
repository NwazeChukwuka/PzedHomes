"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Star, Gift, MessageSquare, LogOut, User } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import Link from "next/link"

export default function GuestDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/guest"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!user) {
    window.location.href = "/guest/login"
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PZ</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">P-ZED Hotels & Suites</h1>
                <p className="text-xs text-slate-600">Guest Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Welcome, {user.user_metadata?.first_name || "Guest"}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back!</h2>
          <p className="text-slate-600">Manage your bookings and enjoy exclusive benefits</p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Current Reservations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No current reservations</p>
                    <Link href="/guest/booking">
                      <Button className="bg-amber-600 hover:bg-amber-700">Book a Room</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-slate-500">No previous bookings</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="w-5 h-5 mr-2" />
                  P-ZED Rewards Program
                </CardTitle>
                <CardDescription>Earn points with every stay and unlock exclusive benefits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-amber-600 mb-2">0</div>
                  <p className="text-slate-600">Reward Points</p>
                  <Badge variant="secondary" className="mt-2">
                    Bronze Member
                  </Badge>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <h4 className="font-semibold">Bronze</h4>
                    <p className="text-sm text-slate-600">0-999 points</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Star className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <h4 className="font-semibold">Silver</h4>
                    <p className="text-sm text-slate-600">1,000-4,999 points</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Star className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <h4 className="font-semibold">Gold</h4>
                    <p className="text-sm text-slate-600">5,000+ points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Share Your Experience
                </CardTitle>
                <CardDescription>Help us improve by sharing your feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No feedback submitted yet</p>
                  <Button variant="outline">Submit Feedback</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Room Service</CardTitle>
                  <CardDescription>Order food and beverages to your room</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700">View Menu</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Housekeeping</CardTitle>
                  <CardDescription>Request housekeeping services</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full bg-transparent">
                    Request Service
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Laundry Service</CardTitle>
                  <CardDescription>Professional laundry and dry cleaning</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full bg-transparent">
                    Schedule Pickup
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Concierge</CardTitle>
                  <CardDescription>Get assistance with local recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full bg-transparent">
                    Contact Concierge
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">First Name</label>
                    <p className="text-slate-900">{user.user_metadata?.first_name || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                    <p className="text-slate-900">{user.user_metadata?.last_name || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <p className="text-slate-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Phone</label>
                    <p className="text-slate-900">{user.user_metadata?.phone || "Not provided"}</p>
                  </div>
                </div>
                <Button variant="outline">Edit Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
