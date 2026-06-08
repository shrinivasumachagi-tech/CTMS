"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

export default function KPICard({ title, value, icon: Icon, trend, trendUp, color }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-[#D8DDE3] p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[#6B7280] font-medium">{title}</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{value}</p>
          {trend && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trendUp ? "text-[#22C55E]" : "text-[#EF4444]")}>
              {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trend}
            </div>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
}
