import React from "react";

const StatCard = ({ title, value, subtext, icon: Icon, trend }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        <p
          className={`text-xs mt-2 ${trend === "good" ? "text-green-600" : "text-gray-500"}`}
        >
          {subtext}
        </p>
      </div>
      <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;
