import React, { useState } from 'react';
import AlertTable from '../components/AlertTable';
import GroupedAlerts from '../components/GroupedAlerts';
import Analytics from '../components/Analytics';
import Reports from '../components/Reports';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [alertCount, setAlertCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [view, setView] = useState("grouped"); // 'grouped' | 'table' | 'analytics' | 'reports'
  const [resetTrigger, setResetTrigger] = useState(0); // 🔁 state to trigger component refresh

  const handleGenerateLogs = () => {
    fetch('http://localhost:5000/api/start-simulator', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => toast.success(`🛠️ ${data.message}`))
      .catch(() => toast.error('Failed to start simulator'));
  };

  const handleResetSimulator = async () => {
    const confirmed = window.confirm("This will reset all logs and reports. Continue?");
    if (!confirmed) return;

    try {
      const res = await fetch('http://localhost:5000/api/reset-simulator', {
        method: 'POST',
      });
      const data = await res.json();
      toast.success(`🔁 ${data.message}`);
      setResetTrigger(prev => prev + 1); // 🔁 trigger re-render
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset simulator");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white py-8 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold text-white mb-2">SIEM Dashboard</h1>
          <p className="text-gray-400">Real-time alert monitoring and log analysis</p>
        </header>

        {/* Tabbed Box */}
        <div className="bg-[#161b22] rounded-xl p-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-6 space-x-6">
            <button
              onClick={() => setView("grouped")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                view === "grouped"
                  ? "border-blue-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Patterns
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                view === "table"
                  ? "border-blue-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setView("analytics")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                view === "analytics"
                  ? "border-blue-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setView("reports")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                view === "reports"
                  ? "border-blue-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Reports
            </button>
          </div>

          {/* Tab Content */}
          {view === "grouped" && <GroupedAlerts resetTrigger={resetTrigger} />}

          {view === "table" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Events <span className="text-gray-400">({alertCount})</span>
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleGenerateLogs}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-[#21262d] hover:bg-[#30363d] text-gray-200 border border-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Simulate Events
                  </button>
                  <button
                    onClick={handleResetSimulator}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-[#21262d] hover:bg-[#30363d] text-gray-200 border border-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Clear Logs
                  </button>
                </div>
              </div>
              
              <AlertTable setAlertCount={setAlertCount} resetTrigger={resetTrigger} />
            </>
          )}

          {view === "analytics" && <Analytics />}

          {view === "reports" && (
            <>
              <h2 className="text-xl font-semibold text-white mb-4">
                Incident Reports <span className="text-gray-400">({reportCount})</span>
              </h2>
              <Reports setReportCount={setReportCount} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
