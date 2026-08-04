import { NextResponse } from "next/server";
import Papa from "papaparse";
import type { PrintJob } from "@/lib/data";

// ---------------------------------------------------------------------------
// Server-side data loader for the dashboard.
// Always fetches the live Google Sheet, caches it in memory, and never falls
// back to the bundled CSV. This removes the slow browser->Google round-trip
// from every page load.
// ---------------------------------------------------------------------------

function getSheetCsvUrl(): string {
  const url = process.env.GOOGLE_SHEET_CSV_URL;
  if (!url) {
    throw new Error("GOOGLE_SHEET_CSV_URL environment variable is not set");
  }
  return url;
}

const SHEET_CSV_URL = getSheetCsvUrl();

const FETCH_TIMEOUT_MS = 5000;

const COLUMN_MAP: Record<string, keyof PrintJob> = {
  "SO Fisik Masuk PPIC": "soFisikMasukPpic",
  "Tgl SO": "tglSo",
  "No SO": "noSo",
  Customer: "customer",
  Pekerjaan: "pekerjaan",
  "Jumlah Order": "jumlahOrder",
  "Lembar Cetak": "lembarCetak",
  "Type Cetak": "typeCetak",
  "Nama Bahan": "namaBahan",
  "Gram Bahan": "gramBahan",
  "Ukuran Cetak": "ukuranCetak",
  "Due Date": "dueDate",
  "Kertas Dari": "kertasDari",
  "Jumlah Plano": "jumlahPlano",
  "Ukuran Plano": "ukuranPlano",
  "Ket Strook": "ketStrook",
  "Ukuran Strook": "ukuranStrook",
  "Proses Produksi": "prosesProduksi",
  "Masuk Lamper": "masukLamper",
  MESIN: "mesin",
  "Status Bahan": "statusBahan",
  "Potong / Tidak": "potongTidak",
  "Persiapan Bahan": "persiapanBahan",
  "Bahan Ready": "bahanReady",
  Tinta: "tinta",
  "Tgl Tinta": "tglTinta",
  "Jadwal Potong": "jadwalPotong",
  "Keterangan Potong": "keteranganPotong",
  "File Preparation": "filePreparation",
  Plate: "plate",
  "Jadwal Cetak": "jadwalCetak",
  "Shift Jadwal": "shiftJadwal",
  Operator: "operator",
  "Tgl Cetak": "tglCetak",
  "Shift Cetak": "shiftCetak",
  "Operator Cetak": "operatorCetak",
  "CTK BAIK": "ctkBaik",
  "CTK Rusak": "ctkRusak",
  "CTK DPN": "ctkDpn",
  "CTK BLKNG": "ctkBlkng",
  Status: "status",
  Keterangan: "keterangan",
  "Tanggal kirim ke Lamper": "tanggalKirimKeLamper",
};

function mapRow(row: Record<string, string>): PrintJob {
  const job = {} as PrintJob;
  const target = job as unknown as Record<string, string>;
  for (const [csvCol, key] of Object.entries(COLUMN_MAP)) {
    target[key] = (row[csvCol] ?? "").trim();
  }
  return job;
}

function parseCsv(csvText: string): PrintJob[] {
  const result = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: "greedy",
  });

  const rows = result.data.filter((row) =>
    row.some((cell) => cell && cell.trim() !== "")
  );

  // Skip group-header rows (e.g. "PERSIAPAN / CETAK" section labels).
  const headerIdx = rows.findIndex(
    (row) =>
      row.some((cell) => cell.trim() === "No SO") &&
      row.some((cell) => cell.trim() === "Tgl Cetak")
  );

  if (headerIdx === -1) return [];

  const headers = rows[headerIdx].map((h) => h.trim());

  const jobs: PrintJob[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row: Record<string, string> = {};
    rows[i].forEach((cell, colIdx) => {
      row[headers[colIdx] ?? `col_${colIdx}`] = cell ?? "";
    });
    const job = mapRow(row);
    if (job.noSo !== "") jobs.push(job);
  }

  return jobs;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

// In-memory cache — survives across requests within a single server process.
let cache:
  | { jobs: PrintJob[]; source: "sheets"; fetchedAt: number }
  | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function loadJobs(): Promise<{
  jobs: PrintJob[];
  source: "sheets";
}> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return { jobs: cache.jobs, source: cache.source };
  }

  // Always use the live Google Sheet — no CSV fallback.
  const csvText = await fetchWithTimeout(SHEET_CSV_URL, FETCH_TIMEOUT_MS);
  const jobs = parseCsv(csvText);
  if (jobs.length === 0) {
    throw new Error("Google Sheet kosong atau gagal di-parse");
  }
  cache = { jobs, source: "sheets", fetchedAt: Date.now() };
  return { jobs, source: "sheets" };
}

export async function GET() {
  try {
    const { jobs, source } = await loadJobs();
    return NextResponse.json({ jobs, source });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Gagal memuat data",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";