const api = require('../../utils/api')

Page({
  data: {
    activityId: '',
    activities: [],
    activityIndex: 0,
    registrations: []
  },

  async onLoad(options) {
    this.setData({ activityId: options.activityId || '' })
    await this.loadActivities()
  },

  async loadActivities() {
    try {
      const rows = await api.request({ url: '/api/activities/my', auth: true })
      const activities = (rows || []).map(api.normalizeActivity)
      let index = 0
      if (this.data.activityId) {
        const found = activities.findIndex(i => String(i.id) === String(this.data.activityId))
        index = found >= 0 ? found : 0
      }
      this.setData({ activities, activityIndex: index })
      if (activities.length) {
        this.loadRegistrations(activities[index].id)
      }
    } catch (error) {
      api.showError(error)
    }
  },

  async loadRegistrations(activityId) {
    try {
      const rows = await api.request({ url: `/api/registrations/activity/${activityId}?auditState=Pending`, auth: true })
      this.setData({ registrations: (rows || []).map(api.normalizeRegistration) })
    } catch (error) {
      api.showError(error)
    }
  },

  onActivityChange(e) {
    const index = Number(e.detail.value)
    const item = this.data.activities[index]
    this.setData({ activityIndex: index, activityId: item.id })
    this.loadRegistrations(item.id)
  },

  onApprove(e) {
    this.audit(e.currentTarget.dataset.id, 'Approved', 'Approved')
  },

  onReject(e) {
    this.audit(e.currentTarget.dataset.id, 'Rejected', 'Rejected')
  },

  audit(id, auditState, registrationStatus) {
    wx.showModal({
      title: '处理报名',
      content: '确认提交审核结果吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.request({
            url: `/api/registrations/${id}/audit`,
            method: 'PUT',
            auth: true,
            data: { auditState, registrationStatus }
          })
          wx.showToast({ title: '已处理', icon: 'success' })
          this.loadRegistrations(this.data.activities[this.data.activityIndex].id)
        } catch (error) {
          api.showError(error)
        }
      }
    })
  }
})
