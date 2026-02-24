'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/auth-context';
import { Button } from '@/src/components/button';

export default function ChatPage() {
  const [showInstructions, setShowInstructions] = useState(true);
  const router = useRouter();
  const { authState } = useAuth();
  const isAuthenticated = authState === 'authenticated';

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm">
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

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="md"
                className="font-medium"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                {showInstructions ? 'Hide Guide' : 'Show Guide'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            About the AI Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Learn about Taskory's AI-powered assistant and how to use it to manage your tasks with natural language commands.
          </p>
        </div>

        {/* Instructions Panel */}
        {showInstructions && (
          <div className="mb-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">How to Use the AI Assistant</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstructions(false)}
              >
                ×
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-2">Adding Tasks</h3>
                <ul className="list-disc pl-5 text-blue-800 space-y-1">
                  <li>"Add a task to buy groceries"</li>
                  <li>"Create a task for project deadline"</li>
                  <li>"Add task with high priority: finish report"</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-semibold text-green-900 mb-2">Managing Tasks</h3>
                <ul className="list-disc pl-5 text-green-800 space-y-1">
                  <li>"Show my tasks" or "What do I have to do?"</li>
                  <li>"Mark task 'buy groceries' as done"</li>
                  <li>"Complete task 1"</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h3 className="font-semibold text-purple-900 mb-2">Updating Tasks</h3>
                <ul className="list-disc pl-5 text-purple-800 space-y-1">
                  <li>"Change task 'buy groceries' to 'buy milk and eggs'"</li>
                  <li>"Set priority of project task to high"</li>
                  <li>"Change status to in-progress"</li>
                </ul>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <h3 className="font-semibold text-red-900 mb-2">Deleting Tasks</h3>
                <ul className="list-disc pl-5 text-red-800 space-y-1">
                  <li>"Delete task 'old task'"</li>
                  <li>"Remove task 1"</li>
                  <li>"Delete completed tasks"</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              AI Taskory Assistant
            </h2>

            <p className="text-gray-600 mb-4 text-sm">
              Available on your dashboard to help manage tasks with natural language commands.
            </p>

            <div className="flex justify-center">
              <Button
                onClick={handleGetStarted}
                variant="primary"
                size="md"
                className="px-6 py-2 font-semibold"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Need more help? Check out our <Link href="/docs" className="text-blue-600 hover:underline">complete documentation</Link>.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-50 mt-12">
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
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#benefits" className="hover:text-blue-600 transition-colors">Benefits</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a></li>
                <li><a href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="/about" className="hover:text-blue-600 transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-blue-600 transition-colors">Blog</a></li>
                <li><a href="/contact" className="hover:text-blue-600 transition-colors">Contact</a></li>
                <li><a href="/support" className="hover:text-blue-600 transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Resources</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="/docs" className="hover:text-blue-600 transition-colors">Documentation</a></li>
                <li><a href="/docs" className="hover:text-blue-600 transition-colors">AI Chatbot Guide</a></li>
                <li><a href="/docs" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="/api" className="hover:text-blue-600 transition-colors">API Documentation</a></li>
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