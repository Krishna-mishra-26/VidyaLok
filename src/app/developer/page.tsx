'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, Github, Linkedin, Mail, Download, Award, Code, Users, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function DeveloperPage() {
  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: "Krishna Mishra",
      role: "Full-Stack Developer",
      description: "Full-Stack Developer specializing in React, Next.js, and modern web technologies. Leading the VidyaLok project with passion for innovative library management solutions.",
      image: "https://krishna-mishra-26.github.io/Mishrajii/Krishna%20Mishra%20LinkedIn%20Profile%20Picture.jpg", // You'll add this image
      linkedin: "https://www.linkedin.com/in/krishna--mishra/",
      resume: "https://drive.google.com/file/d/1hRXU-fNwLWIR02j8gyrp3cLi8nXpwa6O/view?usp=sharing",
      github: "https://github.com/Krishna-mishra-26", 
      email: "Krishnamishrajii26@gmail.com", 
      skills: ["React", "Next.js", "TypeScript", "Node.js", "Python", "MongoDB", "Data Structures", "AI/ML", "DL", "NLP", "Algorithms"],
      isLeader: true
    },
    {
      id: 2,
      name: "Ayush Gondhali",
      role: "Frontend Developer",
      description: "Passionate about creating beautiful and intuitive user interfaces. Specializes in modern CSS frameworks and responsive design.",
      image: "/images/member2.jpg", // Placeholder - you can add real images later
      linkedin: "#",
      github: "#",
      email: "member2@example.com",
      skills: ["React", "CSS", "JavaScript", "Tailwind CSS", "Figma"],
      isLeader: false
    },
    {
      id: 3,
      name: "Tanuj Kokamkar",
      role: "Backend Developer",
      description: "Expert in server-side development and database management. Focuses on building scalable and efficient backend systems.",
      image: "/images/member3.jpg", // Placeholder
      linkedin: "#",
      github: "#",
      email: "member3@example.com",
      skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "AWS"],
      isLeader: false
    },
    {
      id: 4,
      name: "Harsh Jain",
      role: "UI/UX Designer & Developer",
      description: "Creative designer with development skills. Bridges the gap between design and functionality to create exceptional user experiences.",
      image: "/images/member4.jpg", // Placeholder
      linkedin: "#",
      github: "#",
      email: "member4@example.com",
      skills: ["Figma", "Adobe XD", "JavaScript", "CSS", "User Research"],
      isLeader: false
    }
  ]

  const projectStats = [
    { label: "Students Served", value: "2,500+", icon: Users, description: "Active library users" },
    { label: "Books Managed", value: "15,000+", icon: Code, description: "Digital catalog system" },
    { label: "AI Recommendations", value: "10,000+", icon: Star, description: "Personalized suggestions" },
    { label: "Response Time", value: "<0.5s", icon: ExternalLink, description: "Lightning fast queries" },
    { label: "Uptime Achieved", value: "99.9%", icon: Award, description: "Enterprise reliability" },
    { label: "Data Protected", value: "100%", icon: Github, description: "Zero breaches" },
    { label: "Smart Alerts", value: "50+", icon: Mail, description: "Automated notifications" },
    { label: "User Satisfaction", value: "96%", icon: Star, description: "Positive feedback" }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-emerald-600/5"></div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-400/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-emerald-400/10 rounded-full animate-pulse delay-1000"></div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>

          {/* Page Header */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
              Meet Our Team
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
              The passionate developers behind VidyaLok - AI Powered Smart Library System
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>

          {/* Project Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {projectStats.map((stat, index) => (
              <div key={index} className="group relative">
                {/* Always Visible Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-emerald-500/5 rounded-2xl blur-sm group-hover:from-blue-500/15 group-hover:via-purple-500/15 group-hover:to-emerald-500/15 transition-all duration-500"></div>
                
                {/* Main Card */}
                <div className="relative bg-white/95 backdrop-blur-lg border border-white/60 rounded-2xl p-5 text-center shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  
                  {/* Icon with Default Background */}
                  <div className="relative mx-auto mb-3 w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-purple-500/30 to-emerald-500/30 rounded-full group-hover:from-blue-400/50 group-hover:via-purple-500/50 group-hover:to-emerald-500/50 transition-all duration-300"></div>
                    <stat.icon className="relative z-10 h-6 w-6 text-blue-600 group-hover:text-purple-600 transition-colors duration-300" />
                  </div>
                  
                  {/* Main Value */}
                  <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  
                  {/* Primary Label */}
                  <div className="text-base font-semibold text-gray-800 mb-1">
                    {stat.label}
                  </div>
                  
                  {/* Description */}
                  <div className="text-sm text-gray-600 opacity-80">
                    {stat.description}
                  </div>
                  
                  {/* Always Visible Progress Bar */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full group-hover:w-3/4 transition-all duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={member.id} className={`overflow-hidden hover:shadow-xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm ${member.isLeader ? 'ring-2 ring-yellow-400 shadow-lg' : ''}`}>
                {member.isLeader && (
                  <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white text-center py-3 font-bold text-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    <div className="relative z-10 flex items-center justify-center space-x-2">
                      <span className="text-yellow-300 animate-bounce">⭐</span>
                      <span className="tracking-wider">TEAM LEAD</span>
                      <span className="text-yellow-300 animate-bounce" style={{animationDelay: '0.2s'}}>⭐</span>
                    </div>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className={`grid gap-8 ${index % 2 === 0 ? 'md:grid-cols-[300px_1fr]' : 'md:grid-cols-[1fr_300px]'}`}>
                    {/* Profile Image */}
                    <div className={`${index % 2 === 0 ? 'order-1' : 'order-2'}`}>
                      <div className="relative group">
                        <div className="relative w-full h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                          {member.image && member.image !== "/images/member2.jpg" && member.image !== "/images/member3.jpg" && member.image !== "/images/member4.jpg" ? (
                            <Image
                              src={member.image}
                              alt={member.name}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 300px"
                              style={{ filter: 'contrast(1.1) saturate(1.2)' }}
                            />
                          ) : (
                            <div className="text-6xl text-gray-400">👤</div>
                          )}
                        </div>
                        {/* Academic Qualification */}
                        <div className="mt-4 text-center">
                          <p className="text-lg font-semibold bg-blue-50 px-4 py-2 rounded-lg border border-blue-200" style={{color: '#2563eb !important', WebkitTextFillColor: '#2563eb'}}>
                            BE CSE(AI & ML)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className={`space-y-6 ${index % 2 === 0 ? 'order-2' : 'order-1'}`}>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">{member.name}</h3>
                        <p className="text-xl text-blue-600 font-semibold mb-4">{member.role}</p>
                        <p className="text-gray-700 leading-relaxed mb-6">{member.description}</p>
                      </div>

                      {/* Skills */}
                      <div>
                        <h4 className="text-lg font-bold mb-4 border-b pb-2" style={{color: '#2563eb !important', borderBottomColor: '#93c5fd'}}>Technical Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {member.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-shadow duration-300 inline-block">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Contact Links */}
                      <div>
                        <h4 className="text-lg font-bold mb-4 border-b pb-2" style={{color: '#9333ea !important', borderBottomColor: '#c4b5fd'}}>Contacts</h4>
                        <div className="flex flex-wrap gap-3">
                          {member.linkedin !== "#" && (
                          <a 
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
                          >
                            <Linkedin className="h-4 w-4" />
                            <span>LinkedIn</span>
                          </a>
                        )}
                        {member.resume && (
                          <a 
                            href={member.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
                          >
                            <Download className="h-4 w-4" />
                            <span>Resume</span>
                          </a>
                        )}
                        {member.github !== "#" && (
                          <a 
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
                          >
                            <Github className="h-4 w-4" />
                            <span>GitHub</span>
                          </a>
                        )}
                        <a 
                          href={`mailto:${member.email}`}
                          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
                        >
                          <Mail className="h-4 w-4" />
                          <span>Email</span>
                        </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Project Information Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">About VidyaLok Project</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl leading-relaxed mb-8">
              VidyaLok is an innovative AI-Powered Smart Library Ecosystem designed specifically for APSIT. 
              Our team has worked tirelessly to create a comprehensive solution that revolutionizes library management 
              through intelligent automation, real-time tracking, and personalized learning experiences.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Code className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Modern Technology</h3>
                <p>Built with Next.js, React, TypeScript, and cutting-edge web technologies</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Collaborative Effort</h3>
                <p>Developed by a dedicated team of 4 passionate developers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Star className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Innovation Focus</h3>
                <p>Focused on creating the best user experience for library management</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white text-center">
        <div className="container mx-auto px-6">
          <p className="text-gray-400 mb-4">
            © 2025 VidyaLok Team. Built with ❤️ for APSIT College Library.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/privacypolicies" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">
              Privacy Policy
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/Termsofservice" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
