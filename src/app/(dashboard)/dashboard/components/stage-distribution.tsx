"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { StageDistribution as StageDist } from "@/lib/data"

const chartConfig = {
  count: {
    label: "Jumlah Pekerjaan:   ",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

// Only show the 3 key preparation processes requested.
const FOCUS_STAGES = new Set(["Persiapan Bahan", "Tinta", "Plate"])

export function StageDistribution({ data }: { data: StageDist[] }) {
  const focusData = data.filter((d) => FOCUS_STAGES.has(d.stage))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribusi Proses</CardTitle>
        <CardDescription>
          Jumlah job per tahap proses produksi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart data={focusData} layout="vertical" accessibilityLayer>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="stage"
              type="category"
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}