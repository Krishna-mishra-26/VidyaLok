'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, FileText, Users, Lock } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please read these terms carefully before using VidyaLok - AI Powered Smart Library System
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: January 8, 2025
          </p>
        </div>

        {/* Terms Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center" style={{color: '#1f2937'}}>
                <Shield className="h-6 w-6 text-blue-600 mr-3" />
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using VidyaLok, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center" style={{color: '#1f2937'}}>
                <Users className="h-6 w-6 text-blue-600 mr-3" />
                2. Use License
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of VidyaLok per device for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center" style={{color: '#1f2937'}}>
                <Lock className="h-6 w-6 text-blue-600 mr-3" />
                3. User Accounts
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times.
                You are responsible for safeguarding the password and for keeping your account information current.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You are fully responsible for all activities that occur under your account and any other actions taken in connection with the account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>4. Library Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                VidyaLok provides smart library management services including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Book search and borrowing system</li>
                <li>AI-powered recommendations</li>
                <li>Real-time seat availability tracking</li>
                <li>Digital library management tools</li>
                <li>Student entry and exit monitoring</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>5. Prohibited Uses</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may not use our service:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>For any unlawful purpose or to solicit others to engage in unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>6. Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                {"The information on this website is provided on an 'as is' basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms."}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>7. Limitations</h2>
              <p className="text-gray-700 leading-relaxed">
                {"In no event shall VidyaLok or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on VidyaLok's website."}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>8. Revisions and Errata</h2>
              <p className="text-gray-700 leading-relaxed">
                {"The materials appearing on VidyaLok's website could include technical, typographical, or photographic errors. VidyaLok does not warrant that any of the materials on its website are accurate, complete, or current."}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>9. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700"><strong>Email:</strong> support@vidyalok.edu</p>
                <p className="text-gray-700"><strong>Address:</strong> APSIT College, Thane, Maharashtra, India</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
