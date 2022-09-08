export const baseUrl = process.env.REACT_APP_BACKEND_URL

export const generatebase64 = (data) => {
  return window.btoa(unescape(encodeURIComponent(data)))
}

export const generateHeaders = (token, isJSON = false) => ({
  Authorization: `Basic ${token}`,
  'X-Requested-With': 'XMLHttpRequest',
  ...(isJSON ? { 'Content-Type': 'application/json' } : {}),
})
