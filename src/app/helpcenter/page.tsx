'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, HelpCircle, Search, Book, Users, Settings, MessageCircle, Phone, Mail, Clock, CheckCircle, AlertTriangle, Info } from 'lucide-react'

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 w-full">
      {/* Header */}
      <div className="w-full px-6 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 group">
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-16">
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help articles, tutorials, or FAQs..."
                className="w-full pl-4 pr-12 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Find answers to your questions and get support for VidyaLok - AI Powered Smart Library Management System.
          </p>
          <div className="mt-6 inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">24/7 Support Available</span>
          </div>
        </div>

        {/* Help Categories */}
        <div className="w-full">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 overflow-hidden mx-4">
            
            {/* Categories Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <HelpCircle className="h-6 w-6 mr-3" />
                Browse Help Topics
              </h2>
              <p className="text-blue-100">Choose a category to find relevant help articles and guides</p>
            </div>

            <div className="p-8 md:p-12">
              
              {/* Help Categories Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                
                {/* Getting Started */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-200 p-3 rounded-xl group-hover:bg-blue-300 transition-colors">
                      <Book className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-800 ml-4">Getting Started</h3>
                  </div>
                  <p className="text-blue-700 mb-4">Learn the basics of using VidyaLok</p>
                  <ul className="space-y-2 text-blue-600">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
                      <span>How to create an account</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
                      <span>First-time login guide</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
                      <span>System requirements</span>
                    </li>
                  </ul>
                </div>

                {/* Book Management */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-l-4 border-green-500 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-200 p-3 rounded-xl group-hover:bg-green-300 transition-colors">
                      <Book className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-800 ml-4">Book Management</h3>
                  </div>
                  <p className="text-green-700 mb-4">Everything about borrowing and returning books</p>
                  <ul className="space-y-2 text-green-600">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>How to search for books</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>Borrowing process</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>Return procedures</span>
                    </li>
                  </ul>
                </div>

                {/* Account Settings */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-200 p-3 rounded-xl group-hover:bg-purple-300 transition-colors">
                      <Settings className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-purple-800 ml-4">Account Settings</h3>
                  </div>
                  <p className="text-purple-700 mb-4">Manage your profile and preferences</p>
                  <ul className="space-y-2 text-purple-600">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0 mt-1" />
                      <span>Update profile information</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0 mt-1" />
                      <span>Change password</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0 mt-1" />
                      <span>Notification settings</span>
                    </li>
                  </ul>
                </div>

                {/* AI Features */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border-l-4 border-indigo-500 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-200 p-3 rounded-xl group-hover:bg-indigo-300 transition-colors">
                      <MessageCircle className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-indigo-800 ml-4">AI Features</h3>
                  </div>
                  <p className="text-indigo-700 mb-4">Learn about AI-powered recommendations</p>
                  <ul className="space-y-2 text-indigo-600">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-1" />
                      <span>AI chatbot assistance</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-1" />
                      <span>Personalized recommendations</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-1" />
                      <span>Smart search features</span>
                    </li>
                  </ul>
                </div>

                {/* Library Services */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border-l-4 border-orange-500 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-200 p-3 rounded-xl group-hover:bg-orange-300 transition-colors">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-orange-800 ml-4">Library Services</h3>
                  </div>
                  <p className="text-orange-700 mb-4">Information about library facilities</p>
                  <ul className="space-y-2 text-orange-600">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-1" />
                      <span>Seat reservation system</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-1" />
                      <span>Library hours and policies</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-1" />
                      <span>Study room booking</span>
                    </li>
                  </ul>
                </div>

                {/* Troubleshooting */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border-l-4 border-red-500 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center mb-4">
                    <div className="bg-red-200 p-3 rounded-xl group-hover:bg-red-300 transition-colors">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-red-800 ml-4">Troubleshooting</h3>
                  </div>
                  <p className="text-red-700 mb-4">Solutions to common problems</p>
                  <ul className="space-y-2 text-red-600">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                      <span>Login issues</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                      <span>Browser compatibility</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                      <span>Technical errors</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* FAQ Section */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-8 text-center" style={{color: '#1f2937'}}>Frequently Asked Questions</h2>
                <div className="space-y-4">
                  
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <div className="flex items-start space-x-4">
                      <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-bold mb-2" style={{color: '#1f2937'}}>How do I reset my password?</h3>
                        <p className="text-gray-700">{`Click on "Forgot Password" on the login page and follow the instructions sent to your registered email address.`}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <div className="flex items-start space-x-4">
                      <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-bold mb-2" style={{color: '#1f2937'}}>What are the library operating hours?</h3>
                        <p className="text-gray-700">The library is open Monday to Friday from 8:00 AM to 8:00 PM, and Saturday from 9:00 AM to 5:00 PM. Closed on Sundays and public holidays.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <div className="flex items-start space-x-4">
                      <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-bold mb-2" style={{color: '#1f2937'}}>How long can I borrow books?</h3>
                        <p className="text-gray-700">Students can borrow books for up to 14 days with the option to renew once if no one else has reserved the book.</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Contact Support Section */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-3xl text-white">
                <h2 className="text-3xl font-bold mb-6 flex items-center" style={{color: '#ffffff'}}>
                  <HelpCircle className="h-8 w-8 mr-3" />
                  Still Need Help?
                </h2>
                <p className="text-blue-100 mb-6 text-lg">
                  Can&apos;t find what you&apos;re looking for? Our support team is here to help you 24/7.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur p-6 rounded-2xl">
                    <div className="flex items-center mb-3">
                      <Phone className="h-6 w-6 mr-3" />
                      <h3 className="font-bold text-xl" style={{color: '#ffffff'}}>Call Us</h3>
                    </div>
                    <p className="text-blue-100 mb-2">+91 (022) 1234-5678</p>
                    <div className="flex items-center text-sm text-blue-200">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>24/7 Available</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur p-6 rounded-2xl">
                    <div className="flex items-center mb-3">
                      <Mail className="h-6 w-6 mr-3" />
                      <h3 className="font-bold text-xl" style={{color: '#ffffff'}}>Email Support</h3>
                    </div>
                    <p className="text-blue-100 mb-2">support@vidyalok.edu</p>
                    <div className="flex items-center text-sm text-blue-200">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Response within 2 hours</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur p-6 rounded-2xl">
                    <div className="flex items-center mb-3">
                      <MessageCircle className="h-6 w-6 mr-3" />
                      <h3 className="font-bold text-xl" style={{color: '#ffffff'}}>Live Chat</h3>
                    </div>
                    <p className="text-blue-100 mb-2">Instant assistance</p>
                    <div className="flex items-center text-sm text-blue-200">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Available 9 AM - 6 PM</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
