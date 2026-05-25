const api = require('../../utils/api')

Page({
  data: {
    searchText: '',
    posts: [],
    filteredPosts: []
  },

  onLoad() {
    this.loadPosts()
  },

  onShow() {
    this.loadPosts()
  },

  async loadPosts() {
    try {
      const list = await api.request({ url: '/api/posts' })
      const posts = (list || []).map(api.normalizePost)
      this.setData({ posts })
      this.filterPosts()
    } catch (error) {
      api.showError(error)
    }
  },

  onSearchInput(e) {
    this.setData({ searchText: e.detail.value })
  },

  onSearch() {
    this.filterPosts()
  },

  filterPosts() {
    const { posts, searchText } = this.data
    let filtered = posts
    if (searchText) {
      filtered = filtered.filter(item =>
        String(item.title || '').includes(searchText) ||
        String(item.content || '').includes(searchText)
      )
    }
    this.setData({ filteredPosts: filtered })
  },

  onPostTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${id}` })
  },

  onLike() {
    wx.showToast({ title: '点赞功能暂未接入后端', icon: 'none' })
  },

  onComment(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${id}` })
  },

  onShare() {
    wx.showToast({ title: '请使用右上角分享', icon: 'none' })
  },

  onAddPost() {
    wx.navigateTo({ url: '/pages/add-post/add-post' })
  }
})
