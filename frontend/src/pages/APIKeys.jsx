// frontend/src/pages/APIKeys.jsx
import React, { useState, useEffect } from "react";
import { Key, Plus } from "lucide-react";

const APIKeys = () => {
  const [keys, setKeys] = useState([]);
  const [newOwnerName, setNewOwnerName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchKeys = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/keys");
      const json = await response.json();
      setKeys(json.data);
    } catch (error) {
      console.error("Failed to fetch keys:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newOwnerName.trim()) return;

    try {
      await fetch("http://localhost:8000/api/v1/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_name: newOwnerName }),
      });
      setNewOwnerName("");
      fetchKeys(); // Refresh the list
    } catch (error) {
      console.error("Failed to create key:", error);
    }
  };

  if (loading) return <div className="p-8">Loading keys...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">API Key Management</h2>
      </div>

      {/* Create New Key Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Generate New Key
        </h3>
        <form onSubmit={handleCreateKey} className="flex gap-4">
          <input
            type="text"
            value={newOwnerName}
            onChange={(e) => setNewOwnerName(e.target.value)}
            placeholder="Client or App Name (e.g., Mobile App Production)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={18} /> Generate
          </button>
        </form>
      </div>

      {/* Active Keys List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Owner / Application
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                API Key
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {keys.map((k) => (
              <tr key={k.key} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">
                  {k.owner}
                </td>
                <td className="px-6 py-4">
                  <code className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm font-mono flex items-center gap-2 w-fit">
                    <Key size={14} />
                    {k.key}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default APIKeys;
