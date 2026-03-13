"use client";

import React, { useState } from "react";
import { useAdminClients, useClientStats } from "@/hooks/queries/useAdminClients";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable }  from "@/components/ui/DataTable";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminClients({ page, search });
  const { data: stats } = useClientStats();
  const clients = data?.clients ?? [];
  const pagination = data?.pagination;

  const columns = [
    {
      header: "Client",
      accessor: (client: any) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center text-xs font-bold text-emerald-400">
            {((client.firstName || client.fullName || "?")[0]).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-admin-text">
            {client.fullName || `${client.firstName || ""} ${client.lastName || ""}`.trim() || "—"}
          </span>
        </div>
      )
    },
    { header: "Email", accessor: (c: any) => <span className="text-admin-text-secondary">{c.email || "—"}</span> },
    { header: "Place of Birth", accessor: (c: any) => <span className="text-admin-text-secondary">{c.placeOfBirth || c.birthPlace || "—"}</span> },
    { header: "Date of Birth", accessor: (c: any) => <span className="text-admin-text-secondary">{c.dateOfBirth || c.birthDate ? new Date(c.dateOfBirth || c.birthDate).toLocaleDateString() : "—"}</span> },
    { header: "Gender", accessor: (c: any) => <span className="capitalize text-admin-text-secondary">{c.gender || "—"}</span> },
    { header: "Added", accessor: (c: any) => <span className="text-admin-text-muted">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Client Registry"
        description="All clients across all astrologers — platform-wide view"
        actions={
          <div className="flex gap-4">
             <div className="text-right">
                <p className="text-xl font-bold text-admin-accent">{stats?.totalClients ?? "—"}</p>
                <p className="text-[10px] text-admin-text-muted uppercase font-bold">Registry Total</p>
             </div>
             <div className="text-right border-l border-admin-border pl-4">
                <p className="text-xl font-bold text-emerald-400">+{stats?.newClientsThisMonth ?? "0"}</p>
                <p className="text-[10px] text-admin-text-muted uppercase font-bold">New This Month</p>
             </div>
          </div>
        }
      />

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, email, city…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none transition-colors shadow-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={clients}
        isLoading={isLoading}
        pagination={pagination ? {
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          onPageChange: (p) => setPage(p)
        } : undefined}
        emptyMessage="No search results were found in the global client registry."
      />
    </div>
  );
}
