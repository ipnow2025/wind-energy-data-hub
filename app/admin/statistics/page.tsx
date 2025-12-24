"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

type StatData = {
  date?: string
  week?: string
  month?: string
  year?: string
  visitors: number
  page_views: number
}

export default function AdminStatisticsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [dailyData, setDailyData] = useState<StatData[]>([])
  const [weeklyData, setWeeklyData] = useState<StatData[]>([])
  const [monthlyData, setMonthlyData] = useState<StatData[]>([])
  const [yearlyData, setYearlyData] = useState<StatData[]>([])

  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const availableYears = Array.from({ length: currentYear - 2024 }, (_, i) => 2025 + i)

  const formatValue = (value: number) => {
    return value === 0 ? "-" : value.toLocaleString()
  }

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")

    if (userRole !== "admin") {
      router.push("/login")
      return
    }

    setIsAuthorized(true)
  }, [router])

  const fetchStats = async (period: string, year?: number) => {
    try {
      setIsLoading(true)
      const url = year ? `/api/analytics/stats?period=${period}&year=${year}` : `/api/analytics/stats?period=${period}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.stats) {
        const formattedStats = data.stats.map((stat: any) => ({
          ...stat,
          pageViews: stat.page_views,
        }))

        switch (period) {
          case "daily":
            setDailyData(formattedStats)
            break
          case "weekly":
            setWeeklyData(formattedStats)
            break
          case "monthly":
            setMonthlyData(formattedStats)
            break
          case "yearly":
            setYearlyData(formattedStats)
            break
        }
      }
    } catch (error) {
      console.error(`[v0] Failed to fetch ${period} stats:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthorized) {
      fetchStats("daily")
      fetchStats("weekly")
      fetchStats("monthly", selectedYear)
      fetchStats("yearly")
    }
  }, [isAuthorized, selectedYear])

  const calculateTotals = (data: StatData[]) => {
    const totalVisitors = data.reduce((sum, item) => sum + item.visitors, 0)
    const totalPageViews = data.reduce((sum, item) => sum + item.page_views, 0)
    return { totalVisitors, totalPageViews }
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">접속자 통계</h1>
          
        </div>

        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">일간</TabsTrigger>
            <TabsTrigger value="weekly">주간</TabsTrigger>
            <TabsTrigger value="monthly">월간</TabsTrigger>
            <TabsTrigger value="yearly">연간</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>일간 통계</CardTitle>
                <CardDescription>최근 7일간의 날짜별 접속자 및 페이지뷰</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">로딩 중...</p>
                  </div>
                ) : dailyData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>날짜</TableHead>
                          {dailyData.map((item) => (
                            <TableHead key={item.date} className="text-center">
                              {item.date}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">방문자 수</TableCell>
                          {dailyData.map((item) => (
                            <TableCell key={item.date} className="text-center">
                              {formatValue(item.visitors)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">페이지뷰</TableCell>
                          {dailyData.map((item) => (
                            <TableCell key={item.date} className="text-center">
                              {formatValue(item.page_views)}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">데이터가 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>일간 방문자 수</CardTitle>
                  <CardDescription>최근 7일간의 방문자 추이</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">로딩 중...</p>
                    </div>
                  ) : dailyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="visitors" fill="#0d31ed" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">데이터가 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>일간 페이지뷰</CardTitle>
                  <CardDescription>최근 7일간의 페이지뷰 추이</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">로딩 중...</p>
                    </div>
                  ) : dailyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="pageViews" stroke="#0d31ed" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">데이터가 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>주간 통계</CardTitle>
                <CardDescription>최근 5주간의 주별 접속자 및 페이지뷰</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">로딩 중...</p>
                  </div>
                ) : weeklyData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>주차</TableHead>
                          {weeklyData.map((item) => (
                            <TableHead key={item.week} className="text-center">
                              {item.week}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">방문자 수</TableCell>
                          {weeklyData.map((item) => (
                            <TableCell key={item.week} className="text-center">
                              {formatValue(item.visitors)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">페이지뷰</TableCell>
                          {weeklyData.map((item) => (
                            <TableCell key={item.week} className="text-center">
                              {formatValue(item.page_views)}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">데이터가 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>주간 방문자 수</CardTitle>
                  <CardDescription>최근 5주간의 방문자 추이</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">로딩 중...</p>
                    </div>
                  ) : weeklyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="visitors" fill="#0d31ed" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">데이터가 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>주간 페이지뷰</CardTitle>
                  <CardDescription>최근 5주간의 페이지뷰 추이</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">로딩 중...</p>
                    </div>
                  ) : weeklyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="pageViews" stroke="#0d31ed" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">데이터가 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <div className="flex justify-end">
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}년
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>월간 통계</CardTitle>
                <CardDescription>{selectedYear}년 월별 접속자 및 페이지뷰</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">로딩 중...</p>
                  </div>
                ) : monthlyData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>월</TableHead>
                          {monthlyData.map((item) => (
                            <TableHead key={item.month} className="text-center">
                              {item.month}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">방문자 수</TableCell>
                          {monthlyData.map((item) => (
                            <TableCell key={item.month} className="text-center">
                              {formatValue(item.visitors)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">페이지뷰</TableCell>
                          {monthlyData.map((item) => (
                            <TableCell key={item.month} className="text-center">
                              {formatValue(item.page_views)}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">데이터가 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>월간 방문자 수</CardTitle>
                  <CardDescription>{selectedYear}년 월별 방문자 추이</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">로딩 중...</p>
                    </div>
                  ) : monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="visitors" fill="#0d31ed" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">데이터가 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>월간 페이지뷰</CardTitle>
                  <CardDescription>{selectedYear}년 월별 페이지뷰 추이</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">로딩 중...</p>
                    </div>
                  ) : monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="pageViews" stroke="#0d31ed" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">데이터가 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="yearly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>연간 통계</CardTitle>
                <CardDescription>최근 5년간의 연간 접속자 및 페이지뷰</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">로딩 중...</p>
                  </div>
                ) : yearlyData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>연도</TableHead>
                          {yearlyData.map((item) => (
                            <TableHead key={item.year} className="text-center">
                              {item.year}년
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">방문자 수</TableCell>
                          {yearlyData.map((item) => (
                            <TableCell key={item.year} className="text-center">
                              {formatValue(item.visitors)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">페이지뷰</TableCell>
                          {yearlyData.map((item) => (
                            <TableCell key={item.year} className="text-center">
                              {formatValue(item.page_views)}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">데이터가 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>연간 방문자 수</CardTitle>
                  <CardDescription>최근 5년간의 방문자 추이</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">로딩 중...</p>
                    </div>
                  ) : yearlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="visitors" fill="#0d31ed" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">데이터가 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>연간 페이지뷰</CardTitle>
                  <CardDescription>최근 5년간의 페이지뷰 추이</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">로딩 중...</p>
                    </div>
                  ) : yearlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="pageViews" stroke="#0d31ed" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">데이터가 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
