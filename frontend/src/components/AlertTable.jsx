import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const AlertTable = ({ setAlertCount, resetTrigger }) => {
  const [alerts, setAlerts] = useState([]);
  const [previousIds, setPreviousIds] = useState(new Set());
  const [newlyInsertedIds, setNewlyInsertedIds] = useState(new Set());
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [alertsPerPage, setAlertsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  const fetchAlerts = () => {
    fetch('http://localhost:5000/api/fake-events')
      .then(res => res.json())
      .then(data => {
        const reversed = [...data].reverse();
        const newIds = new Set();
        const newEntries = new Set();

        reversed.forEach(alert => {
          newIds.add(alert.id);
          if (!previousIds.has(alert.id)) {
            newEntries.add(alert.id);
          }
        });

        setPreviousIds(newIds);
        setNewlyInsertedIds(newEntries);
        setAlerts(reversed);
        setLastUpdated(new Date());
      })
      .catch(err => console.error('Error fetching fake events:', err));
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAlerts();
    setCurrentPage(1);
  }, [resetTrigger]);

  const filteredAlerts = alerts.filter(alert =>
    JSON.stringify(alert).toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (setAlertCount) {
      setAlertCount(filteredAlerts.length);
    }
  }, [filteredAlerts, setAlertCount]);

  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);
  const indexOfLast = currentPage * alertsPerPage;
  const indexOfFirst = indexOfLast - alertsPerPage;
  const currentAlerts = filteredAlerts.slice(indexOfFirst, indexOfLast);

  const changePage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const handlePageSizeChange = (e) => {
    setAlertsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-300 text-black">$1</mark>');
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const visibleRange = 3;
    const start = Math.max(2, currentPage - visibleRange);
    const end = Math.min(totalPages - 1, currentPage + visibleRange);

    buttons.push(
      <button key={1} onClick={() => changePage(1)} className={`px-2 py-1 rounded ${currentPage === 1 ? 'bg-blue-600 font-bold' : 'bg-gray-700 hover:bg-gray-600'}`}>
        1
      </button>
    );

    if (start > 2) buttons.push(<span key="start-ellipsis" className="px-2">...</span>);

    for (let i = start; i <= end; i++) {
      buttons.push(
        <button key={i} onClick={() => changePage(i)} className={`px-2 py-1 rounded ${currentPage === i ? 'bg-blue-600 font-bold' : 'bg-gray-700 hover:bg-gray-600'}`}>
          {i}
        </button>
      );
    }

    if (end < totalPages - 1) buttons.push(<span key="end-ellipsis" className="px-2">...</span>);

    if (totalPages > 1) {
      buttons.push(
        <button key={totalPages} onClick={() => changePage(totalPages)} className={`px-2 py-1 rounded ${currentPage === totalPages ? 'bg-blue-600 font-bold' : 'bg-gray-700 hover:bg-gray-600'}`}>
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  const noAlertsLoaded = alerts.length === 0;
  const noSearchResults = !noAlertsLoaded && filteredAlerts.length === 0;

  return (
    <div className="bg-[#161b22] p-6 rounded-xl relative shadow-none">
      {!noAlertsLoaded && (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Filter your logs"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              maxLength={300}
              className="w-full p-2 rounded bg-[#0d1117] border border-gray-600 text-white overflow-x-auto truncate"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <div className="flex space-x-2 text-white text-sm mb-2 sm:mb-0">
              <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50">Prev</button>
              {renderPaginationButtons()}
              <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50">Next</button>
            </div>
            <div className="text-sm text-white">
              <label htmlFor="pageSize" className="mr-2">Rows per page:</label>
              <select id="pageSize" value={alertsPerPage} onChange={handlePageSizeChange} className="bg-gray-700 text-white px-2 py-1 rounded">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </>
      )}

      {noAlertsLoaded ? (
        <div className="text-sm text-gray-400 py-12 text-center">
          <div className="flex flex-col items-center justify-center mt-6 relative">
            <div className="relative bg-gray-800 text-white text-sm px-4 py-3 rounded-xl tracking-wide shadow-lg mb-3 font-mono
              before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2
              before:border-8 before:border-transparent before:border-t-gray-800">
              👻 Hi i'm Ghost! To get started, click on “Simulate Events”
            </div>
            <img src="/ghost-mascot.png" alt="GHOST Mascot" className="w-32 h-32 mb-2 opacity-90" />
            <p className="text-gray-400 text-center text-base mt-1">No alerts to display.</p>
          </div>
        </div>
      ) : noSearchResults ? (
        <div className="text-center text-gray-400 py-12">
          <img src="/ghost-searching.png" alt="Searching Ghost" className="w-32 h-32 mx-auto mb-3 opacity-80" />
          <p className="text-base italic max-w-[90%] truncate mx-auto">
            No matching logs for "<span className="font-mono">{searchTerm}</span>"
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-[#1f2937] text-white">
              <tr>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Event</th>
              </tr>
            </thead>
            <tbody>
              {currentAlerts.map((alert) => {
                const filteredAlert = Object.fromEntries(
                  Object.entries(alert).filter(
                    ([key]) => !["label", "category", "scenario_id", "id", "threat_pattern"].includes(key)
                  )
                );

                return (
                  <React.Fragment key={alert.id}>
                    <tr className="border-b border-gray-700 hover:bg-[#1f2937]">
                      <td className="px-4 py-2">
                        {alert.timestamp ? (
                          <>
                            {new Date(alert.timestamp).toLocaleDateString('en-GB')}
                            <br />
                            {new Date(alert.timestamp).toLocaleTimeString('en-GB', {
                              hour12: false,
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              fractionalSecondDigits: 3
                            })}
                          </>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2 text-sm font-semibold flex justify-between items-center">
                        <span>{alert.event_type} — {alert.message?.slice(0, 60) || '[Expand for details]'}</span>
                        <button
                          onClick={() => toggleRow(alert.id)}
                          className="ml-4 text-xl text-gray-400 hover:text-white focus:outline-none"
                        >
                          {expandedRows[alert.id] ? '−' : '+'}
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedRows[alert.id] ? 'max-h-[1000px] opacity-100 py-2' : 'max-h-0 opacity-0'}`}>
                          <pre className="text-xs whitespace-pre-wrap break-words px-4 text-white">
                            <code
                              dangerouslySetInnerHTML={{
                                __html: highlightMatch(JSON.stringify(filteredAlert, null, 2), searchTerm)
                              }}
                            />
                          </pre>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {lastUpdated && (
        <p className="text-sm text-gray-500 mt-4 text-center italic opacity-75">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default AlertTable;
