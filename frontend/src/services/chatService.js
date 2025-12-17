import { getApiBaseUrlDynamic } from '../config/api';

const chatService = {
  // Create or get existing conversation
  async createOrGetConversation(jobId, jobOwnerUid, participantUid, jobTitle) {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          jobOwnerUid,
          participantUid,
          jobTitle
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Send a message
  async sendMessage(conversationId, senderUid, senderName, message) {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          senderUid,
          senderName,
          message
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get user's conversations
  async getConversations(userUid) {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/chat/conversations/${userUid}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  },

  // Get messages for a conversation
  async getMessages(conversationId) {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/chat/messages/${conversationId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }
};

export default chatService;