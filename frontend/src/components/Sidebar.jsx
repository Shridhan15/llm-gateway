import React from "react";
import { LayoutDashboard, Activity, Key, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "API Keys", path: "/keys", icon: Key },
    { name: "Logs", path: "/logs", icon: Activity },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r h-screen fixed flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          LLM Gateway
        </h1>
        <p className="text-xs text-gray-500 mt-1">Enterprise Console</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
