"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { BarChart3, FileText, Download, Calendar } from "lucide-react"
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"

interface ReportData {
  account_name: string
  account_type: string
  total_debit: number
  total_credit: number
  balance: number
}

export function FinancialReports() {
  const [reportType, setReportType] = useState("profit-loss")
  const [reportPeriod, setReportPeriod] = useState("current-month")
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    generateReport()
  }, [reportType, reportPeriod])

  const getDateRange = () => {
    const now = new Date()
    switch (reportPeriod) {
      case "current-month":
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case "current-year":
        return { start: startOfYear(now), end: endOfYear(now) }
      case "last-month":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  }

  const generateReport = async () => {
    setLoading(true)
    try {
      const { start, end } = getDateRange()

      const { data, error } = await supabase
        .from("accounting_entries")
        .select(`
          debit_amount,
          credit_amount,
          chart_of_accounts (
            account_name,
            account_type
          ),
          accounting_transactions (
            transaction_date
          )
        `)
        .gte("accounting_transactions.transaction_date", format(start, "yyyy-MM-dd"))
        .lte("accounting_transactions.transaction_date", format(end, "yyyy-MM-dd"))

      if (error) throw error

      // Group by account and calculate balances
      const accountTotals = new Map<string, ReportData>()

      data?.forEach((entry) => {
        const accountName = entry.chart_of_accounts.account_name
        const accountType = entry.chart_of_accounts.account_type

        if (!accountTotals.has(accountName)) {
          accountTotals.set(accountName, {
            account_name: accountName,
            account_type: accountType,
            total_debit: 0,
            total_credit: 0,
            balance: 0,
          })
        }

        const account = accountTotals.get(accountName)!
        account.total_debit += entry.debit_amount || 0
        account.total_credit += entry.credit_amount || 0

        // Calculate balance based on account type
        if (["Assets", "Expenses", "Cost of Goods Sold"].includes(accountType)) {
          account.balance = account.total_debit - account.total_credit
        } else {
          account.balance = account.total_credit - account.total_debit
        }
      })

      setReportData(Array.from(accountTotals.values()))
    } catch (error) {
      console.error("Failed to generate report:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderProfitLossReport = () => {
    const revenue = reportData.filter((item) => item.account_type === "Revenue")
    const expenses = reportData.filter((item) => item.account_type === "Expenses")
    const cogs = reportData.filter((item) => item.account_type === "Cost of Goods Sold")

    const totalRevenue = revenue.reduce((sum, item) => sum + item.balance, 0)
    const totalExpenses = expenses.reduce((sum, item) => sum + item.balance, 0)
    const totalCOGS = cogs.reduce((sum, item) => sum + item.balance, 0)
    const netIncome = totalRevenue - totalExpenses - totalCOGS

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-600">Revenue</h3>
          <div className="space-y-2">
            {revenue.map((item) => (
              <div key={item.account_name} className="flex justify-between">
                <span>{item.account_name}</span>
                <span className="font-mono">₦{item.balance.toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total Revenue</span>
              <span className="font-mono text-green-600">₦{totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {cogs.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-orange-600">Cost of Goods Sold</h3>
            <div className="space-y-2">
              {cogs.map((item) => (
                <div key={item.account_name} className="flex justify-between">
                  <span>{item.account_name}</span>
                  <span className="font-mono">₦{item.balance.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total COGS</span>
                <span className="font-mono text-orange-600">₦{totalCOGS.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-3 text-red-600">Expenses</h3>
          <div className="space-y-2">
            {expenses.map((item) => (
              <div key={item.account_name} className="flex justify-between">
                <span>{item.account_name}</span>
                <span className="font-mono">₦{item.balance.toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total Expenses</span>
              <span className="font-mono text-red-600">₦{totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="border-t-2 pt-4">
          <div
            className={`flex justify-between text-xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            <span>Net Income</span>
            <span className="font-mono">₦{netIncome.toLocaleString()}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderBalanceSheetReport = () => {
    const assets = reportData.filter((item) => item.account_type === "Assets")
    const liabilities = reportData.filter((item) => item.account_type === "Liabilities")
    const equity = reportData.filter((item) => item.account_type === "Equity")

    const totalAssets = assets.reduce((sum, item) => sum + item.balance, 0)
    const totalLiabilities = liabilities.reduce((sum, item) => sum + item.balance, 0)
    const totalEquity = equity.reduce((sum, item) => sum + item.balance, 0)

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Assets</h3>
          <div className="space-y-2">
            {assets.map((item) => (
              <div key={item.account_name} className="flex justify-between">
                <span>{item.account_name}</span>
                <span className="font-mono">₦{item.balance.toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total Assets</span>
              <span className="font-mono text-blue-600">₦{totalAssets.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-red-600">Liabilities</h3>
            <div className="space-y-2">
              {liabilities.map((item) => (
                <div key={item.account_name} className="flex justify-between">
                  <span>{item.account_name}</span>
                  <span className="font-mono">₦{item.balance.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Liabilities</span>
                <span className="font-mono text-red-600">₦{totalLiabilities.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-purple-600">Equity</h3>
            <div className="space-y-2">
              {equity.map((item) => (
                <div key={item.account_name} className="flex justify-between">
                  <span>{item.account_name}</span>
                  <span className="font-mono">₦{item.balance.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Equity</span>
                <span className="font-mono text-purple-600">₦{totalEquity.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="border-t-2 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Liabilities + Equity</span>
              <span className="font-mono">₦{(totalLiabilities + totalEquity).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Financial Reports
              </CardTitle>
              <CardDescription>Generate comprehensive financial statements and reports</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profit-loss">Profit & Loss</SelectItem>
                  <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
                </SelectContent>
              </Select>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {reportType === "profit-loss" ? "Profit & Loss Statement" : "Balance Sheet"}
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {reportPeriod === "current-month" && `${format(getDateRange().start, "MMMM yyyy")}`}
            {reportPeriod === "last-month" && `${format(getDateRange().start, "MMMM yyyy")}`}
            {reportPeriod === "current-year" && `${format(getDateRange().start, "yyyy")}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">Generating report...</div>
          ) : (
            <div>{reportType === "profit-loss" ? renderProfitLossReport() : renderBalanceSheetReport()}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
