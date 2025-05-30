import React, { useEffect, useState } from 'react';
import StatCards from '../components/StatCards';
import AnalystReportCard from '../components/AnalystReportCard';
import PerformanceGrade from './PerformanceGrade';

const Analytics = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/analytics/report_card")
      .then((res) => res.json())
      .then((data) => setReport(data))
      .catch((err) => console.error("Failed to load report card:", err));
  }, []);

  return (
    <div className="space-y-8">
      {/* Stat Cards Row */}
      <StatCards />

      {/* Analyst Report + Chart in 2 columns, OR single centered column */}
      <div className={`grid gap-6 ${report ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        <AnalystReportCard report={report} />
        {report && <PerformanceGrade report={report} />}
      </div>
    </div>
  );
};

export default Analytics;
