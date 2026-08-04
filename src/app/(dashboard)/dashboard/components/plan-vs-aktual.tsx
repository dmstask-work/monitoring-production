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
import { formatDate, getPlanAktual, parseDate, type PrintJob } from "@/lib/data"

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

interface Row extends PrintJob {
  dateMatch: boolean
  shiftMatch: boolean
  operatorMatch: boolean
  hasDate: boolean
  hasShift: boolean
  hasOperator: boolean
}

export function PlanVsAktual({ jobs }: { jobs: PrintJob[] }) {
  const [dateFilter, setDateFilter] = React.useState<string>("all")
  const [shiftFilter, setShiftFilter] = React.useState<string>("all")
  const [operatorFilter, setOperatorFilter] = React.useState<string>("all")

  const rows = React.useMemo<Row[]>(() => {
    return jobs
      .filter((j) => parseDate(j.tglCetak) !== null)
      .map((job) => {
        const pa = getPlanAktual(job)
        return {
          ...job,
          dateMatch: pa.dateMatch,
          shiftMatch: pa.shiftMatch,
          operatorMatch: pa.operatorMatch,
          hasDate: !!pa.planDate && !!pa.aktualDate,
          hasShift: !!pa.planShift || !!pa.aktualShift,
          hasOperator: !!pa.planOperator || !!pa.aktualOperator,
        }
      })
  }, [jobs])

  const filtered = React.useMemo(() => {
    return rows.filter((j) => {
      if (dateFilter === "sesuai" && !j.dateMatch) return false
      if (dateFilter === "tidak" && j.dateMatch) return false
      if (shiftFilter === "sesuai" && !j.shiftMatch) return false
      if (shiftFilter === "tidak" && j.shiftMatch) return false
      if (operatorFilter === "sesuai" && !j.operatorMatch) return false
      if (operatorFilter === "tidak" && j.operatorMatch) return false
      return true
    })
  }, [rows, dateFilter, shiftFilter, operatorFilter])

  const columns = React.useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "noSo",
        header: "No SO",
        enableSorting: true,
      },
      {
        accessorKey: "jadwalCetak",
        header: "Jadwal Cetak (Plan)",
        enableSorting: true,
        cell: ({ row }) => formatDate(row.original.jadwalCetak),
      },
      {
        accessorKey: "shiftJadwal",
        header: "Shift Jadwal",
        enableSorting: true,
        cell: ({ row }) => row.original.shiftJadwal || "—",
      },
      {
        accessorKey: "operator",
        header: "Operator (Plan)",
        enableSorting: true,
        cell: ({ row }) => row.original.operator || "—",
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
        accessorKey: "operatorCetak",
        header: "Operator Cetak",
        enableSorting: true,
        cell: ({ row }) => row.original.operatorCetak || "—",
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
        accessorKey: "operatorMatch",
        header: "Operator",
        enableSorting: true,
        cell: ({ row }) =>
          row.original.hasOperator ? (
            <MatchBadge match={row.original.operatorMatch} />
          ) : (
            <MatchBadge match={false} showEmpty />
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

      <Select value={operatorFilter} onValueChange={setOperatorFilter}>
        <SelectTrigger size="sm" className="w-[160px]">
          <SelectValue placeholder="Filter Operator" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Operator</SelectItem>
          <SelectItem value="sesuai">Operator Sesuai</SelectItem>
          <SelectItem value="tidak">Operator Tidak Sesuai</SelectItem>
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
          searchPlaceholder="Cari No SO, Operator..."
          emptyMessage="Tidak ada data Plan vs Aktual."
          toolbar={toolbar}
        />
      </CardContent>
    </Card>
  )
}