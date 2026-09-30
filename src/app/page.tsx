import Link from "next/link";
import { BookOpen, Users, BarChart3, Zap, Shield, Clock, Brain, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <section id="home" className="relative bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-700 text-white overflow-hidden min-h-screen flex items-center pt-24">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/30 to-purple-600/30 animate-pulse"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-purple-400/20 rounded-full animate-bounce delay-1000"></div>
        
        <div className="container mx-auto px-6 py-32 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            {/* Main Title with Animation */}
            <div className="mb-8">
              <h1 className="vidyalok-gradient-title text-7xl md:text-8xl font-extrabold mb-4 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                VidyaLok
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 mx-auto rounded-full animate-pulse"></div>
            </div>
            
            <p className="text-3xl md:text-4xl font-bold text-emerald-100 mb-6 animate-fade-in">
              AI-Powered Smart Library Ecosystem for APSIT
            </p>
            <p className="text-xl md:text-2xl text-blue-100 mb-16 max-w-4xl mx-auto leading-relaxed">
              ✨ Revolutionizing library management with intelligent automation, 
              real-time tracking, and personalized learning experiences for over 10,000+ students! ✨
            </p>
            
            {/* Enhanced CTA Buttons with Premium Styling */}
            <div className="flex flex-col sm:flex-row gap-10 justify-center items-center mb-20">
              <Link href="/login" className="group">
                <Button size="lg" className="relative w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 font-extrabold text-xl px-16 py-8 rounded-2xl shadow-2xl border-2 border-white/20 overflow-hidden transform transition-all duration-300 ease-in-out hover:scale-110 hover:-translate-y-2 hover:shadow-3xl hover:shadow-blue-500/50 ">
                  {/* Animated Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Button Content */}
                  <div className="relative z-10 flex items-center space-x-3" style={{ textShadow: 'none' }}>
                    <span className="text-3xl transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" style={{ textShadow: 'none' }}>🎓</span>
                    <span className="tracking-wide text-black transform transition-all duration-300 group-hover:tracking-wider" style={{ textShadow: 'none', filter: 'none' }}>STUDENT PORTAL</span>
                  </div>
                </Button>
              </Link>
              
              <Link href="/admin/login" className="group">
                <Button size="lg" className="relative w-full sm:w-auto bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 font-extrabold text-xl px-16 py-8 rounded-2xl shadow-2xl border-2 border-white/20 overflow-hidden transform transition-all duration-300 ease-in-out hover:scale-110 hover:-translate-y-2 hover:shadow-3xl hover:shadow-purple-500/50 ">
                  {/* Animated Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Button Content */}
                  <div className="relative z-10 flex items-center space-x-3" style={{ textShadow: 'none' }}>
                    <span className="text-3xl transform transition-transform duration-300 group-hover:scale-125 " style={{ textShadow: 'none' }}>👨‍💼</span>
                    <span className="tracking-wide text-black font-extrabold transform transition-all duration-300 group-hover:tracking-wider" style={{ textShadow: 'none', filter: 'none' }}>ADMIN DASHBOARD</span>
                  </div>
                </Button>
              </Link>
            </div>
            
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/50 shadow-lg hover:bg-white/95 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-400/60 transition-all duration-300 ease-in-out cursor-pointer group">
                <div className="text-5xl font-bold text-gray-800 mb-3 group-hover:text-blue-600">1000+ 📚</div>
                <div className="text-blue-600 font-bold text-lg group-hover:text-blue-700">Books Available</div>
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/50 shadow-lg hover:bg-white/95 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-400/60 transition-all duration-300 ease-in-out cursor-pointer group">
                <div className="text-5xl font-bold text-gray-800 mb-3 group-hover:text-purple-600">5000+ 👥</div>
                <div className="text-purple-600 font-bold text-lg group-hover:text-purple-700">Students Ready</div>
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/50 shadow-lg hover:bg-white/95 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-400/60 transition-all duration-300 ease-in-out cursor-pointer group">
                <div className="text-5xl font-bold text-gray-800 mb-3 group-hover:text-emerald-600">24/7 ⚡</div>
                <div className="text-emerald-600 font-bold text-lg group-hover:text-emerald-700">Smart Monitoring</div>
              </div>
            </div>
            
            
          </div>
        </div>
        
        {/* Enhanced Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-24 fill-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray mb-4">
              <span className="text-blue-600">Why choose VidyaLok</span>
            </h2>
            <p className="text-lg text-red-600 max-w-2xl mx-auto font-bold">
              Advanced features designed specifically for modern library management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colors = [
                { bg: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-600', hoverBg: 'hover:bg-blue-50', hoverBorder: 'hover:border-blue-300', hoverShadow: 'hover:shadow-blue-200/50' },
                { bg: 'bg-purple-500', border: 'border-purple-200', text: 'text-purple-600', hoverBg: 'hover:bg-purple-50', hoverBorder: 'hover:border-purple-300', hoverShadow: 'hover:shadow-purple-200/50' },
                { bg: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-600', hoverBg: 'hover:bg-emerald-50', hoverBorder: 'hover:border-emerald-300', hoverShadow: 'hover:shadow-emerald-200/50' },
                { bg: 'bg-orange-500', border: 'border-orange-200', text: 'text-orange-600', hoverBg: 'hover:bg-orange-50', hoverBorder: 'hover:border-orange-300', hoverShadow: 'hover:shadow-orange-200/50' },
                { bg: 'bg-indigo-500', border: 'border-indigo-200', text: 'text-indigo-600', hoverBg: 'hover:bg-indigo-50', hoverBorder: 'hover:border-indigo-300', hoverShadow: 'hover:shadow-indigo-200/50' },
                { bg: 'bg-green-500', border: 'border-green-200', text: 'text-green-600', hoverBg: 'hover:bg-green-50', hoverBorder: 'hover:border-green-300', hoverShadow: 'hover:shadow-green-200/50' },
                { bg: 'bg-gray-700', border: 'border-gray-200', text: 'text-gray-700', hoverBg: 'hover:bg-gray-50', hoverBorder: 'hover:border-gray-300', hoverShadow: 'hover:shadow-gray-200/50' },
                { bg: 'bg-red-500', border: 'border-red-200', text: 'text-red-600', hoverBg: 'hover:bg-red-50', hoverBorder: 'hover:border-red-300', hoverShadow: 'hover:shadow-red-200/50' }
              ];
              return (
                <div key={index} className={`bg-white p-6 rounded-xl shadow-md border ${colors[index].border} ${colors[index].hoverBg} ${colors[index].hoverBorder} hover:shadow-xl ${colors[index].hoverShadow} transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-in-out cursor-pointer group`}>
                  <div className={`w-12 h-12 ${colors[index].bg} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ease-in-out`}>
                    <Icon className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300 ease-in-out" />
                  </div>
                  <h3 className={`text-lg font-bold ${colors[index].text} mb-2 group-hover:text-opacity-80 transition-all duration-300`}>{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        
        </div>
      </section>

      {/* Student Features Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-purple-800 mb-6">
                Smart Tools <span className="text-blue-600">for Student Success</span>
              </h2>
              <p className="text-xl text-gray-700 mb-10 leading-relaxed font-medium">
                Everything students need for a seamless library experience
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg border border-blue-100 hover:bg-blue-50 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-200/50 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-in-out cursor-pointer group">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <Smartphone className="h-7 w-7 text-white group-hover:rotate-12 transition-transform duration-300 ease-in-out" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">ID-Based Entry System</h3>
                    <p className="text-gray-700 text-lg font-medium group-hover:text-gray-800 transition-colors duration-300">Quick entry with student ID scanning and real-time tracking</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg border border-purple-100 hover:bg-purple-50 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-200/50 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-in-out cursor-pointer group">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <BookOpen className="h-7 w-7 text-white group-hover:rotate-12 transition-transform duration-300 ease-in-out" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors duration-300">Smart Book Search</h3>
                    <p className="text-gray-700 text-lg font-medium group-hover:text-gray-800 transition-colors duration-300">AI-powered search with instant availability checking</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg border border-emerald-100 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-200/50 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-in-out cursor-pointer group">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <Brain className="h-7 w-7 text-white group-hover:rotate-12 transition-transform duration-300 ease-in-out" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-emerald-600 transition-colors duration-300">AI Recommendations</h3>
                    <p className="text-gray-700 text-lg font-medium group-hover:text-gray-800 transition-colors duration-300">Personalized book suggestions based on your interests</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg border border-orange-100 hover:bg-orange-50 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-200/50 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-in-out cursor-pointer group">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <Clock className="h-7 w-7 text-white group-hover:rotate-12 transition-transform duration-300 ease-in-out" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-orange-600 transition-colors duration-300">Live Seat Availability</h3>
                    <p className="text-gray-700 text-lg font-medium group-hover:text-gray-800 transition-colors duration-300">Real-time monitoring of study spaces and seating</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 p-16 rounded-3xl shadow-2xl">
                  <BookOpen className="h-32 w-32 text-white mx-auto" />
                </div>
                
                {/* Enhanced Stats */}
                <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border-4 border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">1000+</div>
                  <div className="text-sm text-gray-600 font-medium">Books</div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border-4 border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">24/7</div>
                  <div className="text-sm text-gray-600 font-medium">Access</div>
                </div>
                
                {/* Additional floating elements */}
                <div className="absolute top-1/2 -right-8 bg-white rounded-xl p-3 shadow-lg border-2 border-emerald-200">
                  <div className="text-lg font-bold text-emerald-600">AI</div>
                  <div className="text-xs text-gray-600">Smart</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Features Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center items-center order-2 lg:order-1">
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-700 p-16 rounded-3xl shadow-2xl">
                  <BarChart3 className="h-32 w-32 text-white mx-auto" />
                </div>
                
                {/* Enhanced Stats */}
                <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border-4 border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">100%</div>
                  <div className="text-sm text-gray-600 font-medium">Automated</div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border-4 border-indigo-200">
                  <div className="text-3xl font-bold text-indigo-600">AI</div>
                  <div className="text-sm text-gray-600 font-medium">Powered</div>
                </div>
                
                {/* Additional floating elements */}
                <div className="absolute top-1/2 -left-8 bg-white rounded-xl p-3 shadow-lg border-2 border-blue-200">
                  <div className="text-lg font-bold text-blue-600">🔒</div>
                  <div className="text-xs text-gray-600">Secure</div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-purple-700 mb-6">
                Complete Admin<span className="text-purple-600"> Control</span>
              </h2>
              <p className="text-xl text-gray-700 mb-10 leading-relaxed font-medium">
                Powerful tools for efficient library management and oversight
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg border border-purple-100 hover:bg-purple-50 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-200/50 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-in-out cursor-pointer group">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <BookOpen className="h-7 w-7 text-white group-hover:rotate-12 transition-transform duration-300 ease-in-out" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors duration-300">Book Inventory Management</h3>
                    <p className="text-gray-700 text-lg font-medium group-hover:text-gray-800 transition-colors duration-300">Complete control over library catalog and inventory</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-200/50 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-in-out cursor-pointer group">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <BarChart3 className="h-7 w-7 text-white group-hover:rotate-12 transition-transform duration-300 ease-in-out" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors duration-300">Analytics Dashboard</h3>
                    <p className="text-gray-700 text-lg font-medium group-hover:text-gray-800 transition-colors duration-300">Real-time insights and comprehensive reporting</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg border border-blue-100 hover:bg-blue-50 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-200/50 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-in-out cursor-pointer group">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <Users className="h-7 w-7 text-white group-hover:rotate-12 transition-transform duration-300 ease-in-out" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">User Management</h3>
                    <p className="text-gray-700 text-lg font-medium group-hover:text-gray-800 transition-colors duration-300">Monitor and manage all library users effectively</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg border border-red-100 hover:bg-red-50 hover:border-red-300 hover:shadow-xl hover:shadow-red-200/50 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-in-out cursor-pointer group">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <Zap className="h-7 w-7 text-white group-hover:rotate-12 transition-transform duration-300 ease-in-out" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-red-600 transition-colors duration-300">Emergency Alerts</h3>
                    <p className="text-gray-700 text-lg font-medium group-hover:text-gray-800 transition-colors duration-300">Instant communication and broadcast system</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Professional Footer */}
            {/* Enhanced Footer */}
      <footer id="footer" className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white py-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-purple-900/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-12 pb-4 relative z-10">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-5">
            {/* Enhanced Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-5 mb-8 group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <BookOpen className="h-9 w-9 text-white" />
                </div>
                <div>
                  <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">VidyaLok</span>
                  <p className="text-gray-300 font-semibold text-lg">AI-Powered Smart Library Ecosystem</p>
                </div>
              </Link>
              
              <p className="text-gray-300 text-xl mb-10 max-w-2xl leading-relaxed font-medium">
                Revolutionizing library management for <span className="text-blue-400 font-bold">APSIT College</span> with cutting-edge AI technology, 
                serving <span className="text-purple-400 font-bold">10,000+ students</span> with seamless digital experiences.
              </p>
              
              {/* Enhanced Contact Info with Icons */}
              <div className="space-y-6">
                <div className="flex items-center space-x-5 text-gray-300 group hover:text-blue-400 transition-all duration-300 cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-blue-500/40 group-hover:to-blue-600/50 group-hover:scale-110 transition-all duration-300 border border-blue-500/20">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <span className="font-bold text-lg">support@vidyalok.apsit.edu.in</span>
                    <p className="text-gray-400 text-sm">24/7 Student Support</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-5 text-gray-300 group hover:text-purple-400 transition-all duration-300 cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-purple-500/40 group-hover:to-purple-600/50 group-hover:scale-110 transition-all duration-300 border border-purple-500/20">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div>
                    <span className="font-bold text-lg">+91 98765 43210</span>
                    <p className="text-gray-400 text-sm">Emergency Helpline</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-5 text-gray-300 group hover:text-emerald-400 transition-all duration-300 cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-emerald-500/40 group-hover:to-emerald-600/50 group-hover:scale-110 transition-all duration-300 border border-emerald-500/20">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <span className="font-bold text-lg">APSIT Campus, Thane</span>
                    <p className="text-gray-400 text-sm">Maharashtra, India - 400615</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-purple-400 text-xl mb-6">Quick Links</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/student" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center space-x-3 group">
                    <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span>Student Portal</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 flex items-center space-x-3 group">
                    <div className="w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span>Admin Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 flex items-center space-x-3 group">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span>Digital Library</span>
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 flex items-center space-x-3 group">
                    <div className="w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span>About APSIT</span>
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="font-bold text-purple-400 text-xl mb-6">Support</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/helpcenter" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center space-x-3 group">
                    <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span>Help Center</span>
                  </Link>
                </li>
                <li>
                  <Link href="/userguide" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 flex items-center space-x-3 group">
                    <div className="w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span>User Guide</span>
                  </Link>
                </li>
                <li>
                  <Link href="/privacypolicies" className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 flex items-center space-x-3 group">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/Termsofservice" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 flex items-center space-x-3 group">
                    <div className="w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span>Terms of Service</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-700 pt-2 mb-0 text-center">
            <div className="flex flex-col md:flex-col justify-center items-center">
              <p className="text-gray-400 text-lg">© 2025 VidyaLok. All rights reserved.</p>
              <p className="text-gray-400 text-lg">Made for APSIT students and faculty</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
