"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bed, Users, DollarSign, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Stats {
  totalRooms: number
  occupiedRooms: number
  todayCheckIns: number
  todayRevenue: number
}

export function QuickStats() {
  const [stats, setStats] = useState<Stats>({
    totalRooms: 0,
    occupiedRooms: 0,
    todayCheckIns: 0,
    todayRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()

      try {
        // Get total rooms
        const { count: totalRooms } = await supabase.from("rooms").select("*", { count: "exact", head: true })

        // Get occupied rooms
        const { count: occupiedRooms } = await supabase
          .from("rooms")
          .select("*", { count: "exact", head: true })
          .eq("status", "occupied")

        // Get today's check-ins
        const today = new Date().toISOString().split("T")[0]
        const { count: todayCheckIns } = await supabase
          .from("reservations")
          .select("*", { count: "exact", head: true })
          .eq("check_in_date", today)
          .eq("status", "confirmed")

        // Get today's revenue (simplified - would need more complex query in real app)
        const { data: todayPayments } = await supabase
          .from("payments")
          .select("amount")
          .gte("processed_at", `${today}T00:00:00`)
          .lt("processed_at", `${today}T23:59:59`)

        const todayRevenue = todayPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

        setStats({
          totalRooms: totalRooms || 0,
          occupiedRooms: occupiedRooms || 0,
          todayCheckIns: todayCheckIns || 0,
          todayRevenue,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const occupancyRate = stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0

  const statCards = [
    {
      title: "Room Occupancy",
      value: `${stats.occupiedRooms}/${stats.totalRooms}`,
      description: `${occupancyRate}% occupied`,
      icon: Bed,
      color: occupancyRate > 80 ? "text-green-600" : occupancyRate > 50 ? "text-yellow-600" : "text-red-600",
    },
    {
      title: "Today's Check-ins",
      value: stats.todayCheckIns.toString(),
      description: "Arrivals expected",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Today's Revenue",
      value: `₦${stats.todayRevenue.toLocaleString()}`,
      description: "Total earnings",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Available Rooms",
      value: (stats.totalRooms - stats.occupiedRooms).toString(),
      description: "Ready for booking",
      icon: Calendar,
      color: "text-purple-600",
    },
  ]

  if (loading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-slate-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  return (
    <>
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <p className="text-xs text-slate-600 mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
