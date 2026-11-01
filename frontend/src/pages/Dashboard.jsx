import React, { useState, useEffect } from "react";
import { Activity, Zap, DollarSign, Database } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import StatCard from "../components/StatCard";
import ChatTester from "../components/ChatTester";

const Dashboard = () => {
  const [telemetryData, setTelemetryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch live data from FastAPI
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/telemetry");
        const json = await response.json();
        setTelemetryData(json.data);
      } catch (error) {
        console.error("Failed to fetch telemetry:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTelemetry();

    // Optional: Refresh every 5 seconds for a "live" feel
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate live metrics for the StatCards
  const totalRequests = telemetryData.length;
  const cacheHits = telemetryData.filter((d) =>
    d.source.includes("cache"),
  ).length;
  const hitRate =
    totalRequests > 0 ? ((cacheHits / totalRequests) * 100).toFixed(1) : 0;

  const totalCost = telemetryData
    .reduce((sum, req) => sum + req.estimated_cost_usd, 0)
    .toFixed(6);

  // Calculate average latency for cached vs non-cached
  const cachedReqs = telemetryData.filter((d) => d.source.includes("cache"));
  const avgCacheLatency =
    cachedReqs.length > 0
      ? Math.round(
          cachedReqs.reduce((sum, req) => sum + req.latency_ms, 0) /
            cachedReqs.length,
        )
      : 0;

  if (loading)
    return <div className="p-8 text-gray-500">Loading telemetry...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
          API Healthy
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Requests"
          value="5"
          subtext="Last 24 hours"
          icon={Activity}
        />
        <StatCard
          title="Cache Hit Rate"
          value="80.0%"
          subtext="4/5 intercepted"
          icon={Database}
          trend="good"
        />
        <StatCard
          title="Avg Latency (Cache)"
          value="70 ms"
          subtext="vs 3.8s LLM baseline"
          icon={Zap}
          trend="good"
        />
        <StatCard
          title="Total Cost"
          value="$0.000069"
          subtext="$0.000276 saved"
          icon={DollarSign}
        />
      </div>

      {/* Replace your existing grid grid-cols-1 lg:grid-cols-2 with this: */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Charts (Takes up 2/3 of the space) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latency Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Request Latency (ms)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="latency_ms"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3B82F6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost Analysis Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Token Cost vs Savings (USD)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={telemetryData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#F3F4F6" }}
                    contentStyle={{ borderRadius: "8px", border: "none" }}
                  />
                  <Bar
                    dataKey="estimated_cost_usd"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Live Chat Tester (Takes up 1/3 of the space) */}
        <div className="lg:col-span-1">
          <ChatTester />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
