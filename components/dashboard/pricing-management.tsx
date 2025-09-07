"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Edit, Save, X } from "lucide-react"
import { toast } from "sonner"

interface RoomRate {
  id: string
  room_type: string
  base_rate: number
  weekend_rate: number
  holiday_rate: number
  description: string
}

interface Service {
  id: string
  name: string
  price: number
  category: string
  description: string
  is_active: boolean
}

export function PricingManagement() {
  const [roomRates, setRoomRates] = useState<RoomRate[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [editingRate, setEditingRate] = useState<string | null>(null)
  const [editingService, setEditingService] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ratesResponse, servicesResponse] = await Promise.all([
        supabase.from("room_rates").select("*").order("room_type"),
        supabase.from("services").select("*").order("category", { ascending: true }),
      ])

      if (ratesResponse.data) setRoomRates(ratesResponse.data)
      if (servicesResponse.data) setServices(servicesResponse.data)
    } catch (error) {
      toast.error("Failed to load pricing data")
    } finally {
      setLoading(false)
    }
  }

  const updateRoomRate = async (id: string, updates: Partial<RoomRate>) => {
    try {
      const { error } = await supabase.from("room_rates").update(updates).eq("id", id)

      if (error) throw error

      setRoomRates((prev) => prev.map((rate) => (rate.id === id ? { ...rate, ...updates } : rate)))
      setEditingRate(null)
      toast.success("Room rate updated successfully")
    } catch (error) {
      toast.error("Failed to update room rate")
    }
  }

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      const { error } = await supabase.from("services").update(updates).eq("id", id)

      if (error) throw error

      setServices((prev) => prev.map((service) => (service.id === id ? { ...service, ...updates } : service)))
      setEditingService(null)
      toast.success("Service updated successfully")
    } catch (error) {
      toast.error("Failed to update service")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading pricing data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Room Rates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Room Rates
            <Badge variant="secondary">Owner Only</Badge>
          </CardTitle>
          <CardDescription>Manage base rates, weekend rates, and holiday pricing for all room types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roomRates.map((rate) => (
              <div key={rate.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg capitalize">{rate.room_type} Room</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRate(editingRate === rate.id ? null : rate.id)}
                  >
                    {editingRate === rate.id ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  </Button>
                </div>

                {editingRate === rate.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Base Rate (₦)</Label>
                      <Input
                        type="number"
                        defaultValue={rate.base_rate}
                        onChange={(e) => {
                          const newRate = { ...rate, base_rate: Number(e.target.value) }
                          setRoomRates((prev) => prev.map((r) => (r.id === rate.id ? newRate : r)))
                        }}
                      />
                    </div>
                    <div>
                      <Label>Weekend Rate (₦)</Label>
                      <Input
                        type="number"
                        defaultValue={rate.weekend_rate}
                        onChange={(e) => {
                          const newRate = { ...rate, weekend_rate: Number(e.target.value) }
                          setRoomRates((prev) => prev.map((r) => (r.id === rate.id ? newRate : r)))
                        }}
                      />
                    </div>
                    <div>
                      <Label>Holiday Rate (₦)</Label>
                      <Input
                        type="number"
                        defaultValue={rate.holiday_rate}
                        onChange={(e) => {
                          const newRate = { ...rate, holiday_rate: Number(e.target.value) }
                          setRoomRates((prev) => prev.map((r) => (r.id === rate.id ? newRate : r)))
                        }}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Description</Label>
                      <Textarea
                        defaultValue={rate.description}
                        onChange={(e) => {
                          const newRate = { ...rate, description: e.target.value }
                          setRoomRates((prev) => prev.map((r) => (r.id === rate.id ? newRate : r)))
                        }}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Button onClick={() => updateRoomRate(rate.id, rate)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Base Rate:</span> ₦{rate.base_rate.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Weekend:</span> ₦{rate.weekend_rate.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Holiday:</span> ₦{rate.holiday_rate.toLocaleString()}
                    </div>
                    {rate.description && <div className="md:col-span-3 text-muted-foreground">{rate.description}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Services Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Additional Services
            <Badge variant="secondary">Owner Only</Badge>
          </CardTitle>
          <CardDescription>Manage additional services, amenities, and their pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{service.name}</h3>
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingService(editingService === service.id ? null : service.id)}
                  >
                    {editingService === service.id ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  </Button>
                </div>

                {editingService === service.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Service Name</Label>
                      <Input
                        defaultValue={service.name}
                        onChange={(e) => {
                          const newService = { ...service, name: e.target.value }
                          setServices((prev) => prev.map((s) => (s.id === service.id ? newService : s)))
                        }}
                      />
                    </div>
                    <div>
                      <Label>Price (₦)</Label>
                      <Input
                        type="number"
                        defaultValue={service.price}
                        onChange={(e) => {
                          const newService = { ...service, price: Number(e.target.value) }
                          setServices((prev) => prev.map((s) => (s.id === service.id ? newService : s)))
                        }}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        defaultValue={service.description}
                        onChange={(e) => {
                          const newService = { ...service, description: e.target.value }
                          setServices((prev) => prev.map((s) => (s.id === service.id ? newService : s)))
                        }}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button onClick={() => updateService(service.id, service)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">₦{service.price.toLocaleString()}</div>
                    {service.description && <p className="text-muted-foreground text-sm">{service.description}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
