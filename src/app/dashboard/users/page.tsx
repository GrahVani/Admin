"use client";

import React, { useState } from "react";
import { useAdminUsers, useAdminUserDetail } from "@/hooks/queries/useAdminUsers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  X, Shield, Ban, CheckCircle, CreditCard, MailCheck, RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Drawer } from "@/components/ui/Drawer";
import { Modal } from "@/components/ui/Modal";

// Note: role filter is now removed from UI and forced to 'user' in the query hook
const STATUSES = ["all", "active", "suspended", "pending_verification", "deleted"];

function AssignSubscriptionModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [planId, setPlanId] = useState("");

  const mutation = useMutation({
    mutationFn: (data: any) => adminApiFetch("/api/v1/admin/subscriptions/assign", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); onClose(); },
  });

  return (
    <Modal title="Manual Subscription Assignment" isOpen={true} onClose={onClose}>
      <div className="space-y-4">
         <div>
           <label className="label-field text-admin-text-secondary">Select Plan Tier</label>
           <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="input-field w-full">
             <option value="">Choose a plan...</option>
             <option value="basic">Basic Astrologer</option>
             <option value="pro">Pro Astrologer</option>
             <option value="business">Business Elite</option>
           </select>
         </div>
         <p className="text-[10px] text-admin-text-muted italic">This will grant full professional access to the astrologer for 30 days starting immediately.</p>
         <button
           onClick={() => mutation.mutate({ userId, planId, durationDays: 30 })}
           disabled={!planId || mutation.isPending}
           className="w-full btn-gold py-3 rounded-xl font-bold flex items-center justify-center gap-2"
         >
           {mutation.isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
           {mutation.isPending ? "Assigning..." : "Confirm Assignment"}
         </button>
      </div>
    </Modal>
  );
}

function UserDetailDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: user, isLoading, refetch } = useAdminUserDetail(userId);
  const queryClient = useQueryClient();
  const [showAssign, setShowAssign] = useState(false);

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
    <Drawer title="Astrologer Information" isOpen={true} onClose={onClose}>
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-admin-elevated animate-pulse" />)}
        </div>
      ) : user ? (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-admin-accent/10 border border-admin-accent/20 flex items-center justify-center text-3xl font-bold text-admin-accent shadow-inner">
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-admin-text">{user.name || "Unnamed Astrologer"}</p>
              <p className="text-sm text-admin-text-secondary">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={user.status} />
                {user.isVerified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-admin-success uppercase">
                    <MailCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-xl bg-admin-elevated border border-admin-border">
               <p className="text-[10px] text-admin-text-muted mb-1 uppercase tracking-wider">Tenant ID</p>
               <p className="text-xs font-semibold text-admin-text font-mono truncate">{user.tenantId}</p>
             </div>
             <div className="p-4 rounded-xl bg-admin-elevated border border-admin-border">
               <p className="text-[10px] text-admin-text-muted mb-1 uppercase tracking-wider">Created On</p>
               <p className="text-xs font-semibold text-admin-text">{new Date(user.createdAt).toLocaleDateString()}</p>
             </div>
          </div>

          <div className="space-y-3">
             <p className="text-xs font-bold text-admin-text-muted uppercase tracking-wider mb-2">Administrative Actions</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
               {!user.isVerified && (
                 <button onClick={() => updateMutation.mutate({ isVerified: true })} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-admin-info/10 text-admin-info hover:bg-admin-info/20 text-xs font-bold transition-colors">
                   <MailCheck className="w-4 h-4" /> Verify Email
                 </button>
               )}
               {user.status !== "active" ? (
                 <button onClick={() => updateMutation.mutate({ status: "active" })} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-admin-success/10 text-admin-success hover:bg-admin-success/20 text-xs font-bold transition-colors">
                   <CheckCircle className="w-4 h-4" /> Activate Account
                 </button>
               ) : (
                 <button onClick={() => updateMutation.mutate({ status: "suspended" })} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-admin-danger/10 text-admin-danger hover:bg-admin-danger/20 text-xs font-bold transition-colors">
                   <Ban className="w-4 h-4" /> Suspend Account
                 </button>
               )}
               <button onClick={() => setShowAssign(true)} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-admin-accent/10 text-admin-accent hover:bg-admin-accent/20 text-xs font-bold transition-colors">
                 <CreditCard className="w-4 h-4" /> Assign Subscription
               </button>
               <button onClick={() => updateMutation.mutate({ role: "admin" })} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-xs font-bold transition-colors">
                 <Shield className="w-4 h-4" /> Promote to Admin
               </button>
             </div>
          </div>

          {showAssign && <AssignSubscriptionModal userId={userId} onClose={() => setShowAssign(false)} />}
        </div>
      ) : null}
    </Drawer>
  );
}

export default function AstrologersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, isLoading } = useAdminUsers({ page, search, role: "user", status });
  const users = data?.users ?? [];
  const pagination = data?.pagination;

  const columns = [
    {
      header: "Astrologer",
      accessor: (user: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-admin-accent/5 flex items-center justify-center text-xs font-bold text-admin-accent border border-admin-accent/10">
            {user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-admin-text">{user.name || "—"}</p>
            <p className="text-[10px] text-admin-text-secondary">{user.email}</p>
          </div>
        </div>
      ),
    },
    { header: "Status", accessor: (user: any) => <StatusBadge status={user.status} /> },
    { header: "Tenant Context", accessor: (user: any) => <span className="text-xs font-mono text-admin-text-muted truncate max-w-[120px] block">{user.tenantId}</span> },
    { header: "Joined Date", accessor: (user: any) => <span className="text-xs text-admin-text-muted">{new Date(user.createdAt).toLocaleDateString()}</span> },
    { 
      header: "", 
      accessor: (user: any) => (
        <div className="text-right">
          <button className="text-xs text-admin-accent font-bold hover:text-admin-accent-hover">Manage →</button>
        </div>
      ) 
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Professional Astrologers"
        description={`Managing the global network of Grahvani practitioners — ${pagination?.total ?? 0} active professionals`}
      />

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search astrologers…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none transition-colors shadow-sm"
          />
        </div>
        <div className="relative">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text focus:outline-none focus:border-admin-accent cursor-pointer">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace(/_/g, " ").charAt(0).toUpperCase() + s.replace(/_/g, " ").slice(1)}</option>)}
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
        <UserDetailDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}
