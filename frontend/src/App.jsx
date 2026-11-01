import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* Future routes */}
            <Route
              path="/keys"
              element={
                <div className="text-gray-500">API Keys View (Coming Soon)</div>
              }
            />
            <Route
              path="/logs"
              element={
                <div className="text-gray-500">Raw Logs View (Coming Soon)</div>
              }
            />
            <Route
              path="/settings"
              element={
                <div className="text-gray-500">Settings View (Coming Soon)</div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
