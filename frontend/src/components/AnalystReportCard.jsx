import React from "react";

const AnalystReportCard = ({ report }) => {
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center text-sm text-gray-400 py-12 text-center">
        <div className="relative bg-gray-800 text-white text-sm px-4 py-3 rounded-xl tracking-wide shadow-lg mb-3 font-mono
          before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2
          before:border-8 before:border-transparent before:border-t-gray-800">
          👻 I’m tracking your progress. Once you take action, I’ll fill in the report!
        </div>

        <img
          src="/ghost-analytics.png"
          alt="Analytics Ghost"
          className="w-36 h-36 mb-2 opacity-90"
        />

        <p className="text-gray-400 text-center text-base mt-1">Nothing to report.</p>
      </div>
    );
  }

  if (report.error) {
    return <div className="text-red-400">Error loading report.</div>;
  }

  return (
    <div className="bg-[#1c2128] p-6 rounded-2xl h-full w-full border border-gray-700 shadow-md">
      <h2 className="text-xl font-semibold text-white text-center mb-4 font-mono">
        Analyst Report Card
      </h2>

      <div className="divide-y divide-dashed divide-gray-700 text-sm text-gray-300 font-mono">
        <div className="flex justify-between py-3">
          <span>Resolved False Positives</span>
          <span className="text-white font-semibold">{report.resolved_false_positives}</span>
        </div>
        <div className="flex justify-between py-3">
          <span>Escalated True Threats</span>
          <span className="text-white font-semibold">{report.escalated_true_threats}</span>
        </div>
        <div className="flex justify-between py-3">
          <span>Correct Investigations</span>
          <span className="text-white font-semibold">{report.investigated_correct}</span>
        </div>
        <div className="flex justify-between py-3">
          <span>Misclassified Alerts</span>
          <span className="text-white font-semibold">{report.incorrect_actions}</span>
        </div>
        <div className="flex justify-between py-3">
          <span>Total Actions</span>
          <span className="text-white font-semibold">{report.total_actions}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalystReportCard;
