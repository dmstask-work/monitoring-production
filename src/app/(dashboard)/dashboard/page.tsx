"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { CalendarIcon, X } from "lucide-react"

import { usePrintData } from "@/hooks/use-print-data"
import { KpiCards } from "./components/kpi-cards"
import { JobProgressTable } from "./components/job-progress-table"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  parseDate,
  summarizeKpis,
  monthlyVolume,
  operatorStats,
  stageDistribution,
  type PrintJob,
} from "@/lib/data"

// Lazy-load below-the-fold sections so the KPI cards and first table paint first.
const MonthlyVolumeChart = dynamic(
  () => import("./components/monthly-volume-chart").then((m) => m.MonthlyVolumeChart),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse rounded-lg bg-muted" /> }
)
const StageDistribution = dynamic(
  () => import("./components/stage-distribution").then((m) => m.StageDistribution),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse rounded-lg bg-muted" /> }
)
const PlanVsAktual = dynamic(
  () => import("./components/plan-vs-aktual").then((m) => m.PlanVsAktual),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse rounded-lg bg-muted" /> }
)
const OperatorAnalysis = dynamic(
  () => import("./components/operator-analysis").then((m) => m.OperatorAnalysis),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse rounded-lg bg-muted" /> }
)

export default function Page() {
  const { jobs, source, loading, error } = usePrintData()
  const [dateRange, setDateRange] = React.useState<DateRange>(() => {
    const now = new Date()
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    }
  })

  // Filter jobs by Tgl Cetak within the selected date range.
  const filteredJobs = React.useMemo(() => {
    const { from, to } = dateRange
    if (!from && !to) return jobs
    const start = from
      ? new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
      : -Infinity
    const end = to
      ? new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999).getTime()
      : Infinity
    return jobs.filter((job: PrintJob) => {
      const d = parseDate(job.tglSo)
      if (!d) return false
      const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      return t >= start && t <= end
    })
  }, [jobs, dateRange])

  // Recompute all aggregations against the date-filtered jobs using the
  // same aggregation functions as usePrintData, so KPI/charts/tables stay
  // consistent with each other.
  const filteredData = React.useMemo(() => {
    return {
      kpi: summarizeKpis(filteredJobs),
      monthly: monthlyVolume(filteredJobs),
      operators: operatorStats(filteredJobs),
      stages: stageDistribution(filteredJobs),
    }
  }, [filteredJobs])

  const hasFilter = !!(dateRange.from || dateRange.to)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Memuat data produksi...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-destructive">
          <p>Gagal memuat data: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Monitoring Produksi</h1>
            {/* <Badge variant="outline">
              {source === "sheets" ? "Live Google Sheets" : "Data CSV (fallback)"}
            </Badge> */}

            {/* Date range filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <CalendarIcon className="size-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd MMM yyyy")} –{" "}
                        {format(dateRange.to, "dd MMM yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd MMM yyyy")
                    )
                  ) : (
                    "Filter by Tanggal"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) =>
                    setDateRange(range ?? { from: undefined, to: undefined })
                  }
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {hasFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground"
                onClick={() => setDateRange({ from: undefined, to: undefined })}
              >
                <X className="size-4" />
                Reset
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">
            Tracking job produksi dari Sales Order, persiapan, hingga cetak selesai
          </p>
        </div>
      </div>

      <div className="@container/main px-4 lg:px-6 space-y-6">
        <KpiCards kpis={filteredData.kpi} />

        <div className="grid gap-6 xl:grid-cols-2">
          <MonthlyVolumeChart data={filteredData.monthly} />
          <StageDistribution data={filteredData.stages} />
        </div>

        <JobProgressTable jobs={filteredJobs} />

        <PlanVsAktual jobs={filteredJobs} />

        <OperatorAnalysis data={filteredData.operators} />
      </div>
    </>
  )
}