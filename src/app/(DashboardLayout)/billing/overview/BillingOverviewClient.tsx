"use client";

// ==============================================================================
// Billing Overview Client Component
// ==============================================================================
// Displays subscription info, billing stats, and recent platform invoices.
// ==============================================================================

import React, { useEffect, useState } from "react";
import { Badge, Spinner, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import { getCurrentSubscription, getBillingStats, getPlatformInvoices } from "@/app/actions/billing";

const BillingOverviewClient = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [subResult, statsResult, invResult] = await Promise.all([
          getCurrentSubscription(),
          getBillingStats(),
          getPlatformInvoices({ page: 1, perPage: 5 }),
        ]);

        if (subResult && !("error" in subResult)) setSubscription(subResult.data);
        if (statsResult && !("error" in statsResult)) setStats(statsResult.data);
        if (invResult && !("error" in invResult)) setInvoices(invResult.data || []);
      } catch (err) {
        console.error("Failed to load billing overview:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-500">Loading billing data...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Current Subscription Card */}
      <CardBox className="lg:col-span-2">
        <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon icon="solar:card-recive-line-duotone" height={22} />
          Current Subscription
        </h5>
        {subscription ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Plan</span>
              <span className="font-medium">{subscription.plan?.plan_name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <Badge color={subscription.status === "ACTIVE" ? "success" : "warning"}>
                {subscription.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Billing Cycle</span>
              <span>{subscription.billing_cycle || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Current Period</span>
              <span>
                {subscription.current_period_start
                  ? `${new Date(subscription.current_period_start).toLocaleDateString()} – ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount</span>
              <span className="font-semibold text-primary">
                ₹{Number(subscription.amount || 0).toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No active subscription found.</p>
        )}
      </CardBox>

      {/* Billing Stats Card */}
      <CardBox>
        <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon icon="solar:wallet-money-line-duotone" height={22} />
          Billing Summary
        </h5>
        {stats ? (
          <div className="space-y-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.totalSubscriptions ?? 0}</p>
              <p className="text-sm text-gray-500">Total Subscriptions</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.activeSubscriptions ?? 0}</p>
              <p className="text-sm text-gray-500">Active Subscriptions</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                ₹{Number(stats.totalRevenue ?? 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No billing stats available.</p>
        )}
      </CardBox>

      {/* Recent Platform Invoices */}
      <CardBox className="lg:col-span-3">
        <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon icon="solar:bill-list-line-duotone" height={22} />
          Recent Platform Invoices
        </h5>
        {invoices.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No invoices yet.</p>
        ) : (
          <Table hoverable>
            <TableHead>
              <TableHeadCell>Invoice #</TableHeadCell>
              <TableHeadCell>Date</TableHeadCell>
              <TableHeadCell>Amount</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {invoices.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoice_number || inv.id?.slice(0, 8)}</TableCell>
                  <TableCell>{new Date(inv.invoice_date || inv.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>₹{Number(inv.total_amount || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge color={inv.status === "PAID" ? "success" : inv.status === "SENT" ? "info" : "warning"}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardBox>
    </div>
  );
};

export default BillingOverviewClient;
