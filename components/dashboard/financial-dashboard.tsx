"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { ChartOfAccounts } from "./chart-of-accounts"
import { TransactionManager } from "./transaction-manager"
import { FinancialReports } from "./financial-reports"
import { PayrollManager } from "./payroll-manager"
import { InvoiceManager } from "./invoice-manager"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import type { UserPermissions } from "@/lib/auth-utils"

interface FinancialDashboardProps {
  userRole: string
  permissions: UserPermissions
}

export function FinancialDashboard({ userRole, permissions }: FinancialDashboardProps) {
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    cashBalance: 0,
    accountsReceivable: 0,
    accountsPayable: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchFinancialStats()
  }, [])

  const fetchFinancialStats = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

      // Get revenue from hotel bookings and restaurant orders
      const [bookingsResponse, ordersResponse, transactionsResponse] = await Promise.all([
        supabase
          .from("reservations")
          .select("total_amount")
          .gte("created_at", `${currentMonth}-01`)
          .lte("created_at", `${currentMonth}-31`),
        supabase
          .from("restaurant_orders")
          .select("total_amount")
          .gte("created_at", `${currentMonth}-01`)
          .lte("created_at", `${currentMonth}-31`),
        supabase
          .from("accounting_transactions")
          .select("amount, transaction_type")
          .gte("created_at", `${currentMonth}-01`)
          .lte("created_at", `${currentMonth}-31`),
      ])

      let totalRevenue = 0
      let totalExpenses = 0

      if (bookingsResponse.data) {
        totalRevenue += bookingsResponse.data.reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
      }

      if (ordersResponse.data) {
        totalRevenue += ordersResponse.data.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      }

      if (transactionsResponse.data) {
        transactionsResponse.data.forEach((transaction) => {
          if (transaction.transaction_type === "expense") {
            totalExpenses += transaction.amount
          }
        })
      }

      setFinancialStats({
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        cashBalance: 0, // This would come from cash accounts
        accountsReceivable: 0, // This would come from AR accounts
        accountsPayable: 0, // This would come from AP accounts
      })
    } catch (error) {
      console.error("Failed to fetch financial stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading financial dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₦{financialStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₦{financialStats.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialStats.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₦{financialStats.netIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Management Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionManager onTransactionUpdate={fetchFinancialStats} />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <ChartOfAccounts />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <FinancialReports />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <PayrollManager />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <InvoiceManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
