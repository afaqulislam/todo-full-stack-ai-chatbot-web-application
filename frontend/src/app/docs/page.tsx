'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/src/components/button';

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState('chatbot');

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
                onClick={() => window.history.back()}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            Taskory Documentation
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive guide to using Taskory's features and AI-powered task management system
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveTab('chatbot')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'chatbot'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            AI Chatbot Guide
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Task Management
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'features'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Features
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {activeTab === 'chatbot' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-900">AI Chatbot Guide</h2>
                <p className="text-gray-600 mb-6">
                  Interact with Taskory's AI assistant using natural language to manage your tasks efficiently.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Getting Started</h3>
                <p className="text-gray-600 mb-4">
                  The AI assistant understands natural language commands to help you manage your tasks.
                  Simply type what you want to do in plain English.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Common Commands</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-2">Adding Tasks</h4>
                    <ul className="list-disc pl-5 space-y-1 text-blue-800">
                      <li>"Add a task to buy groceries"</li>
                      <li>"Create a task to complete project proposal"</li>
                      <li>"Add task: schedule meeting with team"</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h4 className="font-semibold text-green-900 mb-2">Listing Tasks</h4>
                    <ul className="list-disc pl-5 space-y-1 text-green-800">
                      <li>"Show my tasks"</li>
                      <li>"What do I have to do?"</li>
                      <li>"List all my tasks"</li>
                      <li>"Show me pending tasks"</li>
                      <li>"Show completed tasks"</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <h4 className="font-semibold text-purple-900 mb-2">Completing Tasks</h4>
                    <ul className="list-disc pl-5 space-y-1 text-purple-800">
                      <li>"Mark task 'buy groceries' as done"</li>
                      <li>"Complete task 1"</li>
                      <li>"Mark task number 3 as completed"</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <h4 className="font-semibold text-yellow-900 mb-2">Updating Tasks</h4>
                    <ul className="list-disc pl-5 space-y-1 text-yellow-800">
                      <li>"Change task 'buy groceries' to 'buy milk and eggs'"</li>
                      <li>"Update task 2 with new description"</li>
                      <li>"Change status of meeting task to in-progress"</li>
                      <li>"Set priority of project task to high"</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                    <h4 className="font-semibold text-red-900 mb-2">Deleting Tasks</h4>
                    <ul className="list-disc pl-5 space-y-1 text-red-800">
                      <li>"Delete task 'buy groceries'"</li>
                      <li>"Remove task 1"</li>
                      <li>"Delete completed tasks"</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Advanced Features</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h4 className="font-semibold text-indigo-900 mb-2">Task Priorities</h4>
                    <p className="text-indigo-800 mb-2">You can set priorities for your tasks:</p>
                    <ul className="list-disc pl-5 space-y-1 text-indigo-800">
                      <li>"Add task with high priority"</li>
                      <li>"Set priority of task 'project' to medium"</li>
                      <li>"Change priority of task 5 to low"</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                    <h4 className="font-semibold text-pink-900 mb-2">Task Statuses</h4>
                    <p className="text-pink-800 mb-2">Manage task statuses:</p>
                    <ul className="list-disc pl-5 space-y-1 text-pink-800">
                      <li>"Set status of task 1 to in-progress"</li>
                      <li>"Mark task 'meeting' as todo"</li>
                      <li>"Change task status to completed"</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Tips for Best Results</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Be specific with task names and descriptions</li>
                  <li>Use clear and natural language commands</li>
                  <li>Reference tasks by their number (e.g., "task 1") or name</li>
                  <li>Use status keywords like "todo", "in-progress", and "completed"</li>
                  <li>Use priority keywords like "low", "medium", and "high"</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Task Management</h2>
                <p className="text-gray-600 mb-6">
                  Learn how to effectively manage your tasks using Taskory's comprehensive task management system.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Creating Tasks</h3>
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 mb-4">
                    You can create tasks in multiple ways:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Use the AI chatbot with natural language commands</li>
                    <li>Use the task creation form in the dashboard</li>
                    <li>Import tasks from external sources</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Task Organization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-2">Priorities</h4>
                    <p className="text-blue-800">
                      Tasks can be assigned priorities: Low, Medium, or High. High priority tasks are highlighted and appear first in your list.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h4 className="font-semibold text-green-900 mb-2">Statuses</h4>
                    <p className="text-green-800">
                      Track task progress with statuses: Todo, In Progress, Completed. Tasks automatically update their status based on completion.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Managing Your Tasks</h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-2">•</span>
                    <span><strong>Editing:</strong> Update task details, priorities, or status by clicking on any task</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-2">•</span>
                    <span><strong>Filtering:</strong> Use the filter options to view tasks by status, priority, or date</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-2">•</span>
                    <span><strong>Searching:</strong> Find tasks quickly using the search functionality</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-2">•</span>
                    <span><strong>Archiving:</strong> Completed tasks can be archived to keep your active list clean</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Key Features</h2>
                <p className="text-gray-600 mb-6">
                  Discover the powerful features that make Taskory the best choice for task management.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <h3 className="text-xl font-semibold mb-3 text-blue-900">AI-Powered Assistant</h3>
                  <p className="text-blue-800">
                    Use natural language to manage your tasks with our intelligent AI assistant that understands context and intent.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <h3 className="text-xl font-semibold mb-3 text-green-900">Smart Prioritization</h3>
                  <p className="text-green-800">
                    Automatically organize tasks by priority with visual indicators to help you focus on what matters most.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                  <h3 className="text-xl font-semibold mb-3 text-purple-900">Real-time Sync</h3>
                  <p className="text-purple-800">
                    Stay updated across all devices with real-time synchronization and seamless multi-platform support.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-100">
                  <h3 className="text-xl font-semibold mb-3 text-orange-900">Secure & Private</h3>
                  <p className="text-orange-800">
                    Enterprise-grade security with end-to-end encryption to protect your data and maintain your privacy.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Advanced Capabilities</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Collaborative task management for teams</li>
                  <li>Customizable workflows and automation</li>
                  <li>Detailed analytics and progress tracking</li>
                  <li>Integration with popular productivity tools</li>
                  <li>Custom themes and personalization options</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="primary"
            size="lg"
            className="px-8 py-4 font-semibold"
          >
            <Link href="/chat">Try the AI Assistant</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-50 mt-20">
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