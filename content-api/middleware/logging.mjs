export const DEBUG_MODE = process.env.DEBUG_LOGS === 'true'

// 安全的调试日志函数
export const debugLog = (message, data = null) => {
  if (DEBUG_MODE) {
    const timestamp = new Date().toISOString()
    if (data) {
      console.log(`[DEBUG ${timestamp}] ${message}:`, JSON.stringify(data, null, 2))
    } else {
      console.log(`[DEBUG ${timestamp}] ${message}`)
    }
  }
}
