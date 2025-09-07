"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Plus, Minus, ShoppingCart, CreditCard, Scan, UtensilsCrossed } from "lucide-react"
import { toast } from "sonner"

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  description: string
  is_available: boolean
  barcode?: string
}

interface CartItem extends MenuItem {
  quantity: number
}

interface Table {
  id: string
  table_number: string
  status: string
  capacity: number
}

interface POSSystemProps {
  onOrderUpdate: () => void
}

export function POSSystem({ onOrderUpdate }: POSSystemProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [menuResponse, tablesResponse] = await Promise.all([
        supabase.from("menu_items").select("*").eq("is_available", true).order("category", { ascending: true }),
        supabase.from("restaurant_tables").select("*").order("table_number", { ascending: true }),
      ])

      if (menuResponse.data) setMenuItems(menuResponse.data)
      if (tablesResponse.data) setTables(tablesResponse.data)
    } catch (error) {
      toast.error("Failed to load menu data")
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id)
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (itemId: string, change: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + change
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId))
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const processOrder = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }

    if (!selectedTable) {
      toast.error("Please select a table")
      return
    }

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("restaurant_orders")
        .insert({
          table_id: selectedTable,
          total_amount: getTotalAmount(),
          status: "preparing",
          order_type: "dine-in",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      const { error: itemsError } = await supabase.from("restaurant_order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Update table status
      await supabase.from("restaurant_tables").update({ status: "occupied" }).eq("id", selectedTable)

      // Clear cart and reset
      setCart([])
      setSelectedTable("")
      onOrderUpdate()
      toast.success("Order placed successfully!")
    } catch (error) {
      toast.error("Failed to process order")
      console.error("Order processing error:", error)
    }
  }

  const categories = [...new Set(menuItems.map((item) => item.category))]
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading POS system...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu Items */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Menu Items
            </CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{item.category}</Badge>
                          {item.barcode && (
                            <Badge variant="secondary">
                              <Scan className="h-3 w-3 mr-1" />
                              Barcode
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">₦{item.price.toLocaleString()}</div>
                        <Button size="sm" onClick={() => addToCart(item)} className="mt-2">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart and Checkout */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Current Order
            </CardTitle>
            <CardDescription>
              Table: {selectedTable ? tables.find((t) => t.id === selectedTable)?.table_number : "Not selected"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger>
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {tables
                  .filter((table) => table.status === "available")
                  .map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      Table {table.table_number} (Capacity: {table.capacity})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">₦{item.price.toLocaleString()} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <div className="text-center text-muted-foreground py-8">Cart is empty</div>}
            </div>

            {cart.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>₦{getTotalAmount().toLocaleString()}</span>
                </div>
                <Button className="w-full" onClick={processOrder} disabled={!selectedTable}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Process Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
