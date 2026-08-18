"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"

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
import { formatDate, getStage, parseDate, type PrintJob, type ProcessStage } from "@/lib/data"

function daysUntil(dateStr: string): number | null {
  const d = parseDate(dateStr)
  if (!d) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.floor((d.getTime() - today.getTime()) / 86_400_000)
}

function isOverdue(row: Row): boolean {
  if (row.stage === "Selesai") return false
  const days = daysUntil(row.jadwalCetak)
  if (days === null) return false
  return days <= 0
}

function isWarning(row: Row): boolean {
  if (row.stage === "Selesai") return false
  return daysUntil(row.jadwalCetak) === 1
}

function getScheduleRowClass(row: Row): string {
  if (isOverdue(row)) return "bg-red-50 dark:bg-red-950/30"
  if (isWarning(row)) return "bg-yellow-50 dark:bg-yellow-950/30"
  return ""
}

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

interface Row extends PrintJob {
  stage: ProcessStage
}

type AlertFilter = "all" | "overdue" | "warning"

export function JobProgressTable({ jobs }: { jobs: PrintJob[] }) {
  const [stageFilter, setStageFilter] = React.useState<string>("all")
  const [mesinFilter, setMesinFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [alertFilter, setAlertFilter] = React.useState<AlertFilter>("all")

  const rows = React.useMemo<Row[]>(
    () =>
      jobs.map((job) => ({
        ...job,
        stage: getStage(job).stage,
      })),
    [jobs]
  )

  // Counts computed from all unfiltered rows for the alert bar
  const overdueCount = React.useMemo(() => rows.filter(isOverdue).length, [rows])
  const warningCount = React.useMemo(() => rows.filter(isWarning).length, [rows])

  // Toggle alert filter; clicking the same alert again clears the filter
  const toggleAlertFilter = (filter: Exclude<AlertFilter, "all">) => {
    setAlertFilter((current) => (current === filter ? "all" : filter))
  }

  // Distinct mesin values for the filter dropdown
  const mesinOptions = React.useMemo(() => {
    const set = new Set<string>()
    for (const j of jobs) if (j.mesin) set.add(j.mesin)
    return Array.from(set).sort()
  }, [jobs])

  const filtered = React.useMemo(() => {
    return rows.filter((j) => {
      if (alertFilter === "overdue" && !isOverdue(j)) return false
      if (alertFilter === "warning" && !isWarning(j)) return false
      if (stageFilter !== "all" && j.stage !== stageFilter) return false
      if (mesinFilter !== "all" && j.mesin !== mesinFilter) return false
      if (statusFilter === "selesai" && j.stage !== "Selesai") return false
      if (statusFilter === "belum" && j.stage === "Selesai") return false
      return true
    })
  }, [rows, alertFilter, stageFilter, mesinFilter, statusFilter])

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
      },
      {
        accessorKey: "tglSo",
        header: "Tgl SO",
        enableSorting: true,
        cell: ({ row }) => formatDate(row.original.tglSo),
      },
      {
        accessorKey: "pekerjaan",
        header: "Pekerjaan",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="block max-w-[280px] truncate" title={row.original.pekerjaan}>
            {row.original.pekerjaan}
          </span>
        ),
      },
      {
        accessorKey: "mesin",
        header: "Mesin",
        enableSorting: true,
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
        accessorKey: "operator",
        header: "Operator",
        enableSorting: true,
        cell: ({ row }) => row.original.operator || "—",
      },
      {
        accessorKey: "operatorCetak",
        header: "Operator Cetak",
        enableSorting: true,
        cell: ({ row }) => row.original.operatorCetak || "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: ({ row }) =>
          row.original.stage === "Selesai" ? (
            <Badge className="bg-emerald-600 text-white">Selesai</Badge>
          ) : (
            <Badge variant="outline">Belum</Badge>
          ),
      },
    ],
    []
  )

  const toolbar = (
    <>
      <Select value={stageFilter} onValueChange={setStageFilter}>
        <SelectTrigger size="sm" className="w-[160px]">
          <SelectValue placeholder="Proses" />
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

      <Select value={mesinFilter} onValueChange={setMesinFilter}>
        <SelectTrigger size="sm" className="w-[180px]">
          <SelectValue placeholder="Mesin" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Mesin</SelectItem>
          {mesinOptions.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger size="sm" className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="selesai">Selesai</SelectItem>
          <SelectItem value="belum">Belum Cetak</SelectItem>
        </SelectContent>
      </Select>
    </>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress per Job / SO</CardTitle>
        <CardDescription>
          Status proses setiap job dari SO masuk hingga cetak selesai
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(overdueCount > 0 || warningCount > 0) && (
          <div className="flex flex-wrap gap-2">
            {overdueCount > 0 && (
              <button
                type="button"
                onClick={() => toggleAlertFilter("overdue")}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  alertFilter === "overdue"
                    ? "border-red-500 bg-red-100 ring-2 ring-red-500/30 dark:border-red-500 dark:bg-red-900/50"
                    : "border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:hover:bg-red-900/40"
                }`}
              >
                <span className="size-2 rounded-full bg-red-500" />
                <span className="font-medium text-red-700 dark:text-red-400">
                  {overdueCount} job terlambat
                </span>
                <span className="text-red-600/70 dark:text-red-400/70">- jadwal cetak sudah lewat</span>
              </button>
            )}
            {warningCount > 0 && (
              <button
                type="button"
                onClick={() => toggleAlertFilter("warning")}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  alertFilter === "warning"
                    ? "border-yellow-500 bg-yellow-100 ring-2 ring-yellow-500/30 dark:border-yellow-500 dark:bg-yellow-900/50"
                    : "border-yellow-200 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950/30 dark:hover:bg-yellow-900/40"
                }`}
              >
                <span className="size-2 rounded-full bg-yellow-500" />
                <span className="font-medium text-yellow-700 dark:text-yellow-400">
                  {warningCount} job peringatan
                </span>
                <span className="text-yellow-600/70 dark:text-yellow-400/70">- jadwal cetak besok</span>
              </button>
            )}
          </div>
        )}
        <DataTable
          columns={columns}
          data={filtered}
          searchPlaceholder="Cari No SO, Customer, Pekerjaan, Mesin..."
          emptyMessage="Tidak ada data yang cocok."
          toolbar={toolbar}
          getRowClassName={getScheduleRowClass}
        />
      </CardContent>
    </Card>
  )
}