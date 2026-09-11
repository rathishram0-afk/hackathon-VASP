"use client";

import { useForensicStore } from "@/store/useForensicStore";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, CheckCircle, ShieldAlert, Activity, DollarSign } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

export default function WalletIntelligencePage() {
  const params = useParams();
  const router = useRouter();
  const { wallets, setLE28ModalOpen } = useForensicStore();

  const rawAddress = (params?.address as string) || "0x83A1e91F24c90a1b2c4e51291884391F2";
  const address = decodeURIComponent(rawAddress);
  const profile = wallets[address] || wallets["0x83A1e91F24c90a1b2c4e51291884391F2"];

  const [copied, setCopied] = useState(false);

  const copyAddr = () => {
    navigator.clipboard.writeText(profile.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock balance chart data
  const chartData = [
    { date: "Sep 01", balance: 2.84 },
    { date: "Sep 03", balance: 2.10 },
    { date: "Sep 05", balance: 1.45 },
    { date: "Sep 07", balance: 0.55 },
    { date: "Sep 09", balance: 0.12 },
    { date: "Sep 11", balance: 0.12 },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-mono text-outline hover:text-on-surface transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-[10px] uppercase text-outline tracking-wider">
              WALLET INTELLIGENCE PROFILE
            </span>
            <span className="px-2 py-0.5 rounded bg-error-container text-error font-mono text-[10px] font-bold">
              {profile.entityType}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl font-bold text-on-surface break-all">
              {profile.address}
            </h1>
            <button onClick={copyAddr} className="text-outline hover:text-secondary">
              {copied ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant/30 text-secondary font-mono text-[10px] font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Risk Score Meter */}
        <div className="flex items-center gap-6 bg-surface-container/60 p-4 rounded-lg border border-outline-variant/30">
          <div className="flex flex-col items-end">
            <span className="font-label-sm text-[10px] text-outline uppercase">
              RISK SCORE ASSESSMENT
            </span>
            <span className="font-mono text-3xl font-bold text-error">
              {profile.riskScore}/100
            </span>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-error flex items-center justify-center font-mono font-bold text-error text-xs shadow-[0_0_12px_rgba(239,68,68,0.4)]">
            CRIT
          </div>
        </div>
      </div>

      {/* Grid for Balance Chart & Telemetry */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Historical Balance Chart (8 cols) */}
        <div className="xl:col-span-8 bg-surface-container-low p-5 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
            <h2 className="font-display font-semibold text-sm text-on-surface">
              HISTORICAL BALANCE TRAJECTORY (BTC)
            </h2>
            <span className="font-mono text-xs text-secondary-container">
              Current: {profile.currentBalanceBtc} BTC
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBtc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00d2ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#8b90a0" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke="#8b90a0" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#181b25",
                    borderColor: "#414754",
                    borderRadius: "8px",
                    color: "#dfe2ef",
                    fontFamily: "JetBrains Mono",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#00d2ff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBtc)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Telemetry & Cluster Data (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-surface-container-low p-5 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col gap-4 font-mono text-xs">
            <h3 className="font-display font-semibold text-sm text-on-surface border-b border-outline-variant/20 pb-2">
              CLUSTER & NETWORK METRICS
            </h3>

            <div className="flex justify-between p-2.5 rounded bg-surface-container/60 border border-outline-variant/20">
              <span className="text-outline">Co-Spent Cluster:</span>
              <span className="text-secondary font-bold">{profile.coSpentCluster}</span>
            </div>

            <div className="flex justify-between p-2.5 rounded bg-surface-container/60 border border-outline-variant/20">
              <span className="text-outline">Total Received:</span>
              <span className="text-on-surface font-bold">{profile.totalReceivedBtc} BTC</span>
            </div>

            <div className="flex justify-between p-2.5 rounded bg-surface-container/60 border border-outline-variant/20">
              <span className="text-outline">Total Sent:</span>
              <span className="text-on-surface font-bold">{profile.totalSentBtc} BTC</span>
            </div>

            <div className="flex flex-col gap-1.5 pt-2">
              <span className="text-outline text-[10px] uppercase font-bold">
                Associated Telemetry IPs
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.associatedIPs.map((ip) => (
                  <span
                    key={ip}
                    className="px-2 py-1 rounded bg-surface-container-highest text-primary text-[10px]"
                  >
                    {ip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
