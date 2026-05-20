const api = require('../../utils/api')

Page({
  data: {
    form: {
      title: '',
      content: ''
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  async onSubmit() {
    const { form } = this.data

    if (!form.title) return wx.showToast({ title: '请输入帖子标题', icon: 'none' })
    if (!form.content) return wx.showToast({ title: '请输入帖子内容', icon: 'none' })
    if (form.content.length < 10) return wx.showToast({ title: '帖子内容至少10个字', icon: 'none' })

    wx.showLoading({ title: '发布中...' })
    try {
      await api.request({
        url: '/api/posts',
        method: 'POST',
        auth: true,
        data: form
      })
      wx.showToast({ title: '已提交审核', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 800)
    } catch (error) {
      api.showError(error)
    } finally {
      wx.hideLoading()
    }
  }
})
