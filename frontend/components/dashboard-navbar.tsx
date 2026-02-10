'use client';

import React, { useState } from 'react';
import { useAuth } from '../app/contexts/auth-context';
import { Button } from '@/components/button';
import Link from 'next/link';

const DashboardNavbar = () => {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LEFT: Logo + Home */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="6" width="24" height="20" rx="3" fill="white" fillOpacity="0.9" />
                <path d="M12 12H20M12 16H18M12 20H16" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 6V26" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <Link href="/dashboard">
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                Dashboard
              </span>
            </Link>

            {/* Home Button */}
            <Button
              variant="primary"
              size="md"
              className="ml-4 font-semibold"
              onClick={() => window.location.href = '/'}
            >
              Home
            </Button>
          </div>

          {/* CENTER: Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Overview
            </Link>
            <Link
              href="/dashboard/tasks"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Tasks
            </Link>
            <Link
              href="/dashboard/calendar"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Calendar
            </Link>
          </div>


          {/* RIGHT: Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">

            {/* Logout Button */}
            <Button variant="primary" size="md" onClick={logout}>
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-5 space-y-4">

            <Link href="/dashboard" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">Overview</Link>
            <Link href="/dashboard/tasks" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">Tasks</Link>
            <Link href="/dashboard/calendar" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">Calendar</Link>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">

              <Button variant="primary" size="md" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DashboardNavbar;