"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import type { MonthlyVolume } from "@/lib/data"

const chartConfig = {
  count: {
    label: "Jumlah Cetak:   ",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function MonthlyVolumeChart({ data }: { data: MonthlyVolume[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume Cetak Bulanan</CardTitle>
        <CardDescription>
          Jumlah pekerjaan yang tercetak per bulan (berdasarkan Tgl Cetak)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={30}
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