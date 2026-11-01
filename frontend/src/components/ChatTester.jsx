import React, { useState } from "react";
import { Send, Cpu, Database, Zap } from "lucide-react";

const ChatTester = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "gw_test123", // Your test API key
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Chat error:", error);
      setResponse({ status: "error", data: "Failed to connect to Gateway." });
    } finally {
      setLoading(false);
    }
  };

  // Dynamically assign an icon and color based on the routing layer
  const getSourceBadge = (source) => {
    if (source?.includes("layer1"))
      return (
        <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md text-xs border border-yellow-200">
          <Zap size={14} /> Redis Exact Match
        </span>
      );
    if (source?.includes("layer2"))
      return (
        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs border border-blue-200">
          <Database size={14} /> Vector Semantic Match
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-md text-xs border border-purple-200">
        <Cpu size={14} /> Groq LLM Generation
      </span>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full min-h-[400px]">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Gateway Live Tester
      </h3>

      <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
        {response ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              {getSourceBadge(response.source)}
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {response.data}
            </p>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center px-4">
            Send a prompt to test the cascading cache. Watch the charts update
            automatically.
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
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
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
