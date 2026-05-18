// pages/splash/splash.js
Page({
  data: {},

  onLoad() {
    // 2秒后跳转
    setTimeout(() => {
      const app = getApp()
      if (app.globalData.isLoggedIn) {
        // 已登录，按角色跳转
        if (app.globalData.isAdmin) {
          wx.reLaunch({ url: '/pages/admin-index/admin-index' })
        } else {
          wx.switchTab({ url: '/pages/index/index' })
        }
      } else {
        // 未登录，跳转到登录页
        wx.redirectTo({
          url: '/pages/login/login'
        })
      }
    }, 2000)
  }
})
