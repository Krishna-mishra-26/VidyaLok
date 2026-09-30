'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X, Send, Bot, User } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasDisplayedWelcome, setHasDisplayedWelcome] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Show welcome message on first open
  useEffect(() => {
    if (isOpen && !hasDisplayedWelcome) {
      const welcomeMessage: Message = {
        id: `bot-${Date.now()}`,
        text: "Hi! I'm your Library Assistant. Ask me about any book or topic 📚",
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
      setHasDisplayedWelcome(true)
    }
  }, [isOpen, hasDisplayedWelcome])

  // Simulate API call to RAG system
  const sendMessageToAPI = async (message: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // Mock responses based on keywords for demo
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('book') || lowerMessage.includes('find')) {
      return "I can help you find books! Our library has over 50,000 titles. What specific book or topic are you looking for? I can search by title, author, subject, or ISBN."
    } else if (lowerMessage.includes('seat') || lowerMessage.includes('reservation')) {
      return "For seat reservations, you can book study spaces through the VidyaLok portal. We have quiet study areas, group discussion rooms, and computer workstations available. Would you like me to check availability?"
    } else if (lowerMessage.includes('hours') || lowerMessage.includes('time')) {
      return "Our library is open Monday-Saturday: 8:00 AM to 10:00 PM, Sunday: 10:00 AM to 8:00 PM. During exam periods, we extend hours until midnight on weekdays."
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm here to help with all your library needs. You can ask me about finding books, reserving seats, library hours, or any academic resources."
    } else if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
      return "We have an excellent collection of AI and Machine Learning books! Some popular titles include 'Pattern Recognition and Machine Learning' by Bishop, 'Deep Learning' by Goodfellow, and 'Artificial Intelligence: A Modern Approach' by Russell & Norvig. Would you like me to check their availability?"
    } else {
      return `I understand you're asking about "${message}". I can help you find relevant books, articles, and resources on this topic. Our AI-powered search can also suggest related materials that might interest you. Would you like me to search our catalog?`
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      const response = await sendMessageToAPI(userMessage.text)
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('ChatbotWidget: failed to send message', error)
      const errorMessage: Message = {
        id: `bot-error-${Date.now()}`,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <div className="relative group z-50">
            <button
              onClick={toggleChat}
              className="w-28 h-31 rounded-full hover:scale-110 transition-transform duration-300 overflow-visible bg-transparent border-none"
              aria-label="Open Chatbot"
              style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}
            >
              {/* Your Robot Image */}
              <Image 
                src="/Graident-Ai-Robot.jpg" 
                alt="AI Robot" 
                width={112}
                height={112}
                className="w-full h-full object-cover rounded-full"
                style={{ border: 'none', background: 'transparent' }}
                unoptimized
                priority
              />
            </button>
            {/* Tooltip on hover (left side, always visible above other elements) */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-6 px-4 py-2 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 text-white text-base font-semibold rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-blue-600 z-[999] flex items-center shadow-xl">
              <svg width='20' height='20' viewBox='0 0 20 20' className='mr-2'><circle cx='10' cy='10' r='10' fill='#38bdf8'/><text x='10' y='15' textAnchor='middle' fontSize='12' fill='white'>🤖</text></svg>
              <span className="typing">Chat with VidyaLok AI</span>
              {/* Tooltip arrow */}
              <span className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-blue-700"></span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className={`fixed bottom-5 right-5 z-50 transition-all duration-300 ease-in-out ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 h-96 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">VidyaLok AI Assistant</h3>
                <p className="text-xs text-purple-100">Online • Ready to help</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-3 py-2 ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 shadow-sm border">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about the library..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by VidyaLok AI • Press Enter to send
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Adjustments and Tooltip Typing Animation */}
      <style jsx>{`
        @media (max-width: 640px) {
          .w-80 {
            width: calc(100vw - 2.5rem);
            max-width: 350px;
          }
          .h-96 {
            height: 70vh;
            max-height: 500px;
          }
        }
        .typing {
          position: relative;
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid #fff;
          animation: typing 1.8s steps(22, end) 1, blink-caret 0.7s step-end infinite;
        }
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #fff; }
        }
      `}</style>
    </>
  )
}
