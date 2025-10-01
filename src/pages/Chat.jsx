import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { machinesData } from '../data/machines'
import { useJobs } from '../context/JobsContext'

const Chat = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const { getJobById } = useJobs()
  
  const chatType = searchParams.get('type') || 'machine'
  const machineId = searchParams.get('machine')
  const jobId = searchParams.get('jobId')
  const supplierName = searchParams.get('supplier')
  const clientName = searchParams.get('client')
  
  const machine = machineId ? machinesData.find(m => m.id === parseInt(machineId)) : null
  const job = jobId ? getJobById(jobId) : null

  useEffect(() => {
    // Initialize chat with welcome message
    if (chatType === 'machine' && machine && supplierName) {
      setMessages([
        {
          id: 1,
          sender: 'supplier',
          text: `Hello! I'm ${supplierName}. I see you're interested in our ${machine.name}. How can I help you today?`,
          timestamp: new Date(),
          avatar: '/images/user-avatar.svg'
        }
      ])
    } else if (chatType === 'job' && job && clientName) {
      setMessages([
        {
          id: 1,
          sender: 'client',
          text: `Hello! I'm ${clientName}. Thank you for your interest in my project "${job.title}". I'd love to discuss the requirements with you.`,
          timestamp: new Date(),
          avatar: '/images/user-avatar.svg'
        }
      ])
    }
  }, [chatType, machine, job, supplierName, clientName])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      sender: 'buyer',
      text: message,
      timestamp: new Date(),
      avatar: '/images/user-avatar.svg'
    }

    setMessages(prev => [...prev, newMessage])
    setMessage('')
    
    // Simulate typing and response
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      
      let responses, senderType
      
      if (chatType === 'machine') {
        responses = [
          "Thank you for your interest! Let me provide you with more details.",
          "That's a great question. This machine has excellent specifications for your needs.",
          "I'd be happy to arrange a demonstration or provide additional technical documentation.",
          "We offer competitive pricing and excellent after-sales support.",
          "Would you like to schedule a call to discuss your specific requirements?"
        ]
        senderType = 'supplier'
      } else {
        responses = [
          "Great! I'd love to hear more about your experience and approach to this project.",
          "That sounds interesting. Can you tell me more about your timeline and pricing?",
          "I'm looking for someone with expertise in this area. What's your background?",
          "Perfect! Let's discuss the project requirements in more detail.",
          "I appreciate your interest. When would you be available to start?"
        ]
        senderType = 'client'
      }
      
      const response = {
        id: messages.length + 2,
        sender: senderType,
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        avatar: '/images/user-avatar.svg'
      }
      
      setMessages(prev => [...prev, response])
    }, 2000)
  }

  if ((chatType === 'machine' && !machine) || (chatType === 'job' && !job)) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            {chatType === 'machine' ? 'Machine not found' : 'Job not found'}
          </h2>
          <button
            onClick={() => navigate(chatType === 'machine' ? '/machinery' : '/jobs')}
            className="btn-primary"
          >
            {chatType === 'machine' ? 'Back to Machinery' : 'Back to Jobs'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <div className="bg-white border-b border-border-light sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(chatType === 'machine' ? '/machinery' : '/jobs')}
                className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {chatType === 'machine' ? supplierName?.charAt(0) : clientName?.charAt(0)}
                </div>
                <div>
                  <h1 className="font-semibold text-text-primary">
                    {chatType === 'machine' ? supplierName : clientName}
                  </h1>
                  <p className="text-sm text-text-secondary">Online now</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-background-secondary rounded-lg transition-colors">
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-background-secondary rounded-lg transition-colors">
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-border-light h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${msg.sender === 'buyer' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <img
                        src={msg.avatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          msg.sender === 'buyer'
                            ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                            : 'bg-background-secondary text-text-primary'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'buyer' ? 'text-primary-100' : 'text-text-muted'}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                      <img
                        src="/images/user-avatar.svg"
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="bg-background-secondary text-text-primary px-4 py-2 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-border-light p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-border-light p-6">
              <h3 className="font-semibold text-text-primary mb-4">
                {chatType === 'machine' ? 'Machine Details' : 'Project Details'}
              </h3>
              <div className="space-y-4">
                {chatType === 'machine' ? (
                  <>
                    <img
                      src={machine.image}
                      alt={machine.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-medium text-text-primary">{machine.name}</h4>
                      <p className="text-sm text-text-secondary">{machine.category}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">Price:</span>
                      <span className="font-semibold text-primary-600">
                        ₹{machine.price.toLocaleString()}/{machine.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">Condition:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        machine.condition === 'New' 
                          ? 'bg-success-100 text-success-700'
                          : 'bg-warning-100 text-warning-700'
                      }`}>
                        {machine.condition}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">Location:</span>
                      <span className="text-sm text-text-primary">{machine.location}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="font-medium text-text-primary">{job.title}</h4>
                      <p className="text-sm text-text-secondary">{job.category}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">Budget:</span>
                      <span className="font-semibold text-primary-600">
                        ₹{job.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">Duration:</span>
                      <span className="text-sm text-text-primary">{job.estimatedDuration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === 'Open' 
                          ? 'bg-success-100 text-success-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">Location:</span>
                      <span className="text-sm text-text-primary">{job.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border-light p-6">
              <h3 className="font-semibold text-text-primary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {chatType === 'machine' ? (
                  <>
                    <button className="w-full btn-primary">
                      Request Quote
                    </button>
                    <button className="w-full btn-outline">
                      Schedule Demo
                    </button>
                    <button className="w-full btn-outline">
                      Download Specs
                    </button>
                  </>
                ) : (
                  <>
                    <button className="w-full btn-primary">
                      Submit Proposal
                    </button>
                    <button className="w-full btn-outline">
                      Request Details
                    </button>
                    <button className="w-full btn-outline">
                      Schedule Call
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat