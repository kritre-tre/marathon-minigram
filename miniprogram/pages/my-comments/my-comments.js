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
      const rows = await api.request({ url: '/api/comments/my', auth: true })
      this.setData({ list: (rows || []).map(api.normalizeComment) })
    } catch (error) {
      api.showError(error)
    }
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除评论',
      content: '确认删除该评论吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.request({ url: `/api/comments/${id}`, method: 'DELETE', auth: true })
          wx.showToast({ title: '已删除', icon: 'success' })
          this.loadList()
        } catch (error) {
          api.showError(error)
        }
      }
    })
  },

  onGoPost(e) {
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${e.currentTarget.dataset.postid}` })
  }
})
