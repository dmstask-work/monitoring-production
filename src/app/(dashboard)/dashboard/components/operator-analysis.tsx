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
import type { OperatorStat } from "@/lib/data"

interface Row extends OperatorStat {
  pct: number
}

export function OperatorAnalysis({ data }: { data: OperatorStat[] }) {
  const [operatorFilter, setOperatorFilter] = React.useState<string>("all")
  const [aktualFilter, setAktualFilter] = React.useState<string>("all")

  const rows = React.useMemo<Row[]>(
    () =>
      data.map((op) => {
        // Porsi = Aktual vs Plan: percentage of planned work actually completed.
        const pct =
          op.planCount > 0
            ? Math.round((op.aktualCount / op.planCount) * 100)
            : 0
        return {
          ...op,
          pct,
        }
      }),
    [data]
  )

  const filtered = React.useMemo(() => {
    return rows.filter((op) => {
      if (operatorFilter !== "all" && op.name !== operatorFilter) return false
      if (aktualFilter === "5" && op.aktualCount < 5) return false
      if (aktualFilter === "10" && op.aktualCount < 10) return false
      if (aktualFilter === "20" && op.aktualCount < 20) return false
      return true
    })
  }, [rows, operatorFilter, aktualFilter])

  const operatorOptions = React.useMemo(
    () => Array.from(new Set(rows.map((r) => r.name))).sort(),
    [rows]
  )

  const columns = React.useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Operator",
        enableSorting: true,
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "planCount",
        header: "Plan (Jadwal)",
        enableSorting: true,
        cell: ({ row }) => <Badge variant="secondary">{row.original.planCount}</Badge>,
      },
      {
        accessorKey: "aktualCount",
        header: "Aktual (Cetak)",
        enableSorting: true,
        cell: ({ row }) => (
          <Badge className="bg-emerald-600 text-white">{row.original.aktualCount}</Badge>
        ),
      },
      {
        accessorKey: "pct",
        header: "Porsi (Aktual vs Plan)",
        enableSorting: true,
        cell: ({ row }) => {
          const pct = row.original.pct
          const barWidth = Math.min(100, pct)
          return (
            <div className="flex items-center gap-2">
              <div className="h-2 w-full min-w-[80px] overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {pct}%
              </span>
            </div>
          )
        },
      },
    ],
    []
  )

  const toolbar = (
    <>
      <Select value={operatorFilter} onValueChange={setOperatorFilter}>
        <SelectTrigger size="sm" className="w-[180px]">
          <SelectValue placeholder="Nama Operator" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Operator</SelectItem>
          {operatorOptions.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={aktualFilter} onValueChange={setAktualFilter}>
        <SelectTrigger size="sm" className="w-[180px]">
          <SelectValue placeholder="Aktual Jobs" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Aktual</SelectItem>
          <SelectItem value="5">Aktual ≥ 5</SelectItem>
          <SelectItem value="10">Aktual ≥ 10</SelectItem>
          <SelectItem value="20">Aktual ≥ 20</SelectItem>
        </SelectContent>
      </Select>
    </>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analisis Operator</CardTitle>
        <CardDescription>
          Operator (Plan) vs Operator Cetak (Aktual) - persentase realisasi dari rencana
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={filtered}
          searchPlaceholder="Cari operator..."
          emptyMessage="Tidak ada data operator."
          toolbar={toolbar}
        />
      </CardContent>
    </Card>
  )
}