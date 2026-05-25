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
      const rows = await api.request({ url: '/api/registrations/my', auth: true })
      this.setData({ list: (rows || []).map(api.normalizeRegistration) })
    } catch (error) {
      api.showError(error)
    }
  },

  onCancel(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '取消报名',
      content: '确认取消该报名吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.request({ url: `/api/registrations/${id}`, method: 'DELETE', auth: true })
          wx.showToast({ title: '已取消', icon: 'success' })
          this.loadList()
        } catch (error) {
          api.showError(error)
        }
      }
    })
  }
})
