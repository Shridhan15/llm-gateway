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
  const [selectedKey, setSelectedKey] = useState("All"); // New state for dropdown

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
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  // 1. Extract unique keys for the dropdown
  const uniqueKeys = [
    "All",
    ...new Set(telemetryData.map((d) => d.api_key).filter(Boolean)),
  ];

  // 2. Filter the data based on the dropdown selection
  const displayData =
    selectedKey === "All"
      ? telemetryData
      : telemetryData.filter((d) => d.api_key === selectedKey);

  // 3. Calculate metrics using ONLY the filtered displayData
  const totalRequests = displayData.length;
  const cacheHits = displayData.filter((d) =>
    d.source.includes("cache"),
  ).length;
  const hitRate =
    totalRequests > 0 ? ((cacheHits / totalRequests) * 100).toFixed(1) : 0;

  const totalCost = displayData
    .reduce((sum, req) => sum + req.estimated_cost_usd, 0)
    .toFixed(6);

  const cachedReqs = displayData.filter((d) => d.source.includes("cache"));
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
      {/* Header with Dropdown */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>

        <div className="flex items-center gap-4">
          {/* API Key Selector */}
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            {uniqueKeys.map((key) => (
              <option key={key} value={key}>
                {key === "All" ? "All API Keys" : `Key: ${key}`}
              </option>
            ))}
          </select>

          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
            API Healthy
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Requests"
          value={totalRequests}
          subtext="Tracked logs"
          icon={Activity}
        />
        <StatCard
          title="Cache Hit Rate"
          value={`${hitRate}%`}
          subtext={`${cacheHits} intercepted`}
          icon={Database}
          trend={hitRate > 50 ? "good" : "neutral"}
        />
        <StatCard
          title="Avg Latency (Cache)"
          value={`${avgCacheLatency} ms`}
          subtext="From Upstash Edge"
          icon={Zap}
          trend="good"
        />
        <StatCard
          title="Total Cost"
          value={`$${totalCost}`}
          subtext="Llama 3 Tokens"
          icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Request Latency (ms)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {/* Bind charts to displayData */}
                <LineChart data={displayData}>
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

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Token Cost vs Savings (USD)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {/* Bind charts to displayData */}
                <BarChart data={displayData}>
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

        {/* Right Column: Live Chat Tester */}
        <div className="lg:col-span-1">
          <ChatTester />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
