/** Central place for API base URL and helper methods. */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = {
  baseUrl: API_BASE_URL,
}

export function getAuthToken(): string | null {
  return localStorage.getItem('aarogya_token')
}

export function setAuthToken(token: string) {
  localStorage.setItem('aarogya_token', token)
}

export async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    try {
      const errorJson = JSON.parse(errorText)
      throw new Error(errorJson.message || 'API Request failed')
    } catch {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  return response.json()
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

