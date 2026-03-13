"use client";

import React, { useState, useMemo } from "react";
import { useAdminUsers, useAdminUserDetail } from "@/hooks/queries/useAdminUsers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { 
  Search, ChevronDown, Shield, Ban, CheckCircle, UserPlus, Crown,
  MoreHorizontal, Edit, Trash2, Eye, Key, LogOut, Activity,
  ChevronLeft, ChevronRight, Download, X, Clock, Mail, ShieldAlert,
  UserCheck, ShieldCheck, History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { format, formatDistanceToNow } from "date-fns";

// Types
interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  displayName: string | null;
  status: "active" | "suspended" | "pending_verification" | "deleted";
  role: "admin" | "moderator";
  isVerified: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}

// Statistics Cards
function StatsCards({ users }: { users: AdminUser[] }) {
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === "admin").length;
    const moderators = users.filter(u => u.role === "moderator").length;
    const active = users.filter(u => u.status === "active").length;
    const verified = users.filter(u => u.isVerified).length;
    
    return [
      { label: "Total Team", value: total, icon: Shield, color: "purple", description: "Administrators & Moderators" },
      { label: "Super Admins", value: admins, icon: Crown, color: "amber", description: "Full platform access" },
      { label: "Moderators", value: moderators, icon: ShieldCheck, color: "blue", description: "Limited admin rights" },
      { label: "Active Now", value: active, icon: Activity, color: "green", description: "Currently active" },
      { label: "Verified", value: verified, icon: UserCheck, color: "emerald", description: "Email verified" },
    ];
  }, [users]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <motion.div 
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card p-4"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
            stat.color === "purple" ? "bg-violet-500/10 text-violet-400" :
            stat.color === "amber" ? "bg-amber-500/10 text-amber-400" :
            stat.color === "blue" ? "bg-blue-500/10 text-blue-400" :
            stat.color === "green" ? "bg-emerald-500/10 text-emerald-400" :
            "bg-emerald-500/10 text-emerald-400"
          }`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
          <p className="text-xs text-slate-500">{stat.label}</p>
          <p className="text-[10px] text-slate-600 mt-1">{stat.description}</p>
        </motion.div>
      ))}
    </div>
  );
}

// Invite Admin Modal
function InviteAdminModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "moderator">("moderator");
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: (data: any) => 
      adminApiFetch("/api/v1/admin/users/invite", { 
        method: "POST", 
        body: JSON.stringify(data) 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    },
  });

  return (
    <Modal title="Invite New Admin" isOpen={true} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 focus:border-amber-500/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Role</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRole("admin")}
              className={`p-4 rounded-xl border text-left transition-all ${
                role === "admin" 
                  ? "border-amber-500 bg-amber-500/10" 
                  : "border-slate-700 hover:border-slate-600"
              }`}
            >
              <Crown className={`w-6 h-6 mb-2 ${role === "admin" ? "text-amber-400" : "text-slate-500"}`} />
              <p className={`font-semibold ${role === "admin" ? "text-slate-200" : "text-slate-400"}`}>Super Admin</p>
              <p className="text-xs text-slate-500 mt-1">Full platform access</p>
            </button>
            <button
              onClick={() => setRole("moderator")}
              className={`p-4 rounded-xl border text-left transition-all ${
                role === "moderator" 
                  ? "border-amber-500 bg-amber-500/10" 
                  : "border-slate-700 hover:border-slate-600"
              }`}
            >
              <ShieldCheck className={`w-6 h-6 mb-2 ${role === "moderator" ? "text-amber-400" : "text-slate-500"}`} />
              <p className={`font-semibold ${role === "moderator" ? "text-slate-200" : "text-slate-400"}`}>Moderator</p>
              <p className="text-xs text-slate-500 mt-1">Limited permissions</p>
            </button>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-800/50 text-xs text-slate-400">
          <p>📧 An invitation email will be sent with setup instructions.</p>
        </div>

        <button
          onClick={() => inviteMutation.mutate({ email, role })}
          disabled={!email || inviteMutation.isPending}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold flex items-center justify-center gap-2 transition-colors"
        >
          {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
        </button>
      </div>
    </Modal>
  );
}

// Admin Detail Drawer
function AdminDetailDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: user, isLoading, refetch } = useAdminUserDetail(userId);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "permissions" | "activity">("overview");
  const [showConfirmAction, setShowConfirmAction] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      adminApiFetch(`/api/v1/admin/users/${userId}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApiFetch(`/api/v1/admin/users/${userId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    },
  });

  const handleAction = (action: string, callback: () => void) => {
    setShowConfirmAction(action);
    setTimeout(() => {
      if (confirm(`Are you sure you want to ${action}?`)) {
        callback();
      }
      setShowConfirmAction(null);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-slate-900 border-l border-slate-800 z-50 p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-800 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isSuperAdmin = user.role === "admin";

  return (
    <>
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="fixed inset-y-0 right-0 w-full md:w-[550px] bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold border ${
                isSuperAdmin 
                  ? "bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400"
                  : "bg-gradient-to-br from-violet-500/20 to-violet-600/10 border-violet-500/20 text-violet-400"
              }`}>
                {(user.name || user.email)[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-100">{user.name || "—"}</h2>
                  {isSuperAdmin && <Crown className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-sm text-slate-400">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={user.status} />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isSuperAdmin 
                      ? "bg-amber-500/10 text-amber-400" 
                      : "bg-violet-500/10 text-violet-400"
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            {["overview", "permissions", "activity"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? "bg-amber-500 text-slate-900" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">Tenant ID</p>
                  <p className="text-sm font-mono text-slate-300 truncate">{user.tenantId}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">Joined</p>
                  <p className="text-sm text-slate-300">{format(new Date(user.createdAt), "MMM d, yyyy")}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">Last Active</p>
                  <p className="text-sm text-slate-300">
                    {user.lastActiveAt 
                      ? formatDistanceToNow(new Date(user.lastActiveAt), { addSuffix: true })
                      : "Never"
                    }
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">Email Verified</p>
                  <p className={`text-sm ${user.isVerified ? "text-emerald-400" : "text-slate-500"}`}>
                    {user.isVerified ? "✓ Verified" : "✗ Not Verified"}
                  </p>
                </div>
              </div>

              {/* Privileged Actions */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Privileged Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {user.status !== "active" ? (
                    <button 
                      onClick={() => updateMutation.mutate({ status: "active" })}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Activate
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction("suspend this admin", () => updateMutation.mutate({ status: "suspended" }))}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm font-medium transition-colors"
                    >
                      <Ban className="w-4 h-4" /> Suspend
                    </button>
                  )}
                  
                  {isSuperAdmin ? (
                    <button 
                      onClick={() => handleAction("demote to moderator", () => updateMutation.mutate({ role: "moderator" }))}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 text-sm font-medium transition-colors"
                    >
                      <Shield className="w-4 h-4" /> Demote
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction("promote to admin", () => updateMutation.mutate({ role: "admin" }))}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm font-medium transition-colors"
                    >
                      <Crown className="w-4 h-4" /> Promote
                    </button>
                  )}

                  <button 
                    onClick={() => handleAction("reset password", () => {})}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm font-medium transition-colors"
                  >
                    <Key className="w-4 h-4" /> Reset Password
                  </button>

                  <button 
                    onClick={() => handleAction("force logout", () => {})}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Force Logout
                  </button>
                </div>

                <button 
                  onClick={() => {
                    if (confirm("⚠️ WARNING: This will permanently delete this admin account.\n\nAre you absolutely sure?")) {
                      deleteMutation.mutate();
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" /> Delete Admin Account
                </button>
              </div>
            </>
          )}

          {activeTab === "permissions" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Permission Level: {isSuperAdmin ? "Super Admin" : "Moderator"}
                </h3>
                
                <div className="space-y-3">
                  {[
                    { name: "User Management", admin: true, moderator: false },
                    { name: "Subscription Management", admin: true, moderator: true },
                    { name: "Content Management", admin: true, moderator: true },
                    { name: "Settings & Configuration", admin: true, moderator: false },
                    { name: "Audit Log Access", admin: true, moderator: true },
                    { name: "Admin Team Management", admin: true, moderator: false },
                    { name: "System Monitor", admin: true, moderator: true },
                  ].map((perm) => (
                    <div key={perm.name} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                      <span className="text-sm text-slate-300">{perm.name}</span>
                      {(isSuperAdmin ? perm.admin : perm.moderator) ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 text-center py-8">Activity log coming soon...</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// Main Page
export default function AdminTeamPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const { data, isLoading } = useAdminUsers({ page, search, status });
  const users = (data?.users ?? []).filter((u: AdminUser) => ["admin", "moderator"].includes(u.role));
  
  // Additional client-side filtering
  const filteredUsers = useMemo(() => {
    if (role === "all") return users;
    return users.filter((u: AdminUser) => u.role === role);
  }, [users, role]);
  
  const pagination = data?.pagination;

  // Export to CSV
  const handleExport = () => {
    const csv = [
      ["Name", "Email", "Role", "Status", "Verified", "Joined"].join(","),
      ...filteredUsers.map((u: AdminUser) => [
        u.name || "",
        u.email,
        u.role,
        u.status,
        u.isVerified ? "Yes" : "No",
        new Date(u.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-team-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Maintenance Team"
        description="Internal administration & platform managers"
        actions={
          <button 
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Invite Admin
          </button>
        }
      />

      {/* Stats */}
      <StatsCards users={users} />

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select 
              value={role} 
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Super Admin</option>
              <option value="moderator">Moderator</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-700 text-sm text-slate-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Administrator</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/30">
                    <td colSpan={5} className="px-4 py-4">
                      <div className="h-12 rounded-lg bg-slate-800/50 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No admin team members found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: AdminUser) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border ${
                          user.role === "admin"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-violet-500/10 text-violet-400 border-violet-500/20"
                        }`}>
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-200">{user.name || "—"}</p>
                            {user.role === "admin" && <Crown className="w-3 h-3 text-amber-400" />}
                          </div>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        user.role === "admin"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-violet-500/10 text-violet-400"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelectedUserId(user.id)}
                        className="text-sm text-amber-400 hover:text-amber-300 font-medium"
                      >
                        Manage →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
            <p className="text-sm text-slate-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer & Modals */}
      <AnimatePresence>
        {selectedUserId && (
          <AdminDetailDrawer 
            userId={selectedUserId} 
            onClose={() => setSelectedUserId(null)} 
          />
        )}
      </AnimatePresence>

      {showInvite && (
        <InviteAdminModal onClose={() => setShowInvite(false)} />
      )}
    </div>
  );
}
