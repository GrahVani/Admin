"use client";

import React, { useState, useMemo } from "react";
import { useAdminUsers, useAdminUserDetail } from "@/hooks/queries/useAdminUsers";
import { usePlans, useSubscriptions } from "@/hooks/queries/useSubscriptions";
import { useQueryClient } from "@tanstack/react-query";
import { useUserTrends } from "@/hooks/queries/useDashboardTrends";
import { useActionMutation, useDeleteMutation } from "@/hooks/useMutationWithToast";
import { adminApiFetch, adminApiFetchCSV } from "@/lib/api";
import { 
  Search, ChevronDown, X, Shield, Ban, CheckCircle, CreditCard, 
  MailCheck, RefreshCw, Users, TrendingUp, TrendingDown, Clock, Filter, 
  Download, MoreHorizontal, Edit, Trash2, Eye, Crown, 
  AlertCircle, Calendar, MapPin, Phone, Activity, 
  ChevronLeft, ChevronRight, Check, XCircle, UserCheck,
  HelpCircle, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Tooltip } from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/Button";
import { format, formatDistanceToNow } from "date-fns";

// Types
interface User {
  id: string;
  email: string;
  name: string | null;
  displayName: string | null;
  status: "active" | "suspended" | "pending_verification" | "deleted";
  role: "user" | "admin" | "moderator";
  isVerified: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
  phone?: string;
  location?: string;
}

// Dynamic Statistics Cards with Real Trends
function StatsCards({ users }: { users: User[] }) {
  const { total, active, verified, pending, isLoading } = useUserTrends(7);

  const stats = useMemo(() => {
    const computedTotal = users.length;
    const computedActive = users.filter(u => u.status === "active").length;
    const computedPending = users.filter(u => u.status === "pending_verification").length;
    const computedVerified = users.filter(u => u.isVerified).length;
    const computedSuspended = users.filter(u => u.status === "suspended").length;

    return [
      { 
        label: "Total Astrologers", 
        value: computedTotal, 
        icon: Users, 
        color: "blue", 
        trend: total,
        tooltip: "Total registered astrologers on the platform"
      },
      { 
        label: "Active", 
        value: computedActive, 
        icon: CheckCircle, 
        color: "green", 
        trend: active,
        tooltip: "Astrologers with active status"
      },
      { 
        label: "Pending Verification", 
        value: computedPending, 
        icon: AlertCircle, 
        color: "amber",
        trend: pending,
        tooltip: "Astrologers awaiting email verification"
      },
      { 
        label: "Verified", 
        value: computedVerified, 
        icon: MailCheck, 
        color: "purple", 
        trend: verified,
        tooltip: "Astrologers with verified email addresses"
      },
      { 
        label: "Suspended", 
        value: computedSuspended, 
        icon: Ban, 
        color: "rose",
        tooltip: "Temporarily suspended accounts"
      },
    ];
  }, [users, total, active, pending, verified]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <Tooltip key={stat.label} content={stat.tooltip} position="top">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 cursor-help h-full hover:border-slate-600/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                stat.color === "blue" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                stat.color === "green" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                stat.color === "amber" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                stat.color === "purple" ? "bg-violet-500/10 text-violet-400 border-violet-500/20" :
                "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-slate-100">{stat.value}</p>
                  {!isLoading && stat.trend && (
                    <span className={`text-xs font-medium ${
                      stat.trend.trendDirection === "up" ? "text-emerald-400" :
                      stat.trend.trendDirection === "down" ? "text-rose-400" :
                      "text-slate-400"
                    }`}>
                      {stat.trend.trend > 0 && stat.trend.trendDirection === "up" ? "+" : ""}
                      {stat.trend.trendDirection !== "neutral" ? `${stat.trend.trend}%` : "—"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        </Tooltip>
      ))}
    </div>
  );
}

// Assign Subscription Modal with Error Handling
function AssignSubscriptionModal({ userId, userName, onClose }: { userId: string; userName: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [planId, setPlanId] = useState("");
  const [duration, setDuration] = useState(30);
  const { data: plans } = usePlans();

  const mutation = useActionMutation("Assign Subscription", "User", {
    mutationFn: (data: any) => adminApiFetch("/api/v1/admin/subscriptions/assign", { 
      method: "POST", 
      body: JSON.stringify(data) 
    }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["admin-users"] }); 
      qc.invalidateQueries({ queryKey: ["admin-user", userId] });
      qc.invalidateQueries({ queryKey: ["user-trends"] });
      onClose(); 
    },
  });

  return (
    <Modal title={`Assign Subscription - ${userName}`} isOpen={true} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Select Plan</label>
          <div className="space-y-2">
            {plans?.map((plan: any) => (
              <button
                key={plan.id}
                onClick={() => setPlanId(plan.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  planId === plan.id 
                    ? "border-amber-500 bg-amber-500/10" 
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-200">{plan.name}</p>
                    <p className="text-xs text-slate-500">{plan.tier} tier</p>
                  </div>
                  <p className="text-amber-400 font-bold">₹{plan.monthlyPrice}/mo</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Duration (days)</label>
          <div className="flex gap-2">
            {[7, 30, 90, 365].map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  duration === d 
                    ? "bg-amber-500 text-slate-900" 
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {d === 365 ? "1 Year" : `${d}d`}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-800/50 text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>This will immediately activate the subscription for {duration} days.</p>
        </div>

        <Button
          onClick={() => mutation.mutate({ userId, planId, durationDays: duration })}
          disabled={!planId || mutation.isPending}
          isLoading={mutation.isPending}
          className="w-full"
        >
          {mutation.isPending ? "Assigning..." : "Confirm Assignment"}
        </Button>
      </div>
    </Modal>
  );
}

// User Detail Drawer with Improved UX
function UserDetailDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: user, isLoading, refetch } = useAdminUserDetail(userId);
  const { data: subscriptions } = useSubscriptions({ limit: 100 });
  const queryClient = useQueryClient();
  const [showAssignSub, setShowAssignSub] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "subscriptions">("overview");

  const userSubscription = subscriptions?.subscriptions?.find((s: any) => s.userId === userId);

  const updateMutation = useActionMutation("Update User", "User", {
    mutationFn: (body: Record<string, unknown>) =>
      adminApiFetch(`/api/v1/admin/users/${userId}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      refetch();
    },
  });

  const deleteMutation = useDeleteMutation("User", {
    mutationFn: async (_: void) => {
      return adminApiFetch(`/api/v1/admin/users/${userId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    },
  });

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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-2xl font-bold text-amber-400">
                {(user.name || user.email)[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">{user.name || "Unnamed Astrologer"}</h2>
                <p className="text-sm text-slate-400">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={user.status} />
                  {user.isVerified && (
                    <Tooltip content="Email verified" position="bottom">
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full cursor-help">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
            <Tooltip content="Close" position="bottom">
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            {["overview", "activity", "subscriptions"].map((tab) => (
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
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Tooltip content="Unique tenant identifier" position="top">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 cursor-help">
                    <p className="text-xs text-slate-500 mb-1">Tenant ID</p>
                    <p className="text-sm font-mono text-slate-300 truncate">{user.tenantId}</p>
                  </div>
                </Tooltip>
                <Tooltip content="Account creation date" position="top">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 cursor-help">
                    <p className="text-xs text-slate-500 mb-1">Joined</p>
                    <p className="text-sm text-slate-300">{format(new Date(user.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </Tooltip>
                {user.phone && (
                  <Tooltip content="Primary phone number" position="top">
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 cursor-help">
                      <p className="text-xs text-slate-500 mb-1">Phone</p>
                      <p className="text-sm text-slate-300 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {user.phone}
                      </p>
                    </div>
                  </Tooltip>
                )}
                {user.location && (
                  <Tooltip content="User location" position="top">
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 cursor-help">
                      <p className="text-xs text-slate-500 mb-1">Location</p>
                      <p className="text-sm text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {user.location}
                      </p>
                    </div>
                  </Tooltip>
                )}
              </div>

              {/* Current Subscription */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    Subscription Status
                  </h3>
                  <button 
                    onClick={() => setShowAssignSub(true)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                  >
                    {userSubscription ? "Change" : "Assign"}
                  </button>
                </div>
                {userSubscription ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Plan</span>
                      <span className="text-sm font-medium text-slate-200">{userSubscription.plan?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Status</span>
                      <span className={`text-sm font-medium ${
                        userSubscription.status === "active" ? "text-emerald-400" : "text-amber-400"
                      }`}>
                        {userSubscription.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Expires</span>
                      <span className="text-sm text-slate-200">
                        {format(new Date(userSubscription.currentPeriodEnd), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No active subscription</p>
                )}
              </div>

              {/* Actions */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Administrative Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {!user.isVerified && (
                    <Tooltip content="Mark email as verified" position="top">
                      <button 
                        onClick={() => updateMutation.mutate({ isVerified: true })}
                        disabled={updateMutation.isPending}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <MailCheck className="w-4 h-4" /> Verify Email
                      </button>
                    </Tooltip>
                  )}
                  {user.status !== "active" ? (
                    <Tooltip content="Activate user account" position="top">
                      <button 
                        onClick={() => updateMutation.mutate({ status: "active" })}
                        disabled={updateMutation.isPending}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" /> Activate
                      </button>
                    </Tooltip>
                  ) : (
                    <Tooltip content="Temporarily suspend user" position="top">
                      <button 
                        onClick={() => updateMutation.mutate({ status: "suspended" })}
                        disabled={updateMutation.isPending}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <Ban className="w-4 h-4" /> Suspend
                      </button>
                    </Tooltip>
                  )}
                  <Tooltip content="Manage subscription" position="top">
                    <button 
                      onClick={() => setShowAssignSub(true)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm font-medium transition-colors"
                    >
                      <CreditCard className="w-4 h-4" /> Subscription
                    </button>
                  </Tooltip>
                  <Tooltip content={user.role === "admin" ? "Remove admin privileges" : "Grant admin privileges"} position="top">
                    <button 
                      onClick={() => updateMutation.mutate({ role: user.role === "admin" ? "user" : "admin" })}
                      disabled={updateMutation.isPending}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Shield className="w-4 h-4" /> {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                    </button>
                  </Tooltip>
                </div>

                <Tooltip content="Permanently delete this account" position="top">
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
                        deleteMutation.mutate(undefined);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
                </Tooltip>
              </div>
            </>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">Activity Log</p>
                <p className="text-xs text-slate-600">User activity tracking will be available in the next update</p>
              </div>
            </div>
          )}

          {activeTab === "subscriptions" && (
            <div className="space-y-4">
              {userSubscription ? (
                <div className="glass-card p-4">
                  <h3 className="font-semibold text-slate-200 mb-4">Current Subscription</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Plan</span>
                      <span className="text-slate-200 font-medium">{userSubscription.plan?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tier</span>
                      <span className="text-slate-200">{userSubscription.plan?.tier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status</span>
                      <span className={`font-medium ${
                        userSubscription.status === "active" ? "text-emerald-400" : "text-amber-400"
                      }`}>{userSubscription.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Period</span>
                      <span className="text-slate-200">
                        {format(new Date(userSubscription.currentPeriodStart), "MMM d")} - {format(new Date(userSubscription.currentPeriodEnd), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 mb-4">No subscription history</p>
                  <Button onClick={() => setShowAssignSub(true)}>
                    Assign Subscription
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {showAssignSub && (
        <AssignSubscriptionModal 
          userId={userId} 
          userName={user.name || user.email}
          onClose={() => setShowAssignSub(false)} 
        />
      )}
    </>
  );
}

// Main Page
export default function AstrologersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [verified, setVerified] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, refetch, isFetching } = useAdminUsers({ page, search, role: "user", status });
  const users = data?.users ?? [];
  const pagination = data?.pagination;

  // Filter users by verification status
  const filteredUsers = useMemo(() => {
    if (verified === "all") return users;
    return users.filter((u: User) => 
      verified === "verified" ? u.isVerified : !u.isVerified
    );
  }, [users, verified]);

  // Export to CSV
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csv = [
        ["Name", "Email", "Status", "Verified", "Joined", "Tenant ID"].join(","),
        ...filteredUsers.map((u: User) => [
          u.name || "",
          u.email,
          u.status,
          u.isVerified ? "Yes" : "No",
          new Date(u.createdAt).toLocaleDateString(),
          u.tenantId
        ].join(","))
      ].join("\n");
      
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `astrologers-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Professional Astrologers"
        description={`Managing ${pagination?.total ?? 0} practitioners in the Grahvani network`}
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
          <Tooltip content="Filter by account status" position="bottom">
            <div className="relative">
              <select 
                value={status} 
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer min-w-[140px]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending_verification">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="deleted">Deleted</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </Tooltip>

          <Tooltip content="Filter by verification status" position="bottom">
            <div className="relative">
              <select 
                value={verified} 
                onChange={(e) => { setVerified(e.target.value); setPage(1); }}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer min-w-[140px]"
              >
                <option value="all">All Users</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </Tooltip>

          <Tooltip content="Export to CSV" position="bottom">
            <Button
              onClick={handleExport}
              isLoading={isExporting}
              variant="secondary"
              leftIcon={Download}
            >
              Export
            </Button>
          </Tooltip>

          <Tooltip content="Refresh data" position="bottom">
            <Button
              variant="ghost"
              onClick={() => refetch()}
              isLoading={isFetching}
              leftIcon={RefreshCw}
            >
              Refresh
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Astrologer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Verification</th>
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
                    No astrologers found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: User) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Tooltip content={user.email} position="top">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-sm font-bold text-amber-400 border border-amber-500/20 cursor-help">
                            {(user.name || user.email)[0].toUpperCase()}
                          </div>
                        </Tooltip>
                        <div>
                          <p className="font-medium text-slate-200">{user.name || "—"}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3">
                      {user.isVerified ? (
                        <Tooltip content="Email verified" position="top">
                          <span className="flex items-center gap-1 text-xs text-emerald-400 cursor-help">
                            <CheckCircle className="w-3.5 h-3.5" /> Verified
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip content="Email not verified" position="top">
                          <span className="flex items-center gap-1 text-xs text-slate-500 cursor-help">
                            <XCircle className="w-3.5 h-3.5" /> Unverified
                          </span>
                        </Tooltip>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Tooltip content="Manage user" position="left">
                        <button 
                          onClick={() => setSelectedUserId(user.id)}
                          className="text-sm text-amber-400 hover:text-amber-300 font-medium"
                        >
                          Manage →
                        </button>
                      </Tooltip>
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
              <Tooltip content="Previous page" position="top">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </Tooltip>
              <span className="text-sm text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Tooltip content="Next page" position="top">
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selectedUserId && (
          <UserDetailDrawer 
            userId={selectedUserId} 
            onClose={() => setSelectedUserId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
