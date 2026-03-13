"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Loader2, Database } from "lucide-react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  pagination,
  onRowClick,
  emptyMessage = "No records found matching the criteria.",
}: DataTableProps<T>) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-admin-border/50 bg-admin-elevated/5">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-4 text-[10px] font-bold text-admin-text-muted uppercase tracking-[0.2em] ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border/30">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {columns.map((_, ci) => (
                    <td key={ci} className="px-6 py-5">
                      <div className="h-5 bg-admin-elevated rounded animate-pulse w-full opacity-40" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-40">
                    <Database className="w-10 h-10 text-admin-text-muted" />
                    <p className="text-sm font-medium text-admin-text-muted italic">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => onRowClick?.(item)}
                  className={`group transition-all duration-200 ${onRowClick ? "cursor-pointer hover:bg-admin-accent/[0.03]" : ""}`}
                >
                  {columns.map((col, idx) => (
                    <td key={idx} className={`px-6 py-5 ${col.className || ""}`}>
                      {typeof col.accessor === "function" 
                          ? col.accessor(item) 
                          : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-admin-border/50 bg-admin-elevated/5">
          <div className="text-[10px] font-bold text-admin-text-muted uppercase tracking-wider">
            Displaying <span className="text-admin-text">{data.length}</span> of <span className="text-admin-text">{pagination.total}</span> records
          </div>
          
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-bold text-admin-text-muted uppercase">
               Page {pagination.page} / {pagination.totalPages}
             </span>
             <div className="flex gap-1.5">
               <button
                 onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
                 disabled={pagination.page === 1}
                 className="p-1.5 rounded-lg border border-admin-border hover:bg-admin-elevated text-admin-text-muted hover:text-admin-text disabled:opacity-30 transition-all"
               >
                 <ChevronLeft className="w-4 h-4" />
               </button>
               <button
                 onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                 disabled={pagination.page === pagination.totalPages}
                 className="p-1.5 rounded-lg border border-admin-border hover:bg-admin-elevated text-admin-text-muted hover:text-admin-text disabled:opacity-30 transition-all"
               >
                 <ChevronRight className="w-4 h-4" />
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
