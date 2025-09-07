"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createBrowserClient } from "@/lib/supabase/client"
import { Plus, FileText, Download, Eye } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Invoice {
  id: string
  invoice_number: string
  guest_id?: string
  customer_name: string
  customer_email: string
  customer_address: string
  invoice_date: string
  due_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  status: string
  notes?: string
  created_at: string
  guests?: {
    full_name: string
    email: string
  }
}

interface Guest {
  id: string
  full_name: string
  email: string
  phone: string
}

export function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [newInvoice, setNewInvoice] = useState({
    guest_id: "",
    customer_name: "",
    customer_email: "",
    customer_address: "",
    subtotal: 0,
    tax_rate: 7.5, // 7.5% VAT
    notes: "",
  })
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [invoicesResponse, guestsResponse] = await Promise.all([
        supabase
          .from("invoices")
          .select(`
            *,
            guests (
              full_name,
              email
            )
          `)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.from("guests").select("id, full_name, email, phone").order("full_name"),
      ])

      if (invoicesResponse.data) setInvoices(invoicesResponse.data)
      if (guestsResponse.data) setGuests(guestsResponse.data)
    } catch (error) {
      console.error("Failed to fetch invoice data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = () => {
    const taxAmount = (newInvoice.subtotal * newInvoice.tax_rate) / 100
    const totalAmount = newInvoice.subtotal + taxAmount
    return { taxAmount, totalAmount }
  }

  const createInvoice = async () => {
    if (!newInvoice.customer_name || !newInvoice.customer_email || newInvoice.subtotal <= 0) {
      toast.error("Please fill in all required fields")
      return
    }

    const { taxAmount, totalAmount } = calculateTotals()
    const invoiceNumber = `INV-${Date.now()}`
    const invoiceDate = new Date().toISOString().split("T")[0]
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // 30 days from now

    try {
      const { error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        guest_id: newInvoice.guest_id || null,
        customer_name: newInvoice.customer_name,
        customer_email: newInvoice.customer_email,
        customer_address: newInvoice.customer_address,
        invoice_date: invoiceDate,
        due_date: dueDate,
        subtotal: newInvoice.subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: "pending",
        notes: newInvoice.notes,
      })

      if (error) throw error

      setNewInvoice({
        guest_id: "",
        customer_name: "",
        customer_email: "",
        customer_address: "",
        subtotal: 0,
        tax_rate: 7.5,
        notes: "",
      })

      fetchData()
      toast.success("Invoice created successfully")
    } catch (error) {
      toast.error("Failed to create invoice")
      console.error("Invoice creation error:", error)
    }
  }

  const updateInvoiceStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("invoices").update({ status }).eq("id", id)

      if (error) throw error

      fetchData()
      toast.success(`Invoice marked as ${status}`)
    } catch (error) {
      toast.error("Failed to update invoice status")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleGuestSelection = (guestId: string) => {
    const selectedGuest = guests.find((g) => g.id === guestId)
    if (selectedGuest) {
      setNewInvoice((prev) => ({
        ...prev,
        guest_id: guestId,
        customer_name: selectedGuest.full_name,
        customer_email: selectedGuest.email,
      }))
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading invoice data...</div>
  }

  const { taxAmount, totalAmount } = calculateTotals()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Management
              </CardTitle>
              <CardDescription>Create and manage invoices for hotel services and bookings</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                  <DialogDescription>Generate an invoice for hotel services</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select Guest (Optional)</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newInvoice.guest_id}
                      onChange={(e) => handleGuestSelection(e.target.value)}
                    >
                      <option value="">Select existing guest or enter manually</option>
                      {guests.map((guest) => (
                        <option key={guest.id} value={guest.id}>
                          {guest.full_name} ({guest.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Customer Name *</Label>
                    <Input
                      value={newInvoice.customer_name}
                      onChange={(e) => setNewInvoice((prev) => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="Customer full name"
                    />
                  </div>
                  <div>
                    <Label>Customer Email *</Label>
                    <Input
                      type="email"
                      value={newInvoice.customer_email}
                      onChange={(e) => setNewInvoice((prev) => ({ ...prev, customer_email: e.target.value }))}
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div>
                    <Label>Customer Address</Label>
                    <Textarea
                      value={newInvoice.customer_address}
                      onChange={(e) => setNewInvoice((prev) => ({ ...prev, customer_address: e.target.value }))}
                      placeholder="Customer billing address"
                    />
                  </div>
                  <div>
                    <Label>Subtotal (₦) *</Label>
                    <Input
                      type="number"
                      value={newInvoice.subtotal}
                      onChange={(e) => setNewInvoice((prev) => ({ ...prev, subtotal: Number(e.target.value) }))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      value={newInvoice.tax_rate}
                      onChange={(e) => setNewInvoice((prev) => ({ ...prev, tax_rate: Number(e.target.value) }))}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={newInvoice.notes}
                      onChange={(e) => setNewInvoice((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes or terms"
                    />
                  </div>

                  {/* Invoice Calculations */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>₦{newInvoice.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax ({newInvoice.tax_rate}%):</span>
                      <span>₦{taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">₦{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button onClick={createInvoice} className="w-full">
                    Create Invoice
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Latest invoices and their payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{invoice.invoice_number}</h3>
                      <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>To: {invoice.customer_name}</div>
                      <div>Email: {invoice.customer_email}</div>
                      <div>
                        Invoice Date: {format(new Date(invoice.invoice_date), "MMM dd, yyyy")} | Due:{" "}
                        {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₦{invoice.total_amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      Subtotal: ₦{invoice.subtotal.toLocaleString()} + Tax: ₦{invoice.tax_amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {invoice.notes && (
                  <div className="text-sm text-muted-foreground mb-3 p-2 bg-gray-50 rounded">
                    <strong>Notes:</strong> {invoice.notes}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  {invoice.status === "pending" && (
                    <Button size="sm" onClick={() => updateInvoiceStatus(invoice.id, "paid")}>
                      Mark Paid
                    </Button>
                  )}
                  {invoice.status === "pending" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateInvoiceStatus(invoice.id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {invoices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No invoices created yet. Create your first invoice above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
