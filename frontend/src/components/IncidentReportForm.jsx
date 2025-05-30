import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const IncidentReportForm = ({ initialData = {}, onSubmit, onCancel, submitting }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Medium',
    threat_category: '',
    affected_hosts: '',
    mitigation: '',
    status: 'In Progress',
    timestamp: new Date().toISOString(),
    id: '',
    scenario_id: '',
    correct_category: '',
    category_match: undefined
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        severity: initialData.severity || 'Medium',
        threat_category: initialData.threat_category || '',
        affected_hosts: initialData.affected_hosts || '',
        mitigation: initialData.mitigation || '',
        status: initialData.status || 'In Progress',
        timestamp: initialData.timestamp || new Date().toISOString(),
        id: initialData.id, // ✅ Now included
        scenario_id: initialData.scenario_id || '',
        correct_category: initialData.correct_category || '',
        category_match: initialData.category_match ?? undefined
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, maxLength } = e.target;

    if (maxLength && value.length > maxLength) {
      toast.warning(`Maximum ${maxLength} characters allowed for ${name}`);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (!formData.severity) newErrors.severity = "Severity is required.";
    if (!formData.threat_category) newErrors.threat_category = "Category is required.";
    if (!formData.status) newErrors.status = "Status is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="relative p-6 w-full max-w-2xl text-white bg-[#161b22] rounded-xl">
      <button
        onClick={onCancel}
        title="Close"
        className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
      >
        ✖
      </button>

      <h2 className="text-center text-2xl font-bold mb-4">Incident Report</h2>

      <div className="space-y-4 text-sm">
        <div>
          <label htmlFor="title" className="block mb-1">Title</label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            maxLength={80}
            className="w-full p-2.5 rounded bg-[#1a1f27] text-gray-100 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 focus:shadow-md"
          />
          {errors.title && <p className="text-red-400 text-sm">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={1000}
            className="w-full p-2.5 rounded bg-[#1a1f27] text-gray-100 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 focus:shadow-md"
          />
          {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
        </div>

        <div className="flex space-x-4">
          <div className="w-1/2">
            <label htmlFor="severity" className="block mb-1">Severity</label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full p-2.5 rounded bg-[#1a1f27] text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-150 focus:shadow-md"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
            {errors.severity && <p className="text-red-400 text-sm mt-1">{errors.severity}</p>}
          </div>

          <div className="w-1/2">
            <label htmlFor="threat_category" className="block mb-1">Category</label>
            <select
              id="threat_category"
              name="threat_category"
              value={formData.threat_category}
              onChange={handleChange}
              className="w-full p-2.5 rounded bg-[#1a1f27] text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-150 focus:shadow-md"
            >
              <option value="">Select Category</option>
              <option>Malware</option>
              <option>Phishing</option>
              <option>Lateral Movement</option>
              <option>Data Exfiltration</option>
              <option>Insider Threat</option>
              <option>Defense Evasion</option>
              <option>Brute Force</option>
              <option>Command & Control</option>
              <option>DDoS</option>
            </select>
            {errors.threat_category && (
              <p className="text-red-400 text-sm mt-1">{errors.threat_category}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="affected_hosts" className="block mb-1">Affected Hosts</label>
          <input
            id="affected_hosts"
            name="affected_hosts"
            value={formData.affected_hosts}
            onChange={handleChange}
            maxLength={200}
            placeholder="e.g. server01, 192.168.1.20"
            className="w-full p-2.5 rounded bg-[#1a1f27] text-gray-100 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 focus:shadow-md"
          />
        </div>

        <div>
          <label htmlFor="mitigation" className="block mb-1">Mitigation Steps</label>
          <textarea
            id="mitigation"
            name="mitigation"
            value={formData.mitigation}
            onChange={handleChange}
            maxLength={800}
            className="w-full p-2.5 rounded bg-[#1a1f27] text-gray-100 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 focus:shadow-md"
          />
        </div>

        <div>
          <label htmlFor="status" className="block mb-1">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2.5 rounded bg-[#1a1f27] text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-150 focus:shadow-md"
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>Escalated</option>
            <option>Resolved</option>
          </select>
          {errors.status && <p className="text-red-400 text-sm mt-1">{errors.status}</p>}
        </div>

        <p className="text-sm text-gray-400">
          Detected At:{' '}
          {new Date(formData.timestamp).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>

        <div className="flex justify-end space-x-4 pt-2">
          <button
            onClick={onCancel}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-[#21262d] hover:bg-[#30363d] text-gray-200 border border-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border transition focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              submitting
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-[#21262d] hover:bg-[#30363d] text-gray-200 border-gray-600'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentReportForm;
