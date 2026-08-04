"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Printer,
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
} from "@/components/ui/sidebar"

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
          title: "Data Cetak (CSV)",
          // url: "/data/data_produksi_cetak.csv",
          url: "/src/app/not-found.tsx",
          icon: Printer,
        },
      ],
    },
  ],
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
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-3 text-xs text-muted-foreground">
          Master Plan · Produksi Cetak
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}