"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import {
  User, Mail, Shield, Clock, LogOut, Key, Eye, EyeOff, Save, 
  CheckCircle, AlertTriangle, RefreshCw, Camera, Phone, MapPin,
  Calendar, ShieldCheck, Smartphone, Globe, History, ChevronRight, 
  Loader2, X, Lock, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { format, formatDistanceToNow } from "date-fns";

// Types - matching backend UserProfileResponse
interface ProfileData {
  id: string;
  email: string;
  name: string;
  displayName?: string | null;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  role: string;
  isVerified: boolean;
  lastActiveAt?: string | null;
  createdAt: string;
  avatarUrl?: string | null;
  status?: string;
}

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 20, x: "-50%" }}
      className={`fixed bottom-6 left-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
        type === "success" ? "bg-emerald-500 text-slate-900" : "bg-rose-500 text-white"
      }`}
    >
      {type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
    </motion.div>
  );
}

// Change Password Modal
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [strength, setStrength] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const calculateStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  };

  const mutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await adminApiFetch("/api/v1/users/me", { 
        method: "PATCH", 
        body: JSON.stringify({ password: data.newPassword, currentPassword: data.currentPassword }) 
      });
      return res;
    },
    onSuccess: () => {
      setToast({ message: "Password updated successfully", type: "success" });
      setTimeout(() => onClose(), 1000);
    },
    onError: (error: any) => {
      setToast({ message: error.message || "Failed to update password", type: "error" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    mutation.mutate({ currentPassword, newPassword });
  };

  const strengthColors = ["bg-rose-500", "bg-amber-500", "bg-yellow-500", "bg-emerald-500"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <>
      <Modal title="Change Password" isOpen={true} onClose={onClose}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                  placeholder="Enter current password"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrent(!showCurrent)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    calculateStrength(e.target.value);
                  }}
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                  placeholder="Enter new password"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowNew(!showNew)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Strength Meter */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div 
                        className={`h-full ${strengthColors[strength - 1] || "bg-slate-600"} transition-all`}
                        style={{ width: `${(strength / 4) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs ${strength >= 3 ? "text-emerald-400" : "text-amber-400"}`}>
                      {strengthLabels[strength - 1] || "Too Short"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Use 8+ characters with uppercase, numbers & symbols
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-sm text-slate-200 focus:outline-none transition-all ${
                  confirmPassword && newPassword !== confirmPassword 
                    ? "border-rose-500" 
                    : "border-slate-700 focus:border-amber-500/50"
                }`}
                placeholder="Confirm new password"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-rose-400 mt-1">Passwords do not match</p>
              )}
            </div>
          </div>

          {mutation.isError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Current password is incorrect
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending || !newPassword || newPassword !== confirmPassword || strength < 2}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold flex items-center justify-center gap-2 transition-colors"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            {mutation.isPending ? "Updating..." : "Update Password"}
          </button>
        </form>
      </Modal>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

// Avatar Upload Component
function AvatarUpload({ currentAvatar, name, onUpload }: { currentAvatar?: string | null; name: string; onUpload: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload - replace with actual upload logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    onUpload(URL.createObjectURL(file));
    setIsUploading(false);
  };

  return (
    <div className="relative">
      <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/30 flex items-center justify-center overflow-hidden">
        {currentAvatar ? (
          <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl font-bold text-amber-400">{name[0]?.toUpperCase()}</span>
        )}
      </div>
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-900 flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
      >
        {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

// Main Profile Page
export default function ProfilePage() {
  const { user, logout } = useAdminAuth();
  const queryClient = useQueryClient();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "security" | "activity">("general");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    displayName: user?.displayName || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    location: user?.location || "",
  });

  // Fetch detailed profile - backend returns data directly, not wrapped
  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const res = await adminApiFetch("/api/v1/users/me");
      // Backend returns the user profile directly
      return res as ProfileData;
    },
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        displayName: profile.displayName || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        location: profile.location || "",
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ProfileData>) => {
      // Build payload - only include changed fields
      // Backend regex for displayName: /^[a-zA-Z0-9_]+$/ (no spaces allowed)
      // Phone regex: /^\+?[1-9]\d{1,14}$/ (10-15 digits, first digit 1-9, optional +)
      const payload: any = {};
      
      if (data.name !== undefined && data.name !== null && data.name.trim()) {
        payload.name = data.name.trim();
      }
      
      // Display name: only allow letters, numbers, underscores (no spaces per backend)
      if (data.displayName !== undefined && data.displayName !== null) {
        const trimmed = data.displayName.trim();
        if (trimmed) {
          // Replace spaces with underscores for backend compatibility
          payload.displayName = trimmed.replace(/\s+/g, "_");
        } else {
          payload.displayName = null;
        }
      }
      
      // Phone: format as per backend regex or null
      if (data.phone !== undefined && data.phone !== null) {
        const phone = data.phone.trim();
        if (phone) {
          payload.phone = phone;
        } else {
          payload.phone = null;
        }
      }
      
      if (data.bio !== undefined && data.bio !== null) {
        payload.bio = data.bio.trim() || null;
      }
      
      if (data.location !== undefined && data.location !== null) {
        payload.location = data.location.trim() || null;
      }
      
      const res = await adminApiFetch("/api/v1/users/me", { 
        method: "PATCH", 
        body: JSON.stringify(payload) 
      });
      return res as ProfileData;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["admin-profile"], data);
      setIsEditing(false);
      setToast({ message: "Profile updated successfully", type: "success" });
    },
    onError: (error: any) => {
      // Extract detailed validation errors from backend response
      const errorMessage = error.message || "Failed to update profile";
      setToast({ message: errorMessage, type: "error" });
    }
  });

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ["admin-profile-activity"],
    queryFn: async () => {
      const res = await adminApiFetch("/api/v1/admin/audit-logs?limit=10");
      // Handle both response formats
      const items = (res as any)?.data?.items || (res as any)?.items || [];
      return items.filter((log: any) => log.adminId === user?.id).slice(0, 5);
    },
    enabled: !!user?.id,
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        displayName: profile.displayName || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        location: profile.location || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="My Profile"
        description="Manage your personal information and security settings"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Profile Card */}
        <div className="space-y-4">
          {/* Profile Card */}
          <div className="glass-card p-6 text-center">
            <div className="flex justify-center mb-4">
              <AvatarUpload 
                currentAvatar={profile?.avatarUrl} 
                name={profile?.name || user?.name || "A"}
                onUpload={(url) => console.log("Avatar uploaded:", url)}
              />
            </div>
            
            <h2 className="text-xl font-bold text-slate-100">{profile?.name || user?.name}</h2>
            <p className="text-sm text-slate-400">{profile?.email || user?.email}</p>
            
            <div className="flex justify-center gap-2 mt-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize">
                {profile?.role || user?.role || "Admin"}
              </span>
              {profile?.isVerified && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Member Since</span>
                <span className="text-slate-300">
                  {profile?.createdAt ? format(new Date(profile.createdAt), "MMM yyyy") : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Last Active</span>
                <span className="text-slate-300">
                  {profile?.lastActiveAt 
                    ? formatDistanceToNow(new Date(profile.lastActiveAt), { addSuffix: true })
                    : "Just now"
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="glass-card p-1">
            <div className="flex gap-1">
              {[
                { id: "general", label: "General", icon: User },
                { id: "security", label: "Security", icon: Shield },
                { id: "activity", label: "Activity", icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-amber-500 text-slate-900"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* General Tab */}
          {activeTab === "general" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-100">Personal Information</h3>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCancel}
                      className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-400 hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 text-sm font-medium hover:bg-amber-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm text-slate-500 mb-2">Full Name *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                      required
                    />
                  ) : (
                    <p className="px-4 py-2.5 rounded-xl bg-slate-800/30 text-slate-300">{profile?.name || user?.name}</p>
                  )}
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm text-slate-500 mb-2">
                    Display Name
                    {isEditing && <span className="text-xs text-slate-600 ml-2">(letters, numbers, underscores only)</span>}
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                        placeholder="e.g., naveen_motika"
                      />
                      <p className="text-xs text-slate-600 mt-1">Spaces will be converted to underscores automatically</p>
                    </>
                  ) : (
                    <p className="px-4 py-2.5 rounded-xl bg-slate-800/30 text-slate-300">
                      {profile?.displayName || <span className="text-slate-600">Not set</span>}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm text-slate-500 mb-2">Email Address</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/30 text-slate-400">
                    <Mail className="w-4 h-4" />
                    {profile?.email || user?.email}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-slate-500 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                      placeholder="+919876543210"
                    />
                  ) : (
                    <p className="px-4 py-2.5 rounded-xl bg-slate-800/30 text-slate-300">
                      {profile?.phone || <span className="text-slate-600">Not set</span>}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-500 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                      placeholder="City, Country"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/30 text-slate-300">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      {profile?.location || <span className="text-slate-600">Not set</span>}
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-500 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
                      placeholder="Tell us a bit about yourself..."
                      maxLength={500}
                    />
                  ) : (
                    <p className="px-4 py-2.5 rounded-xl bg-slate-800/30 text-slate-300 min-h-[80px]">
                      {profile?.bio || <span className="text-slate-600">No bio added</span>}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Password */}
              <div className="glass-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100">Password</h3>
                      <p className="text-sm text-slate-500 mt-1">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="glass-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100">Two-Factor Authentication</h3>
                      <p className="text-sm text-slate-500 mt-1">Add an extra layer of security</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-400">
                    Coming Soon
                  </span>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-100 mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">Current Session</p>
                        <p className="text-xs text-slate-500">Web Browser</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Recent Activity</h3>
              
              {recentActivity?.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((log: any) => (
                    <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <History className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200">
                          {log.action?.replace(/_/g, " ") || "Unknown action"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {log.targetType || "System"} • {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : "Recently"}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">No recent activity</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}

      <Modal title="Sign Out" isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)}>
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
            <LogOut className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Are you sure?</h3>
            <p className="text-sm text-slate-500 mt-2">You will be signed out of your account.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowLogoutConfirm(false)} 
              className="flex-1 py-3 rounded-xl border border-slate-700 text-sm text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={logout} 
              className="flex-1 py-3 rounded-xl bg-rose-500 text-slate-900 font-medium hover:bg-rose-400 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
