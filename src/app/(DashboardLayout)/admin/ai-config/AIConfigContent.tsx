"use client";

// ==============================================================================
// AI Configuration Content (Client Component)
// ==============================================================================
// Phase 6 placeholder showing upcoming AI capabilities.
// ==============================================================================

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";

const features = [
  {
    icon: "solar:magic-stick-3-line-duotone",
    title: "Autonomous Workflows",
    desc: "Self-operating business processes with AI decision-making",
  },
  {
    icon: "solar:chart-2-line-duotone",
    title: "Predictive Analytics",
    desc: "Revenue forecasting, demand prediction, churn analysis",
  },
  {
    icon: "solar:chat-round-dots-line-duotone",
    title: "NLP Processing",
    desc: "Natural language understanding for emails, tickets, and documents",
  },
];

const AIConfigContent = () => {
  return (
    <CardBox>
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon icon="solar:cpu-bolt-line-duotone" height={40} className="text-primary" />
        </div>

        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
          AI Configuration — Coming in Phase 6
        </h3>

        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-8">
          This module will allow you to configure AI-powered autonomous workflows,
          predictive analytics models, natural language processing settings,
          and intelligent automation rules across all business modules.
        </p>

        {/* Phase 6 Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {features.map((feature, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <Icon icon={feature.icon} height={28} className="text-primary mb-3" />
              <h5 className="font-semibold text-sm mb-1">{feature.title}</h5>
              <p className="text-xs text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </CardBox>
  );
};

export default AIConfigContent;
