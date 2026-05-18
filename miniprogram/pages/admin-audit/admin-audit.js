// pages/admin-audit/admin-audit.js
const adminData = require('../../utils/adminData')

Page({
  data: {
    tab: 'post',
    tabs: [
      { key: 'post', label: '主题帖审核' },
      { key: 'comment', label: '评论审核' },
      { key: 'activity', label: '赛事审核' },
      { key: 'user', label: '用户管理' }
    ],
    list: [],
    emptyText: {
      post: '暂无待审核主题帖',
      comment: '暂无待审核评论',
      activity: '暂无待审核赛事',
      user: '暂无注册用户'
    }
  },

  onLoad(options) {
    if (options.tab) {
      this.setData({ tab: options.tab }, () => this.loadList())
    }
  },

  onShow() {
    this.loadList()
  },

  onSwitchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ tab }, () => this.loadList())
  },

  loadList() {
    let list = []
    switch (this.data.tab) {
      case 'post':
        list = adminData.pendingPosts
        break
      case 'comment':
        list = adminData.pendingComments
        break
      case 'activity':
        list = adminData.pendingActivities
        break
      case 'user':
        list = adminData.registeredUsers
        break
    }
    this.setData({ list })
  },

  onItemTap(e) {
    const { type, id } = e.currentTarget.dataset
    if (type === 'user') return
    wx.navigateTo({
      url: `/pages/admin-audit-detail/admin-audit-detail?type=${type}&id=${id}`
    })
  },

  getStatusText(status) {
    const map = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
    return map[status] || status
  },

  getStatusClass(status) {
    const map = { pending: 'status-pending', approved: 'status-approved', rejected: 'status-rejected' }
    return map[status] || ''
  }
})
