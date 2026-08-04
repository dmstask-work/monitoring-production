"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type PrintJob,
  type KpiSummary,
  type MonthlyVolume,
  type OperatorStat,
  type StageDistribution,
  summarizeKpis,
  monthlyVolume,
  operatorStats,
  stageDistribution,
} from "@/lib/data";

export interface PrintData {
  jobs: PrintJob[];
  kpis: KpiSummary;
  monthly: MonthlyVolume[];
  operators: OperatorStat[];
  stages: StageDistribution[];
  source: "sheets" | "fallback";
  loading: boolean;
  error: string | null;
}

export function usePrintData(): PrintData {
  const [state, setState] = useState<PrintData>({
    jobs: [],
    kpis: {
      totalSo: 0,
      totalJobs: 0,
      activeCustomers: 0,
      selesaiCount: 0,
      belumCount: 0,
      selesaiPct: 0,
      onTimeCount: 0,
      onTimePct: 0,
    },
    monthly: [],
    operators: [],
    stages: [],
    source: "fallback",
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/print-jobs", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        jobs: PrintJob[];
        source: "sheets" | "fallback";
        error?: string;
      };
      if (data.error) throw new Error(data.error);
      const jobs = data.jobs ?? [];
      setState({
        jobs,
        kpis: summarizeKpis(jobs),
        monthly: monthlyVolume(jobs),
        operators: operatorStats(jobs),
        stages: stageDistribution(jobs),
        source: data.source,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Gagal memuat data",
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return state;
}