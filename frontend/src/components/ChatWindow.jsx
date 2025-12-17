import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import chatService from '../services/chatService';
import bidService from '../services/bidService';
import { FiSend, FiMessageCircle, FiX, FiDollarSign } from 'react-icons/fi';

const ChatWindow = ({ jobId, jobOwnerUid, jobTitle, jobBudget, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [myBid, setMyBid] = useState(null);
  const [loadingBid, setLoadingBid] = useState(true);
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
      loadMyBid();
    }
  }, [currentUser, jobId, jobOwnerUid]);

  const loadMyBid = async () => {
    if (!currentUser || !jobId) return;
    
    try {
      setLoadingBid(true);
      const result = await bidService.getMyBid(jobId, currentUser.uid);
      if (result.success) {
        setMyBid(result.bid);
      }
    } catch (error) {
      console.error('Error loading bid:', error);
    } finally {
      setLoadingBid(false);
    }
  };

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    try {
      setPlacingBid(true);
      
      const result = await bidService.placeBid(
        jobId,
        currentUser.uid,
        currentUser.displayName || currentUser.email,
        parseFloat(bidAmount),
        bidMessage
      );

      if (result.success) {
        // Reload bid
        await loadMyBid();
        
        // Send a message about the bid
        if (conversationId) {
          const bidMessageText = result.updated 
            ? `I've updated my bid to ${formatCurrency(parseFloat(bidAmount))}. ${bidMessage || ''}`
            : `I've placed a bid of ${formatCurrency(parseFloat(bidAmount))} for this job. ${bidMessage || ''}`;
          
          await chatService.sendMessage(
            conversationId,
            currentUser.uid,
            currentUser.displayName || currentUser.email,
            bidMessageText
          );
          
          // Refresh messages
          const messagesResult = await chatService.getMessages(conversationId);
          if (messagesResult.success) {
            setMessages(messagesResult.messages);
          }
        }
        
        setShowBidForm(false);
        setBidAmount('');
        setBidMessage('');
        alert(result.updated ? 'Bid updated successfully!' : 'Bid placed successfully!');
      } else {
        alert(result.error || 'Failed to place bid');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      alert('Failed to place bid. Please try again.');
    } finally {
      setPlacingBid(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 w-80 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
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

        {/* Bid Status */}
        {!loadingBid && myBid && (
          <div className="px-4 py-2 bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Your Bid:</p>
                <p className="text-sm font-semibold text-green-700">{formatCurrency(myBid.bid_amount)}</p>
              </div>
              <button
                onClick={() => {
                  setBidAmount(myBid.bid_amount.toString());
                  setBidMessage(myBid.message || '');
                  setShowBidForm(true);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Update Bid
              </button>
            </div>
          </div>
        )}

        {/* Place Bid Button */}
        {!loadingBid && !myBid && (
          <div className="px-4 py-2 border-b border-gray-200">
            <button
              onClick={() => setShowBidForm(true)}
              className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
            >
              <FiDollarSign size={16} />
              <span>Place a Bid</span>
            </button>
          </div>
        )}

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

    {/* Bid Form Modal */}
    {showBidForm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Place a Bid</h3>
              <button
                onClick={() => {
                  setShowBidForm(false);
                  setBidAmount('');
                  setBidMessage('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handlePlaceBid}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bid Amount (INR)
                </label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={jobBudget ? `Budget: ${formatCurrency(jobBudget)}` : 'Enter bid amount'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="1"
                  step="0.01"
                  disabled={placingBid}
                />
                {jobBudget && (
                  <p className="text-xs text-gray-500 mt-1">
                    Job Budget: {formatCurrency(jobBudget)}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="Add a message about your bid..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={placingBid}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBidForm(false);
                    setBidAmount('');
                    setBidMessage('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={placingBid}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={placingBid || !bidAmount}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {placingBid ? 'Placing...' : myBid ? 'Update Bid' : 'Place Bid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ChatWindow;