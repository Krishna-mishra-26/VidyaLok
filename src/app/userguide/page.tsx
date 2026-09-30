'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Play, CheckCircle, Users, Search, Calendar, Bell, Settings, Video } from 'lucide-react'

export default function UserGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 w-full">
      {/* Header */}
      <div className="w-full px-6 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors duration-200 group">
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            User Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Complete step-by-step guide to help you make the most of VidyaLok - AI Powered Smart Library Management System.
          </p>
          <div className="mt-6 inline-flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
            <BookOpen className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-purple-700 font-medium">Updated: August 9, 2025</span>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="w-full">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 overflow-hidden mx-4">
            
            {/* Quick Start Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Play className="h-6 w-6 mr-3" />
                Quick Start Guide
              </h2>
              <p className="text-purple-100">Get started with VidyaLok in just a few simple steps</p>
            </div>

            <div className="p-8 md:p-12 space-y-12">
              
              {/* Getting Started Steps */}
              <section>
                <h2 className="text-3xl font-bold mb-8 text-center" style={{color: '#1f2937'}}>Getting Started</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl text-center border-l-4 border-blue-500">
                    <div className="bg-blue-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-blue-600">1</span>
                    </div>
                    <h3 className="text-lg font-bold text-blue-800 mb-2">Create Account</h3>
                    <p className="text-blue-700 text-sm">Sign up with your student ID and institutional email</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl text-center border-l-4 border-green-500">
                    <div className="bg-green-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-green-600">2</span>
                    </div>
                    <h3 className="text-lg font-bold text-green-800 mb-2">Verify Identity</h3>
                    <p className="text-green-700 text-sm">Complete verification through college database</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center border-l-4 border-purple-500">
                    <div className="bg-purple-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-purple-600">3</span>
                    </div>
                    <h3 className="text-lg font-bold text-purple-800 mb-2">Set Preferences</h3>
                    <p className="text-purple-700 text-sm">Customize your profile and notification settings</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl text-center border-l-4 border-orange-500">
                    <div className="bg-orange-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-orange-600">4</span>
                    </div>
                    <h3 className="text-lg font-bold text-orange-800 mb-2">Start Using</h3>
                    <p className="text-orange-700 text-sm">Begin browsing, borrowing, and enjoying library services</p>
                  </div>

                </div>
              </section>

              {/* Main Features Guide */}
              <section>
                <h2 className="text-3xl font-bold mb-8 text-center" style={{color: '#1f2937'}}>Main Features</h2>
                
                {/* Book Search & Borrowing */}
                <div className="mb-10">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Search className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{color: '#1f2937'}}>Book Search & Borrowing</h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-2xl">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-blue-800 mb-3">How to Search for Books:</h4>
                        <ul className="space-y-2 text-blue-700">
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                            <span>Use the search bar on the main dashboard</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                            <span>Filter by category, author, or subject</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                            <span>Use AI-powered recommendations</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                            <span>Check real-time availability</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-800 mb-3">Borrowing Process:</h4>
                        <ul className="space-y-2 text-blue-700">
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                            <span>{'Click "Borrow" on desired book'}</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                            <span>Confirm borrowing period (up to 14 days)</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                            <span>Visit library to collect the book</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                            <span>Return within due date to avoid fines</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seat Reservation */}
                <div className="mb-10">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{color: '#1f2937'}}>Seat Reservation System</h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded"></div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-2xl">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-green-800 mb-3">Booking a Seat:</h4>
                        <ul className="space-y-2 text-green-700">
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                            <span>{'Go to "Seat Reservation" section'}</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                            <span>View real-time seat availability</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                            <span>Select preferred time slot</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                            <span>Confirm booking and receive notification</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-green-800 mb-3">Seat Rules:</h4>
                        <ul className="space-y-2 text-green-700">
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                            <span>Maximum 4 hours per booking</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                            <span>Must check-in within 15 minutes</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                            <span>Can extend if seats are available</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                            <span>Cancel at least 30 minutes before</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Assistant */}
                <div className="mb-10">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{color: '#1f2937'}}>AI Library Assistant</h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-2xl">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-purple-800 mb-3">What AI Can Help With:</h4>
                        <ul className="space-y-2 text-purple-700">
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-1" />
                            <span>Book recommendations based on your interests</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-1" />
                            <span>Quick answers to library policies</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-1" />
                            <span>Research assistance and citations</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-1" />
                            <span>Study tips and academic resources</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-purple-800 mb-3">How to Use AI Chat:</h4>
                        <ul className="space-y-2 text-purple-700">
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-1" />
                            <span>Click the chat icon in bottom right</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-1" />
                            <span>Type your question in natural language</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-1" />
                            <span>Get instant responses and suggestions</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-1" />
                            <span>Access chat history for reference</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

              </section>

              {/* Account Management */}
              <section>
                <h2 className="text-3xl font-bold mb-8 text-center" style={{color: '#1f2937'}}>Account Management</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  
                  {/* Profile Settings */}
                  <div className="bg-indigo-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                    <div className="flex items-center mb-4">
                      <Settings className="h-6 w-6 text-indigo-600 mr-3" />
                      <h3 className="text-xl font-bold text-indigo-800" style={{color: '#1f2937'}}>Profile Settings</h3>
                    </div>
                    <ul className="space-y-3 text-indigo-700">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-1" />
                        <span>Update personal information</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-1" />
                        <span>Change profile picture</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-1" />
                        <span>Manage academic details</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-1" />
                        <span>Update contact information</span>
                      </li>
                    </ul>
                  </div>

                  {/* Notifications */}
                  <div className="bg-orange-50 p-6 rounded-2xl border-l-4 border-orange-500">
                    <div className="flex items-center mb-4">
                      <Bell className="h-6 w-6 text-orange-600 mr-3" />
                      <h3 className="text-xl font-bold text-orange-800" style={{color: '#1f2937'}}>Notification Settings</h3>
                    </div>
                    <ul className="space-y-3 text-orange-700">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-1" />
                        <span>Due date reminders</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-1" />
                        <span>New book alerts</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-1" />
                        <span>Seat booking confirmations</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-1" />
                        <span>Library announcements</span>
                      </li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* Video Tutorials Section */}
              <section className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-3xl text-white">
                <h2 className="text-3xl font-bold mb-6 flex items-center" style={{color: '#ffffff'}}>
                  <Video className="h-8 w-8 mr-3" />
                  Video Tutorials
                </h2>
                <p className="text-purple-100 mb-6 text-lg">
                  Watch step-by-step video guides to master VidyaLok features quickly
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur p-6 rounded-2xl">
                    <div className="flex items-center mb-3">
                      <Play className="h-6 w-6 mr-3" />
                      <h3 className="font-bold text-xl" style={{color: '#ffffff'}}>Getting Started</h3>
                    </div>
                    <p className="text-purple-100 mb-4">Complete walkthrough for new users</p>
                    <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                      Watch Now (5 min)
                    </button>
                  </div>
                  <div className="bg-white/10 backdrop-blur p-6 rounded-2xl">
                    <div className="flex items-center mb-3">
                      <Play className="h-6 w-6 mr-3" />
                      <h3 className="font-bold text-xl" style={{color: '#ffffff'}}>Book Management</h3>
                    </div>
                    <p className="text-purple-100 mb-4">Learn to search, borrow, and manage books</p>
                    <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                      Watch Now (8 min)
                    </button>
                  </div>
                  <div className="bg-white/10 backdrop-blur p-6 rounded-2xl">
                    <div className="flex items-center mb-3">
                      <Play className="h-6 w-6 mr-3" />
                      <h3 className="font-bold text-xl" style={{color: '#ffffff'}}>AI Features</h3>
                    </div>
                    <p className="text-purple-100 mb-4">Maximize AI assistant capabilities</p>
                    <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                      Watch Now (6 min)
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
