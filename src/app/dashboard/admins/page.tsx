"use client";

import React, { useState } from "react";
import { useAdminUsers, useAdminUserDetail } from "@/hooks/queries/useAdminUsers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import {
  Search, ChevronDown, Shield, Ban, CheckCircle, UserPlus
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Drawer } from "@/components/ui/Drawer";


function AdminDetailDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: user, isLoading, refetch } = useAdminUserDetail(userId);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      adminApiFetch(`/api/v1/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      refetch();
    },
  });

  return (
    <Drawer title="Admin Profile" isOpen={true} onClose={onClose}>
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-admin-elevated animate-pulse" />)}
        </div>
      ) : user ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/40 to-purple-600/20 flex items-center justify-center text-2xl font-bold text-purple-400">
              {(user.name?.[0] || user.email?.[0] || "?").toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-admin-text">{user.name || "—"}</p>
              <p className="text-sm text-admin-text-secondary">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-400 tracking-wider">
                {user.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-admin-elevated">
              <p className="text-[10px] text-admin-text-muted mb-1 uppercase tracking-wider">Status</p>
              <StatusBadge status={user.status} />
            </div>
            <div className="p-3 rounded-xl bg-admin-elevated border border-admin-border/50">
              <p className="text-[10px] text-admin-text-muted mb-1 uppercase tracking-wider">ID</p>
              <p className="text-sm font-semibold text-admin-text truncate">{user.id}</p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <p className="text-xs font-bold text-admin-text-muted uppercase tracking-wider mb-2">Privileged Actions</p>
            <div className="space-y-2">
              {user.status !== "active" ? (
                <button onClick={() => updateMutation.mutate({ status: "active" })} className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl bg-admin-success/10 text-admin-success hover:bg-admin-success/20 text-xs font-bold transition-colors">
                  <CheckCircle className="w-4 h-4" /> Activate Access
                </button>
              ) : (
                <button onClick={() => updateMutation.mutate({ status: "suspended" })} className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl bg-admin-danger/10 text-admin-danger hover:bg-admin-danger/20 text-xs font-bold transition-colors">
                  <Ban className="w-4 h-4" /> Suspend Access
                </button>
              )}
              {user.role === "admin" && (
                 <button onClick={() => updateMutation.mutate({ role: "moderator" })} className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-admin-elevated text-admin-text hover:bg-admin-border text-sm font-semibold transition-colors">
                   <Shield className="w-4 h-4" /> Downgrade to Moderator
                 </button>
              )}
              {user.role === "moderator" && (
                 <button onClick={() => updateMutation.mutate({ role: "admin" })} className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-sm font-semibold transition-colors">
                   <Shield className="w-4 h-4" /> Promote to Admin
                 </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

export default function AdminTeamPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // We'll fetch all users and filter for maintenance roles (admin, moderator) on the frontend 
  // or use a more broad query if the backend allows.
  const { data, isLoading } = useAdminUsers({ page, search, status });
  // Filter for staff roles only on the client side to separate from users/astrologers
  const users = (data?.users ?? []).filter((u: any) => ["admin", "moderator"].includes(u.role));
  const pagination = data?.pagination;

  const STATUSES = ["all", "active", "suspended", "deleted"];

  const columns = [
    {
      header: "Administrator",
      accessor: (user: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-bold">{user.email[0].toUpperCase()}</div>
          <div>
            <p className="text-sm font-bold text-admin-text">{user.name || 'Set Name'}</p>
            <p className="text-[10px] text-admin-text-secondary">{user.email}</p>
          </div>
        </div>
      ),
    },
    { 
      header: "Role", 
      accessor: (user: any) => (
        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/5 px-2 py-1 rounded border border-purple-500/10">
          {user.role}
        </span>
      ) 
    },
    { header: "Status", accessor: (user: any) => <StatusBadge status={user.status} /> },
    { header: "Access ID", accessor: (user: any) => <span className="text-xs font-mono text-admin-text-muted">{user.id.slice(0, 12)}...</span> },
    { 
      header: "", 
      accessor: (user: any) => (
        <div className="text-right">
          <button className="text-xs text-admin-accent hover:text-admin-accent-hover font-bold">Manage</button>
        </div>
      ) 
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Admin Maintenance Team"
        description="Internal administration & platform managers"
        actions={
          <button className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold opacity-50 cursor-not-allowed">
            <UserPlus className="w-4 h-4" /> Invite Admin
          </button>
        }
      />

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search admin team…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none transition-colors"
          />
        </div>
        <div className="relative">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text focus:outline-none cursor-pointer">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-text-muted pointer-events-none" />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        onRowClick={(u) => setSelectedUserId(u.id)}
        pagination={pagination ? {
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          onPageChange: (p) => setPage(p)
        } : undefined}
      />

      {selectedUserId && (
        <AdminDetailDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}
