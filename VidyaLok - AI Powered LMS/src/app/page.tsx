import Link from "next/link";
import { BookOpen, Users, BarChart3, Zap, Shield, Clock, Brain, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";

export default function Home() {
  const features = [
    {
      icon: Smartphone,
      title: "Student ID-Based Entry",
      description: "Seamless entry/exit with ID scanning and real-time tracking"
    },
    {
      icon: BookOpen,
      title: "Smart Book Management",
      description: "Advanced search, availability checking, and borrowing system"
    },
    {
      icon: Brain,
      title: "AI-Powered Recommendations",
      description: "Personalized book suggestions based on your academic interests"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Comprehensive dashboards for library usage and trends"
    },
    {
      icon: Users,
      title: "User Management",
      description: "Complete student and admin management with role-based access"
    },
    {
      icon: Clock,
      title: "Live Seat Tracking",
      description: "Real-time seat availability and occupancy monitoring"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with data protection"
    },
    {
      icon: Zap,
      title: "Emergency Alerts",
      description: "Instant broadcast system for announcements and emergencies"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="premium-hero">
        <div className="premium-container">
          <div className="premium-hero-content">
            <h1 className="premium-hero-title">VidyaLok</h1>
            <p className="premium-hero-subtitle">
              AI-Powered Smart Library Ecosystem Management for APSIT
            </p>
            <p className="premium-hero-description">
              Revolutionizing library management with intelligent automation, 
              real-time tracking, and personalized learning experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/login" className="premium-btn-primary">
                Student Portal
              </Link>
              <Link href="/admin/login" className="premium-btn-secondary">
                Admin Dashboard
              </Link>
            </div>
            
            <div className="premium-stats-grid">
              <div className="premium-stat-card">
                <div className="premium-stat-number">1000+</div>
                <div className="premium-stat-label">Books Available</div>
              </div>
              <div className="premium-stat-card">
                <div className="premium-stat-number">500+</div>
                <div className="premium-stat-label">Active Students</div>
              </div>
              <div className="premium-stat-card">
                <div className="premium-stat-number">24/7</div>
                <div className="premium-stat-label">Smart Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="premium-features-section">
        <div className="premium-container">
          <div className="text-center mb-16">
            <h2 className="premium-heading-lg mb-6">
              Powerful Features
            </h2>
            <p className="premium-text-lg max-w-3xl mx-auto">
              Comprehensive library management system designed for modern educational institutions
            </p>
          </div>
          
          <div className="premium-features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="premium-card-feature">
                  <div className="premium-feature-icon">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="premium-feature-title">{feature.title}</h3>
                  <p className="premium-feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Student Features Section */}
      <section className="premium-section-students">
        <div className="premium-container">
          <div className="premium-two-column">
            <div>
              <h2 className="premium-heading-lg mb-8">For Students</h2>
              <div className="premium-feature-list">
                <div className="premium-feature-item">
                  <div className="premium-feature-item-icon">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div className="premium-feature-item-content">
                    <h3>ID-Based Entry System</h3>
                    <p>Quick entry/exit with student ID scanning</p>
                  </div>
                </div>
                <div className="premium-feature-item">
                  <div className="premium-feature-item-icon">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="premium-feature-item-content">
                    <h3>Smart Book Search</h3>
                    <p>Find and borrow books with intelligent search</p>
                  </div>
                </div>
                <div className="premium-feature-item">
                  <div className="premium-feature-item-icon">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div className="premium-feature-item-content">
                    <h3>AI Recommendations</h3>
                    <p>Personalized book suggestions for your studies</p>
                  </div>
                </div>
                <div className="premium-feature-item">
                  <div className="premium-feature-item-icon">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="premium-feature-item-content">
                    <h3>Live Seat Availability</h3>
                    <p>Check available seats before visiting</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <div className="premium-card p-16 w-full max-w-md aspect-square flex items-center justify-center">
                <BookOpen className="h-32 w-32 text-blue-500 opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Features Section */}
      <section className="premium-section-admins">
        <div className="premium-container">
          <div className="premium-two-column">
            <div className="flex justify-center items-center">
              <div className="premium-card p-16 w-full max-w-md aspect-square flex items-center justify-center">
                <BarChart3 className="h-32 w-32 text-purple-500 opacity-60" />
              </div>
            </div>
            <div>
              <h2 className="premium-heading-lg mb-8">For Administrators</h2>
              <div className="premium-feature-list">
                <div className="premium-feature-item">
                  <div className="premium-feature-item-icon">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="premium-feature-item-content">
                    <h3>Book Inventory Management</h3>
                    <p>Complete control over library catalog</p>
                  </div>
                </div>
                <div className="premium-feature-item">
                  <div className="premium-feature-item-icon">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className="premium-feature-item-content">
                    <h3>Analytics Dashboard</h3>
                    <p>Comprehensive insights and reports</p>
                  </div>
                </div>
                <div className="premium-feature-item">
                  <div className="premium-feature-item-icon">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="premium-feature-item-content">
                    <h3>User Management</h3>
                    <p>Monitor and manage all library users</p>
                  </div>
                </div>
                <div className="premium-feature-item">
                  <div className="premium-feature-item-icon">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="premium-feature-item-content">
                    <h3>Emergency Alerts</h3>
                    <p>Instant communication system</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="premium-footer-simple">
        <div className="premium-container">
          <div className="premium-footer-simple-content">
            <Link href="/" className="premium-footer-logo">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="premium-footer-logo-text">VidyaLok</span>
            </Link>
            
            <p className="premium-footer-tagline">
              AI-Powered Smart Library Management System for APSIT
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <Link href="/student" className="premium-footer-link">Student Portal</Link>
              <Link href="/admin" className="premium-footer-link">Admin Dashboard</Link>
              <Link href="#" className="premium-footer-link">Help Center</Link>
              <Link href="#" className="premium-footer-link">Contact Us</Link>
            </div>
            
            <p className="premium-footer-copyright">
              © 2025 VidyaLok. All rights reserved. Built for APSIT.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
