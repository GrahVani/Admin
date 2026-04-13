"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";
import { Skeleton } from "./Skeleton";
import { Checkbox } from "./Checkbox";
import { Popover, MenuItem, MenuDivider } from "./Popover";
import { Tooltip } from "./Tooltip";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/animations";

type SortDirection = "asc" | "desc" | null;

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
  width?: string;
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
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  emptyMessage?: string;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  searchValue?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  bulkActions?: {
    label: string;
    icon?: React.ElementType;
    onClick: (ids: string[]) => void;
    variant?: "default" | "danger";
  }[];
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  pagination,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  emptyMessage = "No records found matching the criteria.",
  searchable,
  onSearch,
  searchValue = "",
  selectable,
  selectedIds = [],
  onSelectionChange,
  bulkActions,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchQuery, setSearchQuery] = useState(searchValue);

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection((prev) =>
        prev === "asc" ? "desc" : prev === "desc" ? null : "asc"
      );
      if (sortDirection === "desc") {
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnIndex);
      setSortDirection("asc");
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(data.map((item) => String(item.id)));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedIds, id]);
    } else {
      onSelectionChange?.(selectedIds.filter((i) => i !== id));
    }
  };

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <motion.div
      className="glass-card overflow-hidden"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      {/* Toolbar */}
      {(searchable || selectable) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-b border-admin-border/50">
          {searchable && (
            <div className="relative w-full sm:w-72">
              <Tooltip content="Search records" position="top">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted cursor-help" />
              </Tooltip>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search records..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Bulk Actions */}
          <AnimatePresence>
            {selectable && selectedIds.length > 0 && bulkActions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm text-admin-text-muted">
                  {selectedIds.length} selected
                </span>
                {bulkActions.map((action) => (
                  <Tooltip 
                    key={action.label}
                    content={`${action.label} ${selectedIds.length} selected item(s)`}
                    position="top"
                  >
                    <button
                      onClick={() => action.onClick(selectedIds)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        action.variant === "danger"
                          ? "bg-admin-danger/10 text-admin-danger hover:bg-admin-danger/20"
                          : "bg-admin-accent/10 text-admin-accent hover:bg-admin-accent/20"
                      }`}
                    >
                      {action.icon && <action.icon className="w-4 h-4" />}
                      {action.label}
                    </button>
                  </Tooltip>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-admin-border/50 bg-admin-elevated/30">
              {selectable && (
                <th className="px-4 py-3 w-12">
                  <Tooltip content="Select all rows" position="top">
                    <div className="inline-flex">
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </div>
                  </Tooltip>
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 text-[11px] font-bold text-admin-text-muted uppercase tracking-wider ${
                    col.className || ""
                  } ${col.sortable ? "cursor-pointer hover:text-admin-text" : ""}`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(idx)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <Tooltip 
                        content={sortColumn === idx 
                          ? (sortDirection === "asc" ? "Sorted ascending - Click to sort descending" : "Sorted descending - Click to clear sort")
                          : "Click to sort ascending"
                        }
                        position="top"
                      >
                        <span className="text-admin-text-muted cursor-help">
                          {sortColumn === idx ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-4 py-3 w-12"></th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border/30">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {selectable && (
                    <td className="px-4 py-4">
                      <Skeleton variant="circular" width={18} height={18} />
                    </td>
                  )}
                  {columns.map((_, ci) => (
                    <td key={ci} className="px-4 py-4">
                      <Skeleton variant="text" width="80%" height={16} />
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-4 py-4">
                      <Skeleton variant="circular" width={32} height={32} />
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (onEdit || onDelete || onView ? 1 : 0)
                  }
                  className="py-16"
                >
                  <motion.div
                    className="flex flex-col items-center gap-3 text-admin-text-muted"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-admin-elevated/50 flex items-center justify-center">
                      <Database className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </motion.div>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {data.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    variants={staggerItem}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={index}
                    onClick={() => onRowClick?.(item)}
                    className={`group transition-colors ${
                      onRowClick ? "cursor-pointer hover:bg-admin-accent/[0.02]" : ""
                    } ${
                      selectedIds.includes(String(item.id))
                        ? "bg-admin-accent/5"
                        : ""
                    }`}
                  >
                    {selectable && (
                      <td
                        className="px-4 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip content="Select this row" position="top">
                          <div className="inline-flex">
                            <Checkbox
                              checked={selectedIds.includes(String(item.id))}
                              onChange={(e) =>
                                handleSelectRow(String(item.id), e.target.checked)
                              }
                            />
                          </div>
                        </Tooltip>
                      </td>
                    )}
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`px-4 py-4 ${col.className || ""}`}>
                        {typeof col.accessor === "function"
                          ? col.accessor(item)
                          : (item[col.accessor] as React.ReactNode)}
                      </td>
                    ))}
                    {(onEdit || onDelete || onView) && (
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <Popover
                          trigger={
                            <Tooltip content="Open actions menu" position="top">
                              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-admin-text-muted hover:text-admin-text hover:bg-admin-elevated transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          }
                        >
                          <div className="w-40 p-1 bg-admin-card border border-admin-border rounded-xl shadow-xl">
                            {onView && (
                              <Tooltip content="View complete details" position="left">
                                <div>
                                  <MenuItem
                                    icon={<Eye className="w-4 h-4" />}
                                    onClick={() => onView(item)}
                                  >
                                    View
                                  </MenuItem>
                                </div>
                              </Tooltip>
                            )}
                            {onEdit && (
                              <Tooltip content="Edit this record" position="left">
                                <div>
                                  <MenuItem
                                    icon={<Edit className="w-4 h-4" />}
                                    onClick={() => onEdit(item)}
                                  >
                                    Edit
                                  </MenuItem>
                                </div>
                              </Tooltip>
                            )}
                            {(onView || onEdit) && onDelete && <MenuDivider />}
                            {onDelete && (
                              <Tooltip content="Permanently delete this record" position="left">
                                <div>
                                  <MenuItem
                                    icon={<Trash2 className="w-4 h-4" />}
                                    onClick={() => onDelete(item)}
                                    danger
                                  >
                                    Delete
                                  </MenuItem>
                                </div>
                              </Tooltip>
                            )}
                          </div>
                        </Popover>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-admin-border/50 bg-admin-elevated/20">
          <div className="text-xs text-admin-text-muted">
            Showing{" "}
            <span className="font-semibold text-admin-text">
              {(pagination.page - 1) * data.length + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-admin-text">
              {Math.min(pagination.page * data.length, pagination.total)}
            </span>{" "}
            of <span className="font-semibold text-admin-text">{pagination.total}</span>{" "}
            results
          </div>

          <div className="flex items-center gap-2">
            <Tooltip content="Go to first page" position="top">
              <button
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-admin-border hover:bg-admin-elevated text-admin-text-muted hover:text-admin-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Go to previous page" position="top">
              <button
                onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-admin-border hover:bg-admin-elevated text-admin-text-muted hover:text-admin-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </Tooltip>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === pagination.page;
                return (
                  <Tooltip 
                    key={pageNum}
                    content={isActive ? "Current page" : `Go to page ${pageNum}`}
                    position="top"
                  >
                    <button
                      onClick={() => pagination.onPageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-admin-accent text-admin-deep"
                          : "text-admin-text-muted hover:text-admin-text hover:bg-admin-elevated"
                      }`}
                    >
                      {pageNum}
                    </button>
                  </Tooltip>
                );
              })}
            </div>

            <Tooltip content="Go to next page" position="top">
              <button
                onClick={() =>
                  pagination.onPageChange(Math.min(pagination.totalPages, pagination.page + 1))
                }
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg border border-admin-border hover:bg-admin-elevated text-admin-text-muted hover:text-admin-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Go to last page" position="top">
              <button
                onClick={() => pagination.onPageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg border border-admin-border hover:bg-admin-elevated text-admin-text-muted hover:text-admin-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>
      )}
    </motion.div>
  );
}
