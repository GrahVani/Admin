"use client";

import React from "react";
import { useSubscriptions } from "@/hooks/queries/useSubscriptions";
import { usePlans } from "@/hooks/queries/useSubscriptions";
import Link from "next/link";
import { CreditCard, Users, Clock, XCircle, Layers } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { KPICard } from "@/components/ui/KPICard";

export default function SubscriptionsPage() {
  const { data: active } = useSubscriptions({ status: "active" });
  const { data: trialing } = useSubscriptions({ status: "trialing" });
  const { data: pastDue } = useSubscriptions({ status: "past_due" });
  const { data: cancelled } = useSubscriptions({ status: "cancelled" });
  const { data: plans = [] } = usePlans();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Subscriptions"
        description="Platform-wide subscription lifecycle & plan management"
        actions={
          <div className="flex gap-2">
            <Link
              href="/dashboard/subscriptions/plans"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-admin-border hover:bg-admin-elevated text-sm text-admin-text-secondary transition-colors font-bold"
            >
              <Layers className="w-4 h-4" />
              Manage Plan Matrix
            </Link>
            <Link
              href="/dashboard/subscriptions/list"
              className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
            >
              <Users className="w-4 h-4" />
              View All Subscribers
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Subscriptions" value={active?.pagination?.total ?? 0} icon={CreditCard} color="success" />
        <KPICard label="Active Trials" value={trialing?.pagination?.total ?? 0} icon={Clock} color="info" />
        <KPICard label="Past Due Accounts" value={pastDue?.pagination?.total ?? 0} icon={Clock} color="warning" />
        <KPICard label="Cancelled / Expired" value={cancelled?.pagination?.total ?? 0} icon={XCircle} color="danger" />
      </div>

      {/* Plans Overview */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold text-admin-text-muted uppercase tracking-[0.2em]">
            Configured Plan Tiers ({plans.length})
          </h2>
          <Link href="/dashboard/subscriptions/plans" className="text-[10px] text-admin-accent hover:underline font-bold uppercase tracking-widest">
            Detailed Config →
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="py-12 text-center text-admin-text-muted text-sm italic">No subscription plans have been initialized yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan: any) => (
              <div key={plan.id} className="p-5 rounded-2xl bg-admin-elevated border border-admin-border/50 hover:border-admin-accent/30 transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-12 h-12 bg-admin-accent/5 rounded-full blur-xl group-hover:bg-admin-accent/20 transition-all" />
                <p className="text-xs font-bold text-admin-text uppercase tracking-wider mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                   <p className="text-2xl font-bold text-admin-accent" style={{ fontFamily: "var(--font-display)" }}>₹{plan.price}</p>
                   {plan.intervalDays === 30 && <span className="text-[10px] text-admin-text-muted font-bold uppercase">/Mo</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-admin-primary border border-admin-border text-[9px] font-bold text-admin-text-muted uppercase tracking-widest leading-none">
                    {plan.tier}
                  </span>
                  <span className="text-[9px] font-bold text-admin-accent uppercase tracking-tighter">
                    {plan.intervalDays} Days
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
