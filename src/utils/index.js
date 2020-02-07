export const baseUrl = 'https://rts.a6raywa1cher.com/reschedule-tsu-spring'

export const generatebase64 = data => {
  return window.btoa(unescape(encodeURIComponent(data)))
}

export const generateHeaders = (token, isJSON = false) => ({
  Authorization: `Basic ${token}`,
  'X-Requested-With': 'XMLHttpRequest',
  ...(isJSON ? { 'Content-Type': 'application/json' } : {})
})
