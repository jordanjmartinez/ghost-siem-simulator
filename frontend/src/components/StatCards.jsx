import React, { useEffect, useState } from 'react';

const StatCards = () => {
  const [stats, setStats] = useState({
    total_alerts: 0,
    critical_alerts: 0,
    high_severity_rate: 0.0,
  });

  useEffect(() => {
    const fetchStats = () => {
      fetch('http://localhost:5000/api/analytics')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error('Error fetching stats:', err));
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#161b22] rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center text-white">
      {/* Total Alerts */}
      <div className="flex-1 text-center border-b sm:border-b-0 sm:border-r border-gray-700 px-4 py-2">
        <p className="text-sm text-gray-400">Total Alerts</p>
        <p className="text-3xl font-bold">{stats.total_alerts}</p>
      </div>

      {/* Critical Alerts */}
      <div className={`flex-1 text-center border-b sm:border-b-0 sm:border-r border-gray-700 px-4 py-2 ${stats.critical_alerts > 0 ? 'text-red-500' : 'text-white'}`}>
        <p className="text-sm text-gray-400">Critical Alerts</p>
        <p className="text-3xl font-bold">{stats.critical_alerts}</p>
      </div>

      {/* High Severity Rate */}
      <div className="flex-1 text-center px-4 py-2">
        <p className="text-sm text-gray-400">High Severity Rate</p>
        <p className="text-3xl font-bold">{stats.high_severity_rate}%</p>
      </div>
    </div>
  );
};

export default StatCards;
