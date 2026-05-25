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
      const rows = await api.request({ url: '/api/posts/my', auth: true })
      this.setData({ list: (rows || []).map(api.normalizePost) })
    } catch (error) {
      api.showError(error)
    }
  },

  onView(e) {
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${e.currentTarget.dataset.id}` })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/add-post/add-post?id=${id}` })
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除帖子',
      content: '确认删除该帖子吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.request({ url: `/api/posts/${id}`, method: 'DELETE', auth: true })
          wx.showToast({ title: '已删除', icon: 'success' })
          this.loadList()
        } catch (error) {
          api.showError(error)
        }
      }
    })
  }
})
