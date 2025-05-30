import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import IncidentReportForm from '../components/IncidentReportForm';

const GroupedAlerts = () => {
  const [groups, setGroups] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [disappearingId, setDisappearingId] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReports, setSubmittedReports] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [submittingIds, setSubmittingIds] = useState(new Set());

  const fetchGroupedAlerts = () => {
    fetch('http://localhost:5000/api/grouped-alerts')
      .then(res => res.json())
      .then(data => {
        setGroups(prevGroups => {
          const prevMap = new Map(prevGroups.map(g => [g.scenario_id, g.selectedAction]));

          return data.map(group => ({
            ...group,
            selectedAction: prevMap.get(group.scenario_id) || 'investigate'
          }));
        });
        setLastUpdated(new Date());
      })
      .catch(err => console.error('Failed to load threat patterns', err));
  };

  const fetchSubmittedReports = () => {
    fetch("http://localhost:5000/api/reports")
      .then(res => res.json())
      .then(data => {
        const reportMap = {};
        data.forEach(report => {
          reportMap[report.scenario_id] = report;
        });
        setSubmittedReports(reportMap);
      })
      .catch(err => console.error("Failed to fetch reports", err));
  };

  useEffect(() => {
    fetchGroupedAlerts();
    fetchSubmittedReports();

    const interval = setInterval(() => {
      fetchGroupedAlerts();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleGroup = (key) => {
    setExpanded(expanded === key ? null : key);
  };

  const handleLockIn = async (group) => {
    if (submittingIds.has(group.scenario_id)) return;

    const updatedSet = new Set(submittingIds);
    updatedSet.add(group.scenario_id);
    setSubmittingIds(updatedSet);

    if (group.selectedAction === 'investigate') {
      if (submittedReports[group.scenario_id]) {
        toast.warn("⚠️ Report already submitted for this scenario.");
        updatedSet.delete(group.scenario_id);
        setSubmittingIds(updatedSet);
        return;
      }
      setSelectedScenario(group);
      setShowReportForm(true);
      return;
    }

    try {
      await fetch('http://localhost:5000/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyst_action: group.selectedAction,
          scenario_id: group.scenario_id,
          label: group.label
        })
      });

      toast.success(`✔ Scenario "${group.label}" marked as "${group.selectedAction}"`);
      setDisappearingId(group.scenario_id);

      setTimeout(() => {
        setGroups(prev =>
          prev.map(g =>
            g.scenario_id === group.scenario_id
              ? {
                  ...g,
                  status:
                    group.selectedAction === 'escalate'
                      ? 'escalated'
                      : group.selectedAction === 'investigate'
                      ? 'investigating'
                      : group.selectedAction === 'resolve'
                      ? 'resolved'
                      : group.selectedAction,
                  selectedAction: 'investigate'
                }
              : g
          )
        );
        setDisappearingId(null);
      }, 300);
    } catch (err) {
      console.error('Error locking in action:', err);
      toast.error('❌ Failed to lock in scenario action');
    } finally {
      const clearedSet = new Set(submittingIds);
      clearedSet.delete(group.scenario_id);
      setSubmittingIds(clearedSet);
    }
  };

  const filteredGroups =
    activeTab === 'active'
      ? groups.filter(g => g.status === 'active')
      : groups.filter(g => ['resolved', 'escalated', 'investigating'].includes(g.status));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-xl font-semibold text-white">
          Detected Patterns <span className="ml-2 px-2 py-0.5 bg-gray-800 text-gray-300 text-base rounded-md">{filteredGroups.length} {activeTab === 'active' ? 'Active' : 'Past'}</span>
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border transition focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              activeTab === 'active'
                ? 'bg-[#21262d] text-white border-gray-600'
                : 'bg-[#161b22] text-gray-400 border-gray-700 hover:bg-[#30363d]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border transition focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              activeTab === 'history'
                ? 'bg-[#21262d] text-white border-gray-600'
                : 'bg-[#161b22] text-gray-400 border-gray-700 hover:bg-[#30363d]'
            }`}
          >
            Past Incidents
          </button>
        </div>
      </div>

      {filteredGroups.length === 0 && (
        <p className="text-gray-400">
          No {activeTab === 'active' ? 'active threats' : 'historical patterns'} available.
        </p>
      )}

      {filteredGroups.map(group => {
        const groupKey = `${group.scenario_id}_${group.threat_pattern}`;
        return (
          <div
            key={groupKey}
            className={`bg-[#161b22] border border-gray-700 p-4 rounded-xl shadow transition-all duration-300 ease-in-out ${
              disappearingId === group.scenario_id ? 'opacity-0 scale-95' : 'opacity-100'
            }`}
          >
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleGroup(groupKey)}>
              <div className="flex items-center space-x-3 flex-wrap">
                <h3 className="bg-gray-800 text-gray-200 text-base px-2 py-0.5 rounded uppercase font-semibold tracking-wide">🕵️ Notable Event</h3>
                {group.status === 'escalated' && group.category && (
                  <div className="bg-gray-800 text-gray-300 px-2 py-1 rounded-lg shadow-sm font-mono">
                    👻 T3 SOC analyst has confirmed this is: <span className="font-semibold">{group.category}</span>
                  </div>
                )}
                {group.status === 'investigating' && (
                  <div className="bg-gray-800 text-gray-300 px-2 py-1 rounded-lg shadow-sm font-mono">
                    👻 SOC analyst is performing triage on this threat pattern
                  </div>
                )}
                {group.status === 'resolved' && group.category === 'False Positive' && (
                  <div className="bg-gray-800 text-gray-300 px-2 py-1 rounded-lg shadow-sm font-mono">
                    👻 Nice work! This was a false positive
                  </div>
                )}
                {group.status === 'resolved' && group.category !== 'False Positive' && (
                  <div className="bg-gray-800 text-gray-300 px-2 py-1 rounded-lg shadow-sm font-mono">
                    👻 Uh-oh... this was actually: <span className="font-semibold">{group.category}</span>
                  </div>
                )}
              </div>
              <span className="ml-4 text-xl text-gray-400 hover:text-white focus:outline-none">
                {expanded === groupKey ? '−' : '+'}
              </span>
            </div>

            <p className="text-sm text-gray-200 flex flex-wrap gap-3 mt-1">
              <span>Events: <span className="font-semibold">{group.log_count}</span></span>
              <span>|</span>
              <span>Severity: <span className="text-red-400 font-semibold">{group.severity.charAt(0).toUpperCase() + group.severity.slice(1)}</span></span>
              <span>|</span>
              <span>Status: <span className={
                group.status === 'resolved'
                  ? 'text-slate-300 font-semibold'
                  : group.status === 'escalated'
                  ? 'text-yellow-200 font-semibold'
                  : group.status === 'investigating'
                  ? 'text-blue-200 font-semibold'
                  : group.status === 'active'
                  ? 'text-gray-300 font-semibold'
                  : 'text-gray-400 font-semibold'
              }>
                {group.status === 'resolved' ? 'Dismissed' : group.status.charAt(0).toUpperCase() + group.status.slice(1)}
              </span></span>
            </p>

            {expanded === groupKey && (
              <>
                <div className="mt-4 max-h-96 overflow-y-auto border-t border-gray-700 pt-4">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="bg-[#1f2937] text-gray-400">
                      <tr className="text-white">
                        <th className="px-2 py-1">Time</th>
                        <th className="px-2 py-1">Event Type</th>
                        <th className="px-2 py-1">Source IP</th>
                        <th className="px-2 py-1">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.logs.map(log => (
                        <tr key={log.id} className="hover:bg-[#2a2f3a]">
                          <td className="px-2 py-1">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="px-2 py-1">{log.event_type}</td>
                          <td className="px-2 py-1">{log.source_ip}</td>
                          <td className="px-2 py-1">{log.message || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center space-x-3">
                  <select
                    value={group.selectedAction}
                    onChange={(e) => {
                      const updated = groups.map(g =>
                        g.scenario_id === group.scenario_id
                          ? { ...g, selectedAction: e.target.value }
                          : g
                      );
                      setGroups(updated);
                    }}
                    className="bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="investigate">Investigate</option>
                    <option value="escalate">Escalate</option>
                    <option value="resolve">Dismiss</option>
                  </select>

                  <button
                    disabled={!group.selectedAction || submittingIds.has(group.scenario_id)}
                    onClick={() => handleLockIn(group)}
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border transition focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                      (!group.selectedAction || submittingIds.has(group.scenario_id))
                        ? 'bg-[#161b22] text-gray-500 border-gray-700 cursor-not-allowed'
                        : 'bg-[#21262d] hover:bg-[#30363d] text-gray-200 border-gray-600'
                    }`}
                  >
                    {submittingIds.has(group.scenario_id) ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}

      {showReportForm && selectedScenario && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <IncidentReportForm
            scenario={selectedScenario}
            submitting={submitting}
            onSubmit={async (formData) => {
              if (submitting) return;

              setSubmitting(true);
              try {
                const res = await fetch('http://localhost:5000/api/reports', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...formData,
                    scenario_id: selectedScenario.scenario_id,
                  }),
                });

                if (res.ok) {
                  toast.success("✅ Report submitted");
                  fetchGroupedAlerts();
                  fetchSubmittedReports();
                  setShowReportForm(false);
                  setSelectedScenario(null);
                } else {
                  toast.error("❌ Failed to submit report");
                }
              } catch (err) {
                console.error(err);
                toast.error("❌ Network error");
              } finally {
                setSubmitting(false);
              }
            }}
            onCancel={() => {
              setShowReportForm(false);
              setSelectedScenario(null);

              setGroups(prev =>
                prev.map(g =>
                  g.scenario_id === selectedScenario.scenario_id
                    ? { ...g, selectedAction: 'investigate' }
                    : g
                )
              );

              setSubmittingIds(prev => {
                const updated = new Set(prev);
                updated.delete(selectedScenario.scenario_id);
                return updated;
              });
            }}
          />
        </div>
      )}

      {lastUpdated && (
        <p className="text-sm text-gray-500 mt-6 text-center italic opacity-75">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default GroupedAlerts;
