const api = require('../../utils/api')

Page({
  data: {
    postId: '',
    post: null,
    comments: [],
    commentContent: '',
    loading: false
  },

  onLoad(options) {
    this.setData({ postId: options.id || '' })
    this.loadData()
  },

  onShow() {
    if (this.data.postId) this.loadComments()
  },

  async loadData() {
    if (!this.data.postId) return
    this.setData({ loading: true })
    try {
      const [post, comments] = await Promise.all([
        api.request({ url: `/api/posts/${this.data.postId}` }),
        api.request({ url: `/api/comments/post/${this.data.postId}` })
      ])
      this.setData({
        post: api.normalizePost(post),
        comments: (comments || []).map(api.normalizeComment)
      })
    } catch (error) {
      api.showError(error)
    } finally {
      this.setData({ loading: false })
    }
  },

  async loadComments() {
    try {
      const comments = await api.request({ url: `/api/comments/post/${this.data.postId}` })
      this.setData({ comments: (comments || []).map(api.normalizeComment) })
    } catch (error) {
      api.showError(error)
    }
  },

  onInputComment(e) {
    this.setData({ commentContent: e.detail.value })
  },

  async onSubmitComment() {
    const content = this.data.commentContent.trim()
    if (!content) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }
    try {
      await api.request({
        url: '/api/comments',
        method: 'POST',
        auth: true,
        data: {
          postId: this.data.postId,
          content
        }
      })
      wx.showToast({ title: '评论已提交审核', icon: 'success' })
      this.setData({ commentContent: '' })
    } catch (error) {
      api.showError(error)
    }
  }
})
