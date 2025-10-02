import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import chatService from '../services/chatService';
import { FiSend, FiMessageCircle, FiX } from 'react-icons/fi';

const ChatWindow = ({ jobId, jobOwnerUid, jobTitle, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentUser && jobId && jobOwnerUid) {
      initializeChat();
    }
  }, [currentUser, jobId, jobOwnerUid]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      
      // Create or get conversation
      const conversationResult = await chatService.createOrGetConversation(
        jobId,
        jobOwnerUid,
        currentUser.uid,
        jobTitle
      );

      if (conversationResult.success) {
        setConversationId(conversationResult.conversationId);
        
        // Load messages
        const messagesResult = await chatService.getMessages(conversationResult.conversationId);
        if (messagesResult.success) {
          setMessages(messagesResult.messages);
        }
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || sending) return;

    try {
      setSending(true);
      
      const result = await chatService.sendMessage(
        conversationId,
        currentUser.uid,
        currentUser.displayName || currentUser.email,
        newMessage.trim()
      );

      if (result.success) {
        // Add message to local state immediately
        const newMsg = {
          id: Date.now(), // Temporary ID
          conversation_id: conversationId,
          sender_uid: currentUser.uid,
          sender_name: currentUser.displayName || currentUser.email,
          message: newMessage.trim(),
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        
        // Refresh messages to get the actual message from server
        setTimeout(async () => {
          try {
            const messagesResult = await chatService.getMessages(conversationId);
            if (messagesResult.success) {
              setMessages(messagesResult.messages);
            }
          } catch (error) {
            console.error('Error refreshing messages:', error);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <FiMessageCircle className="text-blue-600" />
          <div>
            <h3 className="font-semibold text-sm text-gray-800">Chat about Job</h3>
            <p className="text-xs text-gray-600 truncate">{jobTitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm">
            Start a conversation about this job
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.sender_uid === currentUser.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  message.sender_uid === currentUser.uid
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="break-words">{message.message}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.sender_uid === currentUser.uid ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;