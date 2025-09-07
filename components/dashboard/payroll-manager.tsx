"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Users, Plus, Calendar } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface PayrollRecord {
  id: string
  employee_id: string
  pay_period_start: string
  pay_period_end: string
  basic_salary: number
  overtime_hours: number
  overtime_rate: number
  bonuses: number
  deductions: number
  gross_pay: number
  tax_deductions: number
  net_pay: number
  status: string
  created_at: string
  profiles: {
    full_name: string
    role: string
  }
}

interface Employee {
  id: string
  full_name: string
  role: string
  email: string
}

export function PayrollManager() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [newPayroll, setNewPayroll] = useState({
    employee_id: "",
    basic_salary: 0,
    overtime_hours: 0,
    overtime_rate: 0,
    bonuses: 0,
    deductions: 0,
  })
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [payrollResponse, employeesResponse] = await Promise.all([
        supabase
          .from("payroll")
          .select(`
            *,
            profiles (
              full_name,
              role
            )
          `)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.from("profiles").select("id, full_name, role, email").neq("role", "guest").order("full_name"),
      ])

      if (payrollResponse.data) setPayrollRecords(payrollResponse.data)
      if (employeesResponse.data) setEmployees(employeesResponse.data)
    } catch (error) {
      console.error("Failed to fetch payroll data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePayroll = () => {
    const overtimePay = newPayroll.overtime_hours * newPayroll.overtime_rate
    const grossPay = newPayroll.basic_salary + overtimePay + newPayroll.bonuses
    const taxDeductions = grossPay * 0.1 // 10% tax rate (simplified)
    const netPay = grossPay - taxDeductions - newPayroll.deductions

    return {
      overtimePay,
      grossPay,
      taxDeductions,
      netPay,
    }
  }

  const processPayroll = async () => {
    if (!newPayroll.employee_id || newPayroll.basic_salary <= 0) {
      toast.error("Please select an employee and enter basic salary")
      return
    }

    const calculations = calculatePayroll()
    const now = new Date()
    const payPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const payPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    try {
      const { error } = await supabase.from("payroll").insert({
        employee_id: newPayroll.employee_id,
        pay_period_start: payPeriodStart.toISOString().split("T")[0],
        pay_period_end: payPeriodEnd.toISOString().split("T")[0],
        basic_salary: newPayroll.basic_salary,
        overtime_hours: newPayroll.overtime_hours,
        overtime_rate: newPayroll.overtime_rate,
        bonuses: newPayroll.bonuses,
        deductions: newPayroll.deductions,
        gross_pay: calculations.grossPay,
        tax_deductions: calculations.taxDeductions,
        net_pay: calculations.netPay,
        status: "processed",
      })

      if (error) throw error

      setNewPayroll({
        employee_id: "",
        basic_salary: 0,
        overtime_hours: 0,
        overtime_rate: 0,
        bonuses: 0,
        deductions: 0,
      })

      fetchData()
      toast.success("Payroll processed successfully")
    } catch (error) {
      toast.error("Failed to process payroll")
      console.error("Payroll processing error:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "paid":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading payroll data...</div>
  }

  const calculations = calculatePayroll()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Payroll Management
              </CardTitle>
              <CardDescription>Process employee payroll and manage salary payments</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Process Payroll
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Process Employee Payroll</DialogTitle>
                  <DialogDescription>Calculate and process salary for an employee</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Employee *</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newPayroll.employee_id}
                      onChange={(e) => setNewPayroll((prev) => ({ ...prev, employee_id: e.target.value }))}
                    >
                      <option value="">Select employee</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.full_name} ({employee.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Basic Salary (₦) *</Label>
                    <Input
                      type="number"
                      value={newPayroll.basic_salary}
                      onChange={(e) => setNewPayroll((prev) => ({ ...prev, basic_salary: Number(e.target.value) }))}
                      min="0"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Overtime Hours</Label>
                      <Input
                        type="number"
                        value={newPayroll.overtime_hours}
                        onChange={(e) => setNewPayroll((prev) => ({ ...prev, overtime_hours: Number(e.target.value) }))}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label>Overtime Rate (₦)</Label>
                      <Input
                        type="number"
                        value={newPayroll.overtime_rate}
                        onChange={(e) => setNewPayroll((prev) => ({ ...prev, overtime_rate: Number(e.target.value) }))}
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Bonuses (₦)</Label>
                    <Input
                      type="number"
                      value={newPayroll.bonuses}
                      onChange={(e) => setNewPayroll((prev) => ({ ...prev, bonuses: Number(e.target.value) }))}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label>Deductions (₦)</Label>
                    <Input
                      type="number"
                      value={newPayroll.deductions}
                      onChange={(e) => setNewPayroll((prev) => ({ ...prev, deductions: Number(e.target.value) }))}
                      min="0"
                    />
                  </div>

                  {/* Payroll Calculations */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Basic Salary:</span>
                      <span>₦{newPayroll.basic_salary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Overtime Pay:</span>
                      <span>₦{calculations.overtimePay.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Bonuses:</span>
                      <span>₦{newPayroll.bonuses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Gross Pay:</span>
                      <span>₦{calculations.grossPay.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Tax Deductions (10%):</span>
                      <span>-₦{calculations.taxDeductions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Other Deductions:</span>
                      <span>-₦{newPayroll.deductions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Net Pay:</span>
                      <span className="text-green-600">₦{calculations.netPay.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button onClick={processPayroll} className="w-full">
                    Process Payroll
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Payroll Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payroll Records</CardTitle>
          <CardDescription>Latest salary payments and payroll processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrollRecords.map((record) => (
              <div key={record.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{record.profiles.full_name}</h3>
                      <Badge variant="outline">{record.profiles.role}</Badge>
                      <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(record.pay_period_start), "MMM dd")} -{" "}
                        {format(new Date(record.pay_period_end), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">₦{record.net_pay.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Net Pay</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Basic Salary:</span>
                    <div className="font-medium">₦{record.basic_salary.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gross Pay:</span>
                    <div className="font-medium">₦{record.gross_pay.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tax Deductions:</span>
                    <div className="font-medium text-red-600">₦{record.tax_deductions.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Other Deductions:</span>
                    <div className="font-medium text-red-600">₦{record.deductions.toLocaleString()}</div>
                  </div>
                </div>

                {(record.overtime_hours > 0 || record.bonuses > 0) && (
                  <div className="grid grid-cols-2 gap-4 text-sm mt-2 pt-2 border-t">
                    {record.overtime_hours > 0 && (
                      <div>
                        <span className="text-muted-foreground">Overtime:</span>
                        <div className="font-medium">
                          {record.overtime_hours}h @ ₦{record.overtime_rate.toLocaleString()}/h
                        </div>
                      </div>
                    )}
                    {record.bonuses > 0 && (
                      <div>
                        <span className="text-muted-foreground">Bonuses:</span>
                        <div className="font-medium text-green-600">₦{record.bonuses.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {payrollRecords.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No payroll records found. Process your first payroll above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
