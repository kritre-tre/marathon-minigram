const api = require('../../utils/api')

Page({
  data: {
    list: []
  },

  onShow() {
    this.loadList()
  },

  async loadList() {
    try {
      const rows = await api.request({ url: '/api/activities/my', auth: true })
      this.setData({ list: (rows || []).map(api.normalizeActivity) })
    } catch (error) {
      api.showError(error)
    }
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/add-activity/add-activity?id=${id}` })
  },

  onAudit(e) {
    const id = e.currentTarget.dataset.id
    const name = encodeURIComponent(e.currentTarget.dataset.name || '')
    wx.navigateTo({ url: `/pages/registration-audit/registration-audit?activityId=${id}&name=${name}` })
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除赛事',
      content: '确认删除该赛事吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.request({ url: `/api/activities/${id}`, method: 'DELETE', auth: true })
          wx.showToast({ title: '已删除', icon: 'success' })
          this.loadList()
        } catch (error) {
          api.showError(error)
        }
      }
    })
  }
})
