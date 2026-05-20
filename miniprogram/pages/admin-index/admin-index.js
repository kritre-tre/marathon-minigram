const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    stats: { pendingPosts: 0, pendingComments: 0, pendingActivities: 0, totalUsers: 0 },
    recentPosts: [],
    recentComments: [],
    recentActivities: []
  },

  onLoad() {
    if (!app.globalData.isAdmin) {
      wx.showToast({ title: '无权限访问', icon: 'none' })
      wx.reLaunch({ url: '/pages/index/index' })
    }
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    try {
      const [stats, posts, comments, activities] = await Promise.all([
        api.request({ url: '/api/admin/stats', auth: true }),
        api.request({ url: '/api/admin/audit/post', auth: true }),
        api.request({ url: '/api/admin/audit/comment', auth: true }),
        api.request({ url: '/api/admin/audit/activity', auth: true })
      ])

      this.setData({
        stats,
        recentPosts: (posts || []).slice(0, 3).map(item => api.normalizeAuditItem(item, 'post')),
        recentComments: (comments || []).slice(0, 3).map(item => api.normalizeAuditItem(item, 'comment')),
        recentActivities: (activities || []).slice(0, 3).map(item => api.normalizeAuditItem(item, 'activity'))
      })
    } catch (error) {
      api.showError(error)
    }
  },

  onCardTap(e) {
    wx.navigateTo({ url: `/pages/admin-audit/admin-audit?tab=${e.currentTarget.dataset.type}` })
  },

  onAuditItem(e) {
    const { type, id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/admin-audit-detail/admin-audit-detail?type=${type}&id=${id}` })
  }
})
