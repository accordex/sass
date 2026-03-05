"use client";

import React, { useState, useEffect } from "react";
import { Spinner, Alert } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getExecutiveDashboardStats } from "@/app/actions/ai-enhancement";

interface Stats {
  crm: { leads: number; customers: number };
  hrms: { employees: number };
  elearning: { courses: number };
  partners: { total: number };
  ai: {
    activeConversations: number;
    totalDecisions: number;
    pendingDecisions: number;
    ragDocuments: number;
    activeAgents: number;
  };
}

const statCards = (stats: Stats) => [
  {
    title: "CRM Leads",
    value: stats.crm.leads,
    icon: "solar:magnet-wave-line-duotone",
    color: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600",
  },
  {
    title: "Customers",
    value: stats.crm.customers,
    icon: "solar:users-group-two-rounded-line-duotone",
    color: "bg-green-50 dark:bg-green-900/20",
    iconColor: "text-green-600",
  },
  {
    title: "Employees",
    value: stats.hrms.employees,
    icon: "solar:users-group-rounded-line-duotone",
    color: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "text-purple-600",
  },
  {
    title: "Courses",
    value: stats.elearning.courses,
    icon: "solar:notebook-minimalistic-line-duotone",
    color: "bg-yellow-50 dark:bg-yellow-900/20",
    iconColor: "text-yellow-600",
  },
  {
    title: "Partners",
    value: stats.partners.total,
    icon: "solar:handshake-line-duotone",
    color: "bg-pink-50 dark:bg-pink-900/20",
    iconColor: "text-pink-600",
  },
  {
    title: "Active AI Agents",
    value: stats.ai.activeAgents,
    icon: "solar:cpu-bolt-line-duotone",
    color: "bg-indigo-50 dark:bg-indigo-900/20",
    iconColor: "text-indigo-600",
  },
  {
    title: "AI Conversations",
    value: stats.ai.activeConversations,
    icon: "solar:chat-round-dots-line-duotone",
    color: "bg-cyan-50 dark:bg-cyan-900/20",
    iconColor: "text-cyan-600",
  },
  {
    title: "Knowledge Docs",
    value: stats.ai.ragDocuments,
    icon: "solar:library-line-duotone",
    color: "bg-orange-50 dark:bg-orange-900/20",
    iconColor: "text-orange-600",
  },
  {
    title: "Total Decisions",
    value: stats.ai.totalDecisions,
    icon: "solar:shield-check-line-duotone",
    color: "bg-teal-50 dark:bg-teal-900/20",
    iconColor: "text-teal-600",
  },
  {
    title: "Pending Decisions",
    value: stats.ai.pendingDecisions,
    icon: "solar:hourglass-line-line-duotone",
    color: "bg-red-50 dark:bg-red-900/20",
    iconColor: "text-red-600",
  },
];

const ExecutiveDashboardClient = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await getExecutiveDashboardStats();
      if ("error" in result) setError(result.error as string);
      else setStats((result as any).data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="xl" /></div>;
  }

  if (error) {
    return <Alert color="failure">{error}</Alert>;
  }

  if (!stats) return null;

  const cards = statCards(stats);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`rounded-xl p-5 ${card.color} border border-gray-100 dark:border-gray-700`}>
            <div className="flex items-center justify-between mb-3">
              <Icon icon={card.icon} className={`w-8 h-8 ${card.iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Cross-Module Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon icon="solar:graph-new-up-line-duotone" className="w-5 h-5 text-blue-500" />
            Business Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">CRM Pipeline</span>
              <span className="font-semibold">{stats.crm.leads} leads → {stats.crm.customers} customers</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Workforce</span>
              <span className="font-semibold">{stats.hrms.employees} employees</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Learning Platform</span>
              <span className="font-semibold">{stats.elearning.courses} courses</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Partner Network</span>
              <span className="font-semibold">{stats.partners.total} partners</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon icon="solar:cpu-bolt-line-duotone" className="w-5 h-5 text-purple-500" />
            AI Operations
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Agents</span>
              <span className="font-semibold">{stats.ai.activeAgents}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Conversations</span>
              <span className="font-semibold">{stats.ai.activeConversations}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Knowledge Base Docs</span>
              <span className="font-semibold">{stats.ai.ragDocuments}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Autonomous Decisions</span>
              <span className="font-semibold">{stats.ai.totalDecisions}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending Decisions</span>
              <span className="font-semibold text-orange-500">{stats.ai.pendingDecisions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Note */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 p-6">
        <div className="flex items-start gap-4">
          <Icon icon="solar:lightbulb-bolt-line-duotone" className="w-8 h-8 text-indigo-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-lg mb-2">Cross-Module Insights</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The AI Orchestrator connects data from CRM, Accounting, HRMS, E-Learning, and Partner modules
              to generate cross-functional insights. Configure AI Agents and Autonomous Rules to enable
              intelligent automation across your business operations. Create custom dashboards to visualize
              the metrics that matter most to your organization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboardClient;
