"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Mail, Phone, MapPin, Star } from "lucide-react"

interface Guest {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  id_type: string | null
  id_number: string | null
  address: string | null
  nationality: string | null
  loyalty_points: number
  created_at: string
  total_stays?: number
  last_stay?: string
}

export function GuestManagement() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    id_type: "",
    id_number: "",
    address: "",
    nationality: "",
  })

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase.from("guests").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setGuests(data || [])
    } catch (error) {
      console.error("Error fetching guests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    try {
      if (editingGuest) {
        const { error } = await supabase
          .from("guests")
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email || null,
            phone: formData.phone || null,
            id_type: formData.id_type || null,
            id_number: formData.id_number || null,
            address: formData.address || null,
            nationality: formData.nationality || null,
          })
          .eq("id", editingGuest.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("guests").insert({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || null,
          phone: formData.phone || null,
          id_type: formData.id_type || null,
          id_number: formData.id_number || null,
          address: formData.address || null,
          nationality: formData.nationality || null,
        })

        if (error) throw error
      }

      await fetchGuests()
      setShowAddDialog(false)
      setEditingGuest(null)
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        id_type: "",
        id_number: "",
        address: "",
        nationality: "",
      })
    } catch (error) {
      console.error("Error saving guest:", error)
      alert("Failed to save guest")
    }
  }

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest)
    setFormData({
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email || "",
      phone: guest.phone || "",
      id_type: guest.id_type || "",
      id_number: guest.id_number || "",
      address: guest.address || "",
      nationality: guest.nationality || "",
    })
    setShowAddDialog(true)
  }

  const getLoyaltyTier = (points: number) => {
    if (points >= 10000) return { tier: "Platinum", color: "bg-purple-100 text-purple-800" }
    if (points >= 5000) return { tier: "Gold", color: "bg-yellow-100 text-yellow-800" }
    if (points >= 1000) return { tier: "Silver", color: "bg-gray-100 text-gray-800" }
    return { tier: "Bronze", color: "bg-orange-100 text-orange-800" }
  }

  const filteredGuests = guests.filter(
    (guest) =>
      guest.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone?.includes(searchTerm),
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-slate-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Guest Management</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Guest
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingGuest ? "Edit Guest" : "Add New Guest"}</DialogTitle>
              <DialogDescription>
                {editingGuest ? "Update guest information" : "Add a new guest to the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="id_type">ID Type</Label>
                  <Select
                    value={formData.id_type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, id_type: value }))}
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
                  <Label htmlFor="id_number">ID Number</Label>
                  <Input
                    id="id_number"
                    value={formData.id_number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, id_number: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nationality: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false)
                    setEditingGuest(null)
                    setFormData({
                      first_name: "",
                      last_name: "",
                      email: "",
                      phone: "",
                      id_type: "",
                      id_number: "",
                      address: "",
                      nationality: "",
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                  {editingGuest ? "Update" : "Add"} Guest
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Guests ({filteredGuests.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Loyalty Status</TableHead>
                <TableHead>ID Information</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.map((guest) => {
                const loyalty = getLoyaltyTier(guest.loyalty_points)
                return (
                  <TableRow key={guest.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">
                          {guest.first_name} {guest.last_name}
                        </div>
                        {guest.nationality && (
                          <div className="text-sm text-slate-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {guest.nationality}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {guest.email && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Mail className="h-3 w-3 mr-1" />
                            {guest.email}
                          </div>
                        )}
                        {guest.phone && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Phone className="h-3 w-3 mr-1" />
                            {guest.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={loyalty.color}>{loyalty.tier}</Badge>
                        <div className="flex items-center text-sm text-slate-600">
                          <Star className="h-3 w-3 mr-1" />
                          {guest.loyalty_points.toLocaleString()} points
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {guest.id_type && guest.id_number ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {guest.id_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                          <div className="text-slate-600">{guest.id_number}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(guest)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
