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
        wx.showToast({ title: '已报名活动待接入页面', icon: 'none' })
        break
      case 'publishedActivities':
        wx.showToast({ title: '已发布赛事待接入页面', icon: 'none' })
        break
      case 'myPosts':
        wx.showToast({ title: '我的主题帖待接入页面', icon: 'none' })
        break
      case 'favorites':
        wx.showToast({ title: '收藏赛事待接入页面', icon: 'none' })
        break
      case 'audit':
        wx.showToast({ title: '报名审核待接入页面', icon: 'none' })
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
