"use client";

import React from "react";
import { motion } from "framer-motion";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  email?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showStatus?: boolean;
  status?: "online" | "offline" | "away" | "busy";
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

const statusColors = {
  online: "bg-admin-success",
  offline: "bg-admin-text-muted",
  away: "bg-admin-warning",
  busy: "bg-admin-danger",
};

const statusSizeClasses = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-4 h-4",
};

function getInitials(name?: string, email?: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "?";
}

function getGradientFromString(str: string): string {
  const gradients = [
    "from-amber-500 to-orange-600",
    "from-purple-500 to-pink-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-red-600",
    "from-indigo-500 to-purple-600",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function Avatar({
  src,
  alt,
  name,
  email,
  size = "md",
  className = "",
  showStatus = false,
  status = "offline",
}: AvatarProps) {
  const identifier = name || email || "?";
  const initials = getInitials(name, email);
  const gradient = getGradientFromString(identifier);

  return (
    <div className={`relative inline-flex ${className}`}>
      {src ? (
        <motion.img
          src={src}
          alt={alt || name || "Avatar"}
          className={`${sizeClasses[size]} rounded-xl object-cover border border-admin-border`}
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      ) : (
        <motion.div
          className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-lg border border-white/10`}
          whileHover={{ scale: 1.05 }}
        >
          {initials}
        </motion.div>
      )}
      
      {showStatus && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${statusSizeClasses[size]} ${statusColors[status]} rounded-full border-2 border-admin-card`}
        />
      )}
    </div>
  );
}

// Avatar Group component
interface AvatarGroupProps {
  avatars: Array<Omit<AvatarProps, "size">>;
  max?: number;
  size?: AvatarProps["size"];
}

export function AvatarGroup({ avatars, max = 4, size = "md" }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const overlapClasses = {
    xs: "-ml-1",
    sm: "-ml-2",
    md: "-ml-3",
    lg: "-ml-4",
    xl: "-ml-5",
  };

  return (
    <div className="flex items-center">
      {visible.map((avatar, i) => (
        <div key={i} className={i > 0 ? overlapClasses[size] : ""}>
          <Avatar {...avatar} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`${overlapClasses[size]} ${sizeClasses[size]} rounded-xl bg-admin-elevated border-2 border-admin-card flex items-center justify-center text-xs font-bold text-admin-text-secondary`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
