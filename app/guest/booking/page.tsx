"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function GuestBooking() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState("1")

  const roomTypes = [
    {
      id: "standard",
      name: "Standard Room",
      price: 15000,
      features: ["Free WiFi", "Air Conditioning", "24/7 Room Service"],
      available: 8,
    },
    {
      id: "classic",
      name: "Classic Room",
      price: 25000,
      features: ["Premium Bedding", "Mini Bar", "City View"],
      available: 6,
    },
    {
      id: "diplomatic",
      name: "Diplomatic Suite",
      price: 35000,
      features: ["Separate Living Area", "Executive Lounge", "Butler Service"],
      available: 4,
    },
    {
      id: "deluxe",
      name: "Deluxe Suite",
      price: 40000,
      features: ["Luxury Amenities", "Balcony", "Premium Location"],
      available: 3,
    },
    {
      id: "executive",
      name: "Executive Suite",
      price: 50000,
      features: ["Presidential Treatment", "Private Dining", "Concierge Service"],
      available: 1,
    },
  ]

  const calculateTotal = () => {
    if (!selectedRoom || !checkIn || !checkOut) return 0
    const room = roomTypes.find((r) => r.id === selectedRoom)
    if (!room) return 0

    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    return room.price * nights
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/guest" className="flex items-center space-x-3">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PZ</span>
                </div>
                <span className="text-xl font-bold text-slate-900">P-ZED Hotels</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/guest/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Book Your Stay</h1>
          <p className="text-slate-600">Choose your perfect room and dates</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkin">Check-in Date</Label>
                    <Input
                      id="checkin"
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkout">Check-out Date</Label>
                    <Input
                      id="checkout"
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Guest{num > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Room Selection */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">Select Your Room</h3>
              {roomTypes.map((room) => (
                <Card
                  key={room.id}
                  className={`cursor-pointer transition-all ${
                    selectedRoom === room.id ? "ring-2 ring-amber-500 bg-amber-50" : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedRoom(room.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">{room.name}</h4>
                        <p className="text-2xl font-bold text-amber-600">₦{room.price.toLocaleString()}</p>
                        <p className="text-sm text-slate-600">per night</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={room.available > 0 ? "secondary" : "destructive"}>
                          {room.available > 0 ? `${room.available} Available` : "Sold Out"}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-2">
                      {room.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-slate-600">
                          <Star className="w-3 h-3 mr-1 text-amber-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRoom && checkIn && checkOut ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Room Type:</span>
                        <span className="text-sm font-medium">
                          {roomTypes.find((r) => r.id === selectedRoom)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Check-in:</span>
                        <span className="text-sm font-medium">{new Date(checkIn).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Check-out:</span>
                        <span className="text-sm font-medium">{new Date(checkOut).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Guests:</span>
                        <span className="text-sm font-medium">{guests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Nights:</span>
                        <span className="text-sm font-medium">
                          {Math.ceil(
                            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24),
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-amber-600">₦{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-amber-600 hover:bg-amber-700">Continue to Guest Details</Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Select room and dates to see pricing</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
