import { getApiBaseUrlDynamic } from '../config/api'

export const cartService = {
  async getCart(firebaseUid) {
    const API_BASE_URL = getApiBaseUrlDynamic();
    const res = await fetch(`${API_BASE_URL}/cart?firebase_uid=${encodeURIComponent(firebaseUid)}`)
    if (!res.ok) throw new Error('Failed to fetch cart')
    return res.json()
  },
  async addItem(firebaseUid, productId, qty) {
    const API_BASE_URL = getApiBaseUrlDynamic();
    const res = await fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebase_uid: firebaseUid, product_id: productId, qty })
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to add item. Please check if you have buying permission approved.')
    }
    return res.json()
  },
  async updateItem(itemId, qty) {
    const API_BASE_URL = getApiBaseUrlDynamic();
    const res = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty })
    })
    if (!res.ok) throw new Error('Failed to update item')
    return res.json()
  },
  async removeItem(itemId) {
    const API_BASE_URL = getApiBaseUrlDynamic();
    const res = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to remove item')
    return res.json()
  },
  async checkout(firebaseUid, payload = {}) {
    const API_BASE_URL = getApiBaseUrlDynamic();
    const res = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebase_uid: firebaseUid, ...payload })
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || 'Checkout failed. Please check if you have buying permission approved.')
    }
    return res.json()
  }
}

export default cartService