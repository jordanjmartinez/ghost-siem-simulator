import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#0d1117] text-white px-6 py-4 shadow-md flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <span className="text-xl font-mono tracking-widest">G.H.O.S.T.</span>
      </div>
    </nav>
  );
};

export default Navbar;