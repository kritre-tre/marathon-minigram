const api = require('../../utils/api')

Page({
  data: {
    activity: {}
  },

  onLoad(options) {
    this.loadActivity(options.id)
  },

  async loadActivity(id) {
    try {
      const activity = await api.request({ url: `/api/activities/${id}` })
      this.setData({ activity: api.normalizeActivity(activity) })
    } catch (error) {
      api.showError(error)
    }
  },

  onSignUp() {
    const { activity } = this.data
    wx.navigateTo({
      url: `/pages/registration-form/registration-form?activityId=${activity.id}&activityName=${encodeURIComponent(activity.name || '')}`
    })
  }
})
