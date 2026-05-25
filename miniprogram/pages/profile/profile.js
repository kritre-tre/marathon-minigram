const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    userInfo: {}
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  async loadUserInfo() {
    this.setData({ userInfo: app.globalData.userInfo || {} })
    if (!app.globalData.token) return

    try {
      const user = api.normalizeUser(await api.request({ url: '/api/auth/me', auth: true }))
      app.globalData.userInfo = user
      wx.setStorageSync('userInfo', user)
      this.setData({ userInfo: user })
    } catch (error) {
      api.showError(error)
    }
  },

  onMenuTap(e) {
    const type = e.currentTarget.dataset.type
    switch (type) {
      case 'editProfile':
        wx.navigateTo({ url: '/pages/edit-profile/edit-profile' })
        break
      case 'myActivities':
        wx.navigateTo({ url: '/pages/my-registrations/my-registrations' })
        break
      case 'publishedActivities':
        wx.navigateTo({ url: '/pages/my-activities/my-activities' })
        break
      case 'myPosts':
        wx.navigateTo({ url: '/pages/my-posts/my-posts' })
        break
      case 'myComments':
        wx.navigateTo({ url: '/pages/my-comments/my-comments' })
        break
      case 'audit':
        wx.navigateTo({ url: '/pages/registration-audit/registration-audit' })
        break
      case 'changePassword':
        wx.navigateTo({ url: '/pages/change-password/change-password' })
        break
      case 'changePhone':
        wx.showToast({ title: '请在编辑资料中修改', icon: 'none' })
        break
      case 'changeEmail':
        wx.showToast({ title: '请在编辑资料中修改', icon: 'none' })
        break
      case 'deleteAccount':
        this.onDeleteAccount()
        break
      default:
        wx.showToast({ title: '功能开发中', icon: 'none' })
    }
  },

  onDeleteAccount() {
    wx.showModal({
      title: '注销账户',
      content: '确定要注销账户吗？此操作不可恢复。',
      confirmColor: '#F44336',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.request({ url: '/api/auth/me', method: 'DELETE', auth: true })
        } catch (error) {
          api.showError(error)
        }
        app.logout()
        wx.redirectTo({ url: '/pages/login/login' })
      }
    })
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout()
          wx.redirectTo({ url: '/pages/login/login' })
        }
      }
    })
  }
})
