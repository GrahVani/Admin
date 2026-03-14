"use client";

import React from "react";
import { Loader2, LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-gold",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  gold: "btn-gold",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
  icon: "btn-icon",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const isIconOnly = size === "icon" && !LeftIcon && !RightIcon;
  
  return (
    <button
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
        isLoading ? "btn-loading" : ""
      }`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && !isIconOnly && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {!isLoading && LeftIcon && <LeftIcon className="w-4 h-4" />}
      {!isIconOnly && children}
      {!isLoading && RightIcon && <RightIcon className="w-4 h-4" />}
    </button>
  );
}

// IconButton variant for single icon buttons
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function IconButton({
  icon: Icon,
  variant = "ghost",
  size = "md",
  isLoading = false,
  className = "",
  ...props
}: IconButtonProps) {
  const sizeMap = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  const iconSizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      className={`rounded-xl border border-admin-border text-admin-text-secondary hover:text-admin-text hover:bg-admin-elevated transition-colors disabled:opacity-50 ${sizeMap[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizeMap[size]} animate-spin`} />
      ) : (
        <Icon className={iconSizeMap[size]} />
      )}
    </button>
  );
}
