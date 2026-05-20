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
    const activity = this.data.activity
    wx.showModal({
      title: '确认报名',
      content: `确定要报名参加"${activity.name}"吗？`,
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.request({
            url: '/api/registrations',
            method: 'POST',
            auth: true,
            data: {
              activityId: activity.id,
              realName: getApp().globalData.userInfo.name || getApp().globalData.userInfo.username,
              phoneNumber: getApp().globalData.userInfo.phone || '未填写',
              emergencyContact: ''
            }
          })
          wx.showToast({ title: '报名已提交', icon: 'success' })
        } catch (error) {
          api.showError(error)
        }
      }
    })
  }
})
