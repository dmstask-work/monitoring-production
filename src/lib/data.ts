// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PrintJob {
  // PERSIAPAN (1-20)
  soFisikMasukPpic: string;
  tglSo: string;
  noSo: string;
  customer: string;
  pekerjaan: string;
  jumlahOrder: string;
  lembarCetak: string;
  typeCetak: string;
  namaBahan: string;
  gramBahan: string;
  ukuranCetak: string;
  dueDate: string;
  kertasDari: string;
  jumlahPlano: string;
  ukuranPlano: string;
  ketStrook: string;
  ukuranStrook: string;
  prosesProduksi: string;
  masukLamper: string;
  mesin: string;
  // CETAK (21-43)
  statusBahan: string;
  potongTidak: string;
  persiapanBahan: string;
  bahanReady: string;
  tinta: string;
  tglTinta: string;
  jadwalPotong: string;
  keteranganPotong: string;
  filePreparation: string;
  plate: string;
  jadwalCetak: string;
  shiftJadwal: string;
  operator: string;
  tglCetak: string;
  shiftCetak: string;
  operatorCetak: string;
  ctkBaik: string;
  ctkRusak: string;
  ctkDpn: string;
  ctkBlkng: string;
  status: string;
  keterangan: string;
  tanggalKirimKeLamper: string;
}

export type ProcessStage =
  | "SO Masuk"
  | "Persiapan Bahan"
  | "Tinta"
  | "Plate"
  | "Jadwal Cetak"
  | "Cetak"
  | "Selesai";

export interface StageInfo {
  stage: ProcessStage;
  order: number;
}

// ---------------------------------------------------------------------------
// Date parsing — handles DD-Mon-YY, DD-Mon-YYYY, DD/MM/YY, DD Mon YYYY
// ---------------------------------------------------------------------------

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function parseDate(value: string): Date | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;

  // DD-Mon-YY / DD-Mon-YYYY / DD Mon YYYY
  const dashMatch = v.match(/^(\d{1,2})[- ]([A-Za-z]{3,})[- ](\d{2,4})$/);
  if (dashMatch) {
    const day = parseInt(dashMatch[1], 10);
    const month = MONTHS[dashMatch[2].toLowerCase().slice(0, 3)];
    let year = parseInt(dashMatch[3], 10);
    if (year < 100) year += 2000;
    if (month === undefined || isNaN(day)) return null;
    return new Date(year, month, day);
  }

  // DD/MM/YY
  const slashMatch = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10) - 1;
    let year = parseInt(slashMatch[3], 10);
    if (year < 100) year += 2000;
    return new Date(year, month, day);
  }

  // ISO YYYY-MM-DD
  const isoMatch = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return new Date(
      parseInt(isoMatch[1], 10),
      parseInt(isoMatch[2], 10) - 1,
      parseInt(isoMatch[3], 10)
    );
  }

  return null;
}

export function formatDate(value: string): string {
  const d = parseDate(value);
  if (!d) return value || "—";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Stage derivation — follows key_point.md flow:
// Persiapan Bahan → Tgl Tinta → Plate → Cetak
// ---------------------------------------------------------------------------

const STAGE_ORDER: Record<ProcessStage, number> = {
  "SO Masuk": 1,
  "Persiapan Bahan": 2,
  Tinta: 3,
  Plate: 4,
  "Jadwal Cetak": 5,
  Cetak: 6,
  Selesai: 7,
};

export function getStage(job: PrintJob): StageInfo {
  const isSelesai =
    job.status.trim().toLowerCase() === "selesai cetak" ||
    job.status.trim().toLowerCase() === "done";

  if (isSelesai) return { stage: "Selesai", order: STAGE_ORDER.Selesai };

  if (parseDate(job.tglCetak)) return { stage: "Cetak", order: STAGE_ORDER.Cetak };
  if (parseDate(job.jadwalCetak)) return { stage: "Jadwal Cetak", order: STAGE_ORDER["Jadwal Cetak"] };
  if (parseDate(job.plate)) return { stage: "Plate", order: STAGE_ORDER.Plate };
  if (parseDate(job.tglTinta)) return { stage: "Tinta", order: STAGE_ORDER.Tinta };
  if (parseDate(job.persiapanBahan) || parseDate(job.bahanReady)) {
    return { stage: "Persiapan Bahan", order: STAGE_ORDER["Persiapan Bahan"] };
  }
  return { stage: "SO Masuk", order: STAGE_ORDER["SO Masuk"] };
}

export function isSelesaiCetak(job: PrintJob): boolean {
  return getStage(job).stage === "Selesai";
}

// ---------------------------------------------------------------------------
// Plan vs Aktual comparison
// ---------------------------------------------------------------------------

export interface PlanAktual {
  planDate: string;
  aktualDate: string;
  planShift: string;
  aktualShift: string;
  planOperator: string;
  aktualOperator: string;
  dateMatch: boolean;
  shiftMatch: boolean;
  operatorMatch: boolean;
}

export function getPlanAktual(job: PrintJob): PlanAktual {
  const planDate = job.jadwalCetak;
  const aktualDate = job.tglCetak;
  const planShift = job.shiftJadwal;
  const aktualShift = job.shiftCetak;
  const planOperator = job.operator;
  const aktualOperator = job.operatorCetak;

  const pd = parseDate(planDate);
  const ad = parseDate(aktualDate);

  return {
    planDate,
    aktualDate,
    planShift,
    aktualShift,
    planOperator,
    aktualOperator,
    dateMatch: !!pd && !!ad && pd.getTime() === ad.getTime(),
    shiftMatch:
      planShift.trim().toLowerCase() === aktualShift.trim().toLowerCase() &&
      planShift.trim() !== "",
    operatorMatch:
      planOperator.trim().toLowerCase() === aktualOperator.trim().toLowerCase() &&
      planOperator.trim() !== "",
  };
}

// ---------------------------------------------------------------------------
// Aggregations
// ---------------------------------------------------------------------------

export interface KpiSummary {
  totalSo: number;
  totalJobs: number;
  activeCustomers: number;
  selesaiCount: number;
  belumCount: number;
  selesaiPct: number;
  onTimeCount: number;
  onTimePct: number;
}

export function summarizeKpis(jobs: PrintJob[]): KpiSummary {
  const uniqueSo = new Set(jobs.map((j) => j.noSo));
  const uniqueCustomers = new Set(jobs.map((j) => j.customer).filter(Boolean));
  const selesai = jobs.filter(isSelesaiCetak);
  const onTime = jobs.filter((j) => getPlanAktual(j).dateMatch);

  return {
    totalSo: uniqueSo.size,
    totalJobs: jobs.length,
    activeCustomers: uniqueCustomers.size,
    selesaiCount: selesai.length,
    belumCount: jobs.length - selesai.length,
    selesaiPct: jobs.length ? Math.round((selesai.length / jobs.length) * 100) : 0,
    onTimeCount: onTime.length,
    onTimePct: jobs.length ? Math.round((onTime.length / jobs.length) * 100) : 0,
  };
}

export interface MonthlyVolume {
  month: string; // "2025-09"
  label: string; // "Sep 25"
  count: number;
}

export function monthlyVolume(jobs: PrintJob[]): MonthlyVolume[] {
  const map = new Map<string, { label: string; count: number }>();

  for (const job of jobs) {
    const d = parseDate(job.tglCetak);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, { label, count: 1 });
    }
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, v]) => ({ month, ...v }));
}

export interface OperatorStat {
  name: string;
  planCount: number;
  aktualCount: number;
}

export function operatorStats(jobs: PrintJob[]): OperatorStat[] {
  const map = new Map<string, OperatorStat>();

  const bump = (name: string, key: "planCount" | "aktualCount") => {
    if (!name) return;
    const existing = map.get(name) ?? { name, planCount: 0, aktualCount: 0 };
    existing[key] += 1;
    map.set(name, existing);
  };

  for (const job of jobs) {
    bump(job.operator, "planCount");
    bump(job.operatorCetak, "aktualCount");
  }

  return Array.from(map.values()).sort(
    (a, b) => b.aktualCount + b.planCount - (a.aktualCount + a.planCount)
  );
}

export interface StageDistribution {
  stage: ProcessStage;
  count: number;
}

export function stageDistribution(jobs: PrintJob[]): StageDistribution[] {
  const map = new Map<ProcessStage, number>();
  for (const job of jobs) {
    const { stage } = getStage(job);
    map.set(stage, (map.get(stage) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([stage, count]) => ({ stage, count }))
    .sort((a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage]);
}