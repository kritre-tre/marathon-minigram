const api = require('../../utils/api')

Page({
  data: {
    banners: [],
    activities: []
  },

  onLoad() {
    const app = getApp()
    if (!app.globalData.isLoggedIn) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadActivities()
  },

  onShow() {
    if (getApp().globalData.isLoggedIn) {
      this.loadActivities()
    }
  },

  async loadActivities() {
    try {
      const list = await api.request({ url: '/api/activities' })
      const activities = (list || []).slice(0, 4).map(api.normalizeActivity)
      this.setData({
        activities,
        banners: activities.map(item => ({
          id: item.id,
          title: item.name,
          subtitle: item.address || item.typeText || '',
          gradient: item.gradient,
          hasCover: item.hasCover,
          coverSrc: item.coverSrc
        }))
      })
    } catch (error) {
      api.showError(error)
    }
  },

  onActivityTap(e) {
    wx.navigateTo({ url: `/pages/activity-detail/activity-detail?id=${e.currentTarget.dataset.id}` })
  },

  onViewMore() {
    wx.switchTab({ url: '/pages/activity/activity' })
  }
})
