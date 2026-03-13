"use client";

import React, { useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useMutation } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import {
  User, Mail, Shield, Clock, LogOut, Key, Eye, EyeOff, Save, CheckCircle, AlertTriangle, RefreshCw
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: any) => 
      adminApiFetch("/api/v1/users/me", { 
        method: "PATCH", 
        body: JSON.stringify({ password: data.newPassword, currentPassword: data.currentPassword }) 
      }),
    onSuccess: () => {
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    mutation.mutate({ currentPassword, newPassword });
  };

  return (
    <Modal title="Security Protocol Update" isOpen={true} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="relative">
            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1 mb-1.5 block">Current Credentials</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-admin-input border border-admin-border text-xs font-bold text-admin-text focus:outline-none focus:border-admin-accent transition-all"
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowCurrent(!showCurrent)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-admin-text-muted hover:text-admin-text"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1 mb-1.5 block">New Access Key</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-admin-input border border-admin-border text-xs font-bold text-admin-text focus:outline-none focus:border-admin-accent transition-all"
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowNew(!showNew)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-admin-text-muted hover:text-admin-text"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1 mb-1.5 block">Validate Key</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-admin-input border text-xs font-bold text-admin-text focus:outline-none transition-all ${
                confirmPassword && newPassword !== confirmPassword ? "border-admin-danger" : "border-admin-border focus:border-admin-accent"
              }`}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {mutation.isError && (
          <div className="p-3 rounded-xl bg-admin-danger/5 border border-admin-danger/20 text-admin-danger text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-shake">
            <AlertTriangle className="w-3.5 h-3.5" /> Validation Failed: Incorrect credentials
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending || !newPassword || newPassword !== confirmPassword}
          className="w-full btn-gold py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl shadow-admin-accent/20 disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
        >
          {mutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
          {mutation.isPending ? "Updating Registry..." : "Rotate Access Keys"}
        </button>
      </form>
    </Modal>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAdminAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");

  const updateProfileMutation = useMutation({
    mutationFn: (newName: string) => 
      adminApiFetch("/api/v1/users/me", { 
        method: "PATCH", 
        body: JSON.stringify({ name: newName }) 
      }),
    onSuccess: () => {
      setIsEditing(false);
      // The context will refetch in the background or we can window.location.reload() for a hard refresh of context
      // But usually React Query will handle global state if we use a shared hook.
      // For now, let's just close editing.
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up pb-20">
      <PageHeader
        title="Administrative Identity"
        description="Personal profile, security clearances, and session management"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Identity Vector */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-10 flex flex-col items-center text-center border border-admin-border/50">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-admin-accent via-admin-accent to-admin-accent-hover p-1 shadow-2xl shadow-admin-accent/20 transition-transform duration-500 hover:scale-105">
                <div className="w-full h-full rounded-2xl bg-admin-deep flex items-center justify-center text-4xl font-black text-admin-accent border border-admin-accent/20">
                  {(user?.name?.[0] || user?.email?.[0] || "A").toUpperCase()}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-admin-success border-4 border-admin-deep shadow-lg" />
            </div>

            <div className="mt-8 space-y-2">
              <h2 className="text-xl font-black text-admin-text tracking-tight">{user?.name}</h2>
              <div className="flex flex-col items-center gap-1.5">
                <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-admin-accent/10 text-admin-accent border border-admin-accent/30 tracking-widest">
                  {user?.role || "SYSTEM_ADMIN"}
                </span>
                <p className="text-[10px] text-admin-text-muted font-bold tracking-widest flex items-center gap-2 uppercase opacity-60">
                  <Mail className="w-3 h-3" /> {user?.email}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-admin-border/50">
            <h3 className="text-[10px] font-black text-admin-text uppercase tracking-[0.2em] mb-4 opacity-50">System Clearance</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-admin-text-muted uppercase">Kernel Level</span>
                 <span className="text-xs font-black text-admin-success uppercase">Tier-0 Global</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-admin-text-muted uppercase">Audit Status</span>
                 <span className="text-xs font-black text-admin-text uppercase">Transparent</span>
               </div>
               <div className="h-1.5 w-full bg-admin-elevated rounded-full overflow-hidden p-[1px] border border-admin-border/30">
                 <div className="h-full bg-admin-accent rounded-full w-[94%] shadow-[0_0_8px_rgba(var(--admin-accent-rgb),0.3)]" />
               </div>
            </div>
          </div>
        </div>

        {/* Tactical Controls */}
        <div className="lg:col-span-2 space-y-8">
          {/* Information Ledger */}
          <div className="glass-card p-8 border border-admin-border/50 group">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-[11px] font-black text-admin-text uppercase tracking-[0.2em] flex items-center gap-3">
                 <User className="w-4 h-4 text-admin-accent" /> Identity Matrix
               </h3>
               {isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 rounded-xl border border-admin-border text-[9px] font-black uppercase tracking-widest text-admin-text-muted hover:bg-admin-elevated transition-all">Cancel</button>
                    <button onClick={() => updateProfileMutation.mutate(name)} className="px-4 py-1.5 rounded-xl bg-admin-accent text-admin-deep text-[9px] font-black uppercase tracking-widest hover:bg-admin-accent-hover transition-all shadow-lg shadow-admin-accent/10 flex items-center gap-2">
                       {updateProfileMutation.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Commit
                    </button>
                  </div>
               ) : (
                  <button onClick={() => setIsEditing(true)} className="px-5 py-2 rounded-xl bg-admin-elevated/50 border border-admin-border/50 text-[9px] font-black uppercase tracking-widest text-admin-text hover:border-admin-accent/40 transition-all opacity-0 group-hover:opacity-100">
                    Modify Records
                  </button>
               )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Legal Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-admin-input border border-admin-accent/50 text-xs font-bold text-admin-text focus:outline-none shadow-inner"
                    />
                  ) : (
                    <p className="px-4 py-3 rounded-xl bg-admin-elevated/20 border border-transparent text-xs font-bold text-admin-text">{user?.name}</p>
                  )}
                </div>
                <div className="space-y-1.5 opacity-60">
                  <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Primary Endpoint (Email)</p>
                  <p className="px-4 py-3 rounded-xl bg-admin-elevated/10 border border-admin-border/20 text-xs font-bold text-admin-text/50 italic">{user?.email}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Registry Identifier (UID)</p>
                  <p className="px-4 py-3 rounded-xl bg-admin-elevated/20 border border-transparent text-[10px] font-mono font-bold text-admin-text/40">{user?.id}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Session Lifecycle</p>
                  <div className="px-4 py-3 rounded-xl bg-admin-success/5 border border-admin-success/10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-admin-success animate-pulse shadow-[0_0_8px_rgba(var(--admin-success-rgb),0.5)]" />
                    <span className="text-[10px] font-black text-admin-success uppercase tracking-widest">Active Connection</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Security & Lifecycle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <button
               onClick={() => setShowPasswordModal(true)}
               className="glass-card p-8 border border-admin-border/50 text-left hover:border-admin-accent/40 transition-all group relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Key className="w-16 h-16 -rotate-12" />
                </div>
                <h4 className="text-[11px] font-black text-admin-text uppercase tracking-[0.2em] mb-2">Key Management</h4>
                <p className="text-[10px] text-admin-text-muted leading-relaxed font-bold italic opacity-60">Rotate your administrative access keys regularly to maintain kernel integrity.</p>
                <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-admin-accent uppercase tracking-widest">
                   Initialize Rotation <Key className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
             </button>

             <button
               onClick={() => setShowLogoutConfirm(true)}
               className="glass-card p-8 border border-admin-border/50 text-left hover:border-admin-danger/40 transition-all group relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <LogOut className="w-16 h-16 rotate-12 text-admin-danger" />
                </div>
                <h4 className="text-[11px] font-black text-admin-danger uppercase tracking-[0.2em] mb-2">Nullify Session</h4>
                <p className="text-[10px] text-admin-text-muted leading-relaxed font-bold italic opacity-60">Safely disconnect from the administration matrix and clear local telemetry.</p>
                <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-admin-danger uppercase tracking-widest">
                   Terminate Link <LogOut className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
             </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}

      <Modal title="Secure Session Termination" isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)}>
        <div className="space-y-6 text-center">
           <div className="w-20 h-20 rounded-full bg-admin-danger/10 flex items-center justify-center mx-auto border border-admin-danger/20">
              <LogOut className="w-8 h-8 text-admin-danger" />
           </div>
           <div>
             <h3 className="text-base font-black text-admin-text uppercase tracking-widest">Confirm Disconnection?</h3>
             <p className="text-xs text-admin-text-muted mt-2 font-bold italic">All active administrative buffers will be flushed immediately.</p>
           </div>
           <div className="flex gap-3">
             <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 rounded-xl border border-admin-border text-[10px] font-black uppercase tracking-widest text-admin-text-muted hover:bg-admin-elevated transition-all">Abort</button>
             <button onClick={logout} className="flex-1 py-4 rounded-xl bg-admin-danger text-white text-[10px] font-black uppercase tracking-widest hover:bg-admin-danger/80 transition-all shadow-xl shadow-admin-danger/20">Execute Termination</button>
           </div>
        </div>
      </Modal>
    </div>
  );
}
