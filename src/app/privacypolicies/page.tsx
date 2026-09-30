'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Lock, Database, Users, Bell } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors duration-200">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-100 p-4 rounded-full">
              <Shield className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how VidyaLok collects, uses, and protects your information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: January 8, 2025
          </p>
        </div>

        {/* Privacy Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center" style={{color: '#1f2937'}}>
                <Eye className="h-6 w-6 text-purple-600 mr-3" />
                1. Information We Collect
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
              </p>
              
              {/* Side by Side Information Collection */}
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Personal Information */}
                <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-500">
                  <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Personal Information:
                  </h3>
                  <ul className="space-y-3 text-blue-700">
                    <li className="flex items-start space-x-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Student ID and enrollment details</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Name and contact information</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Email address and phone number</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Academic information and course details</span>
                    </li>
                  </ul>
                </div>

                {/* Usage Information */}
                <div className="bg-purple-50 p-6 rounded-2xl border-l-4 border-purple-500">
                  <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Usage Information:
                  </h3>
                  <ul className="space-y-3 text-purple-700">
                    <li className="flex items-start space-x-2">
                      <div className="h-2 w-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Library visit logs and timestamps</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="h-2 w-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Book borrowing and return history</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="h-2 w-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Search queries and preferences</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="h-2 w-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Device and browser information</span>
                    </li>
                  </ul>
                </div>

              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center" style={{color: '#1f2937'}}>
                <Database className="h-6 w-6 text-purple-600 mr-3" />
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the information we collect to provide, maintain, and improve our services:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Manage your library account and borrowing privileges</li>
                <li>Provide personalized book recommendations using AI</li>
                <li>Track library usage and seat availability</li>
                <li>Send notifications about due dates and library updates</li>
                <li>Improve our services and develop new features</li>
                <li>Ensure security and prevent fraudulent activities</li>
                <li>Comply with legal requirements and institutional policies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center" style={{color: '#1f2937'}}>
                <Users className="h-6 w-6 text-purple-600 mr-3" />
                3. Information Sharing
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described below:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Educational Institution:</strong> We may share information with APSIT College for academic and administrative purposes</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our platform (under strict confidentiality agreements)</li>
                <li><strong>Emergency Situations:</strong> To protect the health, safety, or rights of users or others</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center" style={{color: '#1f2937'}}>
                <Lock className="h-6 w-6 text-purple-600 mr-3" />
                4. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement robust security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication protocols</li>
                <li>Secure data centers with 24/7 monitoring</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>5. Your Rights and Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of the personal information we have about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                <li><strong>Opt-out:</strong> Unsubscribe from promotional communications</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center" style={{color: '#1f2937'}}>
                <Bell className="h-6 w-6 text-purple-600 mr-3" />
                6. Cookies and Tracking
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our services</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Performance Cookies:</strong> Improve website speed and performance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. 
                Student records are typically retained according to institutional policies and regulatory requirements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>8. Children&apos;s Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                VidyaLok is designed for use by college students and staff. We do not knowingly collect personal information 
                from children under 16 years of age without appropriate consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>9. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
                the new policy on this page and updating the {`"Last updated"`} date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>10. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-purple-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700"><strong>Email:</strong> privacy@vidyalok.edu</p>
                <p className="text-gray-700"><strong>Phone:</strong> +91 (022) 1234-5678</p>
                <p className="text-gray-700"><strong>Address:</strong> APSIT College, Thane, Maharashtra, India</p>
                <p className="text-gray-700"><strong>Data Protection Officer:</strong> dpo@vidyalok.edu</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
