'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useAuth } from './contexts/auth-context';
import { Button } from '@/components/button';

export default function LandingPage() {
  const router = useRouter();
  const { authState } = useAuth();
  const isAuthenticated = authState === 'authenticated';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  const handleGoToDashboard = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="6" width="24" height="20" rx="3" fill="white" fillOpacity="0.9" />
                    <path d="M12 12H20M12 16H18M12 20H16" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 6V26" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">Taskory</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">How It Works</a>
              <a href="#benefits" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Benefits</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">

              <Button
                onClick={handleGetStarted}
                variant="primary"
                size="md"
                className="font-semibold"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-5 space-y-4">
              <a href="#features" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">Features</a>
              <a href="#how-it-works" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">How It Works</a>
              <a href="#benefits" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">Benefits</a>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">

                <Button
                  onClick={handleGoToDashboard}
                  variant="primary"
                  size="md"
                  fullWidth={false}
                  className="font-semibold"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-100">
            <span className="text-blue-600">✨ Productivity Redefined</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 hero-heading">
            Transform Your Productivity
          </h1>

          <p className="text-lg sm:text-xl hero-subheading mb-8 max-w-2xl mx-auto leading-relaxed">
            Taskory is a modern task management platform that helps you stay organized, focused, and productive. Built for professionals who demand excellence.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button
              onClick={handleGetStarted}
              variant="primary"
              size="lg"
              className="px-8 py-4 text-base font-semibold"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-base font-semibold"
            >
              <Link href="#features">
                View Demo
              </Link>
            </Button>
          </div>

          {/* Hero Image/Screenshot Placeholder */}
          <div className="relative max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white border border-gray-200 p-2 shadow-lg">

              <div className="aspect-image rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src="/dashboard-preview.png"
                  alt="Taskory Dashboard Preview"
                  width={1280}
                  height={720}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your tasks efficiently and stay productive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className={"group p-6 rounded-2xl bg-white border border-gray-200 hover:border-blue-500/50 border transition-all duration-300 hover:shadow-md hover:-translate-y-1"}>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className={"text-xl font-semibold mb-2 text-gray-900"}>Smart Task Management</h3>
              <p className={"text-gray-600"}>
                Intuitive task organization with priorities, due dates, and smart filtering to keep you focused on what matters most.
              </p>
            </div>

            <div className={"group p-6 rounded-2xl bg-white border border-gray-200 hover:border-blue-500/50 border transition-all duration-300 hover:shadow-md hover:-translate-y-1"}>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={"text-xl font-semibold mb-2 text-gray-900"}>Progress Tracking</h3>
              <p className={"text-gray-600"}>
                Visual progress indicators and analytics to help you track your productivity and celebrate your achievements.
              </p>
            </div>

            <div className={"group p-6 rounded-2xl bg-white border border-gray-200 hover:border-blue-500/50 border transition-all duration-300 hover:shadow-md hover:-translate-y-1"}>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className={"text-xl font-semibold mb-2 text-gray-900"}>Secure & Private</h3>
              <p className={"text-gray-600"}>
                Enterprise-grade security with end-to-end encryption to protect your data and maintain your privacy.
              </p>
            </div>

            <div className={"group p-6 rounded-2xl bg-white border border-gray-200 hover:border-blue-500/50 border transition-all duration-300 hover:shadow-md hover:-translate-y-1"}>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className={"text-xl font-semibold mb-2 text-gray-900"}>Lightning Fast</h3>
              <p className={"text-gray-600"}>
                Optimized for speed with instant loading times and smooth interactions that keep up with your workflow.
              </p>
            </div>

            <div className={"group p-6 rounded-2xl bg-white border border-gray-200 hover:border-blue-500/50 border transition-all duration-300 hover:shadow-md hover:-translate-y-1"}>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h3 className={"text-xl font-semibold mb-2 text-gray-900"}>Cross-Platform Sync</h3>
              <p className={"text-gray-600"}>
                Seamless synchronization across all your devices with real-time updates and offline capability.
              </p>
            </div>

            <div className={"group p-6 rounded-2xl bg-white border border-gray-200 hover:border-blue-500/50 border transition-all duration-300 hover:shadow-md hover:-translate-y-1"}>
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className={"text-xl font-semibold mb-2 text-gray-900"}>Collaboration Ready</h3>
              <p className={"text-gray-600"}>
                Share tasks, assign responsibilities, and collaborate with your team in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={"py-20 px-4 bg-white"}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Get Started in Minutes
            </h2>
            <p className={"text-lg text-gray-600 max-w-2xl mx-auto"}>
              Simple setup process that gets you productive right away
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Sign Up & Customize</h3>
                  <p className="text-gray-600">
                    Create your account and personalize your workspace to match your workflow preferences.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center font-bold text-white text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Add Your Tasks</h3>
                  <p className="text-gray-600">
                    Start adding your tasks with priorities, due dates, and categories to organize your work.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center font-bold text-white text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Stay Productive</h3>
                  <p className="text-gray-600">
                    Use smart features like progress tracking, reminders, and collaboration tools to boost productivity.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Quick Overview</h3>
                <span className="text-sm text-gray-600">Today</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <div className="w-4 h-4 rounded border border-gray-300 mr-3"></div>
                  <span className="flex-1 text-gray-800">Complete project proposal</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">High</span>
                </div>

                <div className="flex items-center p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <div className="w-4 h-4 rounded border border-gray-300 mr-3"></div>
                  <span className="flex-1 text-gray-800 line-through">Buy groceries</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Done</span>
                </div>

                <div className="flex items-center p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <div className="w-4 h-4 rounded border border-gray-300 mr-3"></div>
                  <span className="flex-1 text-gray-800">Schedule team meeting</span>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Medium</span>
                </div>

                <div className="flex items-center p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <div className="w-4 h-4 rounded border border-gray-300 mr-3"></div>
                  <span className="flex-1 text-gray-800">Prepare presentation</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Why Choose Taskory?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mt-1 bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Blazing Fast Performance</h3>
                <p className="text-gray-600">
                  Optimized for speed with instant loading and smooth interactions that keep up with your workflow.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mt-1 bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Enterprise Security</h3>
                <p className="text-gray-600">
                  Military-grade encryption and security measures to protect your sensitive data and privacy.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mt-1 bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Intuitive Design</h3>
                <p className="text-gray-600">
                  Thoughtfully crafted interface that keeps you focused on your work without distractions.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mt-1 bg-orange-100 text-orange-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Universal Access</h3>
                <p className="text-gray-600">
                  Access your tasks from any device with seamless synchronization across platforms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Productivity?
          </h2>

          <p className="text-xl !text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have streamlined their workflow with Taskory
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={handleGetStarted}
              variant="primary"
              size="lg"
              className="px-8 py-4 text-base font-semibold bg-white text-blue-600 hover:bg-gray-100"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-base font-semibold border-white text-white hover:bg-white/10"
            >
              <Link href="#features">
                View Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="6" width="24" height="20" rx="3" fill="white" fillOpacity="0.9" />
                    <path d="M12 12H20M12 16H18M12 20H16" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 6V26" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-900">Taskory</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                The modern task management platform for professionals who demand excellence.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com/afaqulislam" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.000 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://linkedin.com/in/afaqulislam" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://twitter.com/afaqulislam708" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Support</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-gray-600 text-center">
            <p>&copy; {new Date().getFullYear()} Taskory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}