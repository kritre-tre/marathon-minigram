// pages/admin-index/admin-index.js
const adminData = require('../../utils/adminData')
const app = getApp()

Page({
  data: {
    stats: { pendingPosts: 0, pendingComments: 0, pendingActivities: 0, totalUsers: 0 },
    recentPosts: [],
    recentComments: [],
    recentActivities: []
  },

  onLoad() {
    // 检查是否管理员
    if (!app.globalData.isAdmin) {
      wx.showToast({ title: '无权限访问', icon: 'none' })
      wx.reLaunch({ url: '/pages/index/index' })
    }
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const stats = adminData.getStats()
    const posts = adminData.pendingPosts.filter(p => p.status === 'pending')
    const comments = adminData.pendingComments.filter(c => c.status === 'pending')
    const activities = adminData.pendingActivities.filter(a => a.status === 'pending')

    this.setData({
      stats,
      recentPosts: posts.slice(0, 3),
      recentComments: comments.slice(0, 3),
      recentActivities: activities.slice(0, 3)
    })
  },

  onCardTap(e) {
    const type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `/pages/admin-audit/admin-audit?tab=${type}`
    })
  },

  onAuditItem(e) {
    const { type, id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/admin-audit-detail/admin-audit-detail?type=${type}&id=${id}`
    })
  }
})
