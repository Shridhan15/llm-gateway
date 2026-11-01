import React, { useState, useEffect } from "react";
import { Send, Cpu, Database, Zap, Key } from "lucide-react";

const ChatTester = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // New state for key management
  const [availableKeys, setAvailableKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");

  // Fetch keys when the component mounts
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/keys");
        const json = await res.json();
        setAvailableKeys(json.data);
        if (json.data.length > 0) {
          setSelectedKey(json.data[0].key); // Default to the first key
        }
      } catch (error) {
        console.error("Failed to fetch tester keys:", error);
      }
    };
    fetchKeys();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedKey) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": selectedKey, // Use the dynamically selected key
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResponse({
          status: "error",
          data: data.detail || "Request failed.",
        });
      } else {
        setResponse(data);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setResponse({ status: "error", data: "Failed to connect to Gateway." });
    } finally {
      setLoading(false);
    }
  };

  const getSourceBadge = (source) => {
    if (source?.includes("layer1"))
      return (
        <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md text-xs border border-yellow-200">
          <Zap size={14} /> Redis Exact
        </span>
      );
    if (source?.includes("layer2"))
      return (
        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs border border-blue-200">
          <Database size={14} /> Vector Match
        </span>
      );
    if (source === "error")
      return (
        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs border border-red-200">
          Error
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-md text-xs border border-purple-200">
        <Cpu size={14} /> Groq LLM
      </span>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full min-h-[450px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Gateway Live Tester
        </h3>
      </div>

      {/* API Key Selector */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
          <Key size={12} /> Injecting as Tenant:
        </label>
        <select
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {availableKeys.map((k) => (
            <option key={k.key} value={k.key}>
              {k.owner} ({k.key.substring(0, 10)}...)
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
        {response ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              {getSourceBadge(response.source || response.status)}
            </div>
            <p
              className={`text-sm whitespace-pre-wrap leading-relaxed ${response.status === "error" ? "text-red-600 font-medium" : "text-gray-700"}`}
            >
              {response.data}
            </p>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center px-4">
            Select a key and send a prompt to test.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Llama 3..."
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading || availableKeys.length === 0}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim() || availableKeys.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
        >
          {loading ? (
            <span className="animate-pulse">...</span>
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatTester;
