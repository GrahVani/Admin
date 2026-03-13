"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="space-y-1.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-admin-text-muted mb-2">
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                {bc.href ? (
                  <Link href={bc.href} className="hover:text-admin-accent transition-colors">
                    {bc.label}
                  </Link>
                ) : (
                  <span>{bc.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3 opacity-40" />}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        <h1 
          className="text-3xl font-extrabold text-admin-text tracking-tight animate-fade-in"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-sm text-admin-text-secondary max-w-2xl font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 animate-fade-in delay-100">
          {actions}
        </div>
      )}
    </div>
  );
}
