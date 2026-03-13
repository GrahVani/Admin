"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import {
  Save, Loader2, Shield, Globe, Database,
  Check, X, Bell, Zap, Lock, AlertTriangle
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => adminApiFetch("/api/v1/admin/settings"),
  });

  const settings = data?.data || [];

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      adminApiFetch(`/api/v1/admin/settings/${key}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });

  const getSettingValue = (key: string) => {
    const setting = settings.find((s: any) => s.key === key);
    return setting?.value;
  };

  const TABS = [
    { id: "general", label: "General", icon: Globe, desc: "Global platform configuration" },
    { id: "security", label: "Security", icon: Lock, desc: "Access control and protection" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Broadcast and alert logic" },
    { id: "integrations", label: "Integrations", icon: Zap, desc: "External service synchronization" },
    { id: "system", label: "System", icon: Database, desc: "Core engine and log management" },
  ];

  const SETTINGS_MAP: Record<string, any[]> = {
    general: [
      { key: "site_name", label: "Platform Identifier", type: "text", desc: "Global site header and metadata branding" },
      { key: "maintenance_mode", label: "System Lock / Maintenance", type: "toggle", desc: "Immediate platform-wide read-only state" },
      { key: "registration_enabled", label: "Ingress / Registration", type: "toggle", desc: "Allow new neurologists and clients to initialize accounts" },
      { key: "default_ayanamsa", label: "Global Calculation Vector", type: "select", options: ["Lahiri", "KP", "Raman", "Yukteswar", "Tropical"], desc: "Default astronomical calculation methodology" },
    ],
    security: [
      { key: "enforce_2fa", label: "Mandatory Multi-Factor", type: "toggle", desc: "Enforce 2FA for all administrative clearance levels" },
      { key: "password_expiry", label: "Credential Lifetime (Days)", type: "number", desc: "Automatic password expiration cycle (0 = Immortal)" },
      { key: "max_login_attempts", label: "Anomaly Protection Limit", type: "number", desc: "Maximum authentication failures before lockout" },
    ],
    integrations: [
      { key: "razorpay_enabled", label: "Razorpay Gateway Matrix", type: "toggle", desc: "Active payment processing and webhook synchronization" },
      { key: "shiprocket_enabled", label: "Shiprocket Logistics Hub", type: "toggle", desc: "Automated logistics and shipping telemetry" },
      { key: "google_analytics_id", label: "GA Intelligence Stream", type: "text", desc: "Google Analytics 4 Measurement ID tracking" },
    ],
    system: [
      { key: "api_rate_limit", label: "Protocol Rate Throttling", type: "number", desc: "Maximum allowed transmissions per 15m window" },
      { key: "log_retention_days", label: "Telemetry Archive Span", type: "number", desc: "Retention period for audit trails and logs" },
      { key: "debug_mode", label: "Kernel Debug Verbosity", type: "toggle", desc: "Enable verbose system error logs for engineers" },
    ],
  };

  const activeSettings = SETTINGS_MAP[activeTab] || [];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <PageHeader
        title="Control Center & Parameters"
        description="Global system overrides, security protocols, and integration matrices"
      />

      <div className="flex flex-col xl:flex-row gap-10">
        {/* Navigation Matrix */}
        <div className="w-full xl:w-72 space-y-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full group flex items-start gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 border ${
                  isActive
                    ? "bg-admin-accent border-admin-accent text-admin-deep shadow-2xl shadow-admin-accent/20"
                    : "bg-admin-elevated/20 border-admin-border/50 text-admin-text-secondary hover:border-admin-accent/40"
                }`}
              >
                <div className={`mt-0.5 p-2 rounded-xl shrink-0 transition-colors ${isActive ? "bg-admin-deep/10" : "bg-admin-elevated text-admin-text-muted group-hover:text-admin-accent"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-widest ${isActive ? "text-admin-deep" : "text-admin-text"}`}>{tab.label}</p>
                  <p className={`text-[9px] mt-1 font-bold leading-tight ${isActive ? "text-admin-deep/60" : "text-admin-text-muted"}`}>{tab.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Configuration Matrix */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between px-2">
             <h2 className="text-sm font-black text-admin-text uppercase tracking-[0.2em] flex items-center gap-3">
               <Shield className="w-4 h-4 text-admin-accent" />
               {activeTab} Management Partition
             </h2>
             {updateMutation.isPending && (
               <div className="flex items-center gap-2 text-[10px] font-black text-admin-accent uppercase tracking-widest animate-pulse">
                 <Loader2 className="w-3.5 h-3.5 animate-spin" /> Synchronizing...
               </div>
             )}
          </div>

          <div className="glass-card overflow-hidden border border-admin-border/50">
             <div className="divide-y divide-admin-border/30">
               {activeSettings.length === 0 ? (
                 <div className="p-16 text-center">
                    <Database className="w-12 h-12 text-admin-text-muted/10 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest italic">Segment registry is empty</p>
                 </div>
               ) : (
                 activeSettings.map((setting) => {
                   const currentValue = getSettingValue(setting.key);
                   const isSaving = updateMutation.isPending && updateMutation.variables?.key === setting.key;

                   return (
                     <div key={setting.key} className="p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-8 group hover:bg-admin-accent/5 transition-all duration-500">
                        <div className="flex-1">
                           <div className="flex items-center gap-3 mb-1.5">
                             <p className="text-xs font-black text-admin-text uppercase tracking-widest group-hover:text-admin-accent transition-colors">{setting.label}</p>
                             {currentValue !== undefined && <div className="w-1 h-1 rounded-full bg-admin-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                           </div>
                           <p className="text-[11px] text-admin-text-muted leading-relaxed font-medium italic opacity-80">{setting.desc}</p>
                        </div>

                        <div className="flex items-center justify-end min-w-[200px]">
                          {setting.type === "toggle" ? (
                            <button
                              onClick={() => updateMutation.mutate({ key: setting.key, value: !currentValue })}
                              disabled={updateMutation.isPending}
                              className={`w-14 h-7 rounded-full relative transition-all duration-300 border-2 ${
                                currentValue ? "bg-admin-accent border-admin-accent shadow-lg shadow-admin-accent/20" : "bg-admin-deep border-admin-border"
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white shadow-xl absolute top-1 transition-all duration-300 ${currentValue ? "left-8" : "left-1.5"}`} />
                            </button>
                          ) : setting.type === "select" ? (
                            <div className="relative w-full sm:w-64">
                              <select
                                value={currentValue ?? ""}
                                onChange={(e) => updateMutation.mutate({ key: setting.key, value: e.target.value })}
                                className="appearance-none w-full pl-4 pr-10 py-3 rounded-xl bg-admin-input border border-admin-border text-xs font-bold text-admin-text focus:outline-none focus:border-admin-accent transition-all cursor-pointer"
                              >
                                <option value="" className="bg-admin-deep">UNSET</option>
                                {setting.options?.map((o: string) => <option key={o} value={o} className="bg-admin-deep">{o.toUpperCase()}</option>)}
                              </select>
                              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-admin-accent" /> : <Globe className="w-3.5 h-3.5 text-admin-text-muted" />}
                              </div>
                            </div>
                          ) : setting.type === "number" ? (
                            <div className="relative w-full sm:w-32">
                              <input
                                type="number"
                                defaultValue={currentValue ?? ""}
                                onBlur={(e) => updateMutation.mutate({ key: setting.key, value: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl bg-admin-input border border-admin-border text-xs font-black text-center text-admin-text focus:outline-none focus:border-admin-accent transition-all"
                              />
                            </div>
                          ) : (
                            <div className="relative w-full sm:w-64">
                              <input
                                type="text"
                                defaultValue={currentValue ?? ""}
                                onBlur={(e) => updateMutation.mutate({ key: setting.key, value: e.target.value })}
                                className="w-full pl-4 pr-10 py-3 rounded-xl bg-admin-input border border-admin-border text-xs font-bold text-admin-text focus:outline-none focus:border-admin-accent transition-all"
                                placeholder="NOT_SET"
                              />
                              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-admin-accent" /> : <Save className="w-3.5 h-3.5 text-admin-text-muted opacity-20" />}
                              </div>
                            </div>
                          )}
                        </div>
                     </div>
                   )
                 })
               )}
             </div>
          </div>

          {updateMutation.isError && (
            <div className="p-5 rounded-2xl bg-admin-danger/5 border border-admin-danger/20 text-admin-danger text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-shake">
              <AlertTriangle className="w-4 h-4" /> Protocol Deviation: Settings Update Failed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
