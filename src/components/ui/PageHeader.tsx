"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fadeIn, fadeInLeft, fadeInUp } from "@/lib/animations";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  backHref?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  backHref,
  className = "",
}: PageHeaderProps) {
  return (
    <motion.div
      className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 ${className}`}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-1.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <motion.nav
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-admin-text-muted mb-2"
            variants={fadeIn}
          >
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                {bc.href ? (
                  <Link
                    href={bc.href}
                    className="hover:text-admin-accent transition-colors"
                  >
                    {bc.label}
                  </Link>
                ) : (
                  <span>{bc.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-3 h-3 opacity-40" />
                )}
              </React.Fragment>
            ))}
          </motion.nav>
        )}

        {backHref && (
          <motion.div variants={fadeInLeft}>
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 text-xs text-admin-text-muted hover:text-admin-accent transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Link>
          </motion.div>
        )}

        <motion.h1
          className="text-3xl font-extrabold text-admin-text tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
          variants={fadeInUp}
        >
          {title}
        </motion.h1>

        {description && (
          <motion.p
            className="text-sm text-admin-text-secondary max-w-2xl font-medium leading-relaxed"
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
          >
            {description}
          </motion.p>
        )}
      </div>

      {actions && (
        <motion.div
          className="flex items-center gap-3"
          variants={fadeIn}
          transition={{ delay: 0.1 }}
        >
          {actions}
        </motion.div>
      )}
    </motion.div>
  );
}
