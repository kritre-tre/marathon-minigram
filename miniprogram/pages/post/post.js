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
        item.title.includes(searchText) || item.content.includes(searchText)
      )
    }
    this.setData({ filteredPosts: filtered })
  },

  onPostTap() {
    wx.showToast({ title: '帖子详情页待接入', icon: 'none' })
  },

  onLike(e) {
    const id = e.currentTarget.dataset.id
    const posts = this.data.posts.map(item => {
      if (item.id === id) return { ...item, likeCount: item.likeCount + 1 }
      return item
    })
    this.setData({ posts })
    this.filterPosts()
  },

  onComment() {
    wx.showToast({ title: '评论页待接入', icon: 'none' })
  },

  onShare() {
    wx.showToast({ title: '分享功能待接入', icon: 'none' })
  },

  onAddPost() {
    wx.navigateTo({ url: '/pages/add-post/add-post' })
  }
})
