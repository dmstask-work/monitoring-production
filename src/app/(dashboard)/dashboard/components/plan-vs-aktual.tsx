"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { CheckCircle2, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/data-table"
import { formatDate, getPlanAktual, getStage, parseDate, type PrintJob, type ProcessStage } from "@/lib/data"

const STAGE_STYLES: Record<ProcessStage, string> = {
  "SO Masuk": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "Persiapan Bahan": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Tinta: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Plate: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "Jadwal Cetak": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Cetak: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Selesai: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
}

const ALL_STAGES: ProcessStage[] = [
  "SO Masuk",
  "Persiapan Bahan",
  "Tinta",
  "Plate",
  "Jadwal Cetak",
  "Cetak",
  "Selesai",
]

function MatchBadge({ match, showEmpty }: { match: boolean; showEmpty?: boolean }) {
  if (showEmpty) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        —
      </Badge>
    )
  }
  return match ? (
    <Badge className="bg-emerald-600 text-white">
      <CheckCircle2 /> Sesuai
    </Badge>
  ) : (
    <Badge variant="destructive">
      <XCircle /> Tidak
    </Badge>
  )
}

// Days until jadwalCetak: negative = overdue, 0 = today
function daysUntil(dateStr: string): number | null {
  const d = parseDate(dateStr)
  if (!d) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.floor((d.getTime() - today.getTime()) / 86_400_000)
}

function getScheduleRowClass(row: Row): string {
  if (row.isPrintComplete) return ""
  const days = daysUntil(row.jadwalCetak)
  if (days === null) return ""
  if (days <= 0) return "bg-red-50 dark:bg-red-950/30"
  if (days === 1) return "bg-yellow-50 dark:bg-yellow-950/30"
  return ""
}

interface Row extends PrintJob {
  dateMatch: boolean
  shiftMatch: boolean
  hasDate: boolean
  hasShift: boolean
  isPrintComplete: boolean
  stage: ProcessStage
}

export function PlanVsAktual({ jobs }: { jobs: PrintJob[] }) {
  const [dateFilter, setDateFilter] = React.useState<string>("all")
  const [shiftFilter, setShiftFilter] = React.useState<string>("all")
  const [prosesFilter, setProsesFilter] = React.useState<string>("all")

  const rows = React.useMemo<Row[]>(() => {
    return jobs
      .filter((j) => parseDate(j.tglCetak) !== null)
      .map((job) => {
        const pa = getPlanAktual(job)
        const statusLower = job.status.trim().toLowerCase()
        return {
          ...job,
          dateMatch: pa.dateMatch,
          shiftMatch: pa.shiftMatch,
          hasDate: !!pa.planDate && !!pa.aktualDate,
          hasShift: !!pa.planShift || !!pa.aktualShift,
          isPrintComplete:
            statusLower === "selesai cetak" || statusLower === "done",
          stage: getStage(job).stage,
        }
      })
  }, [jobs])

  const filtered = React.useMemo(() => {
    return rows.filter((j) => {
      if (dateFilter === "sesuai" && !j.dateMatch) return false
      if (dateFilter === "tidak" && j.dateMatch) return false
      if (shiftFilter === "sesuai" && !j.shiftMatch) return false
      if (shiftFilter === "tidak" && j.shiftMatch) return false
      if (prosesFilter !== "all" && j.stage !== prosesFilter) return false
      return true
    })
  }, [rows, dateFilter, shiftFilter, prosesFilter])

  const columns = React.useMemo<ColumnDef<Row>[]>(
    () => [
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
        header: "Pekerjaan",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="block max-w-[240px] truncate" title={row.original.pekerjaan}>
            {row.original.pekerjaan || "—"}
          </span>
        ),
      },
      {
        accessorKey: "stage",
        header: "Proses",
        enableSorting: true,
        cell: ({ row }) => (
          <Badge variant="secondary" className={STAGE_STYLES[row.original.stage]}>
            {row.original.stage}
          </Badge>
        ),
      },
      {
        accessorKey: "jadwalCetak",
        header: "Jadwal Cetak (Plan)",
        enableSorting: true,
        cell: ({ row }) => {
          const days = daysUntil(row.original.jadwalCetak)
          const urgency =
            !row.original.isPrintComplete && days !== null
              ? days <= 0
                ? "text-red-600 dark:text-red-400 font-semibold"
                : days === 1
                ? "text-yellow-600 dark:text-yellow-400 font-semibold"
                : ""
              : ""
          return (
            <span className={urgency}>
              {formatDate(row.original.jadwalCetak)}
            </span>
          )
        },
      },
      {
        accessorKey: "shiftJadwal",
        header: "Shift Jadwal",
        enableSorting: true,
        cell: ({ row }) => row.original.shiftJadwal || "—",
      },
      {
        accessorKey: "tglCetak",
        header: "Tgl Cetak (Aktual)",
        enableSorting: true,
        cell: ({ row }) => formatDate(row.original.tglCetak),
      },
      {
        accessorKey: "shiftCetak",
        header: "Shift Cetak",
        enableSorting: true,
        cell: ({ row }) => row.original.shiftCetak || "—",
      },
      {
        accessorKey: "dateMatch",
        header: "Tanggal",
        enableSorting: true,
        cell: ({ row }) =>
          row.original.hasDate ? (
            <MatchBadge match={row.original.dateMatch} />
          ) : (
            <MatchBadge match={false} showEmpty />
          ),
      },
      {
        accessorKey: "shiftMatch",
        header: "Shift",
        enableSorting: true,
        cell: ({ row }) =>
          row.original.hasShift ? (
            <MatchBadge match={row.original.shiftMatch} />
          ) : (
            <MatchBadge match={false} showEmpty />
          ),
      },
      {
        accessorKey: "isPrintComplete",
        header: "Flag",
        enableSorting: true,
        cell: ({ row }) =>
          row.original.isPrintComplete ? (
            <Badge className="bg-blue-600 text-white whitespace-nowrap">
              <CheckCircle2 className="mr-1 size-3" />
              Cetak Complete
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              —
            </Badge>
          ),
      },
    ],
    []
  )

  const toolbar = (
    <>
      <Select value={dateFilter} onValueChange={setDateFilter}>
        <SelectTrigger size="sm" className="w-[160px]">
          <SelectValue placeholder="Filter Tanggal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tanggal</SelectItem>
          <SelectItem value="sesuai">Tanggal Sesuai</SelectItem>
          <SelectItem value="tidak">Tanggal Tidak Sesuai</SelectItem>
        </SelectContent>
      </Select>

      <Select value={shiftFilter} onValueChange={setShiftFilter}>
        <SelectTrigger size="sm" className="w-[150px]">
          <SelectValue placeholder="Filter Shift" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Shift</SelectItem>
          <SelectItem value="sesuai">Shift Sesuai</SelectItem>
          <SelectItem value="tidak">Shift Tidak Sesuai</SelectItem>
        </SelectContent>
      </Select>

      <Select value={prosesFilter} onValueChange={setProsesFilter}>
        <SelectTrigger size="sm" className="w-[160px]">
          <SelectValue placeholder="Filter Proses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Proses</SelectItem>
          {ALL_STAGES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan vs Aktual Cetak</CardTitle>
        <CardDescription>
          Perbandingan Jadwal Cetak (Plan) dengan realisasi Tgl Cetak (Aktual)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={filtered}
          searchPlaceholder="Cari No SO, Customer, Pekerjaan..."
          emptyMessage="Tidak ada data Plan vs Aktual."
          toolbar={toolbar}
          getRowClassName={getScheduleRowClass}
        />
      </CardContent>
    </Card>
  )
}

