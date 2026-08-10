"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Scissors,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const data = {
  appName: "IG Dashboard",
  navGroups: [
    {
      label: "Dashboard",
      items: [
        {
          title: "Dashboard Produksi",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Finishing",
          url: "/finishing",
          icon: Scissors,
        },
      ],
    },
  ],
}

function downloadCSV(filename: string) {
  // fetches CSV from public folder
  const a = document.createElement("a")
  a.href = "/data/data_produksi_cetak.csv"
  a.download = filename
  a.click()
}

function downloadPDF() {
  window.print()
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{data.appName}</span>
                  <span className="truncate text-xs">Monitoring Production</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}

        {/* Download section */}
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Laporan</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip="Unduh Laporan" className="cursor-pointer">
                  <Download />
                  <span>Unduh Laporan</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-52">
                <DropdownMenuLabel>Pilih Format &amp; Laporan</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => downloadCSV("data-produksi-cetak.csv")}>
                  <FileSpreadsheet className="mr-2 size-4" />
                  CSV - Data Cetak
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={downloadPDF}>
                  <FileText className="mr-2 size-4" />
                  PDF - Cetak Halaman
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-3 text-xs text-muted-foreground">
          Master Plan · Produksi Cetak
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}