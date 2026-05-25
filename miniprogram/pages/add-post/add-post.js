const api = require('../../utils/api')

Page({
  data: {
    postId: '',
    activityIndex: 0,
    activityOptions: ['不关联赛事'],
    activities: [],
    form: {
      activityId: '',
      title: '',
      content: ''
    }
  },

  async onLoad(options) {
    const id = options.id || ''
    this.setData({ postId: id })
    await this.loadActivities()
    if (id) this.loadPost(id)
  },

  async loadActivities() {
    try {
      const list = await api.request({ url: '/api/activities' })
      const activities = (list || []).map(api.normalizeActivity)
      this.setData({
        activities,
        activityOptions: ['不关联赛事', ...activities.map(item => item.name)]
      })
    } catch (error) {
      api.showError(error)
    }
  },

  async loadPost(id) {
    try {
      const post = await api.request({ url: `/api/posts/${id}`, auth: true })
      const activityId = post.activityId || ''
      const activityIndex = this.data.activities.findIndex(item => String(item.id) === String(activityId))
      this.setData({
        activityIndex: activityIndex >= 0 ? activityIndex + 1 : 0,
        form: {
          activityId,
          title: post.title || post.Title || '',
          content: post.content || post.Content || ''
        }
      })
      wx.setNavigationBarTitle({ title: '编辑主题帖' })
    } catch (error) {
      api.showError(error)
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onActivityChange(e) {
    const index = Number(e.detail.value)
    const activity = index > 0 ? this.data.activities[index - 1] : null
    this.setData({
      activityIndex: index,
      'form.activityId': activity ? activity.id : ''
    })
  },

  async onSubmit() {
    const { form, postId } = this.data

    if (!form.title) return wx.showToast({ title: '请输入帖子标题', icon: 'none' })
    if (!form.content) return wx.showToast({ title: '请输入帖子内容', icon: 'none' })
    if (form.content.length < 10) return wx.showToast({ title: '帖子内容至少10个字', icon: 'none' })

    wx.showLoading({ title: postId ? '保存中...' : '发布中...' })
    try {
      if (postId) {
        await api.request({
          url: `/api/posts/${postId}`,
          method: 'PUT',
          auth: true,
          data: form
        })
      } else {
        await api.request({
          url: '/api/posts',
          method: 'POST',
          auth: true,
          data: form
        })
      }
      wx.showToast({ title: postId ? '已更新并提交审核' : '已提交审核', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 800)
    } catch (error) {
      api.showError(error)
    } finally {
      wx.hideLoading()
    }
  }
})
