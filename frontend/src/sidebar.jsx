import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaShieldAlt, FaFileAlt, FaCog, FaChartBar } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4 text-xl font-bold border-b">SIEM Dashboard</div>
      <ul className="space-y-1 mt-2">
        <li>
          <Link
            to="/"
            className={`p-4 flex items-center hover:bg-gray-200 ${isActive('/') ? 'bg-gray-200 font-semibold' : ''}`}
          >
            <FaTachometerAlt className="mr-2" /> Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/analytics"
            className={`p-4 flex items-center hover:bg-gray-200 ${isActive('/analytics') ? 'bg-gray-200 font-semibold' : ''}`}
          >
            <FaChartBar className="mr-2" /> Analytics
          </Link>
        </li>
        <li>
          <Link
            to="/ioc"
            className="p-4 flex items-center hover:bg-gray-200"
          >
            <FaShieldAlt className="mr-2" /> IOC List
          </Link>
        </li>
        <li>
          <Link
            to="/reports"
            className="p-4 flex items-center hover:bg-gray-200"
          >
            <FaFileAlt className="mr-2" /> Reports
          </Link>
        </li>
        <li>
          <Link
            to="/settings"
            className="p-4 flex items-center hover:bg-gray-200"
          >
            <FaCog className="mr-2" /> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
