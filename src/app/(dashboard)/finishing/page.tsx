"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { CheckCircle2, CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DataTable } from "@/components/data-table"
import { formatDate, parseDate, type PrintJob } from "@/lib/data"
import { usePrintData } from "@/hooks/use-print-data"

interface CompletedJob extends PrintJob {
  isPrintComplete: true
}

const columns: ColumnDef<CompletedJob>[] = [
  {
    accessorKey: "noSo",
    header: "No SO",
    enableSorting: true,
  },
  {
    accessorKey: "customer",
    header: "Customer",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="block max-w-[200px] truncate" title={row.original.customer}>
        {row.original.customer || "—"}
      </span>
    ),
  },
  {
    accessorKey: "pekerjaan",
    header: "Pekerjaan / Job",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="block max-w-[260px] truncate" title={row.original.pekerjaan}>
        {row.original.pekerjaan || "—"}
      </span>
    ),
  },
  {
    accessorKey: "mesin",
    header: "Mesin",
    enableSorting: true,
  },
  {
    accessorKey: "jadwalCetak",
    header: "Jadwal Cetak",
    enableSorting: true,
    cell: ({ row }) => formatDate(row.original.jadwalCetak),
  },
  {
    accessorKey: "tglCetak",
    header: "Tgl Cetak",
    enableSorting: true,
    cell: ({ row }) => formatDate(row.original.tglCetak),
  },
  {
    accessorKey: "ctkBaik",
    header: "Cetak Baik",
    enableSorting: true,
    cell: ({ row }) => row.original.ctkBaik || "—",
  },
  {
    accessorKey: "tanggalKirimKeLamper",
    header: "Tgl Kirim ke Lamper",
    enableSorting: true,
    cell: ({ row }) => formatDate(row.original.tanggalKirimKeLamper),
  },
  {
    id: "flag",
    header: "Status",
    enableSorting: false,
    cell: () => (
      <Badge className="bg-blue-600 text-white whitespace-nowrap">
        <CheckCircle2 className="mr-1 size-3" />
        Cetak Complete
      </Badge>
    ),
  },
]

export default function FinishingPage() {
  const { jobs, loading, error } = usePrintData()
  const [dateRange, setDateRange] = React.useState<DateRange>(() => {
    const now = new Date()
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    }
  })

  const completedJobs = React.useMemo<CompletedJob[]>(() => {
    const { from, to } = dateRange
    const start = from
      ? new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
      : -Infinity
    const end = to
      ? new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999).getTime()
      : Infinity

    return jobs
      .filter((j) => {
        const s = j.status.trim().toLowerCase()
        if (s !== "selesai cetak" && s !== "done") return false
        const d = parseDate(j.tglCetak)
        if (!d) return false
        const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
        return t >= start && t <= end
      })
      .map((j) => ({ ...j, isPrintComplete: true as const }))
  }, [jobs, dateRange])

  const hasFilter = !!(dateRange.from || dateRange.to)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground mt-2">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Gagal memuat data: {error}</p>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Cetak Complete - Finishing</h1>

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
          Daftar SO dan Job yang sudah selesai cetak dan siap untuk proses finishing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SO &amp; Job Selesai Cetak</CardTitle>
          <CardDescription>
            {completedJobs.length} job dengan status <strong>Cetak Complete</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={completedJobs}
            searchPlaceholder="Cari No SO, Customer, Pekerjaan..."
            emptyMessage="Belum ada job yang selesai cetak pada periode ini."
          />
        </CardContent>
      </Card>
    </div>
  )
}

