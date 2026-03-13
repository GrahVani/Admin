"use client";

import React, { useState, useMemo } from "react";
import { useAdminClients, useClientStats } from "@/hooks/queries/useAdminClients";
import { useAdminUsers } from "@/hooks/queries/useAdminUsers";
import { useQuery } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { 
  Search, Users, TrendingUp, MapPin, Mail, Phone,
  ChevronDown, ChevronLeft, ChevronRight, Download, X, 
  User, Clock, Star, FileText, Activity,
  Eye, Filter, Heart, UserCircle, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { format, formatDistanceToNow } from "date-fns";

// Types
interface Client {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phonePrimary?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  maritalStatus?: string;
  occupation?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  userId?: string;
  generationStatus?: string;
  chartsVersion?: number;
}

// Statistics Cards
function StatsCards({ stats }: { stats: any }) {
  const cards = [
    { label: "Total Clients", value: stats?.totalClients || 0, icon: Users, color: "blue", trend: "+12%" },
    { label: "New This Month", value: stats?.newClientsThisMonth || 0, icon: TrendingUp, color: "green", trend: "+8%" },
    { label: "Charts Generated", value: "—", icon: FileText, color: "amber" },
    { label: "Active Astrologers", value: "—", icon: Activity, color: "purple" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div 
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card p-4"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
            card.color === "blue" ? "bg-blue-500/10 text-blue-400" :
            card.color === "green" ? "bg-emerald-500/10 text-emerald-400" :
            card.color === "amber" ? "bg-amber-500/10 text-amber-400" :
            "bg-violet-500/10 text-violet-400"
          }`}>
            <card.icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-100">{card.value}</p>
          <p className="text-xs text-slate-500">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

// Gender Badge
function GenderBadge({ gender }: { gender?: string }) {
  const config: Record<string, { icon: any; color: string; label: string }> = {
    male: { icon: UserCircle, color: "text-blue-400 bg-blue-500/10", label: "Male" },
    female: { icon: Heart, color: "text-pink-400 bg-pink-500/10", label: "Female" },
    other: { icon: User, color: "text-violet-400 bg-violet-500/10", label: "Other" },
    prefer_not_to_say: { icon: User, color: "text-slate-400 bg-slate-500/10", label: "Not Specified" },
  };
  
  const c = config[gender || "prefer_not_to_say"] || config.prefer_not_to_say;
  const Icon = c.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${c.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {c.label}
    </span>
  );
}

// Client Detail Drawer
function ClientDetailDrawer({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");
  
  // Fetch client details
  const { data: client, isLoading } = useQuery({
    queryKey: ["admin-client", clientId],
    queryFn: () => adminApiFetch(`/api/v1/admin/clients/${clientId}`),
    select: (res) => res?.data as Client,
  });

  // Fetch astrologer info
  const { data: astrologer } = useQuery({
    queryKey: ["admin-user", client?.createdBy || client?.userId],
    queryFn: () => adminApiFetch(`/api/v1/admin/users/${client?.createdBy || client?.userId}`),
    select: (res) => res?.data,
    enabled: !!(client?.createdBy || client?.userId),
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

  if (!client) return null;

  const fullName = client.fullName || `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unnamed Client";

  return (
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-2xl font-bold text-emerald-400">
              {fullName[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">{fullName}</h2>
              {client.email && <p className="text-sm text-slate-400">{client.email}</p>}
              <div className="flex items-center gap-2 mt-2">
                <GenderBadge gender={client.gender} />
                {client.maritalStatus && (
                  <span className="text-xs text-slate-500 capitalize">• {client.maritalStatus}</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6">
          {["overview", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab 
                  ? "bg-emerald-500 text-slate-900" 
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
            {/* Birth Details */}
            <div className="glass-card p-4">
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Birth Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Date of Birth</p>
                  <p className="text-sm text-slate-300">
                    {client.birthDate ? format(new Date(client.birthDate), "MMMM d, yyyy") : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Time of Birth</p>
                  <p className="text-sm text-slate-300">
                    {client.birthTime || "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Place of Birth</p>
                  <p className="text-sm text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {client.birthPlace || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="glass-card p-4">
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Email</span>
                  <span className="text-sm text-slate-200">{client.email || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Phone</span>
                  <span className="text-sm text-slate-200">{client.phonePrimary || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Address</span>
                  <span className="text-sm text-slate-200">
                    {[client.city, client.state, client.country].filter(Boolean).join(", ") || "—"}
                  </span>
                </div>
                {client.occupation && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Occupation</span>
                    <span className="text-sm text-slate-200">{client.occupation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Created By */}
            <div className="glass-card p-4">
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-violet-400" />
                Created By
              </h3>
              {astrologer ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-sm font-bold text-amber-400">
                    {(astrologer.name || astrologer.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">{astrologer.name || astrologer.email}</p>
                    <p className="text-xs text-slate-500">{astrologer.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">System imported</p>
              )}
              <p className="text-xs text-slate-500 mt-3">
                Added {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* Read-only Notice */}
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-500" />
              <p className="text-xs text-slate-500">
                This is a read-only view. Clients are managed by their respective astrologers.
              </p>
            </div>
          </>
        )}



        {activeTab === "history" && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">Activity history will be displayed here</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}



// Main Page
export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("all");
  const [astrologerId, setAstrologerId] = useState("");
  const [page, setPage] = useState(1);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const { data, isLoading } = useAdminClients({ page, search });
  const { data: stats } = useClientStats();
  const { data: astrologersData } = useAdminUsers({ role: "user", limit: 100 });
  
  const clients = data?.clients ?? [];
  const astrologers = astrologersData?.users ?? [];
  const pagination = data?.pagination;

  // Client-side filtering
  const filteredClients = useMemo(() => {
    return clients.filter((c: Client) => {
      if (gender !== "all" && c.gender !== gender) return false;
      if (astrologerId && c.createdBy !== astrologerId && c.userId !== astrologerId) return false;
      return true;
    });
  }, [clients, gender, astrologerId]);

  // Export to CSV
  const handleExport = () => {
    const csv = [
      ["Name", "Email", "Gender", "Birth Date", "Birth Place", "Phone", "Created"].join(","),
      ...filteredClients.map((c: Client) => [
        c.fullName || `${c.firstName || ""} ${c.lastName || ""}`.trim(),
        c.email || "",
        c.gender || "",
        c.birthDate || "",
        c.birthPlace || "",
        c.phonePrimary || "",
        new Date(c.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Registry"
        description="All clients across all astrologers — platform-wide view"
      />

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select 
              value={gender} 
              onChange={(e) => { setGender(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={astrologerId} 
              onChange={(e) => { setAstrologerId(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer min-w-[160px]"
            >
              <option value="">All Astrologers</option>
              {astrologers.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name || a.email}</option>
              ))}
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
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Gender</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Birth Details</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Added</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/30">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-12 rounded-lg bg-slate-800/50 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No clients found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredClients.map((client: Client) => (
                  <tr 
                    key={client.id} 
                    className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-sm font-bold text-emerald-400 border border-emerald-500/20">
                          {(client.fullName || client.firstName || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">
                            {client.fullName || `${client.firstName || ""} ${client.lastName || ""}`.trim() || "—"}
                          </p>
                          {client.occupation && (
                            <p className="text-xs text-slate-500">{client.occupation}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <GenderBadge gender={client.gender} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-300">
                        {client.birthDate && (
                          <p>{format(new Date(client.birthDate), "MMM d, yyyy")}</p>
                        )}
                        {client.birthPlace && (
                          <p className="text-xs text-slate-500">{client.birthPlace}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-300">
                        {client.email && <p>{client.email}</p>}
                        {client.phonePrimary && (
                          <p className="text-xs text-slate-500">{client.phonePrimary}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {format(new Date(client.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelectedClientId(client.id)}
                        className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        View →
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

      {/* Drawer */}
      <AnimatePresence>
        {selectedClientId && (
          <ClientDetailDrawer 
            clientId={selectedClientId} 
            onClose={() => setSelectedClientId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
