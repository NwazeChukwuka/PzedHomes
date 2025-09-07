"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { NewReservationDialog } from "./new-reservation-dialog"

interface Room {
  id: string
  room_number: string
  status: string
  floor: number
  category: {
    name: string
    base_price: number
    max_occupancy: number
  }
  current_reservation?: {
    id: string
    guest: {
      first_name: string
      last_name: string
    }
    check_out_date: string
  }
}

export function RoomAvailabilityGrid() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showNewReservation, setShowNewReservation] = useState(false)

  useEffect(() => {
    const fetchRooms = async () => {
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from("rooms")
          .select(`
            id,
            room_number,
            status,
            floor,
            room_categories (
              name,
              base_price,
              max_occupancy
            )
          `)
          .order("room_number")

        if (error) throw error

        // Transform the data to match our interface
        const transformedRooms =
          data?.map((room: any) => ({
            id: room.id,
            room_number: room.room_number,
            status: room.status,
            floor: room.floor,
            category: {
              name: room.room_categories.name,
              base_price: room.room_categories.base_price,
              max_occupancy: room.room_categories.max_occupancy,
            },
          })) || []

        setRooms(transformedRooms)
      } catch (error) {
        console.error("Error fetching rooms:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "occupied":
        return "bg-red-100 text-red-800 border-red-200"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cleaning":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "out_of_order":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Available"
      case "occupied":
        return "Occupied"
      case "maintenance":
        return "Maintenance"
      case "cleaning":
        return "Cleaning"
      case "out_of_order":
        return "Out of Order"
      default:
        return status
    }
  }

  const handleRoomClick = (room: Room) => {
    if (room.status === "available") {
      setSelectedRoom(room)
      setShowNewReservation(true)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Room Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(22)].map((_, i) => (
              <div key={i} className="aspect-square bg-slate-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Room Availability</CardTitle>
          <Button size="sm" onClick={() => setShowNewReservation(true)} className="bg-slate-900 hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`
                  relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
                  ${getStatusColor(room.status)}
                  ${room.status === "available" ? "hover:scale-105" : "cursor-not-allowed"}
                `}
                onClick={() => handleRoomClick(room)}
              >
                <div className="text-center">
                  <div className="font-bold text-lg mb-1">{room.room_number}</div>
                  <div className="text-xs mb-2">{room.category.name}</div>
                  <Badge variant="secondary" className={`text-xs ${getStatusColor(room.status)}`}>
                    {getStatusText(room.status)}
                  </Badge>
                  <div className="flex items-center justify-center mt-2 text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {room.category.max_occupancy}
                  </div>
                  <div className="text-xs font-medium mt-1">₦{room.category.base_price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-200 rounded"></div>
              <span className="text-sm text-slate-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded"></div>
              <span className="text-sm text-slate-600">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-200 rounded"></div>
              <span className="text-sm text-slate-600">Cleaning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-200 rounded"></div>
              <span className="text-sm text-slate-600">Maintenance</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <NewReservationDialog
        open={showNewReservation}
        onOpenChange={setShowNewReservation}
        selectedRoom={selectedRoom}
        onReservationCreated={() => {
          // Refresh rooms data
          window.location.reload()
        }}
      />
    </>
  )
}
