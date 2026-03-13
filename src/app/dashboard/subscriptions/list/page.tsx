"use client";

import React, { useState } from "react";
import { useSubscriptions } from "@/hooks/queries/useSubscriptions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { CreditCard, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable }  from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

const STATUSES = ["all", "active", "trialing", "past_due", "cancelled"];

export default function SubscriptionsListPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const queryClient = useQueryClient();

  const { data, isLoading } = useSubscriptions({ page, status });
  const subscriptions = data?.subscriptions ?? [];
  const pagination = data?.pagination;

  const cancelMutation = useMutation({
    mutationFn: (id: string) =>
      adminApiFetch(`/api/v1/admin/subscriptions/${id}/cancel`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] }),
  });

  const columns = [
    {
      header: "Subscriber ID",
      accessor: (sub: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-admin-accent/10 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-admin-accent" />
          </div>
          <span className="text-xs font-mono text-admin-text-secondary">{sub.userId?.slice(0, 12)}…</span>
        </div>
      )
    },
    {
      header: "Plan Name",
      accessor: (sub: any) => (
        <span className="text-xs font-bold text-admin-text uppercase tracking-wider">
          {sub.plan?.name ?? "—"}
        </span>
      )
    },
    { header: "Status", accessor: (sub: any) => <StatusBadge status={sub.status} /> },
    { header: "Start Date", accessor: (sub: any) => sub.currentPeriodStart ? new Date(sub.currentPeriodStart).toLocaleDateString() : "—" },
    { header: "End Date", accessor: (sub: any) => sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "—" },
    {
      header: "",
      accessor: (sub: any) => sub.status !== "cancelled" && (
        <div className="text-right">
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm('Cancel this subscription?')) cancelMutation.mutate(sub.id); }}
            disabled={cancelMutation.isPending}
            className="text-[10px] font-bold uppercase tracking-widest text-admin-danger hover:text-admin-danger/80"
          >
            Terminal Terminate
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Subscribers Ledger"
        description="Active and historical platform-wide billing records"
      />

      <div className="flex items-center gap-3">
        <div className="relative w-48">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="appearance-none w-full pl-3 pr-8 py-2.5 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text focus:outline-none cursor-pointer"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/_/g, " ").toUpperCase()}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-text-muted pointer-events-none" />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={subscriptions}
        isLoading={isLoading}
        pagination={pagination ? {
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          onPageChange: (p) => setPage(p)
        } : undefined}
      />
    </div>
  );
}
