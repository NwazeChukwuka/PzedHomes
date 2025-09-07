"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBrowserClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, Scan } from "lucide-react"
import { toast } from "sonner"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  is_available: boolean
  barcode?: string
  created_at: string
}

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    barcode: "",
  })
  const supabase = createBrowserClient()

  const categories = [
    "Appetizers",
    "Main Course",
    "Desserts",
    "Beverages",
    "Alcoholic Drinks",
    "Cocktails",
    "Snacks",
    "Breakfast",
  ]

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase.from("menu_items").select("*").order("category", { ascending: true })

      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error("Failed to fetch menu items:", error)
    } finally {
      setLoading(false)
    }
  }

  const createMenuItem = async () => {
    if (!newItem.name || !newItem.category || newItem.price <= 0) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const { error } = await supabase.from("menu_items").insert({
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        category: newItem.category,
        barcode: newItem.barcode || null,
        is_available: true,
      })

      if (error) throw error

      setNewItem({ name: "", description: "", price: 0, category: "", barcode: "" })
      fetchMenuItems()
      toast.success("Menu item created successfully")
    } catch (error) {
      toast.error("Failed to create menu item")
    }
  }

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const { error } = await supabase.from("menu_items").update(updates).eq("id", id)

      if (error) throw error

      fetchMenuItems()
      setEditingItem(null)
      toast.success("Menu item updated successfully")
    } catch (error) {
      toast.error("Failed to update menu item")
    }
  }

  const toggleAvailability = async (id: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase.from("menu_items").update({ is_available: isAvailable }).eq("id", id)

      if (error) throw error

      fetchMenuItems()
      toast.success(`Item ${isAvailable ? "enabled" : "disabled"} successfully`)
    } catch (error) {
      toast.error("Failed to update item availability")
    }
  }

  const deleteMenuItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return

    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id)

      if (error) throw error

      fetchMenuItems()
      toast.success("Menu item deleted successfully")
    } catch (error) {
      toast.error("Failed to delete menu item")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading menu management...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>
                Total items: {menuItems.length} | Available: {menuItems.filter((item) => item.is_available).length} |
                Unavailable: {menuItems.filter((item) => !item.is_available).length}
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Menu Item</DialogTitle>
                  <DialogDescription>Create a new item for the restaurant menu</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Item Name *</Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Grilled Chicken"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the item"
                    />
                  </div>
                  <div>
                    <Label>Price (₦) *</Label>
                    <Input
                      type="number"
                      value={newItem.price}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, price: Number(e.target.value) }))}
                      min="0"
                      step="100"
                    />
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Barcode (Optional)</Label>
                    <Input
                      value={newItem.barcode}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, barcode: e.target.value }))}
                      placeholder="Barcode for inventory tracking"
                    />
                  </div>
                  <Button onClick={createMenuItem} className="w-full">
                    Create Menu Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Card key={item.id} className={`${!item.is_available ? "opacity-60" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription className="mt-1">{item.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.category}</Badge>
                  {item.barcode && (
                    <Badge variant="secondary">
                      <Scan className="h-3 w-3 mr-1" />
                      Barcode
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">₦{item.price.toLocaleString()}</div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`available-${item.id}`} className="text-sm">
                    Available
                  </Label>
                  <Switch
                    id={`available-${item.id}`}
                    checked={item.is_available}
                    onCheckedChange={(checked) => toggleAvailability(item.id, checked)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => setEditingItem(item)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Menu Item</DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                      <div className="space-y-4">
                        <div>
                          <Label>Item Name</Label>
                          <Input
                            value={editingItem.name}
                            onChange={(e) =>
                              setEditingItem((prev) => (prev ? { ...prev, name: e.target.value } : null))
                            }
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={editingItem.description}
                            onChange={(e) =>
                              setEditingItem((prev) => (prev ? { ...prev, description: e.target.value } : null))
                            }
                          />
                        </div>
                        <div>
                          <Label>Price (₦)</Label>
                          <Input
                            type="number"
                            value={editingItem.price}
                            onChange={(e) =>
                              setEditingItem((prev) => (prev ? { ...prev, price: Number(e.target.value) } : null))
                            }
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Select
                            value={editingItem.category}
                            onValueChange={(value) =>
                              setEditingItem((prev) => (prev ? { ...prev, category: value } : null))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Barcode</Label>
                          <Input
                            value={editingItem.barcode || ""}
                            onChange={(e) =>
                              setEditingItem((prev) => (prev ? { ...prev, barcode: e.target.value } : null))
                            }
                          />
                        </div>
                        <Button onClick={() => updateMenuItem(item.id, editingItem)} className="w-full">
                          Update Item
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="destructive" onClick={() => deleteMenuItem(item.id)}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
