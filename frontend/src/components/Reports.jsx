import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import IncidentReportForm from '../components/IncidentReportForm';

const Reports = ({ setReportCount }) => {
  const [reports, setReports] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [editReport, setEditReport] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/reports");
      const data = await res.json();
      setReports(data.reverse());
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (setReportCount) {
      setReportCount(reports.length);
    }
  }, [reports, setReportCount]);

  const toggleRow = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleExportPDF = async (report) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>Incident Report</h1>
      <p><strong>Title:</strong> ${report.title}</p>
      <p><strong>Description:</strong> ${report.description}</p>
      <p><strong>Severity:</strong> ${report.severity}</p>
      <p><strong>Category:</strong> ${report.threat_category}</p>
      <p><strong>Affected Hosts:</strong> ${report.affected_hosts}</p>
      <p><strong>Mitigation:</strong> ${report.mitigation}</p>
      <p><strong>Status:</strong> ${report.status}</p>
      <p><strong>Timestamp:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
    `;
    document.body.appendChild(element);

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10);
    pdf.save(`incident-${report.title}.pdf`);

    document.body.removeChild(element);
  };

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-sm text-gray-400 text-center">
        <div className="relative bg-gray-800 text-white text-sm px-4 py-3 rounded-xl tracking-wide shadow-lg mb-3 font-mono
          before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2
          before:border-8 before:border-transparent before:border-t-gray-800">
          👻 Review and track incident reports here
        </div>

        <img
          src="/ghost-reports.png"
          alt="Ghost Mascot"
          className="w-32 h-32 mb-2 opacity-90"
        />

        <p className="text-gray-400 text-center text-base mt-1">No incident reports submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-700 p-4 bg-[#0d1117]">
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="bg-[#161b22] border-b border-gray-700 text-white">
            <tr>
              <th className="px-3 py-2 w-8"></th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Affected Hosts</th>
              <th className="px-4 py-2 min-w-[160px]">Timestamp</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <React.Fragment key={index}>
                <tr className="bg-[#111827] border-t border-gray-700 hover:bg-[#1c2431] transition">
                  <td
                    className="text-center cursor-pointer text-lg"
                    onClick={() => toggleRow(index)}
                  >
                    {expandedIndex === index ? '−' : '+'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-400 max-w-[300px] truncate">
                    {report.title || 'Untitled'}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">
                    {report.category_match === true && (
                      <span className="text-white-400">{report.threat_category} ✔️</span>
                    )}
                    {report.category_match === false && (
                      <span className="text-white-400">
                        {report.threat_category} ❌
                        <span className="text-gray-400"> (Correct: {report.correct_category})</span>
                      </span>
                    )}
                    {report.category_match === undefined && '—'}
                  </td>
                  <td className="px-4 py-3 max-w-[250px] truncate">{report.affected_hosts || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                    {new Date(report.timestamp).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditReport(report)}
                        className="text-white-400 hover:text-gray-300 text-xl"
                        title="Edit Report"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleExportPDF(report)}
                        className="text-white-400 hover:text-gray-300 text-2xl"
                        title="Export Report"
                      >
                        🗎
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedIndex === index && (
                  <tr className="bg-[#1a1f2b]">
                    <td colSpan="6" className="px-6 py-4 text-sm text-gray-300 max-w-full">
                      <div className="space-y-3">
                        <div>
                          <span className="font-semibold text-gray-400">Description:</span>
                          <p className="break-words break-all whitespace-normal">
                            {report.description || '—'}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-400">Severity:</span>
                          <p>{report.severity || '—'}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-400">Category:</span>
                          <p>
                            {report.category_match === true && (
                              <span className="text-white-400">{report.threat_category} ✔️</span>
                            )}
                            {report.category_match === false && (
                              <span className="text-white-400">
                                {report.threat_category} ❌
                                <span className="text-gray-400"> (Correct: {report.correct_category})</span>
                              </span>
                            )}
                            {report.category_match === undefined && '—'}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-400">Mitigation:</span>
                          <p className="break-words break-all whitespace-normal">
                            {report.mitigation || '—'}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-400">Status:</span>
                          <p>{report.status || '—'}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {editReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <IncidentReportForm
            initialData={editReport}
            onSubmit={async (updated) => {
              try {
                const res = await fetch(`http://localhost:5000/api/reports/${updated.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updated),
                });

                if (res.ok) {
                  await fetchReports();
                } else {
                  console.error("Failed to update report");
                }
              } catch (err) {
                console.error("Error during report update", err);
              } finally {
                setEditReport(null);
              }
            }}
            onCancel={() => setEditReport(null)}
          />
        </div>
      )}
    </div>
  );
};

export default Reports;
