import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  CalendarCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { KpiSummary } from "@/lib/data"

export function KpiCards({ kpis }: { kpis: KpiSummary }) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total SO</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.totalSo}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <FileText />
              {kpis.totalJobs} jobs
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Sales Order
          </div>
          <div className="text-muted-foreground">
            Total pekerjaan produksi
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Customer</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.activeCustomers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Users />
              aktif
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total Pelanggan
          </div>
          <div className="text-muted-foreground">
            Yang memiliki order
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Selesai Cetak</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.selesaiCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-600">
              <CheckCircle2 />
              {kpis.selesaiPct}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Status Selesai Cetak
          </div>
          <div className="text-muted-foreground">
            Dari {kpis.totalJobs} total jobs
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Belum Cetak</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.belumCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-amber-600">
              <Clock />
              {100 - kpis.selesaiPct}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Dalam proses
          </div>
          <div className="text-muted-foreground">
            Belum selesai cetak
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>On-time</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.onTimePct}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <CalendarCheck />
              {kpis.onTimeCount} jobs
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Plan vs Aktual
          </div>
          <div className="text-muted-foreground">
            Presentase Aktual
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}