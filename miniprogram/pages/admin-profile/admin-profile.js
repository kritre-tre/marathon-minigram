// pages/admin-profile/admin-profile.js
const app = getApp()

Page({
  data: {
    userInfo: null
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  onMenuTap(e) {
    const type = e.currentTarget.dataset.type
    switch (type) {
      case 'changePassword':
        wx.showToast({ title: '功能开发中', icon: 'none' })
        break
      case 'about':
        wx.showModal({ title: '关于', content: '马拉松参赛助手 v1.0\n管理后台' })
        break
      default:
        wx.showToast({ title: '功能开发中', icon: 'none' })
    }
  },

  onGoToDashboard() {
    wx.reLaunch({ url: '/pages/admin-index/admin-index' })
  },

  onGoToAudit() {
    wx.navigateTo({ url: '/pages/admin-audit/admin-audit?tab=post' })
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出管理员账号？',
      success: (res) => {
        if (res.confirm) {
          app.logout()
          wx.reLaunch({ url: '/pages/login/login' })
        }
      }
    })
  }
})
