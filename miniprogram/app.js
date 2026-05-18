// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 检查登录状态
    this.checkLoginStatus()
  },

  globalData: {
    userInfo: null,
    isLoggedIn: false,
    isAdmin: false,
    // 主题色 - 粉色系
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
    const isAdmin = wx.getStorageSync('isAdmin') || false
    if (userInfo) {
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
      this.globalData.isAdmin = isAdmin
    }
  },

  // 登录方法
  login(userInfo, isAdmin = false) {
    this.globalData.userInfo = userInfo
    this.globalData.isLoggedIn = true
    this.globalData.isAdmin = isAdmin
    wx.setStorageSync('userInfo', userInfo)
    wx.setStorageSync('isAdmin', isAdmin)
  },

  // 退出登录
  logout() {
    this.globalData.userInfo = null
    this.globalData.isLoggedIn = false
    this.globalData.isAdmin = false
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('isAdmin')
  }
})
