import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { FaPaperPlane, FaArrowLeft, FaUser, FaSearch, FaEllipsisV } from 'react-icons/fa'
import LoadingSpinner from '../components/LoadingSpinner'

const Chat = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef(null)
  
  // Get conversation ID from URL params
  const conversationId = searchParams.get('conversation')
  const recipientId = searchParams.get('recipient')
  const recipientName = searchParams.get('recipientName')

  // Load user's conversations
  useEffect(() => {
    if (!currentUser) return

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageTime', 'desc')
    )

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const conversationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setConversations(conversationsList)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return

    const messagesQuery = query(
      collection(db, 'conversations', selectedConversation.id, 'messages'),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMessages(messagesList)
      scrollToBottom()
    })

    return () => unsubscribe()
  }, [selectedConversation])

  // Handle conversation selection from URL params
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation) {
        setSelectedConversation(conversation)
      }
    } else if (recipientId && recipientName && currentUser) {
      // Create or find conversation with specific recipient
      createOrFindConversation(recipientId, recipientName)
    }
  }, [conversationId, recipientId, recipientName, conversations, currentUser])

  const createOrFindConversation = async (otherUserId, otherUserName) => {
    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.participants.includes(otherUserId)
      )

      if (existingConversation) {
        setSelectedConversation(existingConversation)
        return
      }

      // Create new conversation
      const conversationData = {
        participants: [currentUser.uid, otherUserId],
        participantNames: {
          [currentUser.uid]: currentUser.displayName || currentUser.email,
          [otherUserId]: otherUserName
        },
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'conversations'), conversationData)
      const newConversation = { id: docRef.id, ...conversationData }
      setSelectedConversation(newConversation)
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || !selectedConversation || sending) return

    setSending(true)
    try {
      const messageData = {
        text: message.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        timestamp: serverTimestamp(),
        read: false
      }

      // Add message to conversation
      await addDoc(
        collection(db, 'conversations', selectedConversation.id, 'messages'),
        messageData
      )

      // Update conversation's last message
      await updateDoc(doc(db, 'conversations', selectedConversation.id), {
        lastMessage: message.trim(),
        lastMessageTime: serverTimestamp()
      })

      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const filteredConversations = conversations.filter(conv =>
    Object.values(conv.participantNames).some(name =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const getOtherParticipantName = (conversation) => {
    const otherParticipantId = conversation.participants.find(id => id !== currentUser?.uid)
    return conversation.participantNames[otherParticipantId] || 'Unknown User'
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Please sign in to access chat</h2>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-border-light flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border-light">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">Messages</h2>
                <button className="p-2 hover:bg-background-secondary rounded-lg transition-colors">
                  <FaEllipsisV className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner variant="glow" text="Loading conversations..." />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-text-muted">
                  <FaUser className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start chatting with other users!</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 border-b border-border-light cursor-pointer hover:bg-background-secondary transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-primary-50 border-r-2 border-r-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {getOtherParticipantName(conversation).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-text-primary truncate">
                            {getOtherParticipantName(conversation)}
                          </h3>
                          <span className="text-xs text-text-muted">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary truncate">
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {selectedConversation ? (
              <div className="bg-white rounded-xl border border-border-light h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-border-light">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="lg:hidden p-2 hover:bg-background-secondary rounded-lg transition-colors"
                      >
                        <FaArrowLeft className="w-4 h-4 text-text-secondary" />
                      </button>
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {getOtherParticipantName(selectedConversation).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {getOtherParticipantName(selectedConversation)}
                        </h3>
                        <p className="text-sm text-text-secondary">Online</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                        msg.senderId === currentUser.uid ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {msg.senderName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            msg.senderId === currentUser.uid
                              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                              : 'bg-background-secondary text-text-primary'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.senderId === currentUser.uid ? 'text-primary-100' : 'text-text-muted'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-border-light p-4">
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={sending}
                      className="flex-1 px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || sending}
                      className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                    >
                      {sending ? (
                        <LoadingSpinner size="sm" variant="wave" />
                      ) : (
                        <FaPaperPlane className="w-4 h-4" />
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border-light h-full flex items-center justify-center">
                <div className="text-center">
                  <FaUser className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Select a conversation</h3>
                  <p className="text-text-secondary">Choose a conversation from the sidebar to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat