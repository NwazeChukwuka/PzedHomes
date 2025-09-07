"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Phone } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"

interface Reservation {
  id: string
  check_in_date: string
  check_out_date: string
  status: string
  total_amount: number
  adults: number
  children: number
  guest: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  room: {
    room_number: string
    room_categories: {
      name: string
    }
  }
}

export function RecentReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReservations = async () => {
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from("reservations")
          .select(`
            id,
            check_in_date,
            check_out_date,
            status,
            total_amount,
            adults,
            children,
            guests (
              first_name,
              last_name,
              email,
              phone
            ),
            rooms (
              room_number,
              room_categories (
                name
              )
            )
          `)
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) throw error

        // Transform the data to match our interface
        const transformedReservations =
          data?.map((reservation: any) => ({
            id: reservation.id,
            check_in_date: reservation.check_in_date,
            check_out_date: reservation.check_out_date,
            status: reservation.status,
            total_amount: reservation.total_amount,
            adults: reservation.adults,
            children: reservation.children,
            guest: {
              first_name: reservation.guests.first_name,
              last_name: reservation.guests.last_name,
              email: reservation.guests.email,
              phone: reservation.guests.phone,
            },
            room: {
              room_number: reservation.rooms.room_number,
              room_categories: {
                name: reservation.rooms.room_categories.name,
              },
            },
          })) || []

        setReservations(transformedReservations)
      } catch (error) {
        console.error("Error fetching reservations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "checked_in":
        return "bg-blue-100 text-blue-800"
      case "checked_out":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no_show":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed"
      case "checked_in":
        return "Checked In"
      case "checked_out":
        return "Checked Out"
      case "cancelled":
        return "Cancelled"
      case "no_show":
        return "No Show"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reservations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No reservations found</p>
          ) : (
            reservations.map((reservation) => (
              <div key={reservation.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {reservation.guest.first_name} {reservation.guest.last_name}
                    </h4>
                    <p className="text-sm text-slate-600">
                      Room {reservation.room.room_number} • {reservation.room.room_categories.name}
                    </p>
                  </div>
                  <Badge className={getStatusColor(reservation.status)}>{getStatusText(reservation.status)}</Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(reservation.check_in_date), "MMM dd")} -{" "}
                    {format(new Date(reservation.check_out_date), "MMM dd")}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {reservation.adults + reservation.children} guest
                    {reservation.adults + reservation.children > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">₦{reservation.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {reservation.guest.phone && (
                      <Button variant="ghost" size="sm">
                        <Phone className="h-3 w-3" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
