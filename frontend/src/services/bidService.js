import { getApiBaseUrlDynamic } from '../config/api'

const bidService = {
  // Place a bid on a job
  async placeBid(jobId, bidderUid, bidderName, bidAmount, message) {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic()
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bidder_uid: bidderUid,
          bidder_name: bidderName,
          bid_amount: bidAmount,
          message: message || ''
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to place bid')
      }

      const data = await response.json()
      return {
        success: true,
        bidId: data.bidId,
        updated: data.updated || false
      }
    } catch (error) {
      console.error('Error placing bid:', error)
      return {
        success: false,
        error: error.message || 'Failed to place bid'
      }
    }
  },

  // Get all bids for a job
  async getBidsByJobId(jobId) {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic()
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/bids`)

      if (!response.ok) {
        throw new Error('Failed to fetch bids')
      }

      const bids = await response.json()
      return {
        success: true,
        bids: bids
      }
    } catch (error) {
      console.error('Error fetching bids:', error)
      return {
        success: false,
        bids: [],
        error: error.message
      }
    }
  },

  // Get user's bid for a job
  async getMyBid(jobId, bidderUid) {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic()
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/bids/${bidderUid}`)

      if (response.status === 404) {
        return {
          success: true,
          bid: null
        }
      }

      if (!response.ok) {
        throw new Error('Failed to fetch bid')
      }

      const bid = await response.json()
      return {
        success: true,
        bid: bid
      }
    } catch (error) {
      console.error('Error fetching bid:', error)
      return {
        success: false,
        bid: null,
        error: error.message
      }
    }
  }
}

export default bidService


