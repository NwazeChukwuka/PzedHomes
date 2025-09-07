"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface Room {
  id: string
  room_number: string
  category: {
    name: string
    base_price: number
    max_occupancy: number
  }
}

interface NewReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRoom: Room | null
  onReservationCreated: () => void
}

export function NewReservationDialog({
  open,
  onOpenChange,
  selectedRoom,
  onReservationCreated,
}: NewReservationDialogProps) {
  const [loading, setLoading] = useState(false)
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()
  const [guestData, setGuestData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idType: "",
    idNumber: "",
    address: "",
    nationality: "",
  })
  const [reservationData, setReservationData] = useState({
    adults: 1,
    children: 0,
    specialRequests: "",
  })

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || !selectedRoom) return 0
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    return nights * selectedRoom.category.base_price
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom || !checkInDate || !checkOutDate) return

    setLoading(true)
    const supabase = createClient()

    try {
      // First, create or find the guest
      let guestId: string

      // Check if guest exists by email
      const { data: existingGuest } = await supabase.from("guests").select("id").eq("email", guestData.email).single()

      if (existingGuest) {
        guestId = existingGuest.id
      } else {
        // Create new guest
        const { data: newGuest, error: guestError } = await supabase
          .from("guests")
          .insert({
            first_name: guestData.firstName,
            last_name: guestData.lastName,
            email: guestData.email,
            phone: guestData.phone,
            id_type: guestData.idType || null,
            id_number: guestData.idNumber || null,
            address: guestData.address || null,
            nationality: guestData.nationality || null,
          })
          .select("id")
          .single()

        if (guestError) throw guestError
        guestId = newGuest.id
      }

      // Create reservation
      const totalAmount = calculateTotal()
      const { error: reservationError } = await supabase.from("reservations").insert({
        guest_id: guestId,
        room_id: selectedRoom.id,
        check_in_date: format(checkInDate, "yyyy-MM-dd"),
        check_out_date: format(checkOutDate, "yyyy-MM-dd"),
        adults: reservationData.adults,
        children: reservationData.children,
        total_amount: totalAmount,
        special_requests: reservationData.specialRequests || null,
        status: "confirmed",
      })

      if (reservationError) throw reservationError

      // Update room status to occupied (if checking in today)
      const today = new Date()
      if (checkInDate.toDateString() === today.toDateString()) {
        await supabase.from("rooms").update({ status: "occupied" }).eq("id", selectedRoom.id)
      }

      onReservationCreated()
      onOpenChange(false)

      // Reset form
      setGuestData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        idType: "",
        idNumber: "",
        address: "",
        nationality: "",
      })
      setReservationData({
        adults: 1,
        children: 0,
        specialRequests: "",
      })
      setCheckInDate(undefined)
      setCheckOutDate(undefined)
    } catch (error) {
      console.error("Error creating reservation:", error)
      alert("Failed to create reservation. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Reservation</DialogTitle>
          <DialogDescription>
            {selectedRoom ? `Create a new booking for Room ${selectedRoom.room_number}` : "Create a new booking"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Guest Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={guestData.firstName}
                  onChange={(e) => setGuestData((prev) => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={guestData.lastName}
                  onChange={(e) => setGuestData((prev) => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={guestData.email}
                  onChange={(e) => setGuestData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={guestData.phone}
                  onChange={(e) => setGuestData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="idType">ID Type</Label>
                <Select
                  value={guestData.idType}
                  onValueChange={(value) => setGuestData((prev) => ({ ...prev, idType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                    <SelectItem value="national_id">National ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  value={guestData.idNumber}
                  onChange={(e) => setGuestData((prev) => ({ ...prev, idNumber: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reservation Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Check-in Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={setCheckInDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Check-out Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={setCheckOutDate}
                      disabled={(date) => date <= (checkInDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="adults">Adults *</Label>
                <Select
                  value={reservationData.adults.toString()}
                  onValueChange={(value) => setReservationData((prev) => ({ ...prev, adults: Number.parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} Adult{num > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="children">Children</Label>
                <Select
                  value={reservationData.children.toString()}
                  onValueChange={(value) =>
                    setReservationData((prev) => ({ ...prev, children: Number.parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "Child" : "Children"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                placeholder="Any special requests or notes..."
                value={reservationData.specialRequests}
                onChange={(e) => setReservationData((prev) => ({ ...prev, specialRequests: e.target.value }))}
              />
            </div>
          </div>

          {/* Booking Summary */}
          {selectedRoom && checkInDate && checkOutDate && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Booking Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span>
                    {selectedRoom.room_number} ({selectedRoom.category.name})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Nights:</span>
                  <span>{Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate per night:</span>
                  <span>₦{selectedRoom.category.base_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t">
                  <span>Total Amount:</span>
                  <span>₦{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !checkInDate || !checkOutDate}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {loading ? "Creating..." : "Create Reservation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
