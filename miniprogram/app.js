// app.js
App({
  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    this.checkLoginStatus()
  },

  globalData: {
    userInfo: null,
    token: '',
    isLoggedIn: false,
    isAdmin: false,
    theme: {
      primary: '#E8A5A5',
      primaryDark: '#D4908F',
      primaryLight: '#F5D5D5',
      background: '#FFF5F5',
      textPrimary: '#333333',
      textSecondary: '#666666',
      textHint: '#999999',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336'
    }
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    const token = wx.getStorageSync('token')
    const isAdmin = wx.getStorageSync('isAdmin') || false
    if (userInfo && token) {
      this.globalData.userInfo = userInfo
      this.globalData.token = token
      this.globalData.isLoggedIn = true
      this.globalData.isAdmin = isAdmin
    }
  },

  login(userInfo, isAdmin = false, token = '') {
    this.globalData.userInfo = userInfo
    this.globalData.token = token
    this.globalData.isLoggedIn = true
    this.globalData.isAdmin = isAdmin
    wx.setStorageSync('userInfo', userInfo)
    wx.setStorageSync('token', token)
    wx.setStorageSync('isAdmin', isAdmin)
  },

  logout() {
    this.globalData.userInfo = null
    this.globalData.token = ''
    this.globalData.isLoggedIn = false
    this.globalData.isAdmin = false
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('token')
    wx.removeStorageSync('isAdmin')
  }
})
